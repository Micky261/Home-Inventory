import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Location } from '../../models/item.model';

@Component({
  selector: 'app-location-overview',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div class="container">
        <h1 i18n="@@locations.title">Orte-Übersicht</h1>
        <div class="header-actions">
          <nav class="main-nav">
            <a class="nav-item" (click)="goToItems()">📦 Artikel</a>
            <span class="nav-item active">📍 Orte</span>
            <a class="nav-item" (click)="goToTags()">🏷️ Tags</a>
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
          <div class="stat-value">{{ locations.length }}</div>
          <div class="stat-label" i18n="@@locations.totalLocations">Orte gesamt</div>
        </div>
        <div class="stat-card status-complete">
          <div class="stat-value">{{ getStatusCount('complete') }}</div>
          <div class="stat-label" i18n="@@locations.complete">Vollständig</div>
        </div>
        <div class="stat-card status-partial">
          <div class="stat-value">{{ getStatusCount('partial') }}</div>
          <div class="stat-label" i18n="@@locations.partial">Teilweise</div>
        </div>
        <div class="stat-card status-none">
          <div class="stat-value">{{ getStatusCount('none') }}</div>
          <div class="stat-label" i18n="@@locations.notInventoried">Nicht erfasst</div>
        </div>
      </div>

      <!-- Filter -->
      <div class="filter-bar">
        <div class="search-box">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="filterLocations()"
            placeholder="Orte suchen..."
            i18n-placeholder="@@locations.search"
          />
        </div>
        <div class="status-filter">
          <label i18n="@@locations.filterStatus">Status:</label>
          <select [(ngModel)]="statusFilter" (change)="filterLocations()">
            <option value="" i18n="@@locations.allStatuses">Alle</option>
            <option value="complete" i18n="@@locations.statusComplete">Vollständig</option>
            <option value="partial" i18n="@@locations.statusPartial">Teilweise</option>
            <option value="none" i18n="@@locations.statusNone">Nicht erfasst</option>
          </select>
        </div>
        <div class="view-toggle">
          <button
            class="view-btn"
            [class.active]="viewMode === 'tree'"
            (click)="viewMode = 'tree'"
            title="Baumansicht"
            i18n-title="@@locations.treeView"
          >
            🌳
          </button>
          <button
            class="view-btn"
            [class.active]="viewMode === 'cards'"
            (click)="viewMode = 'cards'"
            title="Kachelansicht"
            i18n-title="@@locations.cardView"
          >
            ⊞
          </button>
        </div>
      </div>

      <!-- Tree View -->
      <div class="content-card" *ngIf="viewMode === 'tree'">
        <div class="tree-view">
          <ng-container *ngFor="let loc of filteredTreeLocations">
            <ng-container *ngTemplateOutlet="locationNode; context: { $implicit: loc, level: 0 }"></ng-container>
          </ng-container>
          <div *ngIf="filteredTreeLocations.length === 0" class="empty-state" i18n="@@locations.noLocations">
            Keine Orte gefunden.
          </div>
        </div>
      </div>

      <!-- Card View -->
      <div class="cards-grid" *ngIf="viewMode === 'cards'">
        <div
          class="location-card"
          *ngFor="let loc of filteredLocations"
          (click)="goToLocation(loc.id)"
        >
          <div class="card-header">
            <span class="card-name">{{ loc.name }}</span>
            <span class="card-status" [class]="'status-' + (loc.inventory_status || 'none')">
              <span *ngIf="loc.inventory_status === 'complete'" i18n="@@locations.complete">Vollständig</span>
              <span *ngIf="loc.inventory_status === 'partial'" i18n="@@locations.partial">Teilweise</span>
              <span *ngIf="!loc.inventory_status || loc.inventory_status === 'none'" i18n="@@locations.notInventoried">Nicht erfasst</span>
            </span>
          </div>
          <div class="card-item-count">
            <span class="item-count-value">{{ loc.item_count || 0 }}</span>
            <span class="item-count-label" i18n="@@locations.items">Artikel</span>
          </div>
          <div class="card-path" *ngIf="loc.path && loc.path !== loc.name">
            📍 {{ loc.path }}
          </div>
          <div class="card-description" *ngIf="loc.description">
            {{ loc.description | slice:0:100 }}{{ loc.description.length > 100 ? '...' : '' }}
          </div>
        </div>
        <div *ngIf="filteredLocations.length === 0" class="empty-state" i18n="@@locations.noLocations">
          Keine Orte gefunden.
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="loading" i18n="@@app.loading">
      Lade...
    </div>

    <!-- Tree Node Template -->
    <ng-template #locationNode let-loc let-level="level">
      <div class="tree-node" [style.padding-left.px]="level * 24">
        <div class="tree-item" (click)="goToLocation(loc.id)">
          <span class="tree-icon" *ngIf="loc.children?.length">📁</span>
          <span class="tree-icon" *ngIf="!loc.children?.length">📄</span>
          <span class="tree-name">{{ loc.name }}</span>
          <span class="tree-item-count">({{ loc.item_count || 0 }})</span>
          <span class="tree-status" [class]="'status-' + (loc.inventory_status || 'none')">
            <span *ngIf="loc.inventory_status === 'complete'" i18n="@@locations.complete">Vollständig</span>
            <span *ngIf="loc.inventory_status === 'partial'" i18n="@@locations.partial">Teilweise</span>
            <span *ngIf="!loc.inventory_status || loc.inventory_status === 'none'" i18n="@@locations.notInventoried">Nicht erfasst</span>
          </span>
        </div>
        <ng-container *ngIf="loc.children?.length">
          <ng-container *ngFor="let child of loc.children">
            <ng-container *ngTemplateOutlet="locationNode; context: { $implicit: child, level: level + 1 }"></ng-container>
          </ng-container>
        </ng-container>
      </div>
    </ng-template>
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

    .stat-card.status-complete {
      border-left-color: #27ae60;
    }

    .stat-card.status-partial {
      border-left-color: #f39c12;
    }

    .stat-card.status-none {
      border-left-color: #e74c3c;
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

    .status-filter {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-filter label {
      font-weight: 500;
      color: #2c3e50;
    }

    .status-filter select {
      padding: 10px 14px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
      background: white;
    }

    .view-toggle {
      display: flex;
      gap: 5px;
    }

    .view-btn {
      padding: 8px 12px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      font-size: 18px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .view-btn:hover {
      background: #f8f9fa;
    }

    .view-btn.active {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }

    .content-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tree-view {
      font-size: 14px;
    }

    .tree-node {
      border-left: 1px solid #e0e0e0;
      margin-left: 12px;
    }

    .tree-node:first-child {
      border-left: none;
      margin-left: 0;
    }

    .tree-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      cursor: pointer;
      border-radius: 6px;
      transition: all 0.2s;
      margin: 4px 0;
    }

    .tree-item:hover {
      background: #f8f9fa;
    }

    .tree-icon {
      font-size: 16px;
    }

    .tree-name {
      font-weight: 500;
      color: #2c3e50;
    }

    .tree-item-count {
      color: #7f8c8d;
      font-size: 13px;
      margin-left: 6px;
      flex: 1;
    }

    .tree-status {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .status-complete {
      background: #27ae60;
      color: white;
    }

    .status-partial {
      background: #f39c12;
      color: white;
    }

    .status-none {
      background: #e74c3c;
      color: white;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
    }

    .location-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      cursor: pointer;
      transition: all 0.2s;
      border: 2px solid transparent;
    }

    .location-card:hover {
      border-color: #3498db;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }

    .card-name {
      font-size: 18px;
      font-weight: 600;
      color: #2c3e50;
    }

    .card-item-count {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 10px;
    }

    .item-count-value {
      font-size: 24px;
      font-weight: 700;
      color: #3498db;
    }

    .item-count-label {
      font-size: 13px;
      color: #7f8c8d;
    }

    .card-status {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: 12px;
    }

    .card-path {
      font-size: 13px;
      color: #7f8c8d;
      margin-bottom: 8px;
    }

    .card-description {
      font-size: 14px;
      color: #333;
      line-height: 1.5;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #eee;
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
export class LocationOverviewComponent implements OnInit {
  locations: Location[] = [];
  treeLocations: Location[] = [];
  filteredLocations: Location[] = [];
  filteredTreeLocations: Location[] = [];
  loading = true;
  searchQuery = '';
  statusFilter = '';
  viewMode: 'tree' | 'cards' = 'cards';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadLocations();
  }

  loadLocations() {
    this.loading = true;

    // Load flat list for cards and filtering
    this.apiService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.filterLocations();
      },
      error: (err) => {
        console.error('Error loading locations:', err);
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });

    // Load tree for tree view
    this.apiService.getLocationsTree().subscribe({
      next: (tree) => {
        this.treeLocations = tree;
        this.filteredTreeLocations = tree;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading location tree:', err);
        this.loading = false;
      }
    });
  }

  filterLocations() {
    let filtered = [...this.locations];

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(loc =>
        loc.name.toLowerCase().includes(query) ||
        (loc.path && loc.path.toLowerCase().includes(query)) ||
        (loc.description && loc.description.toLowerCase().includes(query))
      );
    }

    // Filter by status
    if (this.statusFilter) {
      filtered = filtered.filter(loc => {
        const status = loc.inventory_status || 'none';
        return status === this.statusFilter;
      });
    }

    this.filteredLocations = filtered;

    // For tree view, filter but keep hierarchy
    if (this.searchQuery || this.statusFilter) {
      const matchingIds = new Set(filtered.map(l => l.id));
      this.filteredTreeLocations = this.filterTree(this.treeLocations, matchingIds);
    } else {
      this.filteredTreeLocations = this.treeLocations;
    }
  }

  filterTree(nodes: Location[], matchingIds: Set<number>): Location[] {
    const result: Location[] = [];

    for (const node of nodes) {
      const children = node.children ? this.filterTree(node.children, matchingIds) : [];
      const hasMatchingChildren = children.length > 0;
      const isMatch = matchingIds.has(node.id);

      if (isMatch || hasMatchingChildren) {
        result.push({
          ...node,
          children: children.length > 0 ? children : undefined
        });
      }
    }

    return result;
  }

  getStatusCount(status: string): number {
    return this.locations.filter(loc => {
      const locStatus = loc.inventory_status || 'none';
      return locStatus === status;
    }).length;
  }

  goToLocation(id: number) {
    this.router.navigate(['/location', id]);
  }

  goToItems() {
    this.router.navigate(['/items']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToTags() {
    this.router.navigate(['/tags']);
  }

  goToCategories() {
    this.router.navigate(['/categories']);
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
