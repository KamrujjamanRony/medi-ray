import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { CarouselM } from '../utils/models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CarouselS {
  http = inject(HttpClient);
  url = `${environment.apiUrl}/Carousel`;

  addCarousel(model: CarouselM | FormData): Observable<CarouselM> {
    return this.http.post<CarouselM>(this.url, model);
  }
  getAllCarousel(params: any): Observable<CarouselM[]> {
    return this.http.post<CarouselM[]>(`${this.url}/Search`, params);
  }
  getCarousel(id: string): Observable<CarouselM> {
    return this.http.get<CarouselM>(`${this.url}/${id}`);
  }
  updateCarousel(id: string, updateCarouselRequest: CarouselM | FormData): Observable<CarouselM> {
    return this.http.put<CarouselM>(`${this.url}/${id}`, updateCarouselRequest);
  }
  deleteCarousel(id: string): Observable<CarouselM> {
    return this.http.delete<CarouselM>(`${this.url}/${id}`);
  }  
  
}










