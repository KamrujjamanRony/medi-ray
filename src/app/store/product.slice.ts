import { baseInitialState, BaseState } from "./appStore/base.store";

export interface Product {
    id: string;
    companyID: number;
    productCategory: string;
    productName: string;
    brand: string;
    model: string;
    origin: string;
    description: string;
    aditionalInformation: string;
    specialFeature: string;
    catalogUrl: string | null;
    imageUrl: string | null;
    imageFile: string | null;
}

export interface ProductState extends BaseState {
  products: Product[];
}

export const ProductInitialState: ProductState = {
  ...baseInitialState,
  products: []
};