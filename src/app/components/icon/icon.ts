import { Component, input } from '@angular/core';

export type IconName = 
  | 'menu-vertical'
  | 'plus'
  | 'check'
  | 'arrow-left'
  | 'x'
  | 'drag-handle';

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `
    <svg 
      [attr.width]="size()" 
      [attr.height]="size()" 
      viewBox="0 0 24 24" 
      fill="currentColor"
      [attr.aria-hidden]="true"
    >
      <path [attr.d]="iconPaths[name()]"/>
    </svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class IconComponent {
  name = input.required<IconName>();
  size = input<number>(20);
  
  protected readonly iconPaths: Record<IconName, string> = {
    'menu-vertical': 'M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z',
    'plus': 'M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z',
    'check': 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
    'arrow-left': 'M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z',
    'x': 'M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z',
    'drag-handle': 'M20 9H4v2h16V9zM4 15h16v-2H4v2z'
  };
}
