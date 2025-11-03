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
                  class="icon-btn"
                  (click)="saveCategory(category.id)"
                  title="Speichern"
                  i18n-title="@@settings.save"
                >
                  ✓
                </button>
                <button
                  class="icon-btn"
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
            <input
              type="color"
              [(ngModel)]="newTagColor"
              title="Farbe"
              i18n-title="@@settings.color"
            />
            <button class="btn btn-success" (click)="addTag()" i18n="@@settings.add">
              Hinzufügen
            </button>
          </div>

          <div class="items-list">
            <div *ngFor="let tag of tags" class="item-row">
              <span *ngIf="editingTag !== tag.id" class="tag-badge" [style.background-color]="tag.color">
                {{ tag.name }}
              </span>
              <div *ngIf="editingTag === tag.id" class="edit-tag">
                <input
                  type="text"
                  [(ngModel)]="editTagName"
                  (keyup.enter)="saveTag(tag.id)"
                  (keyup.escape)="cancelEdit()"
                />
                <input
                  type="color"
                  [(ngModel)]="editTagColor"
                />
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
    }

    .add-form input[type="text"] {
      flex: 1;
      height: 38px;
    }

    .add-form input[type="color"] {
      width: 50px;
      height: 38px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }

    .add-form select {
      min-width: 150px;
      height: 38px;
    }

    .add-form .btn {
      height: 38px;
      display: flex;
      align-items: center;
      white-space: nowrap;
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
      color: white;
      font-size: 14px;
      font-weight: 500;
    }

    .empty-state {
      text-align: center;
      padding: 40px;
      color: #95a5a6;
      font-style: italic;
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

    this.apiService.createCategory(this.newCategory).subscribe({
      next: () => {
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

    const parentId = this.newLocationParent ? Number(this.newLocationParent) : undefined;
    this.apiService.createLocation(this.newLocation, parentId).subscribe({
      next: () => {
        this.newLocation = '';
        this.newLocationParent = null;
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

    this.apiService.createTag(this.newTag, this.newTagColor).subscribe({
      next: () => {
        this.newTag = '';
        this.newTagColor = '#3498db';
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
}
