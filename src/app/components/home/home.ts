import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CarouselComponent } from "../shared/carousel/carousel";
import { Hero } from "../shared/hero/hero";
import { ProductsWrapper } from "../shared/products-wrapper/products-wrapper";
import { CarouselM, ProductM } from '../../utils/models';
import { ProductS } from '../../services/product-s';
import { CarouselS } from '../../services/carousel-s';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CarouselComponent, Hero, ProductsWrapper],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  carouselService = inject(CarouselS);
  productService = inject(ProductS);
  carousels = signal<CarouselM[]>([]);
  products = signal<ProductM[]>([]);
  renderer = inject(Renderer2);
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    // this.carouselService.getCompanyCarousel(environment.companyCode).subscribe(data => data && this.carousels.set(data));
    this.productService.getAllProducts().subscribe(data => data && this.products.set(data.slice(0, 8)));
    // 2. Wrap the browser-specific code in a platform check
    isPlatformBrowser(this.platformId) && this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
  }
}
