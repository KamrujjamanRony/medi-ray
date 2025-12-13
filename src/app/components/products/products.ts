import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { ProductsWrapper } from "../shared/products-wrapper/products-wrapper";
import { ProductStore } from '../../store/product.store';
import { Product } from '../../store/product.slice';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-products',
  imports: [ProductsWrapper],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  productStore = inject(ProductStore);
  products = signal<Product[]>(this.productStore.products());
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
