import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Product } from '../store/product.slice';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  http = inject(HttpClient);
    url = `${environment.apiUrl}/Product`;

  addProduct(model: Product | FormData): Observable<Product>{
    return this.http.post<Product>(this.url, model)
  }

  getAllProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(this.url);
  }

  getAllProductsIds(): Observable<string[]> {
    return this.getAllProducts().pipe(
      map(products => products.map(product => product.id.toString()))
    );
  }


  getCompanyProducts(companyID: number): Observable<Product[]> {
    return this.getAllProducts().pipe(
      map(products => products.filter(product => product.companyID === companyID))
    );
  }

  getProduct(id: string): Observable<Product>{
    return this.http.get<Product>(`${this.url}/GetProductById?id=${id}`);
  }

  updateProduct(id: string, updateProductRequest: Product | FormData): Observable<Product>{
    return this.http.put<Product>(`${this.url}/EditProduct/${id}`, updateProductRequest);
  }

  deleteProduct(id: string): Observable<Product>{
    return this.http.delete<Product>(`${this.url}/DeleteProduct?id=${id}`);
  }
}
