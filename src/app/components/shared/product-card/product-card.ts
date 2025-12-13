import { Component, computed, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { environment } from '../../../../environments/environment';
import { Product } from '../../../store/product.slice';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input<Product>();
  ImageApi = environment.ImageApi;

}
