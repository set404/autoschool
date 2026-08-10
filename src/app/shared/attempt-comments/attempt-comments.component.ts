import { Component, computed, inject, input, output, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { Subject, catchError, combineLatest, of, startWith, switchMap } from 'rxjs';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent } from '../icon/icon.component';
import { CommentsService } from '../../core/services/comments.service';
import { TeacherService } from '../../core/services/teacher.service';
import { AuthService } from '../../core/services/auth.service';
import { Comment } from '../../core/models/comment.model';

@Component({
  selector: 'app-attempt-comments',
  standalone: true,
  imports: [DatePipe, TranslatePipe, IconComponent],
  templateUrl: './attempt-comments.component.html',
  styleUrl: './attempt-comments.component.scss',
})
export class AttemptCommentsComponent {
  readonly attemptId = input.required<string>();
  /** Non-null only when rendered for a teacher — enables posting/deleting. */
  readonly manage = input<{ studentId: string } | null>(null);
  /** Emitted after a comment is added or removed, so the parent can refresh its own comment counts. */
  readonly changed = output<void>();

  private readonly commentsService = inject(CommentsService);
  private readonly teacherService = inject(TeacherService);
  private readonly authService = inject(AuthService);

  private readonly refresh$ = new Subject<void>();

  protected readonly currentUserId = computed(() => this.authService.currentUser()?.id);

  protected readonly comments = toSignal(
    combineLatest([toObservable(this.attemptId), this.refresh$.pipe(startWith(undefined))]).pipe(
      switchMap(([id]) => this.commentsService.list(id).pipe(catchError(() => of([] as Comment[])))),
    ),
    { initialValue: [] as Comment[] },
  );

  protected readonly newBody = signal('');
  protected readonly posting = signal(false);
  protected readonly postError = signal<string | null>(null);

  post(): void {
    const manage = this.manage();
    const body = this.newBody().trim();
    if (!manage || !body || this.posting()) return;

    this.posting.set(true);
    this.postError.set(null);
    this.teacherService
      .addComment(manage.studentId, this.attemptId(), body)
      .pipe(
        catchError(() => {
          this.postError.set('comments.postError');
          return of(null);
        }),
      )
      .subscribe((comment) => {
        this.posting.set(false);
        if (comment) {
          this.newBody.set('');
          this.refresh$.next();
          this.changed.emit();
        }
      });
  }

  remove(comment: Comment): void {
    this.teacherService
      .deleteComment(comment.id)
      .pipe(catchError(() => of(null)))
      .subscribe((result) => {
        if (result) {
          this.refresh$.next();
          this.changed.emit();
        }
      });
  }
}
