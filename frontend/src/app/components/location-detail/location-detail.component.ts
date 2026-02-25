import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Item, Location, LocationDetails, Tag } from '../../models/item.model';
import { ItemDetailComponent } from '../item-detail/item-detail.component';

@Component({
  selector: 'app-location-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemDetailComponent],
  template: `
    <div class="header">
      <div class="container">
        <h1>{{ location?.path || location?.name }}</h1>
        <div class="header-actions">
          <nav class="main-nav">
            <a class="nav-item" (click)="goToItems()">📦 Artikel</a>
            <a class="nav-item active" (click)="goToLocations()">📍 Orte</a>
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

    <div class="container" *ngIf="location">
      <div class="content-card">
        <div class="info-header">
          <div class="status-badge" [class]="'status-' + (location.inventory_status || 'none')">
            <span *ngIf="location.inventory_status === 'complete'" i18n="@@location.statusComplete">Vollständig inventarisiert</span>
            <span *ngIf="location.inventory_status === 'partial'" i18n="@@location.statusPartial">Teilweise inventarisiert</span>
            <span *ngIf="!location.inventory_status || location.inventory_status === 'none'" i18n="@@location.statusNone">Nicht inventarisiert</span>
          </div>
          <button class="btn btn-secondary btn-sm" (click)="toggleEdit()" *ngIf="!editing" i18n="@@location.edit">
            ✏️ Bearbeiten
          </button>
        </div>

        <div class="description-section" *ngIf="!editing">
          <h3 i18n="@@location.description">Beschreibung</h3>
          <p *ngIf="location.description" class="description-text">{{ location.description }}</p>
          <p *ngIf="!location.description" class="no-description" i18n="@@location.noDescription">Keine Beschreibung vorhanden</p>
        </div>

        <div class="edit-section" *ngIf="editing">
          <div class="form-group">
            <label i18n="@@location.inventoryStatus">Inventarisierungsstatus</label>
            <select [(ngModel)]="editStatus">
              <option value="none" i18n="@@location.statusNoneOption">Nicht inventarisiert</option>
              <option value="partial" i18n="@@location.statusPartialOption">Teilweise inventarisiert</option>
              <option value="complete" i18n="@@location.statusCompleteOption">Vollständig inventarisiert</option>
            </select>
          </div>
          <div class="form-group">
            <label i18n="@@location.descriptionLabel">Beschreibung</label>
            <textarea [(ngModel)]="editDescription" rows="4" i18n-placeholder="@@location.descriptionPlaceholder" placeholder="Beschreibung eingeben..."></textarea>
          </div>
          <div class="edit-actions">
            <button class="btn btn-primary" (click)="saveDetails()" i18n="@@location.save">Speichern</button>
            <button class="btn btn-secondary" (click)="cancelEdit()" i18n="@@location.cancel">Abbrechen</button>
          </div>
        </div>

        <div class="share-section">
          <h3 i18n="@@location.shareLink">Direktlink zu diesem Ort</h3>
          <div class="share-url">
            <input type="text" [value]="shareUrl" readonly #urlInput />
            <button class="btn btn-secondary btn-sm" (click)="copyUrl(urlInput)" i18n="@@location.copyLink">Kopieren</button>
          </div>
          <span class="copy-success" *ngIf="copySuccess" i18n="@@location.copied">Kopiert!</span>
        </div>
      </div>

      <div class="content-card" *ngIf="children.length > 0">
        <h2 i18n="@@location.subLocations">Untergeordnete Orte</h2>
        <div class="children-grid">
          <div class="child-card" *ngFor="let child of children" (click)="goToLocation(child.id)">
            <div class="child-name">{{ child.name }}</div>
            <div class="child-status" [class]="'status-' + (child.inventory_status || 'none')">
              <span *ngIf="child.inventory_status === 'complete'" i18n="@@location.complete">Vollständig</span>
              <span *ngIf="child.inventory_status === 'partial'" i18n="@@location.partial">Teilweise</span>
              <span *ngIf="!child.inventory_status || child.inventory_status === 'none'" i18n="@@location.notInventoried">Nicht erfasst</span>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <h2 i18n="@@location.itemsHere">Artikel an diesem Ort</h2>
        <p class="item-count">{{ items.length }} <span i18n="@@location.itemsCount">Artikel</span></p>

        <div class="table-container" *ngIf="items.length > 0">
          <table>
            <thead>
              <tr>
                <th i18n="@@location.itemImage">Bild</th>
                <th i18n="@@location.itemName">Name</th>
                <th i18n="@@location.itemCategory">Kategorie</th>
                <th i18n="@@location.itemQuantity">Menge</th>
                <th i18n="@@location.itemTags">Tags</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of items" (click)="viewItemDetails(item)" class="clickable-row">
                <td>
                  <img *ngIf="item.bild" [src]="getThumbnailUrl(item.bild)" alt="" class="thumbnail" />
                  <div *ngIf="!item.bild" class="no-image">-</div>
                </td>
                <td class="name-cell">{{ item.name }}</td>
                <td>{{ item.kategorie_name || '-' }}</td>
                <td>{{ item.menge || '-' }} {{ item.einheit || '' }}</td>
                <td>
                  <div class="tags-container">
                    <span *ngFor="let tag of item.tags"
                          class="tag-badge"
                          [style.background-color]="tag.color"
                          [style.color]="getTextColor(tag.color)">
                      {{ tag.name }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="items.length === 0" i18n="@@location.noItems">
          Keine Artikel an diesem Ort vorhanden.
        </div>
      </div>
    </div>

    <div class="loading" *ngIf="loading" i18n="@@location.loading">
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
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }

    .info-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .status-badge {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 14px;
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

    .description-section h3,
    .share-section h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #7f8c8d;
      font-weight: 500;
    }

    .description-text {
      margin: 0;
      white-space: pre-wrap;
      line-height: 1.6;
    }

    .no-description {
      color: #95a5a6;
      font-style: italic;
      margin: 0;
    }

    .share-section {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #ecf0f1;
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

    .edit-section {
      margin-top: 16px;
    }

    .edit-actions {
      display: flex;
      gap: 12px;
    }

    .children-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 16px;
    }

    .child-card {
      background: #f8f9fa;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 16px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .child-card:hover {
      border-color: #3498db;
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.2);
      transform: translateY(-2px);
    }

    .child-name {
      font-weight: 600;
      margin-bottom: 8px;
      color: #2c3e50;
    }

    .child-status {
      font-size: 12px;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
    }

    .item-count {
      color: #7f8c8d;
      margin: 0 0 16px 0;
    }

    .clickable-row {
      cursor: pointer;
    }

    .name-cell {
      font-weight: 500;
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
export class LocationDetailComponent implements OnInit {
  location: Location | null = null;
  items: Item[] = [];
  children: Location[] = [];
  loading = true;
  editing = false;
  editDescription = '';
  editStatus: 'none' | 'partial' | 'complete' = 'none';
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
        this.loadLocationDetails(id);
        this.shareUrl = window.location.href;
      }
    });
  }

  loadLocationDetails(id: number) {
    this.loading = true;
    this.apiService.getLocationDetails(id).subscribe({
      next: (data: LocationDetails) => {
        this.location = data.location;
        this.items = data.items;
        this.children = data.children;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading location details:', err);
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        } else if (err.status === 404) {
          this.router.navigate(['/locations']);
        }
      }
    });
  }

  toggleEdit() {
    this.editing = true;
    this.editDescription = this.location?.description || '';
    this.editStatus = this.location?.inventory_status || 'none';
  }

  cancelEdit() {
    this.editing = false;
  }

  saveDetails() {
    if (!this.location) return;

    this.apiService.updateLocationDetails(
      this.location.id,
      this.editDescription || null,
      this.editStatus
    ).subscribe({
      next: (updated) => {
        this.location = { ...this.location, ...updated };
        this.editing = false;
      },
      error: (err) => {
        console.error('Error updating location:', err);
        alert('Fehler beim Speichern');
      }
    });
  }

  copyUrl(input: HTMLInputElement) {
    input.select();
    document.execCommand('copy');
    this.copySuccess = true;
    setTimeout(() => this.copySuccess = false, 2000);
  }

  goToLocations() {
    this.router.navigate(['/locations']);
  }

  goToItems() {
    this.router.navigate(['/items']);
  }

  goToTags() {
    this.router.navigate(['/tags']);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  goToCategories() {
    this.router.navigate(['/categories']);
  }

  goToLocation(id: number) {
    this.router.navigate(['/location', id]);
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
