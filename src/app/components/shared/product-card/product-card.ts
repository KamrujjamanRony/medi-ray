import { Component, computed, input } from '@angular/core';
import { RouterLink } from "@angular/router";
import { environment } from '../../../../environments/environment';
import { ProductM } from '../../../utils/models';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input<ProductM>();
  ImageApi = environment.ImageApi;

}
