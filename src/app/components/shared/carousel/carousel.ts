import { Component, computed, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule, IMAGE_LOADER, ImageLoaderConfig, NgOptimizedImage } from '@angular/common';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../../environments/environment';
import { CarouselM } from '../../../utils/models';

@Component({
  selector: 'app-carousel',
  imports: [FontAwesomeModule, CommonModule, NgOptimizedImage],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',

  // ⚠ REQUIRED FOR SWIPER WEB COMPONENTS
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { ngSkipHydration: '' },
  providers: [
    {
      provide: IMAGE_LOADER,
      useValue: (config: ImageLoaderConfig) => {
        // Build the URL for the backend sharp resizer
        const baseUrl = environment.ImageApi.endsWith('/') 
                      ? environment.ImageApi 
                      : `${environment.ImageApi}/`;
      return `${baseUrl}${config.src}?w=${config.width}`;
      },
    },
  ],
})
export class CarouselComponent {
  slides = input<CarouselM[]>([]);
  faSpinner = faSpinner;
  ImageApi = environment.ImageApi;
  // A computed value to decide if loop should be on
  canLoop = computed(() => this.slides().length > 4);

}
