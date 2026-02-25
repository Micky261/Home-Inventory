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
    <div class="modal-overlay" (click)="$event.stopPropagation()">
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
                <label i18n="@@form.articleNumber">Artikelnummer</label>
                <input
                  type="text"
                  [(ngModel)]="formData.artikelnummer"
                  name="artikelnummer"
                />
              </div>

              <div class="form-group">
                <label i18n="@@form.color">Farbe</label>
                <input
                  type="text"
                  [(ngModel)]="formData.farbe"
                  name="farbe"
                />
              </div>
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
              <input
                type="text"
                [(ngModel)]="tagSearchQuery"
                name="tagSearchQuery"
                placeholder="Tags filtern..."
                class="tag-search"
              />
              <div class="tags-selector">
                <div *ngFor="let tag of getFilteredTags()" class="tag-checkbox">
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
                <div *ngIf="getFilteredTags().length === 0 && tags.length > 0" class="no-tags">
                  Keine Tags gefunden.
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
                <label i18n="@@form.manufacturer">Marke/Hersteller</label>
                <input
                  type="text"
                  [(ngModel)]="formData.hersteller"
                  name="hersteller"
                />
              </div>

              <div class="form-group">
                <label i18n="@@form.retailer">Händler</label>
                <input
                  type="text"
                  [(ngModel)]="formData.haendler"
                  name="haendler"
                />
              </div>
            </div>

            <div class="form-row">
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
              <small *ngIf="datasheetDownloadStatus" class="download-status-hint" [class.success]="!downloadingDatasheet && datasheetDownloadStatus">
                {{ datasheetDownloadStatus }}
              </small>
            </div>

            <div *ngIf="formData.datenblatt_type === 'file'" class="form-group">
              <label i18n="@@form.datasheetFile">Datenblatt-Datei</label>
              <div class="file-upload" (click)="datasheetInput.click(); $event.stopPropagation()">
                <span i18n="@@form.clickToUpload">Klicken zum Hochladen (PDF, DOC, DOCX)</span>
                <input
                  #datasheetInput
                  type="file"
                  accept=".pdf,.doc,.docx"
                  (change)="onDatasheetUpload($event)"
                  (cancel)="$event.stopPropagation()"
                  (click)="$event.stopPropagation()"
                />
                <div *ngIf="formData.datenblatt_value" class="file-preview">
                  📄 {{ formData.datenblatt_value }}
                  <button type="button" class="btn-delete-file" (click)="deleteDatasheet($event)" title="Datenblatt löschen">✖</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>Weitere Datei</label>
              <select [(ngModel)]="formData.weitere_datei_type" name="weitere_datei_type">
                <option [value]="null">Keine</option>
                <option value="url">URL</option>
                <option value="file">Datei hochladen</option>
              </select>
            </div>

            <div *ngIf="formData.weitere_datei_type === 'url'" class="form-group">
              <label>Weitere Datei-URL (wird automatisch heruntergeladen)</label>
              <input
                type="url"
                [(ngModel)]="formData.weitere_datei_value"
                name="weitere_datei_value"
                (blur)="onWeitereDateiUrlBlur()"
                placeholder="https://example.com/document.pdf"
              />
              <small *ngIf="weitereDateiDownloadStatus" class="download-status-hint" [class.success]="!downloadingWeitereDatei && weitereDateiDownloadStatus">
                {{ weitereDateiDownloadStatus }}
              </small>
            </div>

            <div *ngIf="formData.weitere_datei_type === 'file'" class="form-group">
              <label>Weitere Datei</label>
              <div class="file-upload" (click)="weitereDateiInput.click(); $event.stopPropagation()">
                <span>Klicken zum Hochladen (PDF, DOC, DOCX)</span>
                <input
                  #weitereDateiInput
                  type="file"
                  accept=".pdf,.doc,.docx"
                  (change)="onWeitereDateiUpload($event)"
                  (cancel)="$event.stopPropagation()"
                  (click)="$event.stopPropagation()"
                />
                <div *ngIf="formData.weitere_datei_value" class="file-preview">
                  📄 {{ formData.weitere_datei_value }}
                  <button type="button" class="btn-delete-file" (click)="deleteWeitereDatei($event)" title="Weitere Datei löschen">✖</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label i18n="@@form.image">Bild</label>
              <div class="image-upload-container">
                <div class="file-upload" (click)="imageInput.click(); $event.stopPropagation()">
                  <span i18n="@@form.clickToUploadImage">Klicken zum Hochladen (JPG, PNG, GIF, WebP)</span>
                  <input
                    #imageInput
                    type="file"
                    accept="image/*"
                    (change)="onImageUpload($event)"
                    (cancel)="$event.stopPropagation()"
                    (click)="$event.stopPropagation()"
                  />
                  <div *ngIf="formData.bild" class="file-preview">
                    <img [src]="getImageUrl(formData.bild)" alt="Vorschau" />
                    <button type="button" class="btn-delete-file" (click)="deleteImage($event)" title="Bild löschen">✖</button>
                  </div>
                </div>
                <button
                  type="button"
                  class="btn btn-secondary camera-btn"
                  (click)="openCamera($event)"
                  title="Foto aufnehmen"
                >
                  📷 Foto aufnehmen
                </button>
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

    <!-- Camera Modal -->
    <div *ngIf="showCamera" class="camera-overlay" (click)="closeCamera()">
      <div class="camera-container" (click)="$event.stopPropagation()">
        <div class="camera-header">
          <h3>Foto aufnehmen</h3>
          <button class="icon-btn close-btn" (click)="closeCamera()">✖</button>
        </div>
        <div class="camera-body">
          <video id="camera-video" autoplay playsinline></video>
          <canvas id="camera-canvas" style="display: none;"></canvas>
        </div>
        <div class="camera-footer">
          <button type="button" class="btn btn-secondary" (click)="closeCamera()">
            Abbrechen
          </button>
          <button type="button" class="btn btn-primary capture-btn" (click)="capturePhoto($event)">
            📷 Foto machen
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .tag-search {
      margin-bottom: 10px;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .tags-selector {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      min-height: 50px;
      max-height: 200px;
      overflow-y: auto;
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

    .btn-delete-file {
      position: absolute;
      top: 5px;
      right: 5px;
      background: #e74c3c;
      color: white;
      border: none;
      border-radius: 50%;
      width: 24px;
      height: 24px;
      cursor: pointer;
      font-size: 14px;
      line-height: 1;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-delete-file:hover {
      background: #c0392b;
    }

    .file-preview {
      position: relative;
    }

    .image-upload-container {
      display: flex;
      gap: 10px;
      align-items: flex-start;
    }

    .image-upload-container .file-upload {
      flex: 1;
    }

    .camera-btn {
      white-space: nowrap;
      flex-shrink: 0;
    }

    /* Camera Modal */
    .camera-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    }

    .camera-container {
      background: white;
      border-radius: 8px;
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
    }

    .camera-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #ddd;
    }

    .camera-header h3 {
      margin: 0;
      color: #2c3e50;
    }

    .close-btn {
      font-size: 24px;
      padding: 5px;
    }

    .camera-body {
      padding: 20px;
      display: flex;
      justify-content: center;
      align-items: center;
      background: #000;
      flex: 1;
      overflow: hidden;
    }

    .camera-body video {
      max-width: 100%;
      max-height: 100%;
      border-radius: 4px;
    }

    .camera-footer {
      padding: 15px 20px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
    }

    .capture-btn {
      font-size: 16px;
      font-weight: 600;
    }
  `]
})
export class ItemFormComponent implements OnInit {
  @Input() item: Item | null = null;
  @Input() locations: Location[] = [];
  @Output() save = new EventEmitter<Item>();
  @Output() cancel = new EventEmitter<void>();

  downloadingDatasheet = false;
  datasheetDownloadStatus = '';
  downloadingWeitereDatei = false;
  weitereDateiDownloadStatus = '';

  // Camera
  showCamera = false;
  videoStream: MediaStream | null = null;

  formData: any = {
    name: '',
    artikelnummer: '',
    farbe: '',
    kategorie_id: null,
    ort_id: null,
    menge: null,
    einheit: '',
    hersteller: '',
    haendler: '',
    preis: null,
    link: '',
    datenblatt_type: null,
    datenblatt_value: '',
    weitere_datei_type: null,
    weitere_datei_value: '',
    bild: '',
    notizen: '',
    tag_ids: []
  };

  nameSuggestions: string[] = [];
  categories: Category[] = [];
  tags: Tag[] = [];
  tagSearchQuery = '';
  newTagName = '';
  newTagColor = '#3498db';

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    if (this.item) {
      this.formData = {
        ...this.item,
        tag_ids: this.item.tag_ids || this.item.tags?.map(t => t.id) || []
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

  getFilteredTags(): Tag[] {
    if (!this.tagSearchQuery.trim()) {
      return this.tags;
    }
    const query = this.tagSearchQuery.toLowerCase();
    return this.tags.filter(tag => tag.name.toLowerCase().includes(query));
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

  deleteImage(event: Event) {
    event.stopPropagation();
    if (confirm('Bild wirklich löschen?')) {
      this.formData.bild = '';
    }
  }

  async openCamera(event: Event) {
    event.stopPropagation();

    try {
      this.videoStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' } // Use back camera on mobile
      });
      this.showCamera = true;

      // Wait for view to update, then set video source
      setTimeout(() => {
        const video = document.getElementById('camera-video') as HTMLVideoElement;
        if (video && this.videoStream) {
          video.srcObject = this.videoStream;
        }
      }, 100);
    } catch (error) {
      console.error('Error accessing camera:', error);
      alert('Kamera konnte nicht geöffnet werden. Bitte Berechtigungen prüfen.');
    }
  }

  capturePhoto(event: Event) {
    event.stopPropagation();

    const video = document.getElementById('camera-video') as HTMLVideoElement;
    const canvas = document.getElementById('camera-canvas') as HTMLCanvasElement;

    if (!video || !canvas) return;

    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const context = canvas.getContext('2d');
    if (context) {
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to blob and upload
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-photo.jpg', { type: 'image/jpeg' });
          this.uploadImage(file);
          this.closeCamera();
        }
      }, 'image/jpeg', 0.9);
    }
  }

  closeCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach(track => track.stop());
      this.videoStream = null;
    }
    this.showCamera = false;
  }

  private uploadImage(file: File) {
    this.apiService.uploadImage(file).subscribe({
      next: (response) => {
        this.formData.bild = response.filename;
      },
      error: (err) => {
        console.error('Error uploading image:', err);
        alert('Fehler beim Hochladen des Bildes');
      }
    });
  }

  deleteDatasheet(event: Event) {
    event.stopPropagation();
    if (confirm('Datenblatt wirklich löschen?')) {
      this.formData.datenblatt_value = '';
      this.formData.datenblatt_type = null;
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
    this.datasheetDownloadStatus = 'Datenblatt wird heruntergeladen...';

    this.apiService.downloadDatasheetFromUrl(url).subscribe({
      next: (response) => {
        // Replace URL with downloaded filename
        this.formData.datenblatt_value = response.filename;
        // Change type to file since we now have a local file
        this.formData.datenblatt_type = 'file';
        this.downloadingDatasheet = false;
        this.datasheetDownloadStatus = '✓ Datenblatt erfolgreich heruntergeladen und gespeichert';
      },
      error: (err) => {
        console.error('Error downloading datasheet:', err);
        this.downloadingDatasheet = false;
        this.datasheetDownloadStatus = '✗ Fehler beim Herunterladen. Bitte URL überprüfen.';
      }
    });
  }

  onWeitereDateiUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.apiService.uploadDatasheet(file).subscribe({
        next: (response) => {
          this.formData.weitere_datei_value = response.filename;
          this.formData.weitere_datei_type = 'file';
        },
        error: (err) => {
          console.error('Error uploading file:', err);
          alert('Fehler beim Hochladen der Datei');
        }
      });
    }
  }

  deleteWeitereDatei(event: Event) {
    event.stopPropagation();
    if (confirm('Weitere Datei wirklich löschen?')) {
      this.formData.weitere_datei_value = '';
      this.formData.weitere_datei_type = null;
    }
  }

  onWeitereDateiUrlBlur() {
    const url = this.formData.weitere_datei_value?.trim();

    // Only download if URL is valid and not empty
    if (!url || !url.startsWith('http')) {
      return;
    }

    // Don't download if it's already a filename (not a URL)
    if (!url.includes('://')) {
      return;
    }

    this.downloadingWeitereDatei = true;
    this.weitereDateiDownloadStatus = 'Weitere Datei wird heruntergeladen...';

    this.apiService.downloadDatasheetFromUrl(url).subscribe({
      next: (response) => {
        // Replace URL with downloaded filename
        this.formData.weitere_datei_value = response.filename;
        // Change type to file since we now have a local file
        this.formData.weitere_datei_type = 'file';
        this.downloadingWeitereDatei = false;
        this.weitereDateiDownloadStatus = '✓ Weitere Datei erfolgreich heruntergeladen und gespeichert';
      },
      error: (err) => {
        console.error('Error downloading file:', err);
        this.downloadingWeitereDatei = false;
        this.weitereDateiDownloadStatus = '✗ Fehler beim Herunterladen. Bitte URL überprüfen.';
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
