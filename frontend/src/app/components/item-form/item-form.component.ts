import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item, Location, Category, Tag } from '../../models/item.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 *ngIf="!item" i18n="@@form.addItem">Neuen Artikel hinzufügen</h2>
          <h2 *ngIf="item" i18n="@@form.editItem">Artikel bearbeiten</h2>
          <button class="icon-btn" (click)="onCancel()">✖</button>
        </div>

        <div class="modal-body">
          <form (ngSubmit)="onSubmit()">
            <div class="form-group">
              <label i18n="@@form.name">Name *</label>
              <input
                type="text"
                [(ngModel)]="formData.name"
                name="name"
                required
                (input)="onNameInput($event)"
                list="name-suggestions"
              />
              <datalist id="name-suggestions">
                <option *ngFor="let suggestion of nameSuggestions" [value]="suggestion"></option>
              </datalist>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label i18n="@@form.category">Kategorie</label>
                <select [(ngModel)]="formData.kategorie_id" name="kategorie_id">
                  <option [value]="null" i18n="@@form.selectCategory">- Kategorie wählen -</option>
                  <option *ngFor="let cat of categories" [value]="cat.id">{{ cat.name }}</option>
                </select>
              </div>

              <div class="form-group">
                <label i18n="@@form.location">Ort</label>
                <select [(ngModel)]="formData.ort_id" name="ort_id">
                  <option [value]="null" i18n="@@form.selectLocation">- Ort wählen -</option>
                  <option *ngFor="let loc of locations" [value]="loc.id">
                    {{ loc.path || loc.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label i18n="@@form.tags">Tags</label>
              <div class="tags-selector">
                <div *ngFor="let tag of tags" class="tag-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      [checked]="isTagSelected(tag.id)"
                      (change)="toggleTag(tag.id)"
                    />
                    <span class="tag-badge" [style.background-color]="tag.color">
                      {{ tag.name }}
                    </span>
                  </label>
                </div>
                <div *ngIf="tags.length === 0" class="no-tags" i18n="@@form.noTags">
                  Keine Tags vorhanden. Erstellen Sie Tags in den Einstellungen.
                </div>
              </div>
              <div class="tag-create-form">
                <input
                  type="text"
                  [(ngModel)]="newTagName"
                  name="newTagName"
                  placeholder="Neuer Tag"
                  i18n-placeholder="@@form.newTag"
                />
                <input
                  type="color"
                  [(ngModel)]="newTagColor"
                  name="newTagColor"
                  title="Farbe"
                  i18n-title="@@settings.color"
                />
                <button type="button" class="btn btn-sm btn-success" (click)="createNewTag()" i18n="@@form.addTag">
                  + Tag
                </button>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label i18n="@@form.quantity">Menge</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="formData.menge"
                  name="menge"
                />
              </div>

              <div class="form-group">
                <label i18n="@@form.unit">Einheit</label>
                <input
                  type="text"
                  [(ngModel)]="formData.einheit"
                  name="einheit"
                  placeholder="Stk, kg, m, etc."
                  i18n-placeholder="@@form.unitPlaceholder"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label i18n="@@form.retailer">Händler</label>
                <input
                  type="text"
                  [(ngModel)]="formData.haendler"
                  name="haendler"
                />
              </div>

              <div class="form-group">
                <label i18n="@@form.price">Preis (€)</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="formData.preis"
                  name="preis"
                />
              </div>
            </div>

            <div class="form-group">
              <label i18n="@@form.link">Link (URL)</label>
              <input
                type="url"
                [(ngModel)]="formData.link"
                name="link"
              />
            </div>

            <div class="form-group">
              <label i18n="@@form.datasheet">Datenblatt</label>
              <select [(ngModel)]="formData.datenblatt_type" name="datenblatt_type">
                <option [value]="null" i18n="@@form.none">Keins</option>
                <option value="url" i18n="@@form.url">URL</option>
                <option value="file" i18n="@@form.file">Datei hochladen</option>
              </select>
            </div>

            <div *ngIf="formData.datenblatt_type === 'url'" class="form-group">
              <label i18n="@@form.datasheetUrl">Datenblatt-URL (wird automatisch heruntergeladen)</label>
              <input
                type="url"
                [(ngModel)]="formData.datenblatt_value"
                name="datenblatt_value"
                (blur)="onDatasheetUrlBlur()"
                placeholder="https://example.com/document.pdf"
              />
              <small *ngIf="downloadingDatasheet" class="downloading-hint">Datenblatt wird heruntergeladen...</small>
            </div>

            <div *ngIf="formData.datenblatt_type === 'file'" class="form-group">
              <label i18n="@@form.datasheetFile">Datenblatt-Datei</label>
              <div class="file-upload" (click)="datasheetInput.click()">
                <span i18n="@@form.clickToUpload">Klicken zum Hochladen (PDF, DOC, DOCX)</span>
                <input
                  #datasheetInput
                  type="file"
                  accept=".pdf,.doc,.docx"
                  (change)="onDatasheetUpload($event)"
                />
                <div *ngIf="formData.datenblatt_value" class="file-preview">
                  📄 {{ formData.datenblatt_value }}
                </div>
              </div>
            </div>

            <div class="form-group">
              <label i18n="@@form.image">Bild</label>
              <div class="file-upload" (click)="imageInput.click()">
                <span i18n="@@form.clickToUploadImage">Klicken zum Hochladen (JPG, PNG, GIF, WebP)</span>
                <input
                  #imageInput
                  type="file"
                  accept="image/*"
                  (change)="onImageUpload($event)"
                />
                <div *ngIf="formData.bild" class="file-preview">
                  <img [src]="getImageUrl(formData.bild)" alt="Vorschau" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label i18n="@@form.notes">Notizen</label>
              <textarea
                [(ngModel)]="formData.notizen"
                name="notizen"
                rows="4"
              ></textarea>
            </div>
          </form>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" (click)="onCancel()" i18n="@@form.cancel">
            Abbrechen
          </button>
          <button type="button" class="btn btn-success" (click)="onSubmit()" i18n="@@form.save">
            Speichern
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tags-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-height: 50px;
    }

    .tag-checkbox label {
      display: flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
    }

    .tag-checkbox input[type="checkbox"] {
      width: auto;
      margin: 0;
    }

    .tag-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 12px;
      color: white;
      font-size: 14px;
      font-weight: 500;
    }

    .no-tags {
      color: #95a5a6;
      font-style: italic;
      padding: 10px;
    }

    .tag-create-form {
      display: flex;
      gap: 10px;
      margin-top: 10px;
      padding: 10px;
      border-top: 1px solid #ddd;
    }

    .tag-create-form input[type="text"] {
      flex: 1;
    }

    .tag-create-form input[type="color"] {
      width: 50px;
      height: 38px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
    }

    .btn-sm {
      padding: 8px 16px;
      font-size: 14px;
    }

    .downloading-hint {
      display: block;
      margin-top: 5px;
      color: #3498db;
      font-style: italic;
    }
  `]
})
export class ItemFormComponent implements OnInit {
  @Input() item: Item | null = null;
  @Input() locations: Location[] = [];
  @Output() save = new EventEmitter<Item>();
  @Output() cancel = new EventEmitter<void>();

  downloadingDatasheet = false;

  formData: any = {
    name: '',
    kategorie_id: null,
    ort_id: null,
    menge: null,
    einheit: '',
    haendler: '',
    preis: null,
    link: '',
    datenblatt_type: null,
    datenblatt_value: '',
    bild: '',
    notizen: '',
    tag_ids: []
  };

  nameSuggestions: string[] = [];
  categories: Category[] = [];
  tags: Tag[] = [];
  newTagName = '';
  newTagColor = '#3498db';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (this.item) {
      this.formData = {
        ...this.item,
        tag_ids: this.item.tags?.map(t => t.id) || []
      };
    }

    this.apiService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories:', err)
    });

    this.apiService.getTags().subscribe({
      next: (tags) => this.tags = tags,
      error: (err) => console.error('Error loading tags:', err)
    });
  }

  onNameInput(event: any) {
    const query = event.target.value;
    if (query.length >= 2) {
      this.apiService.autocompleteNames(query).subscribe({
        next: (suggestions) => this.nameSuggestions = suggestions,
        error: (err) => console.error('Error loading suggestions:', err)
      });
    }
  }

  isTagSelected(tagId: number): boolean {
    return this.formData.tag_ids.includes(tagId);
  }

  toggleTag(tagId: number) {
    const index = this.formData.tag_ids.indexOf(tagId);
    if (index > -1) {
      this.formData.tag_ids.splice(index, 1);
    } else {
      this.formData.tag_ids.push(tagId);
    }
  }

  createNewTag() {
    if (!this.newTagName.trim()) {
      return;
    }

    this.apiService.createTag(this.newTagName.trim(), this.newTagColor).subscribe({
      next: (newTag) => {
        this.tags.push(newTag);
        this.formData.tag_ids.push(newTag.id);
        this.newTagName = '';
        this.newTagColor = '#3498db';
      },
      error: (err) => {
        console.error('Error creating tag:', err);
        alert('Failed to create tag');
      }
    });
  }

  onImageUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.apiService.uploadImage(file).subscribe({
        next: (response) => {
          this.formData.bild = response.filename;
        },
        error: (err) => {
          console.error('Error uploading image:', err);
          alert('Failed to upload image');
        }
      });
    }
  }

  onDatasheetUpload(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.apiService.uploadDatasheet(file).subscribe({
        next: (response) => {
          this.formData.datenblatt_value = response.filename;
          this.formData.datenblatt_type = 'file';
        },
        error: (err) => {
          console.error('Error uploading datasheet:', err);
          alert('Failed to upload datasheet');
        }
      });
    }
  }

  onDatasheetUrlBlur() {
    const url = this.formData.datenblatt_value?.trim();

    // Only download if URL is valid and not empty
    if (!url || !url.startsWith('http')) {
      return;
    }

    // Don't download if it's already a filename (not a URL)
    if (!url.includes('://')) {
      return;
    }

    this.downloadingDatasheet = true;

    this.apiService.downloadDatasheetFromUrl(url).subscribe({
      next: (response) => {
        // Replace URL with downloaded filename
        this.formData.datenblatt_value = response.filename;
        // Change type to file since we now have a local file
        this.formData.datenblatt_type = 'file';
        this.downloadingDatasheet = false;
        alert('Datenblatt erfolgreich heruntergeladen und gespeichert!');
      },
      error: (err) => {
        console.error('Error downloading datasheet:', err);
        this.downloadingDatasheet = false;
        alert('Fehler beim Herunterladen des Datenblatts. Bitte überprüfen Sie die URL.');
      }
    });
  }

  onSubmit() {
    if (!this.formData.name) {
      alert('Name is required');
      return;
    }

    this.save.emit(this.formData);
  }

  onCancel() {
    this.cancel.emit();
  }

  getImageUrl(filename: string): string {
    return this.apiService.getImageUrl(filename);
  }
}
