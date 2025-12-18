import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { ProductsWrapper } from "../shared/products-wrapper/products-wrapper";
import { isPlatformBrowser } from '@angular/common';
import { ProductM } from '../../utils/models';
import { ProductS } from '../../services/product-s';

@Component({
  selector: 'app-products',
  imports: [ProductsWrapper],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  productService = inject(ProductS);
  products = signal<ProductM[]>([]);
  renderer = inject(Renderer2);
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.productService.getAllProducts().subscribe(data => data && this.products.set(data));
    // 2. Wrap the browser-specific code in a platform check
    isPlatformBrowser(this.platformId) && this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
  }
}
