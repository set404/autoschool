import { Component, input } from '@angular/core';

export type IconName =
  | 'menu'
  | 'bell'
  | 'clock'
  | 'flag'
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron-right'
  | 'check-circle'
  | 'x-circle'
  | 'play'
  | 'book'
  | 'chart-bar'
  | 'user'
  | 'quiz'
  | 'plus'
  | 'lock'
  | 'quote'
  | 'eye'
  | 'shield'
  | 'wrench'
  | 'moon'
  | 'warning-sign'
  | 'refresh'
  | 'list';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  readonly name = input.required<IconName>();
}
