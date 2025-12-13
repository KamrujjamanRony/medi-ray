import { Component, input, Input } from '@angular/core';
import { ProductCard } from "../product-card/product-card";
import { Product } from '../../../store/product.slice';

@Component({
  selector: 'app-products-wrapper',
  imports: [ProductCard],
  templateUrl: './products-wrapper.html',
  styleUrl: './products-wrapper.css',
})
export class ProductsWrapper {
  products = input<Product[]>([]);

}
