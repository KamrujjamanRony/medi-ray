// app.store.ts
import { signalStore, withComputed, withMethods } from '@ngrx/signals';
import { inject } from '@angular/core';
import { StoreManager } from './store.manager';
import { STORE_CONFIGS } from './store.config';

export const AppStore = signalStore(
  { providedIn: 'root' },

  withComputed(() => {
    const storeManager = inject(StoreManager);

    return {
      // Global states
      isLoading: () => storeManager.isLoading(),
      globalError: () => storeManager.getError(),
      globalSuccess: () => storeManager.getSuccess(),
      hasErrors: () => !!storeManager.getError(),
      hasSuccess: () => !!storeManager.getSuccess(),

      // Store-specific states
      aboutLoading: () => storeManager.isLoading('about'),
      carouselLoading: () => storeManager.isLoading('carousel'),
      contactLoading: () => storeManager.isLoading('contact'),
      productLoading: () => storeManager.isLoading('product'),
      

      // Cross-store computed values
      // departmentsWithDoctors: () => {
      //   const doctors = storeManager.getStoreData<Doctor[]>('doctors') || [];
      //   const departments = storeManager.getStoreData<Department[]>('departments') || [];
      //   const doctorDeptIds = doctors.map((d: any) => d.departmentId);
      //   return departments.filter((dept: any) => doctorDeptIds.includes(dept.id));
      // },

      // Initialization status
      isInitialized: () => {
        const criticalStores = STORE_CONFIGS.filter(config => config.isCritical);
        return criticalStores.every(config => {
          const data = storeManager.getStoreData(config.name);
          return data && Array.isArray(data) ? data.length > 0 : !!data;
        });
      },

      // All errors and successes for debugging
      allErrors: () => STORE_CONFIGS.map(config => ({
        store: config.name,
        error: storeManager.getError(config.name)
      })).filter(item => item.error),

      allSuccesses: () => STORE_CONFIGS.map(config => ({
        store: config.name,
        success: storeManager.getSuccess(config.name)
      })).filter(item => item.success),
    };
  }),

  withMethods((store) => {
    const storeManager = inject(StoreManager);

    return {
      // 🔄 Initialization
      initializeApp: async () => {
        const criticalStores = STORE_CONFIGS.filter(config => config.isCritical);
        await storeManager.loadMultipleStores(criticalStores.map(config => config.name));
      },

      initializeFullApp: async () => {
        await storeManager.loadAllStores();
      },

      // 🔄 Store operations
      refreshStore: (storeName: any, params?: any) => {
        return storeManager.loadStore(storeName, params);
      },

      refreshAllStores: () => {
        return storeManager.loadAllStores();
      },

      refreshCriticalStores: () => {
        const criticalStores = STORE_CONFIGS.filter(config => config.isCritical);
        return storeManager.loadMultipleStores(criticalStores.map(config => config.name));
      },

      // 🧹 Cleanup
      clearAllErrors: () => {
        storeManager.clearErrors();
      },

      clearAllSuccess: () => {
        storeManager.clearSuccesses();
      },

      clearStoreError: (storeName: any) => {
        storeManager.clearErrors([storeName]);
      },

      clearStoreSuccess: (storeName: any) => {
        storeManager.clearSuccesses([storeName]);
      },

      // 🔍 Accessors
      getStore: (storeName: any) => {
        return storeManager.getStore(storeName);
      },

      getStoreData: (storeName: any) => {
        return storeManager.getStoreData(storeName);
      },

      // 📊 Statistics
      getStoreStats: () => {
        const stats: Record<string, number> = {};
        STORE_CONFIGS.forEach(config => {
          const data = storeManager.getStoreData(config.name);
          stats[config.name] = Array.isArray(data) ? data.length : data ? 1 : 0;
        });
        return stats;
      },

      // 🎯 Targeted operations
      loadStores: (storeNames: any[]) => {
        return storeManager.loadMultipleStores(storeNames);
      },
    };
  })
);

export type StoreName = import('./store.registry').StoreName;