import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Item, Location, Category, Tag } from '../../models/item.model';
import { ItemFormComponent } from '../item-form/item-form.component';
import { ItemDetailComponent } from '../item-detail/item-detail.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemFormComponent, ItemDetailComponent],
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
      <div class="search-controls">
        <div class="search-row">
          <input
            type="text"
            [(ngModel)]="searchQuery"
            (input)="search()"
            placeholder="Suchen..."
            i18n-placeholder="@@items.search"
            class="search-input"
          />
          <button
            class="filter-toggle-btn"
            (click)="showFilters = !showFilters"
            i18n="@@items.filters"
          >
            🔍 Filter {{ showFilters ? '▲' : '▼' }}
          </button>
          <div class="view-toggle">
            <button
              class="view-btn"
              [class.active]="viewMode === 'list'"
              (click)="viewMode = 'list'"
              title="Listenansicht"
              i18n-title="@@items.listView"
            >
              ☰
            </button>
            <button
              class="view-btn"
              [class.active]="viewMode === 'cards'"
              (click)="viewMode = 'cards'"
              title="Kachelansicht"
              i18n-title="@@items.cardView"
            >
              ⊞
            </button>
          </div>
        </div>

        <div *ngIf="showFilters" class="filters-panel">
          <div class="filter-section">
            <div class="filter-header">
              <h4 i18n="@@items.categories">Kategorien</h4>
              <div class="filter-mode-toggle">
                <button
                  class="mode-btn"
                  [class.active]="categoryMode === 'union'"
                  (click)="categoryMode = 'union'; search()"
                  title="Mindestens eine Kategorie (ODER)"
                  i18n-title="@@items.categoryModeUnion"
                >
                  ODER
                </button>
                <button
                  class="mode-btn"
                  [class.active]="categoryMode === 'intersect'"
                  (click)="categoryMode = 'intersect'; search()"
                  title="Alle Kategorien (UND)"
                  i18n-title="@@items.categoryModeIntersect"
                >
                  UND
                </button>
              </div>
            </div>
            <div class="filter-options">
              <label *ngFor="let cat of categories" class="filter-checkbox">
                <input
                  type="checkbox"
                  [checked]="filterKategorien.includes(cat.id)"
                  (change)="toggleFilter('kategorie', cat.id)"
                />
                <span>{{ cat.name }}</span>
              </label>
              <div *ngIf="categories.length === 0" class="no-options" i18n="@@items.noCategories">
                Keine Kategorien vorhanden
              </div>
            </div>
          </div>

          <div class="filter-section">
            <div class="filter-header">
              <h4 i18n="@@items.locations">Orte</h4>
              <div class="filter-mode-toggle">
                <button
                  class="mode-btn"
                  [class.active]="locationMode === 'union'"
                  (click)="locationMode = 'union'; search()"
                  title="Mindestens ein Ort (ODER)"
                  i18n-title="@@items.locationModeUnion"
                >
                  ODER
                </button>
                <button
                  class="mode-btn"
                  [class.active]="locationMode === 'intersect'"
                  (click)="locationMode = 'intersect'; search()"
                  title="Alle Orte (UND)"
                  i18n-title="@@items.locationModeIntersect"
                >
                  UND
                </button>
              </div>
            </div>
            <div class="filter-options">
              <label *ngFor="let loc of locations" class="filter-checkbox">
                <input
                  type="checkbox"
                  [checked]="filterOrte.includes(loc.id)"
                  (change)="toggleFilter('ort', loc.id)"
                />
                <span>{{ loc.path || loc.name }}</span>
              </label>
              <div *ngIf="locations.length === 0" class="no-options" i18n="@@items.noLocations">
                Keine Orte vorhanden
              </div>
            </div>
          </div>

          <div class="filter-section">
            <div class="filter-header">
              <h4 i18n="@@items.tags">Tags</h4>
              <div class="tag-mode-toggle">
                <button
                  class="mode-btn"
                  [class.active]="tagMode === 'union'"
                  (click)="tagMode = 'union'; search()"
                  title="Mindestens ein Tag (ODER)"
                  i18n-title="@@items.tagModeUnion"
                >
                  ODER
                </button>
                <button
                  class="mode-btn"
                  [class.active]="tagMode === 'intersect'"
                  (click)="tagMode = 'intersect'; search()"
                  title="Alle Tags (UND)"
                  i18n-title="@@items.tagModeIntersect"
                >
                  UND
                </button>
              </div>
            </div>
            <div class="filter-options">
              <label *ngFor="let tag of tags" class="filter-checkbox">
                <input
                  type="checkbox"
                  [checked]="filterTags.includes(tag.id)"
                  (change)="toggleFilter('tag', tag.id)"
                />
                <span class="tag-badge"
                      [style.background-color]="tag.color"
                      [style.color]="getTextColor(tag.color)">
                  {{ tag.name }}
                </span>
              </label>
              <div *ngIf="tags.length === 0" class="no-options" i18n="@@items.noTags">
                Keine Tags vorhanden
              </div>
            </div>
          </div>

          <div class="filter-actions">
            <button class="btn btn-secondary" (click)="clearFilters()" i18n="@@items.clearFilters">
              Filter zurücksetzen
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading" class="loading" i18n="@@app.loading">
        Lädt...
      </div>

      <!-- Bulk Edit Toolbar -->
      <div *ngIf="selectedItemIds.size > 0" class="bulk-toolbar">
        <div class="bulk-toolbar-content">
          <span class="bulk-count">{{ selectedItemIds.size }} ausgewählt</span>
          <button class="btn btn-primary" (click)="openBulkEdit()">
            ✏️ Massenbearbeitung
          </button>
          <button class="btn btn-secondary" (click)="clearSelection()">
            Auswahl aufheben
          </button>
        </div>
      </div>

      <!-- List View -->
      <div *ngIf="!loading && viewMode === 'list'" class="table-container">
        <table>
          <thead>
            <tr>
              <th class="checkbox-column">
                <input
                  type="checkbox"
                  [checked]="allSelected"
                  (change)="toggleSelectAll()"
                  title="Alle auswählen"
                />
              </th>
              <th i18n="@@items.image">Bild</th>
              <th class="sortable" (click)="sortBy('name')">
                <span i18n="@@items.name">Name</span> {{ getSortIcon('name') }}
              </th>
              <th class="sortable" (click)="sortBy('category')">
                <span i18n="@@items.category">Kategorie</span> {{ getSortIcon('category') }}
              </th>
              <th class="sortable" (click)="sortBy('location')">
                <span i18n="@@items.location">Ort</span> {{ getSortIcon('location') }}
              </th>
              <th i18n="@@items.tags">Tags</th>
              <th i18n="@@items.actions">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items" class="clickable-row" (click)="viewItemDetails(item)">
              <td (click)="$event.stopPropagation()" class="checkbox-column">
                <input
                  type="checkbox"
                  [checked]="isItemSelected(item.id!)"
                  (change)="toggleItemSelection(item.id!)"
                />
              </td>
              <td>
                <img
                  *ngIf="item.bild"
                  [src]="getThumbnailUrl(item.bild)"
                  class="thumbnail"
                  [alt]="item.name"
                />
                <div *ngIf="!item.bild" class="no-image" i18n="@@items.noImage">Kein Bild</div>
              </td>
              <td>
                <div>{{ item.name }}</div>
                <small class="item-meta" *ngIf="item.artikelnummer || item.farbe || item.menge">
                  <span *ngIf="item.artikelnummer">Art.-Nr.: {{ item.artikelnummer }}</span>
                  <span *ngIf="item.artikelnummer && (item.farbe || item.menge)"> • </span>
                  <span *ngIf="item.farbe">{{ item.farbe }}</span>
                  <span *ngIf="item.farbe && item.menge"> • </span>
                  <span *ngIf="item.menge">{{ item.menge }} {{ item.einheit || 'Stk' }}</span>
                </small>
                <small class="item-meta" *ngIf="item.hersteller || item.haendler">
                  <span *ngIf="item.hersteller">{{ item.hersteller }}</span>
                  <span *ngIf="item.hersteller && item.haendler"> • </span>
                  <span *ngIf="item.haendler">{{ item.haendler }}</span>
                </small>
              </td>
              <td>{{ item.kategorie_name || '-' }}</td>
              <td>{{ item.ort_path || item.ort_name || '-' }}</td>
              <td>
                <div class="tags-cell">
                  <span
                    *ngFor="let tag of item.tags"
                    class="tag-badge"
                    [style.background-color]="tag.color"
                    [style.color]="getTextColor(tag.color)"
                  >
                    {{ tag.name }}
                  </span>
                  <span *ngIf="!item.tags || item.tags.length === 0" class="no-tags">-</span>
                </div>
              </td>
              <td (click)="$event.stopPropagation()">
                <div class="action-buttons">
                  <button class="icon-btn" (click)="editItem(item)" title="Bearbeiten" i18n-title="@@items.edit">
                    ✏️
                  </button>
                  <button class="icon-btn" (click)="copyItem(item)" title="Kopieren" i18n-title="@@items.copy">
                    📋
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
                  <a
                    *ngIf="item.weitere_datei_type === 'file' && item.weitere_datei_value"
                    [href]="getDatasheetUrl(item.weitere_datei_value)"
                    target="_blank"
                    class="icon-btn"
                    title="Weitere Datei anzeigen"
                  >
                    📎
                  </a>
                  <a
                    *ngIf="item.weitere_datei_type === 'url' && item.weitere_datei_value"
                    [href]="item.weitere_datei_value"
                    target="_blank"
                    class="icon-btn"
                    title="Weitere Datei anzeigen"
                  >
                    📎
                  </a>
                </div>
              </td>
            </tr>
            <tr *ngIf="items.length === 0">
              <td colspan="6" style="text-align: center; padding: 40px;" i18n="@@items.noItems">
                Keine Artikel gefunden. Klicken Sie auf "Artikel hinzufügen" um einen zu erstellen.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Card View -->
      <div *ngIf="!loading && viewMode === 'cards'" class="cards-container">
        <div *ngFor="let item of items" class="item-card" (click)="viewItemDetails(item)">
          <div class="card-image">
            <img
              *ngIf="item.bild"
              [src]="getThumbnailUrl(item.bild)"
              [alt]="item.name"
            />
            <div *ngIf="!item.bild" class="no-image-card" i18n="@@items.noImage">Kein Bild</div>
          </div>
          <div class="card-content">
            <h3>{{ item.name }}</h3>
            <small class="item-meta" *ngIf="item.artikelnummer || item.farbe || item.menge">
              <span *ngIf="item.artikelnummer">Art.-Nr.: {{ item.artikelnummer }}</span>
              <span *ngIf="item.artikelnummer && (item.farbe || item.menge)"> • </span>
              <span *ngIf="item.farbe">{{ item.farbe }}</span>
              <span *ngIf="item.farbe && item.menge"> • </span>
              <span *ngIf="item.menge">{{ item.menge }} {{ item.einheit || 'Stk' }}</span>
            </small>
            <small class="item-meta" *ngIf="item.hersteller || item.haendler">
              <span *ngIf="item.hersteller">{{ item.hersteller }}</span>
              <span *ngIf="item.hersteller && item.haendler"> • </span>
              <span *ngIf="item.haendler">{{ item.haendler }}</span>
            </small>
            <div class="card-info">
              <div *ngIf="item.kategorie_name" class="info-row">
                <span class="label" i18n="@@items.category">Kategorie</span>
                <span>{{ item.kategorie_name }}</span>
              </div>
              <div *ngIf="item.ort_path || item.ort_name" class="info-row">
                <span class="label" i18n="@@items.location">Ort</span>
                <span>{{ item.ort_path || item.ort_name }}</span>
              </div>
              <div *ngIf="item.preis" class="info-row">
                <span class="label" i18n="@@items.price">Preis</span>
                <span>{{ item.preis | number:'1.2-2' }} €</span>
              </div>
              <div *ngIf="item.tags && item.tags.length > 0" class="card-tags">
                <span
                  *ngFor="let tag of item.tags"
                  class="tag-badge"
                  [style.background-color]="tag.color"
                  [style.color]="getTextColor(tag.color)"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
            <div class="card-actions" (click)="$event.stopPropagation()">
              <button class="icon-btn" (click)="editItem(item)" title="Bearbeiten" i18n-title="@@items.edit">
                ✏️
              </button>
              <button class="icon-btn" (click)="copyItem(item)" title="Kopieren" i18n-title="@@items.copy">
                📋
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
              <a
                *ngIf="item.weitere_datei_type === 'file' && item.weitere_datei_value"
                [href]="getDatasheetUrl(item.weitere_datei_value)"
                target="_blank"
                class="icon-btn"
                title="Weitere Datei anzeigen"
              >
                📎
              </a>
              <a
                *ngIf="item.weitere_datei_type === 'url' && item.weitere_datei_value"
                [href]="item.weitere_datei_value"
                target="_blank"
                class="icon-btn"
                title="Weitere Datei anzeigen"
              >
                📎
              </a>
            </div>
          </div>
        </div>
        <div *ngIf="items.length === 0" class="empty-state" i18n="@@items.noItems">
          Keine Artikel gefunden. Klicken Sie auf "Artikel hinzufügen" um einen zu erstellen.
        </div>
      </div>
    </div>

    <app-item-form
      *ngIf="showModal"
      [item]="selectedItem"
      [locations]="locations"
      (save)="onSaveItem($event)"
      (cancel)="closeModal()"
    ></app-item-form>

    <app-item-detail
      *ngIf="showDetail && detailItem"
      [item]="detailItem"
      (close)="closeDetail()"
      (edit)="editFromDetail($event)"
    ></app-item-detail>

    <!-- Bulk Edit Modal -->
    <div *ngIf="showBulkEdit" class="modal-overlay" (click)="closeBulkEdit()">
      <div class="modal bulk-edit-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>Massenbearbeitung</h2>
          <button class="icon-btn" (click)="closeBulkEdit()">✖</button>
        </div>

        <div class="modal-body">
          <div class="bulk-info">
            <strong>{{ selectedItemIds.size }}</strong> Artikel ausgewählt
          </div>

          <div class="form-group">
            <label>Kategorie setzen</label>
            <select [(ngModel)]="bulkEditCategory" class="form-control">
              <option [value]="null">-- Nicht ändern --</option>
              <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Ort setzen</label>
            <select [(ngModel)]="bulkEditLocation" class="form-control">
              <option [value]="null">-- Nicht ändern --</option>
              <option *ngFor="let loc of locations" [value]="loc.id">{{ loc.path || loc.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>Tags hinzufügen</label>
            <div class="tag-selection">
              <label *ngFor="let tag of tags" class="tag-option">
                <input
                  type="checkbox"
                  [checked]="bulkAddTags.includes(tag.id!)"
                  (change)="toggleBulkAddTag(tag.id!)"
                />
                <span class="tag-badge" [style.background-color]="tag.color" [style.color]="getTextColor(tag.color)">
                  {{ tag.name }}
                </span>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Tags entfernen</label>
            <div class="tag-selection">
              <label *ngFor="let tag of tags" class="tag-option">
                <input
                  type="checkbox"
                  [checked]="bulkRemoveTags.includes(tag.id!)"
                  (change)="toggleBulkRemoveTag(tag.id!)"
                />
                <span class="tag-badge" [style.background-color]="tag.color" [style.color]="getTextColor(tag.color)">
                  {{ tag.name }}
                </span>
              </label>
            </div>
          </div>

          <div class="form-actions">
            <button class="btn btn-primary" (click)="applyBulkEdit()">
              Änderungen übernehmen
            </button>
            <button class="btn btn-secondary" (click)="closeBulkEdit()">
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .clickable-row {
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .clickable-row:hover {
      background-color: #f8f9fa;
    }

    .tags-cell {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
    }

    .sortable {
      cursor: pointer;
      user-select: none;
    }

    .sortable:hover {
      background-color: #2c3e50;
    }

    table th:last-child,
    table td:last-child {
      width: 200px;
      min-width: 200px;
    }

    .action-buttons {
      display: flex;
      gap: 8px;
      justify-content: flex-start;
    }

    .item-meta {
      display: block;
      color: #7f8c8d;
      margin-top: 4px;
    }

    .tag-badge {
      display: inline-block;
      padding: 3px 10px;
      border-radius: 10px;
      font-size: 12px;
      font-weight: 500;
    }

    .no-tags {
      color: #95a5a6;
      font-style: italic;
    }

    .search-controls {
      margin-bottom: 20px;
    }

    .search-row {
      display: flex;
      gap: 10px;
      align-items: center;
    }

    .search-input {
      flex: 1;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .filter-toggle-btn {
      padding: 10px 20px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      border-radius: 4px;
      font-size: 14px;
      white-space: nowrap;
      transition: all 0.2s;
    }

    .filter-toggle-btn:hover {
      background: #f8f9fa;
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

    .filters-panel {
      margin-top: 15px;
      padding: 20px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .filter-section {
      border-right: 1px solid #eee;
      padding-right: 20px;
    }

    .filter-section:last-of-type {
      border-right: none;
    }

    .filter-section h4 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 16px;
      font-weight: 600;
    }

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }

    .filter-header h4 {
      margin: 0;
    }

    .tag-mode-toggle {
      display: flex;
      gap: 5px;
    }

    .mode-btn {
      padding: 4px 12px;
      border: 1px solid #ddd;
      background: white;
      cursor: pointer;
      font-size: 12px;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .mode-btn:hover {
      background: #f8f9fa;
    }

    .mode-btn.active {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }

    .filter-options {
      display: flex;
      flex-direction: column;
      gap: 8px;
      max-height: 300px;
      overflow-y: auto;
    }

    .filter-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
      transition: background 0.2s;
    }

    .filter-checkbox:hover {
      background: #f8f9fa;
    }

    .filter-checkbox input[type="checkbox"] {
      width: auto;
      margin: 0;
      cursor: pointer;
    }

    .filter-checkbox span {
      font-size: 14px;
    }

    .no-options {
      color: #95a5a6;
      font-style: italic;
      font-size: 14px;
      padding: 10px;
    }

    .filter-actions {
      grid-column: 1 / -1;
      display: flex;
      justify-content: center;
      padding-top: 10px;
      border-top: 1px solid #eee;
    }

    .cards-container {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .item-card {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.2s, box-shadow 0.2s;
      cursor: pointer;
    }

    .item-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }

    .card-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .card-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .no-image-card {
      color: #95a5a6;
      font-style: italic;
      padding: 20px;
      text-align: center;
    }

    .card-content {
      padding: 16px;
    }

    .card-content h3 {
      margin: 0 0 12px 0;
      color: #2c3e50;
      font-size: 18px;
      font-weight: 600;
    }

    .card-info {
      margin-bottom: 12px;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }

    .info-row .label {
      font-weight: 500;
      color: #7f8c8d;
    }

    .card-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 10px;
    }

    .card-actions {
      display: flex;
      gap: 8px;
      padding-top: 12px;
      border-top: 1px solid #f0f0f0;
    }

    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: #95a5a6;
      font-style: italic;
      font-size: 16px;
    }

    .checkbox-column {
      width: 40px;
      text-align: center;
    }

    .bulk-toolbar {
      background: #3498db;
      color: white;
      padding: 12px 20px;
      margin-bottom: 20px;
      border-radius: 6px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .bulk-toolbar-content {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .bulk-count {
      font-weight: 600;
      margin-right: auto;
    }

    .bulk-edit-modal {
      max-width: 600px;
      max-height: 85vh;
      overflow-y: auto;
    }

    .bulk-info {
      background: #e3f2fd;
      padding: 12px 16px;
      border-radius: 6px;
      margin-bottom: 24px;
      color: #1976d2;
      font-size: 14px;
    }

    .bulk-info strong {
      font-size: 18px;
      font-weight: 600;
    }

    .tag-selection {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 12px;
      background: #f8f9fa;
      border-radius: 6px;
      border: 1px solid #e0e0e0;
      min-height: 50px;
    }

    .tag-option {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      padding: 6px 12px;
      border-radius: 6px;
      background: white;
      border: 2px solid transparent;
      transition: all 0.2s;
    }

    .tag-option:hover {
      border-color: #3498db;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .tag-option input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 24px;
      padding-top: 20px;
      border-top: 2px solid #ecf0f1;
    }
  `]
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  locations: Location[] = [];
  categories: Category[] = [];
  tags: Tag[] = [];
  searchQuery = '';
  filterKategorien: number[] = [];
  filterOrte: number[] = [];
  filterTags: number[] = [];
  categoryMode: 'union' | 'intersect' = 'union';
  locationMode: 'union' | 'intersect' = 'union';
  tagMode: 'union' | 'intersect' = 'union';
  loading = false;
  showModal = false;
  selectedItem: Item | null = null;
  viewMode: 'list' | 'cards' = 'list';
  showFilters = false;
  showDetail = false;
  detailItem: Item | null = null;
  sortColumn: string = '';
  sortDirection: 'asc' | 'desc' = 'asc';

  // Bulk edit
  selectedItemIds: Set<number> = new Set();
  showBulkEdit = false;
  bulkEditCategory: number | null = null;
  bulkEditLocation: number | null = null;
  bulkAddTags: number[] = [];
  bulkRemoveTags: number[] = [];

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
        // Apply default sort: location -> category -> name
        this.applyDefaultSort();
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
      this.filterKategorien.length > 0 ? this.filterKategorien : undefined,
      this.filterOrte.length > 0 ? this.filterOrte : undefined,
      this.filterTags.length > 0 ? this.filterTags : undefined,
      this.categoryMode,
      this.locationMode,
      this.tagMode
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

  toggleFilter(type: 'kategorie' | 'ort' | 'tag', id: number) {
    let array: number[];
    if (type === 'kategorie') {
      array = this.filterKategorien;
    } else if (type === 'ort') {
      array = this.filterOrte;
    } else {
      array = this.filterTags;
    }

    const index = array.indexOf(id);
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(id);
    }

    this.search();
  }

  clearFilters() {
    this.filterKategorien = [];
    this.filterOrte = [];
    this.filterTags = [];
    this.categoryMode = 'union';
    this.locationMode = 'union';
    this.tagMode = 'union';
    this.search();
  }

  openAddModal() {
    this.selectedItem = null;
    this.showModal = true;
  }

  editItem(item: Item) {
    this.selectedItem = { ...item };
    this.showModal = true;
  }

  copyItem(item: Item) {
    // Create a copy without ID (will be created as new item)
    const itemCopy: Item = {
      name: item.name,
      artikelnummer: item.artikelnummer,
      farbe: item.farbe,
      kategorie_id: item.kategorie_id,
      ort_id: item.ort_id,
      menge: item.menge,
      einheit: item.einheit,
      hersteller: item.hersteller,
      haendler: item.haendler,
      preis: item.preis,
      link: item.link,
      datenblatt_type: item.datenblatt_type,
      datenblatt_value: item.datenblatt_value,
      weitere_datei_type: item.weitere_datei_type,
      weitere_datei_value: item.weitere_datei_value,
      bild: item.bild,
      notizen: item.notizen,
      tag_ids: item.tags?.map(t => t.id) || []
    };
    this.selectedItem = itemCopy;
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

  viewItemDetails(item: Item) {
    this.detailItem = item;
    this.showDetail = true;
  }

  closeDetail() {
    this.showDetail = false;
    this.detailItem = null;
  }

  editFromDetail(item: Item) {
    this.closeDetail();
    this.editItem(item);
  }

  getImageUrl(filename: string): string {
    return this.apiService.getImageUrl(filename);
  }

  getThumbnailUrl(filename: string): string {
    return this.apiService.getThumbnailUrl(filename);
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

  applyDefaultSort() {
    // Default sort: location -> category -> name (all ascending)
    this.items.sort((a, b) => {
      // First by location
      const locA = (a.ort_path || a.ort_name || '').toLowerCase();
      const locB = (b.ort_path || b.ort_name || '').toLowerCase();
      if (locA !== locB) {
        return locA.localeCompare(locB);
      }

      // Then by category
      const catA = (a.kategorie_name || '').toLowerCase();
      const catB = (b.kategorie_name || '').toLowerCase();
      if (catA !== catB) {
        return catA.localeCompare(catB);
      }

      // Finally by name
      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  sortBy(column: string) {
    // Toggle direction if same column, otherwise reset to asc
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.items.sort((a, b) => {
      let valueA: string;
      let valueB: string;

      switch (column) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'category':
          valueA = (a.kategorie_name || '').toLowerCase();
          valueB = (b.kategorie_name || '').toLowerCase();
          break;
        case 'location':
          valueA = (a.ort_path || a.ort_name || '').toLowerCase();
          valueB = (b.ort_path || b.ort_name || '').toLowerCase();
          break;
        default:
          return 0;
      }

      const comparison = valueA.localeCompare(valueB);
      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIcon(column: string): string {
    if (this.sortColumn !== column) {
      return '↕️';
    }
    return this.sortDirection === 'asc' ? '↑' : '↓';
  }

  // Calculate text color based on background luminance
  getTextColor(backgroundColor: string): string {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return white for dark backgrounds, black for light backgrounds
    return luminance > 0.5 ? '#000000' : '#ffffff';
  }

  // Bulk edit methods
  toggleItemSelection(itemId: number) {
    if (this.selectedItemIds.has(itemId)) {
      this.selectedItemIds.delete(itemId);
    } else {
      this.selectedItemIds.add(itemId);
    }
  }

  isItemSelected(itemId: number): boolean {
    return this.selectedItemIds.has(itemId);
  }

  toggleSelectAll() {
    if (this.selectedItemIds.size === this.items.length) {
      this.selectedItemIds.clear();
    } else {
      this.items.forEach(item => {
        if (item.id) this.selectedItemIds.add(item.id);
      });
    }
  }

  get allSelected(): boolean {
    return this.items.length > 0 && this.selectedItemIds.size === this.items.length;
  }

  openBulkEdit() {
    this.showBulkEdit = true;
    this.bulkEditCategory = null;
    this.bulkEditLocation = null;
    this.bulkAddTags = [];
    this.bulkRemoveTags = [];
  }

  closeBulkEdit() {
    this.showBulkEdit = false;
  }

  applyBulkEdit() {
    if (this.selectedItemIds.size === 0) return;

    const updates: any = {};
    if (this.bulkEditCategory !== null) {
      updates.kategorie_id = this.bulkEditCategory;
    }
    if (this.bulkEditLocation !== null) {
      updates.ort_id = this.bulkEditLocation;
    }
    if (this.bulkAddTags.length > 0) {
      updates.add_tags = this.bulkAddTags;
    }
    if (this.bulkRemoveTags.length > 0) {
      updates.remove_tags = this.bulkRemoveTags;
    }

    const itemIds = Array.from(this.selectedItemIds);

    this.apiService.bulkUpdateItems(itemIds, updates).subscribe({
      next: () => {
        this.closeBulkEdit();
        this.selectedItemIds.clear();
        this.loadData();
      },
      error: (err) => {
        console.error('Error bulk updating items:', err);
        alert('Fehler beim Massenbearbeiten der Artikel');
      }
    });
  }

  toggleBulkAddTag(tagId: number) {
    const index = this.bulkAddTags.indexOf(tagId);
    if (index > -1) {
      this.bulkAddTags.splice(index, 1);
    } else {
      this.bulkAddTags.push(tagId);
    }
  }

  toggleBulkRemoveTag(tagId: number) {
    const index = this.bulkRemoveTags.indexOf(tagId);
    if (index > -1) {
      this.bulkRemoveTags.splice(index, 1);
    } else {
      this.bulkRemoveTags.push(tagId);
    }
  }

  clearSelection() {
    this.selectedItemIds.clear();
  }
}
