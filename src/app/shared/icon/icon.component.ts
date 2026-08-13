import { Component, input } from '@angular/core';

export type IconName =
  | 'menu'
  | 'bell'
  | 'clock'
  | 'flag'
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron-right'
  | 'chevron-down'
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
  | 'list'
  | 'camera'
  | 'comment'
  | 'calendar'
  | 'login';

@Component({
  selector: 'app-icon',
  standalone: true,
  templateUrl: './icon.component.html',
  styleUrl: './icon.component.scss',
})
export class IconComponent {
  readonly name = input.required<IconName>();
}
