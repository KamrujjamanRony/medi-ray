import { Component, CUSTOM_ELEMENTS_SCHEMA, input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { environment } from '../../../../environments/environment';
import { CarouselM } from '../../../utils/models';

@Component({
  selector: 'app-carousel',
  imports: [FontAwesomeModule, CommonModule],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',

  // ⚠ REQUIRED FOR SWIPER WEB COMPONENTS
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  host: { ngSkipHydration: '' }
})
export class CarouselComponent {
  slides = input<CarouselM[]>([]);
  faSpinner = faSpinner;
  ImageApi = environment.ImageApi;

}
