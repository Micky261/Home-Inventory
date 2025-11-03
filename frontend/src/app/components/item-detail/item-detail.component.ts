import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Item } from '../../models/item.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-item-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-overlay" (click)="onClose()">
      <div class="modal detail-modal" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ item.name }}</h2>
          <button class="icon-btn" (click)="onClose()">✖</button>
        </div>

        <div class="modal-body">
          <!-- Image -->
          <div class="detail-image" *ngIf="item.bild">
            <img [src]="getImageUrl(item.bild)" [alt]="item.name" />
          </div>
          <div class="no-image-detail" *ngIf="!item.bild" i18n="@@items.noImage">
            Kein Bild
          </div>

          <!-- Main Info Grid -->
          <div class="info-grid">
            <div class="info-item" *ngIf="item.kategorie_name">
              <label i18n="@@items.category">Kategorie</label>
              <span>{{ item.kategorie_name }}</span>
            </div>

            <div class="info-item" *ngIf="item.ort_path || item.ort_name">
              <label i18n="@@items.location">Ort</label>
              <span>{{ item.ort_path || item.ort_name }}</span>
            </div>

            <div class="info-item" *ngIf="item.menge">
              <label i18n="@@items.quantity">Menge</label>
              <span>{{ item.menge }} {{ item.einheit || '' }}</span>
            </div>

            <div class="info-item" *ngIf="item.preis">
              <label i18n="@@items.price">Preis</label>
              <span>{{ item.preis }} €</span>
            </div>

            <div class="info-item" *ngIf="item.haendler">
              <label i18n="@@items.retailer">Händler</label>
              <span>{{ item.haendler }}</span>
            </div>

            <div class="info-item full-width" *ngIf="item.tags && item.tags.length > 0">
              <label i18n="@@items.tags">Tags</label>
              <div class="tags-display">
                <span
                  *ngFor="let tag of item.tags"
                  class="tag-badge"
                  [style.background-color]="tag.color"
                >
                  {{ tag.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Notes -->
          <div class="notes-section" *ngIf="item.notizen">
            <label i18n="@@items.notes">Notizen</label>
            <div class="notes-content">{{ item.notizen }}</div>
          </div>

          <!-- Links -->
          <div class="links-section">
            <a
              *ngIf="item.link"
              [href]="item.link"
              target="_blank"
              class="btn btn-primary"
              i18n="@@items.openLink"
            >
              🔗 Link öffnen
            </a>

            <a
              *ngIf="item.datenblatt_type === 'url' && item.datenblatt_value"
              [href]="item.datenblatt_value"
              target="_blank"
              class="btn btn-primary"
              i18n="@@items.viewDatasheet"
            >
              📄 Datenblatt anzeigen
            </a>

            <a
              *ngIf="item.datenblatt_type === 'file' && item.datenblatt_value"
              [href]="getDatasheetUrl(item.datenblatt_value)"
              target="_blank"
              class="btn btn-primary"
              i18n="@@items.viewDatasheet"
            >
              📄 Datenblatt anzeigen
            </a>
          </div>

          <!-- Metadata -->
          <div class="metadata">
            <small *ngIf="item.created_at">
              <span i18n="@@items.createdAt">Erstellt am</span>: {{ formatDate(item.created_at) }}
            </small>
            <small *ngIf="item.updated_at && item.updated_at !== item.created_at">
              • <span i18n="@@items.updatedAt">Aktualisiert am</span>: {{ formatDate(item.updated_at) }}
            </small>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" (click)="onEdit()" i18n="@@items.edit">
            ✏️ Bearbeiten
          </button>
          <button type="button" class="btn btn-secondary" (click)="onClose()" i18n="@@items.close">
            Schließen
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .detail-modal {
      max-width: 700px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .detail-image {
      width: 100%;
      max-height: 400px;
      margin-bottom: 20px;
      border-radius: 8px;
      overflow: hidden;
      background: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .detail-image img {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
    }

    .no-image-detail {
      width: 100%;
      padding: 60px;
      text-align: center;
      background: #f8f9fa;
      color: #95a5a6;
      font-style: italic;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .info-item.full-width {
      grid-column: 1 / -1;
    }

    .info-item label {
      font-weight: 600;
      color: #7f8c8d;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .info-item span {
      font-size: 16px;
      color: #2c3e50;
    }

    .tags-display {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .tag-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 12px;
      color: white;
      font-size: 13px;
      font-weight: 500;
    }

    .notes-section {
      margin-bottom: 20px;
      padding: 15px;
      background: #f8f9fa;
      border-radius: 8px;
    }

    .notes-section label {
      font-weight: 600;
      color: #7f8c8d;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: block;
      margin-bottom: 10px;
    }

    .notes-content {
      color: #2c3e50;
      line-height: 1.6;
      white-space: pre-wrap;
    }

    .links-section {
      display: flex;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .links-section .btn {
      flex: 1;
      min-width: 150px;
      text-decoration: none;
    }

    .links-section .btn:hover {
      text-decoration: none;
    }

    .metadata {
      padding-top: 15px;
      border-top: 1px solid #eee;
      color: #95a5a6;
      font-size: 12px;
    }

    @media (max-width: 600px) {
      .info-grid {
        grid-template-columns: 1fr;
      }

      .links-section {
        flex-direction: column;
      }

      .links-section .btn {
        width: 100%;
      }
    }
  `]
})
export class ItemDetailComponent {
  @Input() item!: Item;
  @Output() close = new EventEmitter<void>();
  @Output() edit = new EventEmitter<Item>();

  constructor(private apiService: ApiService) {}

  onClose() {
    this.close.emit();
  }

  onEdit() {
    this.edit.emit(this.item);
  }

  getImageUrl(filename: string): string {
    return this.apiService.getImageUrl(filename);
  }

  getDatasheetUrl(filename: string): string {
    return this.apiService.getDatasheetUrl(filename);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
