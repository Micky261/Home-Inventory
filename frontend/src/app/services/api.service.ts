import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, Location } from '../models/item.model';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Use PHP development server on port 9000
  private apiUrl = 'http://localhost:9000/api';
  private uploadUrl = 'http://localhost:9000';

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
  getItems(search?: string, kategorie?: string, ort?: string): Observable<Item[]> {
    let params = new HttpParams();
    if (search) params = params.set('search', search);
    if (kategorie) params = params.set('kategorie', kategorie);
    if (ort) params = params.set('ort', ort);

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

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`, {
      headers: this.getHeaders()
    });
  }

  // Locations
  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(`${this.apiUrl}/locations`, {
      headers: this.getHeaders()
    });
  }

  createLocation(name: string): Observable<Location> {
    return this.http.post<Location>(`${this.apiUrl}/locations`, { name }, {
      headers: this.getHeaders()
    });
  }

  deleteLocation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/locations/${id}`, {
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

  deleteFile(filename: string, type: 'image' | 'datasheet'): Observable<any> {
    return this.http.post(`${this.apiUrl}/upload/delete`, { filename, type }, {
      headers: this.getHeaders()
    });
  }

  getImageUrl(filename: string): string {
    return `${this.uploadUrl}/uploads/images/${filename}`;
  }

  getDatasheetUrl(filename: string): string {
    return `${this.uploadUrl}/uploads/datasheets/${filename}`;
  }
}
