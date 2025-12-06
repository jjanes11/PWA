import { Component, Input, signal, HostListener, ElementRef, ChangeDetectionStrategy, inject, effect } from '@angular/core';
import { TooltipService } from '../../services/tooltip.service';

@Component({
  selector: 'app-metric-info-tooltip',
  standalone: true,
  template: `
    <div class="jacaona-metric-info">
      <button
        type="button"
        class="jacaona-metric-info__btn"
        [attr.aria-label]="'Information about ' + label()"
        [attr.aria-expanded]="isOpen()"
        (click)="toggle($event)"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z"/>
        </svg>
      </button>
      
      @if (isOpen()) {
        <div 
          class="jacaona-metric-info__tooltip"
          role="tooltip"
          [attr.id]="tooltipId()"
        >
          <div class="jacaona-metric-info__content">
            {{ description() }}
          </div>
        </div>
      }
    </div>
  `,
  styleUrl: './metric-info-tooltip.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MetricInfoTooltipComponent {
  private tooltipService = inject(TooltipService);
  private elementRef = inject(ElementRef);

  label = signal<string>('');
  description = signal<string>('');
  tooltipId = signal('');

  // Local state tracks if we think we're open
  private localIsOpen = signal(false);

  // Computed: we're open if service says our ID is the open one
  isOpen = () => this.tooltipService.isOpen(this.tooltipId());

  @Input() set metricLabel(value: string) {
    this.label.set(value);
  }

  @Input() set metricDescription(value: string) {
    this.description.set(value);
  }

  @Input() set id(value: string) {
    this.tooltipId.set(`metric-tooltip-${value}`);
  }

  toggle(event: Event): void {
    event.stopPropagation();
    
    const id = this.tooltipId();
    if (this.tooltipService.isOpen(id)) {
      this.tooltipService.closeTooltip(id);
    } else {
      this.tooltipService.openTooltip(id);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.tooltipService.closeTooltip(this.tooltipId());
    }
  }
}
