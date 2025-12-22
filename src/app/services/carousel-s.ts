import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SimpleCacheService } from './simple-cache.service';
import { environment } from '../../environments/environment';
import { CarouselM } from '../utils/models';
import { from, lastValueFrom, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarouselS {
  http = inject(HttpClient);
  cache = inject(SimpleCacheService);
  url = `${environment.apiUrl}/Carousel`;

  // No cache for create operations
  addCarousel(model: CarouselM | FormData): Observable<CarouselM> {
    return this.http.post<CarouselM>(this.url, model);
  }

  // Cached version
  getAllCarousel(params: any): Observable<CarouselM[]> {
    return from(
      this.cache.getOrSet(
        'carousel_all',
        () => lastValueFrom(this.http.post<CarouselM[]>(`${this.url}/Search`, params)),
        15 // Cache for 15 minutes
      )
    );
  }

  // Cached version
  getCompanyCarousel(companyID: number): Observable<CarouselM[]> {
    return from(
      this.cache.getOrSet(
        `carousel_company_${companyID}`,
        async () => {
          const allCarousel = await lastValueFrom(this.http.get<CarouselM[]>(this.url));
          return allCarousel.filter(a => a.companyID === companyID);
        },
        15
      )
    );
  }

  // Cached version
  getCarousel(id: string): Observable<CarouselM> {
    return from(
      this.cache.getOrSet(
        `carousel_item_${id}`,
        () => lastValueFrom(this.http.get<CarouselM>(`${this.url}/${id}`)),
        15 // Cache individual items for 15 minutes
      )
    );
  }

  // Clear cache on update
  updateCarousel(id: string, updateCarouselRequest: CarouselM | FormData): Observable<CarouselM> {
    // Clear relevant cache entries
    this.cache.clear('carousel_all');
    
    // Extract companyID from the data if it's CarouselM
    if (!(updateCarouselRequest instanceof FormData)) {
      this.cache.clear(`carousel_company_${updateCarouselRequest.companyID}`);
    }
    
    this.cache.clear(`carousel_item_${id}`);
    
    return this.http.put<CarouselM>(`${this.url}/${id}`, updateCarouselRequest);
  }

  // Clear cache on delete
  deleteCarousel(id: string): Observable<CarouselM> {
    return this.http.delete<CarouselM>(`${this.url}/${id}`).pipe(
      map(response => {
        // Clear relevant cache
        this.cache.clear('carousel_all');
        this.cache.clearByPattern(/^cache_carousel_company_/); // Clear all company carousel caches
        this.cache.clear(`carousel_item_${id}`);
        return response;
      })
    );
  }

  // Optional: Manual refresh
  refreshCarousel(): void {
    this.cache.clearByPattern(/^cache_carousel_/);
  }
  
}
