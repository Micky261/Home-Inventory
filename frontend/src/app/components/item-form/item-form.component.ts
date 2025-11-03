import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Item, Location } from '../../models/item.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="onCancel()">
      <div class="modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2 *ngIf="!item" i18n="@@form.addItem">Add New Item</h2>
          <h2 *ngIf="item" i18n="@@form.editItem">Edit Item</h2>
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
                <label i18n="@@form.category">Category</label>
                <input
                  type="text"
                  [(ngModel)]="formData.kategorie"
                  name="kategorie"
                  list="category-suggestions"
                />
                <datalist id="category-suggestions">
                  <option *ngFor="let cat of categories" [value]="cat"></option>
                </datalist>
              </div>

              <div class="form-group">
                <label i18n="@@form.location">Location</label>
                <select [(ngModel)]="formData.ort_id" name="ort_id">
                  <option [value]="null" i18n="@@form.selectLocation">- Select Location -</option>
                  <option *ngFor="let loc of locations" [value]="loc.id">{{ loc.name }}</option>
                  <option value="new" i18n="@@form.newLocation">+ New Location</option>
                </select>
              </div>
            </div>

            <div *ngIf="formData.ort_id === 'new'" class="form-group">
              <label i18n="@@form.newLocationName">New Location Name</label>
              <input
                type="text"
                [(ngModel)]="newLocationName"
                name="newLocationName"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label i18n="@@form.quantity">Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  [(ngModel)]="formData.menge"
                  name="menge"
                />
              </div>

              <div class="form-group">
                <label i18n="@@form.unit">Unit</label>
                <input
                  type="text"
                  [(ngModel)]="formData.einheit"
                  name="einheit"
                  placeholder="pcs, kg, m, etc."
                  i18n-placeholder="@@form.unitPlaceholder"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label i18n="@@form.retailer">Retailer</label>
                <input
                  type="text"
                  [(ngModel)]="formData.haendler"
                  name="haendler"
                />
              </div>

              <div class="form-group">
                <label i18n="@@form.price">Price (€)</label>
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
              <label i18n="@@form.datasheet">Datasheet</label>
              <select [(ngModel)]="formData.datenblatt_type" name="datenblatt_type">
                <option [value]="null" i18n="@@form.none">None</option>
                <option value="url" i18n="@@form.url">URL</option>
                <option value="file" i18n="@@form.file">File Upload</option>
              </select>
            </div>

            <div *ngIf="formData.datenblatt_type === 'url'" class="form-group">
              <label i18n="@@form.datasheetUrl">Datasheet URL</label>
              <input
                type="url"
                [(ngModel)]="formData.datenblatt_value"
                name="datenblatt_value"
              />
            </div>

            <div *ngIf="formData.datenblatt_type === 'file'" class="form-group">
              <label i18n="@@form.datasheetFile">Datasheet File</label>
              <div class="file-upload" (click)="datasheetInput.click()">
                <span i18n="@@form.clickToUpload">Click to upload file (PDF, DOC, DOCX)</span>
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
              <label i18n="@@form.image">Image</label>
              <div class="file-upload" (click)="imageInput.click()">
                <span i18n="@@form.clickToUploadImage">Click to upload image (JPG, PNG, GIF, WebP)</span>
                <input
                  #imageInput
                  type="file"
                  accept="image/*"
                  (change)="onImageUpload($event)"
                />
                <div *ngIf="formData.bild" class="file-preview">
                  <img [src]="getImageUrl(formData.bild)" alt="Preview" />
                </div>
              </div>
            </div>

            <div class="form-group">
              <label i18n="@@form.notes">Notes</label>
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
            Cancel
          </button>
          <button type="button" class="btn btn-success" (click)="onSubmit()" i18n="@@form.save">
            Save
          </button>
        </div>
      </div>
    </div>
  `
})
export class ItemFormComponent implements OnInit {
  @Input() item: Item | null = null;
  @Input() locations: Location[] = [];
  @Output() save = new EventEmitter<Item>();
  @Output() cancel = new EventEmitter<void>();

  formData: any = {
    name: '',
    kategorie: '',
    ort_id: null,
    menge: null,
    einheit: '',
    haendler: '',
    preis: null,
    link: '',
    datenblatt_type: null,
    datenblatt_value: '',
    bild: '',
    notizen: ''
  };

  nameSuggestions: string[] = [];
  categories: string[] = [];
  newLocationName = '';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (this.item) {
      this.formData = { ...this.item };
    }

    this.apiService.getCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error('Error loading categories:', err)
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
        },
        error: (err) => {
          console.error('Error uploading datasheet:', err);
          alert('Failed to upload datasheet');
        }
      });
    }
  }

  async onSubmit() {
    if (!this.formData.name) {
      alert('Name is required');
      return;
    }

    // Handle new location
    if (this.formData.ort_id === 'new' && this.newLocationName) {
      try {
        const location = await this.apiService.createLocation(this.newLocationName).toPromise();
        this.formData.ort_id = location!.id;
      } catch (err) {
        console.error('Error creating location:', err);
        alert('Failed to create location');
        return;
      }
    } else if (this.formData.ort_id === 'new') {
      alert('Please enter a location name');
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
