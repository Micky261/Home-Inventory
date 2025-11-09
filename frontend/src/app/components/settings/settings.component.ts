import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Category, Location, Tag } from '../../models/item.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="header">
      <div class="container">
        <h1 i18n="@@settings.title">Einstellungen</h1>
        <div class="header-actions">
          <button class="btn btn-secondary" (click)="goBack()" i18n="@@settings.back">
            ← Zurück zur Übersicht
          </button>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="settings-grid">
        <!-- Categories Section -->
        <div class="settings-card">
          <h2 i18n="@@settings.categories">Kategorien</h2>

          <div class="add-form">
            <input
              type="text"
              [(ngModel)]="newCategory"
              placeholder="Neue Kategorie"
              i18n-placeholder="@@settings.newCategory"
              (keyup.enter)="addCategory()"
            />
            <button class="btn btn-success" (click)="addCategory()" i18n="@@settings.add">
              Hinzufügen
            </button>
          </div>

          <div class="items-list">
            <div *ngFor="let category of categories" class="item-row">
              <span *ngIf="editingCategory !== category.id">{{ category.name }}</span>
              <input
                *ngIf="editingCategory === category.id"
                type="text"
                [(ngModel)]="editCategoryName"
                (keyup.enter)="saveCategory(category.id)"
                (keyup.escape)="cancelEdit()"
              />
              <div class="item-actions">
                <button
                  *ngIf="editingCategory !== category.id"
                  class="icon-btn"
                  (click)="startEditCategory(category)"
                  title="Bearbeiten"
                  i18n-title="@@settings.edit"
                >
                  ✏️
                </button>
                <button
                  *ngIf="editingCategory === category.id"
                  class="icon-btn save-btn"
                  (click)="saveCategory(category.id)"
                  title="Speichern"
                  i18n-title="@@settings.save"
                >
                  ✓
                </button>
                <button
                  class="icon-btn delete-btn"
                  (click)="deleteCategory(category.id)"
                  title="Löschen"
                  i18n-title="@@settings.delete"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div *ngIf="categories.length === 0" class="empty-state" i18n="@@settings.noCategories">
              Keine Kategorien vorhanden
            </div>
          </div>
        </div>

        <!-- Locations Section -->
        <div class="settings-card">
          <h2 i18n="@@settings.locations">Orte</h2>

          <div class="add-form">
            <select [(ngModel)]="newLocationParent">
              <option [value]="null" i18n="@@settings.topLevel">- Oberste Ebene -</option>
              <option *ngFor="let loc of flatLocations" [value]="loc.id">
                {{ loc.path || loc.name }}
              </option>
            </select>
            <input
              type="text"
              [(ngModel)]="newLocation"
              placeholder="Neuer Ort"
              i18n-placeholder="@@settings.newLocation"
              (keyup.enter)="addLocation()"
            />
            <button class="btn btn-success" (click)="addLocation()" i18n="@@settings.add">
              Hinzufügen
            </button>
          </div>

          <div class="items-list">
            <div *ngFor="let location of flatLocations" class="item-row location-row">
              <span class="location-path" *ngIf="editingLocation !== location.id">
                {{ location.path || location.name }}
              </span>
              <div *ngIf="editingLocation === location.id" class="edit-location">
                <select [(ngModel)]="editLocationParent">
                  <option [value]="null" i18n="@@settings.topLevel">- Oberste Ebene -</option>
                  <option *ngFor="let loc of flatLocations" [value]="loc.id" [disabled]="loc.id === location.id">
                    {{ loc.path || loc.name }}
                  </option>
                </select>
                <input
                  type="text"
                  [(ngModel)]="editLocationName"
                  (keyup.enter)="saveLocation(location.id)"
                  (keyup.escape)="cancelEdit()"
                />
              </div>
              <div class="item-actions">
                <button
                  *ngIf="editingLocation !== location.id"
                  class="icon-btn"
                  (click)="startEditLocation(location)"
                  title="Bearbeiten"
                  i18n-title="@@settings.edit"
                >
                  ✏️
                </button>
                <button
                  *ngIf="editingLocation === location.id"
                  class="icon-btn"
                  (click)="saveLocation(location.id)"
                  title="Speichern"
                  i18n-title="@@settings.save"
                >
                  ✓
                </button>
                <button
                  class="icon-btn"
                  (click)="deleteLocation(location.id)"
                  title="Löschen"
                  i18n-title="@@settings.delete"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div *ngIf="flatLocations.length === 0" class="empty-state" i18n="@@settings.noLocations">
              Keine Orte vorhanden
            </div>
          </div>
        </div>

        <!-- Tags Section -->
        <div class="settings-card">
          <h2 i18n="@@settings.tags">Tags</h2>

          <div class="add-form">
            <input
              type="text"
              [(ngModel)]="newTag"
              placeholder="Neuer Tag"
              i18n-placeholder="@@settings.newTag"
              (keyup.enter)="addTag()"
            />
            <div class="color-preview"
                 [style.background-color]="newTagColor"
                 (click)="showColorPicker = !showColorPicker"
                 [title]="showColorPicker ? 'Schließen' : 'Farbe wählen'"
                 i18n-title="@@settings.selectColor">
            </div>
            <button class="btn btn-success" (click)="addTag()" i18n="@@settings.add">
              Hinzufügen
            </button>
          </div>

          <!-- Color Palette -->
          <div *ngIf="showColorPicker" class="color-palette">
            <div class="palette-section">
              <label i18n="@@settings.availableColors">Verfügbare Farben:</label>
              <div class="color-grid">
                <button
                  *ngFor="let color of allColors"
                  class="color-swatch"
                  [style.background-color]="color"
                  [class.selected]="newTagColor === color"
                  (click)="selectColor(color)"
                  [title]="color"
                ></button>
              </div>
            </div>
            <div class="palette-section">
              <label i18n="@@settings.customColorPicker">Oder eigene Farbe:</label>
              <input
                type="color"
                [(ngModel)]="newTagColor"
                title="Farbe"
                i18n-title="@@settings.color"
              />
            </div>
          </div>

          <div class="items-list">
            <div *ngFor="let tag of tags" class="item-row">
              <span *ngIf="editingTag !== tag.id" class="tag-badge"
                    [style.background-color]="tag.color"
                    [style.color]="getTextColor(tag.color)">
                {{ tag.name }}
              </span>
              <div *ngIf="editingTag === tag.id" class="edit-tag">
                <input
                  type="text"
                  [(ngModel)]="editTagName"
                  (keyup.enter)="saveTag(tag.id)"
                  (keyup.escape)="cancelEdit()"
                />
                <div class="color-preview-small" [style.background-color]="editTagColor"></div>

                <!-- Color palette for edit mode -->
                <div class="edit-color-palette">
                  <div class="color-grid-compact">
                    <button
                      *ngFor="let color of allColors"
                      class="color-swatch-small"
                      [style.background-color]="color"
                      [class.selected]="editTagColor === color"
                      (click)="selectEditColor(color)"
                      [title]="color"
                    ></button>
                  </div>
                  <input
                    type="color"
                    [(ngModel)]="editTagColor"
                    class="color-picker-inline"
                  />
                </div>
              </div>
              <div class="item-actions">
                <button
                  *ngIf="editingTag !== tag.id"
                  class="icon-btn"
                  (click)="startEditTag(tag)"
                  title="Bearbeiten"
                  i18n-title="@@settings.edit"
                >
                  ✏️
                </button>
                <button
                  *ngIf="editingTag === tag.id"
                  class="icon-btn"
                  (click)="saveTag(tag.id)"
                  title="Speichern"
                  i18n-title="@@settings.save"
                >
                  ✓
                </button>
                <button
                  class="icon-btn"
                  (click)="deleteTag(tag.id)"
                  title="Löschen"
                  i18n-title="@@settings.delete"
                >
                  🗑️
                </button>
              </div>
            </div>
            <div *ngIf="tags.length === 0" class="empty-state" i18n="@@settings.noTags">
              Keine Tags vorhanden
            </div>
          </div>
        </div>
      </div>

      <!-- Toast Notification -->
      <div class="toast" [class.show]="toastVisible">
        {{ toastMessage }}
      </div>
    </div>
  `,
  styles: [`
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .settings-card {
      background: white;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .settings-card h2 {
      margin-bottom: 20px;
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
    }

    .add-form {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      align-items: center;
      flex-wrap: wrap;
    }

    .add-form input[type="text"] {
      flex: 1;
      min-width: 120px;
      height: 38px;
    }

    .add-form input[type="color"] {
      width: 50px;
      height: 38px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .add-form select, .edit-location select {
      min-width: 150px;
      max-width: 200px;
      height: 38px;
      flex-shrink: 0;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      font-size: 14px;
      color: #333;
      cursor: pointer;
      transition: border-color 0.2s, box-shadow 0.2s;
      appearance: none;
      background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="8" viewBox="0 0 12 8"><path fill="%23333" d="M1 1l5 5 5-5"/></svg>');
      background-repeat: no-repeat;
      background-position: right 10px center;
      padding-right: 32px;
    }

    .add-form select:hover, .edit-location select:hover {
      border-color: #3498db;
    }

    .add-form select:focus, .edit-location select:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
    }

    .add-form .btn {
      height: 38px;
      display: flex;
      align-items: center;
      white-space: nowrap;
      flex-shrink: 0;
      padding: 8px 16px;
    }

    .items-list {
      max-height: 500px;
      overflow-y: auto;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }

    .item-row:hover {
      background-color: #f8f9fa;
    }

    .location-row .location-path {
      font-family: monospace;
      color: #555;
    }

    .edit-location, .edit-tag {
      display: flex;
      gap: 10px;
      flex: 1;
    }

    .edit-location input,
    .edit-tag input[type="text"] {
      flex: 1;
    }

    .item-actions {
      display: flex;
      gap: 5px;
    }

    .tag-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #95a5a6;
      font-style: italic;
    }

    /* Color Selector Styles */
    .color-preview {
      width: 38px;
      height: 38px;
      border-radius: 4px;
      border: 2px solid #ddd;
      cursor: pointer;
      flex-shrink: 0;
      transition: all 0.2s;
    }

    .color-preview:hover {
      border-color: #3498db;
      transform: scale(1.05);
      box-shadow: 0 2px 8px rgba(52, 152, 219, 0.3);
    }

    .color-preview-small {
      width: 32px;
      height: 32px;
      border-radius: 4px;
      border: 2px solid #ddd;
      flex-shrink: 0;
    }

    .color-palette {
      background: #f8f9fa;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 20px;
    }

    .palette-section {
      margin-bottom: 15px;
    }

    .palette-section:last-child {
      margin-bottom: 0;
    }

    .palette-section label {
      display: block;
      font-weight: 500;
      color: #555;
      margin-bottom: 8px;
      font-size: 14px;
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(8, 36px);
      gap: 8px;
    }

    .color-swatch {
      width: 36px;
      height: 36px;
      border: 2px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
    }

    .color-swatch:hover {
      transform: scale(1.1);
      border-color: #333;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }

    .color-swatch.selected {
      border: 3px solid #333;
      box-shadow: 0 0 0 2px #fff, 0 0 0 4px #333;
    }

    .edit-color-palette {
      display: flex;
      flex-direction: column;
      gap: 8px;
      background: #f8f9fa;
      padding: 8px;
      border-radius: 4px;
      max-width: 400px;
    }

    .color-grid-compact {
      display: grid;
      grid-template-columns: repeat(8, 24px);
      gap: 4px;
    }

    .color-swatch-small {
      width: 24px;
      height: 24px;
      border: 1px solid #ddd;
      border-radius: 3px;
      cursor: pointer;
      transition: all 0.2s;
      padding: 0;
    }

    .color-swatch-small:hover {
      transform: scale(1.15);
      border-color: #333;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }

    .color-swatch-small.selected {
      border: 2px solid #333;
      box-shadow: 0 0 0 1px #fff, 0 0 0 3px #333;
    }

    .color-picker-inline {
      width: 80px;
      height: 32px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      align-self: flex-start;
    }

    .edit-tag {
      display: flex;
      gap: 10px;
      flex: 1;
      flex-wrap: wrap;
      align-items: center;
    }

    .edit-tag input[type="text"] {
      flex: 1;
      min-width: 150px;
    }

    /* Toast Notification */
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #27ae60;
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      opacity: 0;
      transform: translateY(-20px);
      transition: all 0.3s ease;
      pointer-events: none;
      z-index: 1000;
      font-weight: 500;
    }

    .toast.show {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }
  `]
})
export class SettingsComponent implements OnInit {
  categories: Category[] = [];
  locations: Location[] = [];
  flatLocations: Location[] = [];
  tags: Tag[] = [];

  newCategory = '';
  newLocation = '';
  newLocationParent: number | null = null;
  newTag = '';
  newTagColor = '#3498db';

  // Predefined color palette (Material Design inspired)
  predefinedColors = [
    '#f44336', // Red
    '#e91e63', // Pink
    '#9c27b0', // Purple
    '#673ab7', // Deep Purple
    '#3f51b5', // Indigo
    '#2196f3', // Blue
    '#03a9f4', // Light Blue
    '#00bcd4', // Cyan
    '#009688', // Teal
    '#4caf50', // Green
    '#8bc34a', // Light Green
    '#cddc39', // Lime
    '#ffeb3b', // Yellow
    '#ffc107', // Amber
    '#ff9800', // Orange
    '#ff5722', // Deep Orange
    '#795548', // Brown
    '#607d8b', // Blue Grey
    '#9e9e9e', // Grey
    '#000000'  // Black
  ];

  showColorPicker = false;

  // Toast notification
  toastMessage = '';
  toastVisible = false;

  editingCategory: number | null = null;
  editCategoryName = '';

  editingLocation: number | null = null;
  editLocationName = '';
  editLocationParent: number | null = null;

  editingTag: number | null = null;
  editTagName = '';
  editTagColor = '';

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.apiService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories:', err)
    });

    this.apiService.getLocations().subscribe({
      next: (locations) => {
        this.locations = locations;
        this.flatLocations = locations;
      },
      error: (err) => console.error('Error loading locations:', err)
    });

    this.apiService.getTags().subscribe({
      next: (tags) => this.tags = tags,
      error: (err) => console.error('Error loading tags:', err)
    });
  }

  // Categories
  addCategory() {
    if (!this.newCategory.trim()) return;

    const categoryName = this.newCategory;
    this.apiService.createCategory(categoryName).subscribe({
      next: () => {
        this.showToast(`Kategorie "${categoryName}" wurde hinzugefügt`);
        this.newCategory = '';
        this.loadData();
      },
      error: (err) => {
        console.error('Error adding category:', err);
        alert('Fehler beim Hinzufügen der Kategorie');
      }
    });
  }

  startEditCategory(category: Category) {
    this.editingCategory = category.id;
    this.editCategoryName = category.name;
  }

  saveCategory(id: number) {
    if (!this.editCategoryName.trim()) return;

    this.apiService.updateCategory(id, this.editCategoryName).subscribe({
      next: () => {
        this.editingCategory = null;
        this.loadData();
      },
      error: (err) => {
        console.error('Error updating category:', err);
        alert('Fehler beim Aktualisieren der Kategorie');
      }
    });
  }

  deleteCategory(id: number) {
    if (!confirm('Kategorie wirklich löschen?')) return;

    this.apiService.deleteCategory(id).subscribe({
      next: () => this.loadData(),
      error: (err) => {
        console.error('Error deleting category:', err);
        alert('Kategorie kann nicht gelöscht werden (wird noch verwendet)');
      }
    });
  }

  // Locations
  addLocation() {
    if (!this.newLocation.trim()) return;

    const locationName = this.newLocation;
    const parentId = this.newLocationParent ? Number(this.newLocationParent) : undefined;
    this.apiService.createLocation(locationName, parentId).subscribe({
      next: () => {
        this.showToast(`Ort "${locationName}" wurde hinzugefügt`);
        // Keep input values for quick consecutive additions
        this.loadData();
      },
      error: (err) => {
        console.error('Error adding location:', err);
        alert('Fehler beim Hinzufügen des Orts');
      }
    });
  }

  startEditLocation(location: Location) {
    this.editingLocation = location.id;
    this.editLocationName = location.name;
    this.editLocationParent = location.parent_id || null;
  }

  saveLocation(id: number) {
    if (!this.editLocationName.trim()) return;

    const parentId = this.editLocationParent ? Number(this.editLocationParent) : undefined;
    this.apiService.updateLocation(id, this.editLocationName, parentId).subscribe({
      next: () => {
        this.editingLocation = null;
        this.loadData();
      },
      error: (err) => {
        console.error('Error updating location:', err);
        alert('Fehler beim Aktualisieren des Orts');
      }
    });
  }

  deleteLocation(id: number) {
    if (!confirm('Ort wirklich löschen?')) return;

    this.apiService.deleteLocation(id).subscribe({
      next: () => this.loadData(),
      error: (err) => {
        console.error('Error deleting location:', err);
        alert('Ort kann nicht gelöscht werden (wird noch verwendet oder hat Unterorte)');
      }
    });
  }

  // Tags
  addTag() {
    if (!this.newTag.trim()) return;

    const tagName = this.newTag;
    this.apiService.createTag(tagName, this.newTagColor).subscribe({
      next: () => {
        this.showToast(`Tag "${tagName}" wurde hinzugefügt`);
        this.newTag = '';
        // Keep the color for next tag
        this.loadData();
      },
      error: (err) => {
        console.error('Error adding tag:', err);
        alert('Fehler beim Hinzufügen des Tags');
      }
    });
  }

  startEditTag(tag: Tag) {
    this.editingTag = tag.id;
    this.editTagName = tag.name;
    this.editTagColor = tag.color;
  }

  saveTag(id: number) {
    if (!this.editTagName.trim()) return;

    this.apiService.updateTag(id, this.editTagName, this.editTagColor).subscribe({
      next: () => {
        this.editingTag = null;
        this.loadData();
      },
      error: (err) => {
        console.error('Error updating tag:', err);
        alert('Fehler beim Aktualisieren des Tags');
      }
    });
  }

  deleteTag(id: number) {
    if (!confirm('Tag wirklich löschen?')) return;

    this.apiService.deleteTag(id).subscribe({
      next: () => this.loadData(),
      error: (err) => {
        console.error('Error deleting tag:', err);
        alert('Fehler beim Löschen des Tags');
      }
    });
  }

  cancelEdit() {
    this.editingCategory = null;
    this.editingLocation = null;
    this.editingTag = null;
  }

  goBack() {
    this.router.navigate(['/items']);
  }

  // Get custom colors that are already used but not in predefined palette
  get customColors(): string[] {
    const usedColors = this.tags.map(tag => tag.color.toLowerCase());
    const predefinedLower = this.predefinedColors.map(c => c.toLowerCase());
    const custom = usedColors.filter(color => !predefinedLower.includes(color));
    // Return unique colors
    return [...new Set(custom)];
  }

  // Get all colors (predefined + custom combined)
  get allColors(): string[] {
    return [...this.predefinedColors, ...this.customColors];
  }

  selectColor(color: string) {
    this.newTagColor = color;
    this.showColorPicker = false;
  }

  selectEditColor(color: string) {
    this.editTagColor = color;
  }

  showToast(message: string) {
    this.toastMessage = message;
    this.toastVisible = true;
    setTimeout(() => {
      this.toastVisible = false;
    }, 3000);
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
}
