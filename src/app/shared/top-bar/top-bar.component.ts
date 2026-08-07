import { Component, input } from '@angular/core';

@Component({
  selector: 'app-top-bar',
  standalone: true,
  templateUrl: './top-bar.component.html',
  styleUrl: './top-bar.component.scss',
})
export class TopBarComponent {
  readonly title = input.required<string>();
  readonly dark = input(false);
}
