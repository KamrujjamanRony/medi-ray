import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProductM } from '../utils/models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  http = inject(HttpClient);
    url = `${environment.apiUrl}/Product`;

  addProduct(model: ProductM | FormData): Observable<ProductM>{
    return this.http.post<ProductM>(this.url, model)
  }

  getAllProducts(): Observable<ProductM[]> {
    return this.http.get<ProductM[]>(this.url);
  }

  getAllProductsIds(): Observable<string[]> {
    return this.getAllProducts().pipe(
      map(products => products.map(product => product.id.toString()))
    );
  }

  getCompanyProducts(companyID: number): Observable<ProductM[]> {
    return this.getAllProducts().pipe(
      map(products => products.filter(product => product.companyID === companyID))
    );
  }

  getProduct(id: string): Observable<ProductM>{
    return this.http.get<ProductM>(`${this.url}/GetProductById?id=${id}`);
  }

  updateProduct(id: string, updateProductRequest: ProductM | FormData): Observable<ProductM>{
    return this.http.put<ProductM>(`${this.url}/EditProduct/${id}`, updateProductRequest);
  }

  deleteProduct(id: string): Observable<ProductM>{
    return this.http.delete<ProductM>(`${this.url}/DeleteProduct?id=${id}`);
  }
}
