import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CarouselComponent } from "../shared/carousel/carousel";
import { Hero } from "../shared/hero/hero";
import { ProductsWrapper } from "../shared/products-wrapper/products-wrapper";
import { CarouselStore } from '../../store/carousel.store';
import { ProductStore } from '../../store/product.store';
import { Carousel } from '../../store/carousel.slice';
import { Product } from '../../store/product.slice';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarouselComponent, Hero, ProductsWrapper],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  carouselStore = inject(CarouselStore);
  productStore = inject(ProductStore);
  carousels = signal<Carousel[]>(this.carouselStore.carousel());
  products = signal<Product[]>(this.productStore.products().slice(0, 8));
  renderer = inject(Renderer2);
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // 2. Wrap the browser-specific code in a platform check
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
    }
  }

}
