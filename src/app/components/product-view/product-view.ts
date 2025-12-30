import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { ProductM } from '../../utils/models';
import { ProductS } from '../../services/product-s';
import { SeoManager } from '../../services/seo-manager';

@Component({
  selector: 'app-product-view',
  imports: [],
  templateUrl: './product-view.html',
  styleUrl: './product-view.css',
})
export class ProductView {
  productService = inject(ProductS);
    seoManager = inject(SeoManager);
  route = inject(ActivatedRoute);
  paramsSubscription?: Subscription;
  ImageApi = environment.ImageApi;
  id!: string | null;
  product = signal<ProductM | null>(null);
  renderer = inject(Renderer2);
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    this.paramsSubscription = this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      this.productService.getProduct(this.id as string).subscribe(data => {
        if (data) {
          this.product.set(data);
          this.setProductsSeoTags(data.title || '');
        }
      });
    });
    // 2. Wrap the browser-specific code in a platform check
    isPlatformBrowser(this.platformId) && this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
  }

  setProductsSeoTags(productTitle: string) {
    const seoTitle = productTitle ? productTitle.charAt(0).toUpperCase() + productTitle.slice(1) : `Single Product`;
    const seoDescription = productTitle
      ? `Explore our wide range of medical products in the ${productTitle} category at ${environment.companyName}. Quality healthcare solutions for all your needs.`
      : `Explore our wide range of medical products at ${environment.companyName}. Quality healthcare solutions for all your needs.`;
    this.seoManager.updateSeoData({
      title: seoTitle,
      description: seoDescription,
      type: 'product',
    });
  }
}
