import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ProductM } from '../utils/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductS {
  http = inject(HttpClient);
  url = `${environment.apiUrl}/Product`;

  addProduct(model: FormData): Observable<ProductM> {
    return this.http.post<ProductM>(this.url, model);
  }

  getAllProducts(params: any): Observable<ProductM[]> {
    return this.http.post<ProductM[]>(this.url + "/Search", params);
  }

  getProduct(id: string): Observable<ProductM> {
    return this.http.get<ProductM>(`${this.url}/${id}`);
  }

  updateProduct(id: string, updateProductRequest: ProductM): Observable<ProductM> {
    return this.http.put<ProductM>(`${this.url}/${id}`, updateProductRequest);
  }

  deleteProduct(id: string): Observable<ProductM> {
    return this.http.delete<ProductM>(`${this.url}/${id}`);
  }

}
