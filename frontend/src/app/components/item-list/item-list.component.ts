import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Item, Location, Category, Tag } from '../../models/item.model';
import { ItemFormComponent } from '../item-form/item-form.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemFormComponent],
  template: `
    <div class="header">
      <div class="container">
        <h1 i18n="@@app.title">Heiminventar-System</h1>
        <div class="header-actions">
          <button class="btn btn-success" (click)="openAddModal()" i18n="@@items.add">
            + Artikel hinzufügen
          </button>
          <button class="btn btn-primary" (click)="goToSettings()" i18n="@@items.settings">
            ⚙️ Einstellungen
          </button>
          <button class="btn btn-secondary" (click)="logout()" i18n="@@app.logout">
            Abmelden
          </button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="search-bar">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          (input)="search()"
          placeholder="Suchen..."
          i18n-placeholder="@@items.search"
        />
        <select [(ngModel)]="filterKategorie" (change)="search()">
          <option value="" i18n="@@items.allCategories">Alle Kategorien</option>
          <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
        </select>
        <select [(ngModel)]="filterOrt" (change)="search()">
          <option value="" i18n="@@items.allLocations">Alle Orte</option>
          <option *ngFor="let loc of locations" [value]="loc.id">{{ loc.path || loc.name }}</option>
        </select>
        <select [(ngModel)]="filterTag" (change)="search()">
          <option value="" i18n="@@items.allTags">Alle Tags</option>
          <option *ngFor="let tag of tags" [value]="tag.id">{{ tag.name }}</option>
        </select>
      </div>

      <div *ngIf="loading" class="loading" i18n="@@app.loading">
        Lädt...
      </div>

      <div *ngIf="!loading" class="table-container">
        <table>
          <thead>
            <tr>
              <th i18n="@@items.image">Bild</th>
              <th i18n="@@items.name">Name</th>
              <th i18n="@@items.category">Kategorie</th>
              <th i18n="@@items.location">Ort</th>
              <th i18n="@@items.tags">Tags</th>
              <th i18n="@@items.quantity">Menge</th>
              <th i18n="@@items.price">Preis</th>
              <th i18n="@@items.actions">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items">
              <td>
                <img
                  *ngIf="item.bild"
                  [src]="getImageUrl(item.bild)"
                  class="thumbnail"
                  [alt]="item.name"
                />
                <div *ngIf="!item.bild" class="no-image" i18n="@@items.noImage">Kein Bild</div>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.kategorie_name || '-' }}</td>
              <td>{{ item.ort_path || item.ort_name || '-' }}</td>
              <td>
                <div class="tags-cell">
                  <span
                    *ngFor="let tag of item.tags"
                    class="tag-badge"
                    [style.background-color]="tag.color"
                  >
                    {{ tag.name }}
                  </span>
                  <span *ngIf="!item.tags || item.tags.length === 0" class="no-tags">-</span>
                </div>
              </td>
              <td>{{ item.menge ? (item.menge + ' ' + (item.einheit || '')) : '-' }}</td>
              <td>{{ item.preis ? (item.preis + ' €') : '-' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="icon-btn" (click)="editItem(item)" title="Bearbeiten" i18n-title="@@items.edit">
                    ✏️
                  </button>
                  <button class="icon-btn" (click)="deleteItem(item)" title="Löschen" i18n-title="@@items.delete">
                    🗑️
                  </button>
                  <a
                    *ngIf="item.link"
                    [href]="item.link"
                    target="_blank"
                    class="icon-btn"
                    title="Link öffnen"
                    i18n-title="@@items.openLink"
                  >
                    🔗
                  </a>
                  <a
                    *ngIf="item.datenblatt_type === 'file' && item.datenblatt_value"
                    [href]="getDatasheetUrl(item.datenblatt_value)"
                    target="_blank"
                    class="icon-btn"
                    title="Datenblatt anzeigen"
                    i18n-title="@@items.viewDatasheet"
                  >
                    📄
                  </a>
                  <a
                    *ngIf="item.datenblatt_type === 'url' && item.datenblatt_value"
                    [href]="item.datenblatt_value"
                    target="_blank"
                    class="icon-btn"
                    title="Datenblatt anzeigen"
                    i18n-title="@@items.viewDatasheet"
                  >
                    📄
                  </a>
                </div>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="8" style="text-align: center; padding: 40px;" i18n="@@items.noItems">
                Keine Artikel gefunden. Klicken Sie auf "Artikel hinzufügen" um einen zu erstellen.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <app-item-form
      *ngIf="showModal"
      [item]="selectedItem"
      [locations]="locations"
      (save)="onSaveItem($event)"
      (cancel)="closeModal()"
    ></app-item-form>
  `,
  styles: [`
    .tags-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .tag-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 10px;
      color: white;
      font-size: 12px;
      font-weight: 500;
    }

    .no-tags {
      color: #95a5a6;
      font-style: italic;
    }
  `]
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  locations: Location[] = [];
  categories: Category[] = [];
  tags: Tag[] = [];
  searchQuery = '';
  filterKategorie = '';
  filterOrt = '';
  filterTag = '';
  loading = false;
  showModal = false;
  selectedItem: Item | null = null;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.loading = true;
    this.apiService.getItems().subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading items:', err);
        this.loading = false;
        if (err.status === 401) {
          this.router.navigate(['/login']);
        }
      }
    });

    this.apiService.getLocations().subscribe({
      next: (locations) => this.locations = locations,
      error: (err) => console.error('Error loading locations:', err)
    });

    this.apiService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories:', err)
    });

    this.apiService.getTags().subscribe({
      next: (tags) => this.tags = tags,
      error: (err) => console.error('Error loading tags:', err)
    });
  }

  search() {
    this.loading = true;
    this.apiService.getItems(
      this.searchQuery || undefined,
      this.filterKategorie || undefined,
      this.filterOrt || undefined,
      this.filterTag || undefined
    ).subscribe({
      next: (items) => {
        this.items = items;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error searching items:', err);
        this.loading = false;
      }
    });
  }

  openAddModal() {
    this.selectedItem = null;
    this.showModal = true;
  }

  editItem(item: Item) {
    this.selectedItem = { ...item };
    this.showModal = true;
  }

  deleteItem(item: Item) {
    if (confirm('Möchten Sie diesen Artikel wirklich löschen?')) {
      this.apiService.deleteItem(item.id!).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          alert('Fehler beim Löschen des Artikels');
        }
      });
    }
  }

  onSaveItem(item: Item) {
    if (item.id) {
      this.apiService.updateItem(item.id, item).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          console.error('Error updating item:', err);
          alert('Fehler beim Aktualisieren des Artikels');
        }
      });
    } else {
      this.apiService.createItem(item).subscribe({
        next: () => {
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          console.error('Error creating item:', err);
          alert('Fehler beim Erstellen des Artikels');
        }
      });
    }
  }

  closeModal() {
    this.showModal = false;
    this.selectedItem = null;
  }

  getImageUrl(filename: string): string {
    return this.apiService.getImageUrl(filename);
  }

  getDatasheetUrl(filename: string): string {
    return this.apiService.getDatasheetUrl(filename);
  }

  goToSettings() {
    this.router.navigate(['/settings']);
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
