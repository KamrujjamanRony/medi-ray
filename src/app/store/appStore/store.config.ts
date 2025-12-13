// store.config.ts
export interface StoreConfig {
  name: StoreName;
  loadMethod: string;
  dataProperty: string;
  isCritical?: boolean;
}

export type StoreName = 
  | 'about' 
  | 'carousel' 
  | 'contact' 
  | 'product';

export const STORE_CONFIGS: StoreConfig[] = [
  { name: 'about', loadMethod: 'loadAbout', dataProperty: 'about', isCritical: true },
  { name: 'carousel', loadMethod: 'loadCarousel', dataProperty: 'carousel', isCritical: true },
  { name: 'contact', loadMethod: 'loadContact', dataProperty: 'contact', isCritical: true },
  { name: 'product', loadMethod: 'loadProduct', dataProperty: 'product', isCritical: true },
];