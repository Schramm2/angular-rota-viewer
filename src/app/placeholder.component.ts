import { Component } from '@angular/core';

@Component({
  selector: 'app-placeholder',
  standalone: true,
  template: `
    <div class="placeholder-content">
      <h2>Welcome to Rota Viewer — roster coming soon.</h2>
    </div>
  `,
  styles: [`
    .placeholder-content {
      text-align: center;
      padding: 2rem;
    }
    
    h2 {
      color: #666;
      font-weight: 300;
    }
  `]
})
export class PlaceholderComponent {}
