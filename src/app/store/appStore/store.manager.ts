// store.manager.ts
import { inject, Injectable, Injector } from '@angular/core';
import { STORE_CONFIGS, StoreConfig, StoreName } from './store.config';
import { STORE_REGISTRY } from './store.registry';

@Injectable({ providedIn: 'root' })
export class StoreManager {
  private injector = inject(Injector);
  private storeInstances = new Map<StoreName, any>();

  getStore<T extends StoreName>(name: T): InstanceType<typeof STORE_REGISTRY[T]> {
    if (!this.storeInstances.has(name)) {
      const storeClass = STORE_REGISTRY[name];
      this.storeInstances.set(name, this.injector.get(storeClass));
    }
    return this.storeInstances.get(name);
  }

  getAllStores() {
    return STORE_CONFIGS.map(config => this.getStore(config.name));
  }

  getCriticalStores() {
    return STORE_CONFIGS
      .filter(config => config.isCritical)
      .map(config => this.getStore(config.name));
  }

  getStoreConfig(name: StoreName): StoreConfig | undefined {
    return STORE_CONFIGS.find(config => config.name === name);
  }

  async loadStore(name: StoreName, params?: any): Promise<void> {
    const store = this.getStore(name);
    const config = this.getStoreConfig(name);

    if (!config || !(store as any)[config.loadMethod]) {
      console.warn(`Store ${name} doesn't have load method: ${config?.loadMethod}`);
      return;
    }

    try {
      const method = (store as any)[config.loadMethod];
      if (params) {
        await method(params);
      } else {
        await method();
      }
    } catch (error) {
      console.error(`Failed to load store ${name}:`, error);
      throw error;
    }
  }

 
  async loadMultipleStores( names: StoreName[], params?: Partial<Record<StoreName, any>> ): Promise<void> {
    const promises = names.map(name => this.loadStore(name, params?.[name]));
    await Promise.all(promises);
  }

  async loadAllStores(): Promise<void> {
    await this.loadMultipleStores(STORE_CONFIGS.map(config => config.name));
  }

  getStoreData<T>(name: StoreName): T | null {
    const store = this.getStore(name) as any;
    const config = this.getStoreConfig(name);

    if (!config || !store[config.dataProperty]) {
      return null;
    }

    return store[config.dataProperty]();
  }

  isLoading(name?: StoreName): boolean {
    if (name) {
      const store = this.getStore(name);
      return store.loading?.() || false;
    }

    return this.getAllStores().some(store => store.loading?.());
  }

  getError(name?: StoreName): string | null {
    if (name) {
      const store = this.getStore(name);
      return store.error?.() || null;
    }

    const errors = this.getAllStores()
      .map(store => store.error?.())
      .filter(error => error && error.trim().length > 0);

    return errors.length > 0 ? errors[0] : null;
  }

  getSuccess(name?: StoreName): string | null {
    if (name) {
      const store = this.getStore(name);
      return store.success?.() || null;
    }

    const successes = this.getAllStores()
      .map(store => store.success?.())
      .filter(success => success && success.trim().length > 0);

    return successes.length > 0 ? successes[0] : null;
  }

  clearErrors(names?: StoreName[]): void {
    const stores = names
      ? names.map(name => this.getStore(name))
      : this.getAllStores();

    stores.forEach(store => store.clearError?.());
  }

  clearSuccesses(names?: StoreName[]): void {
    const stores = names
      ? names.map(name => this.getStore(name))
      : this.getAllStores();

    stores.forEach(store => store.clearSuccess?.());
  }
}