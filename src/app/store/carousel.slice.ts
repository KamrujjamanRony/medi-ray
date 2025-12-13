import { baseInitialState, BaseState } from "./appStore/base.store";

export interface Carousel {
    id: string;
    companyID: number;
    title: string;
    description: string;
    imageUrl: string;
    imageFile: File | null;
}

export interface CarouselState extends BaseState {
  carousel: Carousel[];
}

export const CarouselInitialState: CarouselState = {
  ...baseInitialState,
  carousel: []
};