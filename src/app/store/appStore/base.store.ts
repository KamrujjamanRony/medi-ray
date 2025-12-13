import { withMethods, patchState } from '@ngrx/signals';

export interface BaseState {
  loading: boolean;
  error: string | null;
  success: string | null;
}

export const baseInitialState: BaseState = {
  loading: false,
  error: null,
  success: null
};

export function withBaseMethods() {
  return withMethods(store => ({
    setLoading: (isLoading: boolean) => {
      patchState(store, { loading: isLoading });
    },
    setError: (error: string | null) => {
      patchState(store, { error });
    },
    setSuccess: (message: string | null) => {
      patchState(store, { success: message });
    },
    clearError: () => {
      patchState(store, { error: null });
    },
    clearSuccess: () => {
      patchState(store, { success: null });
    }
  }));
}