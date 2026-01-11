import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ItemM } from '../utils/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ItemS {
  http = inject(HttpClient);
  url = `${environment.apiUrl}/Item`;

  // Create new item
  addItem(item: ItemM | FormData): Observable<ItemM> {
    return this.http.post<ItemM>(this.url, item);
  }

  // Get all items
  getAllItems(params: any): Observable<ItemM[]> {
    return this.http.post<ItemM[]>(`${this.url}/Search`, params);
  }

  // Get single item by ID
  getItem(id: number): Observable<ItemM> {
    return this.http.get<ItemM>(`${this.url}/${id}`);
  }

  // Update item
  updateItem(id: number, itemData: ItemM | FormData): Observable<ItemM> {
    return this.http.put<ItemM>(`${this.url}/${id}`, itemData);
  }

  // Delete item
  deleteItem(id: number): Observable<ItemM> {
    return this.http.delete<ItemM>(`${this.url}/${id}`);
  }
  
}
