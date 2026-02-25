import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Tag } from '../../models/item.model';

@Component({
  selector: 'app-tag-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div class="container">
        <h1 i18n="@@tags.title">Tags-Übersicht</h1>
        <div class="header-actions">
          <nav class="main-nav">
            <a class="nav-item" (click)="goToItems()">📦 Artikel</a>
            <a class="nav-item" (click)="goToLocations()">📍 Orte</a>
            <span class="nav-item active">🏷️ Tags</span>
            <a class="nav-item" (click)="goToCategories()">📁 Kategorien</a>
            <a class="nav-item" (click)="goToSettings()">⚙️ Einstellungen</a>
          </nav>
          <button class="btn btn-secondary" (click)="logout()" i18n="@@app.logout">
            Abmelden
          </button>
        </div>
      </div>
    </div>

    <div class="container">
      <!-- Statistics -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-value">{{ tags.length }}</div>
          <div class="stat-label" i18n="@@tags.totalTags">Tags gesamt</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ getTotalItemCount() }}</div>
          <div class="stat-label" i18n="@@tags.totalAssignments">Zuweisungen</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ getUsedTagsCount() }}</div>
          <div class="stat-label" i18n="@@tags.usedTags">Verwendete Tags</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ getUnusedTagsCount() }}</div>
          <div class="stat-label" i18n="@@tags.unusedTags">Unbenutzte Tags</div>
        </div>
      </div>

      <!-- Filter -->
      <div class="filter-bar">
        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="filterTags()"
            placeholder="Tags suchen..."
            i18n-placeholder="@@tags.search"
          />
        </div>
        <div class="usage-filter">
          <label i18n="@@tags.filterUsage">Nutzung:</label>
          <select [(ngModel)]="usageFilter" (change)="filterTags()">
            <option value="" i18n="@@tags.allTags">Alle</option>
            <option value="used" i18n="@@tags.filterUsed">Verwendet</option>
            <option value="unused" i18n="@@tags.filterUnused">Unbenutzt</option>
          </select>
        </div>
      </div>

      <!-- Tags Grid -->
      <div class="tags-grid">
        <div
          class="tag-card"
          *ngFor="let tag of filteredTags"
          (click)="goToTag(tag.id)"
        >
          <div class="tag-header">
            <span
              class="tag-badge-large"
              [style.background-color]="tag.color"
              [style.color]="getTextColor(tag.color)"
            >
              {{ tag.name }}
            </span>
          </div>
          <div class="tag-stats">
            <span class="item-count">{{ tag.item_count || 0 }}</span>
            <span class="item-label" i18n="@@tags.items">Artikel</span>
          </div>
        </div>
        <div *ngIf="filteredTags.length === 0" class="empty-state" i18n="@@tags.noTags">
          Keine Tags gefunden.
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="loading" i18n="@@app.loading">
      Lade...
    </div>
  `,
  styles: [`
    .main-nav {
      display: flex;
      gap: 4px;
      background: rgba(255,255,255,0.1);
      padding: 4px;
      border-radius: 6px;
    }

    .nav-item {
      padding: 8px 14px;
      border-radius: 4px;
      color: white;
      text-decoration: none;
      cursor: pointer;
      font-size: 14px;
      transition: background 0.2s;
    }

    .nav-item:hover {
      background: rgba(255,255,255,0.2);
    }

    .nav-item.active {
      background: rgba(255,255,255,0.25);
      font-weight: 600;
      cursor: default;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
      margin-bottom: 20px;
    }

    .stat-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-left: 4px solid #3498db;
    }

    .stat-value {
      font-size: 32px;
      font-weight: 700;
      color: #2c3e50;
    }

    .stat-label {
      font-size: 14px;
      color: #2c3e50;
      margin-top: 4px;
      font-weight: 500;
    }

    .filter-bar {
      display: flex;
      gap: 16px;
      align-items: center;
      margin-bottom: 20px;
      flex-wrap: wrap;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .search-box {
      flex: 1;
      min-width: 200px;
    }

    .search-box input {
      width: 100%;
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .usage-filter {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .usage-filter label {
      font-weight: 500;
      color: #2c3e50;
    }

    .usage-filter select {
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      background: white;
    }

    .tags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .tag-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
      text-align: center;
    }

    .tag-card:hover {
      border-color: #3498db;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .tag-header {
      margin-bottom: 16px;
    }

    .tag-badge-large {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 20px;
      font-size: 16px;
      font-weight: 600;
    }

    .tag-stats {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .item-count {
      font-size: 28px;
      font-weight: 700;
      color: #2c3e50;
    }

    .item-label {
      font-size: 13px;
      color: #7f8c8d;
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      color: #95a5a6;
      font-style: italic;
      font-size: 16px;
      grid-column: 1 / -1;
    }
  `]
})
export class TagOverviewComponent implements OnInit {
  tags: Tag[] = [];
  filteredTags: Tag[] = [];
  loading = true;
  searchQuery = '';
  usageFilter = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTags();
  }

  loadTags() {
    this.loading = true;
    this.apiService.getTagsWithCounts().subscribe({
      next: (tags) => {
        this.tags = tags;
        this.filterTags();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading tags:', err);
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  filterTags() {
    let filtered = [...this.tags];

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(tag =>
        tag.name.toLowerCase().includes(query)
      );
    }

    // Filter by usage
    if (this.usageFilter === 'used') {
      filtered = filtered.filter(tag => (tag.item_count || 0) > 0);
    } else if (this.usageFilter === 'unused') {
      filtered = filtered.filter(tag => (tag.item_count || 0) === 0);
    }

    this.filteredTags = filtered;
  }

  getTotalItemCount(): number {
    return this.tags.reduce((sum, tag) => sum + (tag.item_count || 0), 0);
  }

  getUsedTagsCount(): number {
    return this.tags.filter(tag => (tag.item_count || 0) > 0).length;
  }

  getUnusedTagsCount(): number {
    return this.tags.filter(tag => (tag.item_count || 0) === 0).length;
  }

  goToTag(id: number) {
    this.router.navigate(['/tag', id]);
  }

  goToItems() {
    this.router.navigate(['/items']);
  }

  goToLocations() {
    this.router.navigate(['/locations']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToCategories() {
    this.router.navigate(['/categories']);
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  getTextColor(backgroundColor: string): string {
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }
}
