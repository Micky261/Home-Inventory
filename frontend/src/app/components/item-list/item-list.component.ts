import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Item, Location } from '../../models/item.model';
import { ItemFormComponent } from '../item-form/item-form.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemFormComponent],
  template: `
    <div class="header">
      <div class="container">
        <h1 i18n="@@app.title">Home Inventory System</h1>
        <div class="header-actions">
          <button class="btn btn-success" (click)="openAddModal()" i18n="@@items.add">
            + Add Item
          </button>
          <button class="btn btn-secondary" (click)="logout()" i18n="@@app.logout">
            Logout
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
          [placeholder]="'items.search' | i18nPlaceholder"
          i18n-placeholder="@@items.search"
        />
        <select [(ngModel)]="filterKategorie" (change)="search()">
          <option value="" i18n="@@items.allCategories">All Categories</option>
          <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
        </select>
        <select [(ngModel)]="filterOrt" (change)="search()">
          <option value="" i18n="@@items.allLocations">All Locations</option>
          <option *ngFor="let loc of locations" [value]="loc.id">{{ loc.name }}</option>
        </select>
      </div>

      <div *ngIf="loading" class="loading" i18n="@@app.loading">
        Loading...
      </div>

      <div *ngIf="!loading" class="table-container">
        <table>
          <thead>
            <tr>
              <th i18n="@@items.image">Image</th>
              <th i18n="@@items.name">Name</th>
              <th i18n="@@items.category">Category</th>
              <th i18n="@@items.location">Location</th>
              <th i18n="@@items.quantity">Quantity</th>
              <th i18n="@@items.price">Price</th>
              <th i18n="@@items.actions">Actions</th>
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
                <div *ngIf="!item.bild" class="no-image" i18n="@@items.noImage">No Image</div>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item.kategorie || '-' }}</td>
              <td>{{ item.ort_name || '-' }}</td>
              <td>{{ item.menge ? (item.menge + ' ' + (item.einheit || '')) : '-' }}</td>
              <td>{{ item.preis ? (item.preis + ' €') : '-' }}</td>
              <td>
                <div class="action-buttons">
                  <button class="icon-btn" (click)="editItem(item)" title="Edit" i18n-title="@@items.edit">
                    ✏️
                  </button>
                  <button class="icon-btn" (click)="deleteItem(item)" title="Delete" i18n-title="@@items.delete">
                    🗑️
                  </button>
                  <a
                    *ngIf="item.link"
                    [href]="item.link"
                    target="_blank"
                    class="icon-btn"
                    title="Open Link"
                    i18n-title="@@items.openLink"
                  >
                    🔗
                  </a>
                  <a
                    *ngIf="item.datenblatt_type === 'file' && item.datenblatt_value"
                    [href]="getDatasheetUrl(item.datenblatt_value)"
                    target="_blank"
                    class="icon-btn"
                    title="View Datasheet"
                    i18n-title="@@items.viewDatasheet"
                  >
                    📄
                  </a>
                  <a
                    *ngIf="item.datenblatt_type === 'url' && item.datenblatt_value"
                    [href]="item.datenblatt_value"
                    target="_blank"
                    class="icon-btn"
                    title="View Datasheet"
                    i18n-title="@@items.viewDatasheet"
                  >
                    📄
                  </a>
                </div>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="7" style="text-align: center; padding: 40px;" i18n="@@items.noItems">
                No items found. Click "Add Item" to create one.
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
  `
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  locations: Location[] = [];
  categories: string[] = [];
  searchQuery = '';
  filterKategorie = '';
  filterOrt = '';
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
  }

  search() {
    this.loading = true;
    this.apiService.getItems(
      this.searchQuery || undefined,
      this.filterKategorie || undefined,
      this.filterOrt || undefined
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
    if (confirm('Are you sure you want to delete this item?')) {
      this.apiService.deleteItem(item.id!).subscribe({
        next: () => {
          this.loadData();
        },
        error: (err) => {
          console.error('Error deleting item:', err);
          alert('Failed to delete item');
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
          alert('Failed to update item');
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
          alert('Failed to create item');
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

  logout() {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }
}
