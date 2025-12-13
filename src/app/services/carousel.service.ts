import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Carousel } from '../store/carousel.slice';

@Injectable({
  providedIn: 'root'
})
export class CarouselService {
  http = inject(HttpClient);
    url = `${environment.apiUrl}/Carousel`;

  addCarousel(model: Carousel | FormData): Observable<Carousel> {
    return this.http.post<Carousel>(this.url, model);
  }

  getAllCarousel(): Observable<Carousel[]> {
    return this.http.get<Carousel[]>(this.url);
  }

  getCompanyCarousel(companyID: number): Observable<Carousel[]> {
    return this.getAllCarousel().pipe(
      map(carousel => carousel.filter(a => a.companyID === companyID))
    );
  }

  getCarousel(id: string): Observable<Carousel> {
    return this.http.get<Carousel>(`${this.url}/GetCarouselById?id=${id}`);
  }

  updateCarousel(id: string, updateCarouselRequest: Carousel | FormData): Observable<Carousel> {
    return this.http.put<Carousel>(`${this.url}/EditCarousel/${id}`, updateCarouselRequest);
  }

  deleteCarousel(id: string): Observable<Carousel> {
    return this.http.delete<Carousel>(`${this.url}/DeleteCarousel?id=${id}`);
  }
}
