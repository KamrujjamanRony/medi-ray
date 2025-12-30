import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { ProductsWrapper } from "../shared/products-wrapper/products-wrapper";
import { isPlatformBrowser } from '@angular/common';
import { ProductM } from '../../utils/models';
import { ProductS } from '../../services/product-s';
import { environment } from '../../../environments/environment';
import { SeoManager } from '../../services/seo-manager';

@Component({
  selector: 'app-products',
  imports: [ProductsWrapper],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {
  productService = inject(ProductS);
  seoManager = inject(SeoManager);
  products = signal<ProductM[]>([]);
  renderer = inject(Renderer2);
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);

  ngOnInit() {
    this.setProductsSeoTags('');
    this.loadProducts();
    // 2. Wrap the browser-specific code in a platform check
    isPlatformBrowser(this.platformId) && this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
  }

  loadProducts(title = "", description = "", companyID = environment.companyCode) {
    const searchParams = { companyID, title, description }

    this.productService.getAllProducts(searchParams).subscribe({
      next: (data) => {
        data && this.products.set(data)
      },
      error: () => {
        // this.hasError.set(true);
        // this.isLoading.set(false);
      }
    });
  }

  setProductsSeoTags(category: string) {
    const categoryTitle = category ? `${category}` : '';
    const seoTitle = categoryTitle ? `Products in ${categoryTitle}` : `All Products`;
    const seoDescription = categoryTitle
      ? `Explore our wide range of medical products in the ${categoryTitle} category at ${environment.companyName}. Quality healthcare solutions for all your needs.`
      : `Explore our wide range of medical products at ${environment.companyName}. Quality healthcare solutions for all your needs.`;
    this.seoManager.updateSeoData({
      title: seoTitle,
      description: seoDescription,
      type: 'product',
    });
  }
}
