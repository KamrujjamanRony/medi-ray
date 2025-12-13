// store.registry.ts

import { AboutStore } from "../about.store";
import { CarouselStore } from "../carousel.store";
import { contactStore } from "../contact.store";
import { ProductStore } from "../product.store";


export const STORE_REGISTRY = {
  about: AboutStore,
  carousel: CarouselStore,
  contact: contactStore,
  product: ProductStore,
} as const;

export type StoreName = keyof typeof STORE_REGISTRY;
export type StoreInstance = typeof STORE_REGISTRY[StoreName];