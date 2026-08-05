import { Component, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  readonly title = input.required<string>();
  readonly dark = input(false);
}
