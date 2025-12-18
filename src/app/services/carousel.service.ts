import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { CarouselM } from '../utils/models';

@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  http = inject(HttpClient);
    url = `${environment.apiUrl}/Carousel`;

  addCarousel(model: CarouselM | FormData): Observable<CarouselM> {
    return this.http.post<CarouselM>(this.url, model);
  }

  getAllCarousel(): Observable<CarouselM[]> {
    return this.http.get<CarouselM[]>(this.url);
  }

  getCompanyCarousel(companyID: number): Observable<CarouselM[]> {
    return this.getAllCarousel().pipe(
      map(carousel => carousel.filter(a => a.companyID === companyID))
    );
  }

  getCarousel(id: string): Observable<CarouselM> {
    return this.http.get<CarouselM>(`${this.url}/GetCarouselById?id=${id}`);
  }

  updateCarousel(id: string, updateCarouselRequest: CarouselM | FormData): Observable<CarouselM> {
    return this.http.put<CarouselM>(`${this.url}/EditCarousel/${id}`, updateCarouselRequest);
  }

  deleteCarousel(id: string): Observable<CarouselM> {
    return this.http.delete<CarouselM>(`${this.url}/DeleteCarousel?id=${id}`);
  }
}
