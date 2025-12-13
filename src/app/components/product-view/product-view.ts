import { Component, inject, PLATFORM_ID, Renderer2, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product } from '../../store/product.slice';
import { ProductStore } from '../../store/product.store';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-product-view',
  imports: [],
  templateUrl: './product-view.html',
  styleUrl: './product-view.css',
})
export class ProductView {
  productStore = inject(ProductStore);
  route = inject(ActivatedRoute);
  paramsSubscription?: Subscription;
  ImageApi = environment.ImageApi;
  id!: string | null;
  product = signal<Product | null>(null);
  renderer = inject(Renderer2);
  // 1. Inject PLATFORM_ID
  private platformId = inject(PLATFORM_ID);
  
  ngOnInit(): void {
    this.paramsSubscription = this.route.paramMap.subscribe(params => {
      this.id = params.get('id');
      this.product.set(this.productStore.getProductById(this.id));
    });
    // 2. Wrap the browser-specific code in a platform check
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setProperty(document.documentElement, 'scrollTop', 0);
    }
  }

}
