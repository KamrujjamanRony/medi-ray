import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { ProductM } from '../utils/models';
import { from, lastValueFrom, map, Observable } from 'rxjs';
import { CacheS } from './cache-s';

@Injectable({
  providedIn: 'root',
})
export class ProductS {
  http = inject(HttpClient);
  cache = inject(CacheS);
  url = `${environment.apiUrl}/Product`;

  addProduct(model: FormData): Observable<ProductM> {
    // Clear relevant cache entries
    this.refreshProducts();
    return this.http.post<ProductM>(this.url, model);
  }

  getAllProducts(params: any): Observable<ProductM[]> {
    return from(
      params.itemId
        ?
        this.cache.getOrSet(
          `company_${params.companyID}_item_${params.itemId}_products`,
          () => lastValueFrom(this.http.post<ProductM[]>(this.url + "/Search", params)),
          5
        )
        :
        this.cache.getOrSet(
          `company_${params.companyID}_products`,
          () => lastValueFrom(this.http.post<ProductM[]>(this.url + "/Search", params)),
          5
        )
    );
  }

  getAllProductsIds(): Observable<string[]> {
    return from(
      this.cache.getOrSet(
        'all_product_ids',
        async () => {
          const products = await lastValueFrom(this.http.get<ProductM[]>(this.url));
          return products.map(product => product.id.toString());
        },
        5
      )
    );
  }

  getProduct(id: string): Observable<ProductM> {
    return from(
      this.cache.getOrSet(
        `product_${id}`,
        () => lastValueFrom(this.http.get<ProductM>(`${this.url}/${id}`)),
        10
      )
    );
  }

  updateProduct(id: string, updateProductRequest: ProductM): Observable<ProductM> {
    // Clear specific cache entries
    this.cache.clear('all_products');
    this.cache.clear('all_product_ids');
    this.cache.clear(`company_${updateProductRequest.companyID}_products`);
    this.cache.clear(`product_${id}`);
    this.refreshProducts();

    return this.http.put<ProductM>(`${this.url}/${id}`, updateProductRequest);
  }

  deleteProduct(id: string): Observable<ProductM> {
    return this.http.delete<ProductM>(`${this.url}/${id}`).pipe(
      map(response => {
        // Clear relevant cache
        this.cache.clear('all_products');
        this.cache.clear('all_product_ids');
        // Use pattern to clear company caches (since we don't know which company)
        this.cache.clearByPattern(/^cache_company_/);
        this.cache.clear(`product_${id}`);
        return response;
      })
    );
  }

  // Manual cache refresh
  refreshProducts(): void {
    this.cache.clear('all_products');
    this.cache.clear('all_product_ids');
    this.cache.clearByPattern(/^cache_company_/); // Matches "cache_company_123_products"
    this.cache.clearByPattern(/^cache_product_/); // Matches "cache_product_123"
  }

}
