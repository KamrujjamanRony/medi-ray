import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { isPlatformBrowser } from '@angular/common';
import { ProductM } from '../../utils/models';
import { ProductS } from '../../services/product-s';

@Component({
  selector: 'app-product-view',
  imports: [],
  templateUrl: './product-view.html',
  styleUrl: './product-view.css',
})
export class ProductView {
  productService = inject(ProductS);
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
      this.productService.getProduct(this.id as string).subscribe(data => data && this.product.set(data));
    });
    // 2. Wrap the browser-specific code in a platform check
    isPlatformBrowser(this.platformId) && this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
  }
}
