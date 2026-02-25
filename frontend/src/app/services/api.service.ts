import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, Location, LocationDetails, Category, CategoryDetails, Tag, TagDetails } from '../models/item.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;
  private uploadUrl = environment.uploadUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  // Auth
  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/login`, { username, password });
  }

  // Items
  getItems(
    search?: string,
    kategorien?: number[],
    orte?: number[],
    tags?: number[],
    categoryMode?: 'union' | 'intersect' | 'exclude',
    locationMode?: 'union' | 'intersect' | 'exclude',
    tagMode?: 'union' | 'intersect' | 'exclude'
  ): Observable<Item[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);

    if (kategorien && kategorien.length > 0) {
      kategorien.forEach(k => {
        params = params.append('kategorien[]', k.toString());
      });
    }

    if (orte && orte.length > 0) {
      orte.forEach(o => {
        params = params.append('orte[]', o.toString());
      });
    }

    if (tags && tags.length > 0) {
      tags.forEach(t => {
        params = params.append('tags[]', t.toString());
      });
    }

    if (categoryMode) {
      params = params.set('categoryMode', categoryMode);
    }

    if (locationMode) {
      params = params.set('locationMode', locationMode);
    }

    if (tagMode) {
      params = params.set('tagMode', tagMode);
    }

    return this.http.get<Item[]>(`${this.apiUrl}/items`, {
      headers: this.getHeaders(),
      params
    });
  }

  getItem(id: number): Observable<Item> {
    return this.http.get<Item>(`${this.apiUrl}/items/${id}`, {
      headers: this.getHeaders()
    });
  }

  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(`${this.apiUrl}/items`, item, {
      headers: this.getHeaders()
    });
  }

  updateItem(id: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${this.apiUrl}/items/${id}`, item, {
      headers: this.getHeaders()
    });
  }

  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/items/${id}`, {
      headers: this.getHeaders()
    });
  }

  autocompleteNames(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/items/autocomplete/names`, {
      headers: this.getHeaders(),
      params: new HttpParams().set('q', query)
    });
  }

  bulkUpdateItems(itemIds: number[], updates: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/items/bulk-update`, {
      item_ids: itemIds,
      updates: updates
    }, {
      headers: this.getHeaders()
    });
  }

  getStatistics(): Observable<any> {
    return this.http.get(`${this.apiUrl}/items/statistics`, {
      headers: this.getHeaders()
    });
  }

  // Categories
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories`, {
      headers: this.getHeaders()
    });
  }

  createCategory(name: string): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, { name }, {
      headers: this.getHeaders()
    });
  }

  updateCategory(id: number, name: string): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, { name }, {
      headers: this.getHeaders()
    });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categories/${id}`, {
      headers: this.getHeaders()
    });
  }

  getCategoriesWithCounts(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/overview`, {
      headers: this.getHeaders()
    });
  }

  getCategoryDetails(id: number): Observable<CategoryDetails> {
    return this.http.get<CategoryDetails>(`${this.apiUrl}/categories/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Locations
  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/locations`, {
      headers: this.getHeaders()
    });
  }

  getLocationsTree(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/locations/tree`, {
      headers: this.getHeaders()
    });
  }

  createLocation(name: string, parent_id?: number): Observable<Location> {
    const body: any = { name };
    if (parent_id !== undefined && parent_id !== null) {
      body.parent_id = parent_id;
    }
    return this.http.post<Location>(`${this.apiUrl}/locations`, body, {
      headers: this.getHeaders()
    });
  }

  updateLocation(id: number, name: string, parent_id?: number): Observable<Location> {
    const body: any = { name };
    if (parent_id !== undefined && parent_id !== null) {
      body.parent_id = parent_id;
    }
    return this.http.put<Location>(`${this.apiUrl}/locations/${id}`, body, {
      headers: this.getHeaders()
    });
  }

  deleteLocation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/locations/${id}`, {
      headers: this.getHeaders()
    });
  }

  getLocationDetails(id: number): Observable<LocationDetails> {
    return this.http.get<LocationDetails>(`${this.apiUrl}/locations/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateLocationDetails(id: number, description: string | null, inventoryStatus: 'none' | 'partial' | 'complete'): Observable<Location> {
    return this.http.put<Location>(`${this.apiUrl}/locations/${id}/details`, {
      description,
      inventory_status: inventoryStatus
    }, {
      headers: this.getHeaders()
    });
  }

  // Tags
  getTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags`, {
      headers: this.getHeaders()
    });
  }

  createTag(name: string, color: string): Observable<Tag> {
    return this.http.post<Tag>(`${this.apiUrl}/tags`, { name, color }, {
      headers: this.getHeaders()
    });
  }

  updateTag(id: number, name: string, color: string): Observable<Tag> {
    return this.http.put<Tag>(`${this.apiUrl}/tags/${id}`, { name, color }, {
      headers: this.getHeaders()
    });
  }

  deleteTag(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tags/${id}`, {
      headers: this.getHeaders()
    });
  }

  getTagsWithCounts(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.apiUrl}/tags/overview`, {
      headers: this.getHeaders()
    });
  }

  getTagDetails(id: number): Observable<TagDetails> {
    return this.http.get<TagDetails>(`${this.apiUrl}/tags/${id}`, {
      headers: this.getHeaders()
    });
  }

  // Uploads
  uploadImage(file: File): Observable<{ filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ filename: string }>(`${this.apiUrl}/upload/image`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      })
    });
  }

  uploadDatasheet(file: File): Observable<{ filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<{ filename: string }>(`${this.apiUrl}/upload/datasheet`, formData, {
      headers: new HttpHeaders({
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      })
    });
  }

  downloadDatasheetFromUrl(url: string): Observable<{ filename: string }> {
    return this.http.post<{ filename: string }>(`${this.apiUrl}/upload/datasheet-from-url`, { url }, {
      headers: this.getHeaders()
    });
  }

  deleteFile(filename: string, type: 'image' | 'datasheet'): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/delete`, { filename, type }, {
      headers: this.getHeaders()
    });
  }

  getImageUrl(filename: string): string {
    return `${this.uploadUrl}/uploads/images/${filename}`;
  }

  getThumbnailUrl(filename: string): string {
    return `${this.uploadUrl}/uploads/thumbnails/${filename}`;
  }

  getDatasheetUrl(filename: string): string {
    return `${this.uploadUrl}/uploads/datasheets/${filename}`;
  }
}
