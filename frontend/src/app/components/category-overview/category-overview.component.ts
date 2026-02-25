import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Category } from '../../models/item.model';

@Component({
  selector: 'app-category-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div class="container">
        <h1 i18n="@@categories.title">Kategorien-Übersicht</h1>
        <div class="header-actions">
          <nav class="main-nav">
            <a class="nav-item" (click)="goToItems()">📦 Artikel</a>
            <a class="nav-item" (click)="goToLocations()">📍 Orte</a>
            <a class="nav-item" (click)="goToTags()">🏷️ Tags</a>
            <span class="nav-item active">📁 Kategorien</span>
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
          <div class="stat-value">{{ categories.length }}</div>
          <div class="stat-label" i18n="@@categories.totalCategories">Kategorien gesamt</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ getTotalItemCount() }}</div>
          <div class="stat-label" i18n="@@categories.totalItems">Artikel zugeordnet</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ getUsedCategoriesCount() }}</div>
          <div class="stat-label" i18n="@@categories.usedCategories">Verwendete Kategorien</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ getUnusedCategoriesCount() }}</div>
          <div class="stat-label" i18n="@@categories.unusedCategories">Leere Kategorien</div>
        </div>
      </div>

      <!-- Filter -->
      <div class="filter-bar">
        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="filterCategories()"
            placeholder="Kategorien suchen..."
            i18n-placeholder="@@categories.search"
          />
        </div>
        <div class="usage-filter">
          <label i18n="@@categories.filterUsage">Nutzung:</label>
          <select [(ngModel)]="usageFilter" (change)="filterCategories()">
            <option value="" i18n="@@categories.allCategories">Alle</option>
            <option value="used" i18n="@@categories.filterUsed">Mit Artikeln</option>
            <option value="unused" i18n="@@categories.filterUnused">Leer</option>
          </select>
        </div>
      </div>

      <!-- Categories Grid -->
      <div class="categories-grid">
        <div
          class="category-card"
          *ngFor="let category of filteredCategories"
          (click)="goToCategory(category.id)"
        >
          <div class="category-icon">📁</div>
          <div class="category-name">{{ category.name }}</div>
          <div class="category-stats">
            <span class="item-count">{{ category.item_count || 0 }}</span>
            <span class="item-label" i18n="@@categories.items">Artikel</span>
          </div>
        </div>
        <div *ngIf="filteredCategories.length === 0" class="empty-state" i18n="@@categories.noCategories">
          Keine Kategorien gefunden.
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
      border-left: 4px solid #9b59b6;
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

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .category-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
      text-align: center;
    }

    .category-card:hover {
      border-color: #9b59b6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .category-icon {
      font-size: 40px;
      margin-bottom: 12px;
    }

    .category-name {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 12px;
    }

    .category-stats {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .item-count {
      font-size: 28px;
      font-weight: 700;
      color: #9b59b6;
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
export class CategoryOverviewComponent implements OnInit {
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  loading = true;
  searchQuery = '';
  usageFilter = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.loading = true;
    this.apiService.getCategoriesWithCounts().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.filterCategories();
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  filterCategories() {
    let filtered = [...this.categories];

    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(cat =>
        cat.name.toLowerCase().includes(query)
      );
    }

    if (this.usageFilter === 'used') {
      filtered = filtered.filter(cat => (cat.item_count || 0) > 0);
    } else if (this.usageFilter === 'unused') {
      filtered = filtered.filter(cat => (cat.item_count || 0) === 0);
    }

    this.filteredCategories = filtered;
  }

  getTotalItemCount(): number {
    return this.categories.reduce((sum, cat) => sum + (cat.item_count || 0), 0);
  }

  getUsedCategoriesCount(): number {
    return this.categories.filter(cat => (cat.item_count || 0) > 0).length;
  }

  getUnusedCategoriesCount(): number {
    return this.categories.filter(cat => (cat.item_count || 0) === 0).length;
  }

  goToCategory(id: number) {
    this.router.navigate(['/category', id]);
  }

  goToItems() {
    this.router.navigate(['/items']);
  }

  goToLocations() {
    this.router.navigate(['/locations']);
  }

  goToTags() {
    this.router.navigate(['/tags']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
