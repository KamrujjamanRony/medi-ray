import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from "@angular/router";
import { FlowbiteS } from '../../../services/flowbite';
import { ItemS } from '../../../services/item-s';
import { ItemM, ProductM } from '../../../utils/models';
import { environment } from '../../../../environments/environment';
import { ProductS } from '../../../services/product-s';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  flowbiteService = inject(FlowbiteS);
  private itemService = inject(ItemS);
  private productService = inject(ProductS);
  items = signal<ItemM[]>([]);
  products = signal<ProductM[]>([]);

 dropdownData = computed(() => {
    return this.items().map(item => ({
      name: item.description,
      link: this.generateProductLink(Number(item.id), item.description),
    }));
  });

  ngOnInit(): void {
    this.loadItems();
    this.flowbiteService.loadFlowbite((flowbite) => {
      flowbite.initFlowbite();
      console.log(flowbite);
    });
  }

  loadItems(companyID = environment.companyCode) {
    this.itemService.getAllItems({ companyID }).subscribe({
      next: (data) => {
        // Process items if needed
        this.items.set(data);
      },
      error: (error) => {
        console.error('Error loading items:', error);
      }
    });
  }

  loadProducts(title: string) {
    const params = {
      companyID: environment.companyCode,
      title
    };
    this.productService.getAllProducts(params).subscribe({
      next: (data) => {
        // Process products if needed
        this.products.set(data);
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  /**
   * Generate SEO-friendly product URL
   */
  private generateProductLink(itemId: number, description: string | null | undefined): string {
    const slug = (description ?? '')
      .replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, ''); // Remove special characters
    
    return `/products/${itemId}/${slug}`;
  }

}
