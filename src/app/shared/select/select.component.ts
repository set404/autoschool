import { Component, ElementRef, HostListener, computed, inject, input, output, signal } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-select',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './select.component.html',
  styleUrl: './select.component.scss',
})
export class SelectComponent<T extends string = string> {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly options = input.required<SelectOption<T>[]>();
  readonly value = input<T | null>(null);
  readonly placeholder = input<string>('');
  readonly ariaLabel = input<string>('');
  readonly valueChange = output<T>();

  protected readonly open = signal(false);

  protected readonly selectedLabel = computed(() => {
    const option = this.options().find((o) => o.value === this.value());
    return option?.label ?? '';
  });

  toggle(): void {
    this.open.update((v) => !v);
  }

  close(): void {
    this.open.set(false);
  }

  choose(option: SelectOption<T>): void {
    this.valueChange.emit(option.value);
    this.close();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    if (!this.elementRef.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }
}
