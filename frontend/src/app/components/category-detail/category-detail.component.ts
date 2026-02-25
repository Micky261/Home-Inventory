import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Item, Category } from '../../models/item.model';
import { ItemDetailComponent } from '../item-detail/item-detail.component';

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [CommonModule, ItemDetailComponent],
  template: `
    <div class="header">
      <div class="container">
        <h1>📁 {{ category?.name }}</h1>
        <div class="header-actions">
          <nav class="main-nav">
            <a class="nav-item" (click)="goToItems()">📦 Artikel</a>
            <a class="nav-item" (click)="goToLocations()">📍 Orte</a>
            <a class="nav-item" (click)="goToTags()">🏷️ Tags</a>
            <a class="nav-item active" (click)="goToCategories()">📁 Kategorien</a>
            <a class="nav-item" (click)="goToSettings()">⚙️ Einstellungen</a>
          </nav>
          <button class="btn btn-secondary" (click)="logout()" i18n="@@app.logout">
            Abmelden
          </button>
        </div>
      </div>
    </div>

    <div class="container" *ngIf="category">
      <div class="content-card">
        <div class="info-header">
          <div class="category-info">
            <span class="item-count-large">{{ items.length }}</span>
            <span class="item-label" i18n="@@category.itemsInCategory">Artikel in dieser Kategorie</span>
          </div>
        </div>

        <div class="share-section">
          <h3 i18n="@@category.shareLink">Direktlink zu dieser Kategorie</h3>
          <div class="share-url">
            <input type="text" [value]="shareUrl" readonly #urlInput />
            <button class="btn btn-secondary btn-sm" (click)="copyUrl(urlInput)" i18n="@@category.copyLink">Kopieren</button>
          </div>
          <span class="copy-success" *ngIf="copySuccess" i18n="@@category.copied">Kopiert!</span>
        </div>
      </div>

      <div class="content-card">
        <h2 i18n="@@category.itemsHere">Artikel in dieser Kategorie</h2>

        <div class="table-container" *ngIf="items.length > 0">
          <table>
            <thead>
              <tr>
                <th i18n="@@category.itemImage">Bild</th>
                <th i18n="@@category.itemName">Name</th>
                <th i18n="@@category.itemLocation">Ort</th>
                <th i18n="@@category.itemTags">Tags</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items" (click)="viewItemDetails(item)" class="clickable-row">
                <td>
                  <img *ngIf="item.bild" [src]="getThumbnailUrl(item.bild)" alt="" class="thumbnail" />
                  <div *ngIf="!item.bild" class="no-image">-</div>
                </td>
                <td class="name-cell">{{ item.name }}</td>
                <td>
                  <a *ngIf="item.ort_id" class="location-link" (click)="goToLocation(item.ort_id!, $event)">
                    {{ item.ort_path || item.ort_name }}
                  </a>
                  <span *ngIf="!item.ort_id">-</span>
                </td>
                <td>
                  <div class="tags-container">
                    <span *ngFor="let tag of item.tags"
                          class="tag-badge tag-link"
                          [style.background-color]="tag.color"
                          [style.color]="getTextColor(tag.color)"
                          (click)="goToTag(tag.id, $event)">
                      {{ tag.name }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="items.length === 0" i18n="@@category.noItems">
          Keine Artikel in dieser Kategorie vorhanden.
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="loading" i18n="@@category.loading">
      Lade...
    </div>

    <app-item-detail
      *ngIf="showDetail && detailItem"
      [item]="detailItem"
      (close)="closeDetail()"
      (edit)="goToItemEdit($event)"
    ></app-item-detail>
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
    }

    .content-card {
      background: white;
      border-radius: 8px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .content-card h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      color: #2c3e50;
      border-bottom: 2px solid #9b59b6;
      padding-bottom: 10px;
    }

    .info-header {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 20px;
    }

    .category-info {
      text-align: center;
    }

    .item-count-large {
      display: block;
      font-size: 48px;
      font-weight: 700;
      color: #9b59b6;
    }

    .item-label {
      font-size: 16px;
      color: #7f8c8d;
    }

    .share-section {
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
    }

    .share-section h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #7f8c8d;
      font-weight: 500;
    }

    .share-url {
      display: flex;
      gap: 8px;
    }

    .share-url input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-family: monospace;
      font-size: 13px;
      background: #f8f9fa;
    }

    .copy-success {
      color: #27ae60;
      font-size: 13px;
      margin-top: 8px;
      display: block;
    }

    .table-container {
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }

    th {
      background: #9b59b6;
      color: white;
      font-weight: 600;
    }

    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background-color: #f8f9fa;
    }

    .thumbnail {
      width: 50px;
      height: 50px;
      object-fit: contain;
      border-radius: 4px;
    }

    .no-image {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      color: #95a5a6;
      border-radius: 4px;
    }

    .name-cell {
      font-weight: 500;
    }

    .location-link {
      color: #3498db;
      cursor: pointer;
      text-decoration: none;
    }

    .location-link:hover {
      text-decoration: underline;
    }

    .tags-container {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .tag-badge {
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
    }

    .tag-link {
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .tag-link:hover {
      transform: scale(1.05);
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #95a5a6;
      font-style: italic;
    }

    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }
  `]
})
export class CategoryDetailComponent implements OnInit {
  category: Category | null = null;
  items: Item[] = [];
  loading = true;
  copySuccess = false;
  shareUrl = '';
  showDetail = false;
  detailItem: Item | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      if (id) {
        this.loadCategoryDetails(id);
        this.shareUrl = window.location.href;
      }
    });
  }

  loadCategoryDetails(id: number) {
    this.loading = true;
    this.apiService.getCategoryDetails(id).subscribe({
      next: (data) => {
        this.category = data.category;
        this.items = data.items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading category details:', err);
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          this.router.navigate(['/categories']);
        }
      }
    });
  }

  copyUrl(input: HTMLInputElement) {
    input.select();
    document.execCommand('copy');
    this.copySuccess = true;
    setTimeout(() => this.copySuccess = false, 2000);
  }

  goToCategories() {
    this.router.navigate(['/categories']);
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

  goToLocation(locationId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/location', locationId]);
  }

  goToTag(tagId: number, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/tag', tagId]);
  }

  viewItemDetails(item: Item) {
    this.detailItem = item;
    this.showDetail = true;
  }

  closeDetail() {
    this.showDetail = false;
    this.detailItem = null;
  }

  goToItemEdit(item: Item) {
    this.router.navigate(['/items'], { queryParams: { edit: item.id } });
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  getThumbnailUrl(filename: string): string {
    return this.apiService.getThumbnailUrl(filename);
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
