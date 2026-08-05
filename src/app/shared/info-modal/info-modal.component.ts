import { Component, input, output } from '@angular/core';
import { TranslatePipe } from '../../core/services/translate.pipe';

@Component({
  selector: 'app-info-modal',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './info-modal.component.html',
  styleUrl: './info-modal.component.scss',
})
export class InfoModalComponent {
  readonly text = input.required<string>();
  readonly closed = output<void>();

  close(): void {
    this.closed.emit();
  }
}
