import { Component, effect, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { TestSessionService } from '../../core/services/test-session.service';
import { LocalizePipe } from '../../core/services/localize.pipe';
import { TranslatePipe } from '../../core/services/translate.pipe';
import { IconComponent } from '../../shared/icon/icon.component';
import { TopBarComponent } from '../../shared/top-bar/top-bar.component';
import { Question } from '../../core/models/question.model';

@Component({
  selector: 'app-review-answers',
  standalone: true,
  imports: [TranslatePipe, LocalizePipe, IconComponent, TopBarComponent],
  templateUrl: './review-answers.component.html',
  styleUrl: './review-answers.component.scss',
})
export class ReviewAnswersComponent {
  readonly id = input.required<string>();

  private readonly router = inject(Router);

  protected readonly session = inject(TestSessionService);

  constructor() {
    effect(() => {
      if (!this.session.isActiveFor(this.id())) {
        this.router.navigateByUrl('/');
      }
    });
  }

  isCorrect(question: Question): boolean {
    return this.session.answers()[question.id] === question.correctOptionId;
  }

  selectedOptionText(question: Question) {
    const selectedId = this.session.answers()[question.id];
    return question.options.find((o) => o.id === selectedId)?.text;
  }

  correctOptionText(question: Question) {
    return question.options.find((o) => o.id === question.correctOptionId)?.text;
  }
}
