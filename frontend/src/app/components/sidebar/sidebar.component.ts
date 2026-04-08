import { Component } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: false,
})
export class SidebarComponent {
  protected readonly links = [
    { label: 'Dashboard', icon: 'bi-speedometer2', path: '/dashboard' },
    { label: 'Articles', icon: 'bi-box-seam', path: '/articles' },
    { label: 'Categories', icon: 'bi-tags', path: '/categories' },
    { label: 'Users', icon: 'bi-people', path: '/users' },
    { label: 'AI Predictions', icon: 'bi-graph-up-arrow', path: '/ai/predictions' },
  ];
}
