export interface AboutM {
    id: "string",
    companyID: number,
    heading: "string",
    title: "string",
    description: "string",
    title2: "string | null",
    description2: "string | null",
    title3: "string | null",
    description3: "string | null",
    title4: "string | null",
    description4: "string | null",
    title5: "string | null",
    description5: "string | null"
}

export interface CarouselM {
    id: string;
    companyID: number;
    title: string;
    description: string;
    imageUrl: any;
}

export interface ContactM {
    id: "string",
    companyID: number,
    address1: "string | null",
    address2: "string | null",
    phoneNumber1: "string | null",
    phoneNumber2: "string | null",
    phoneNumber3: "string | null",
    email: "string | null",
    facebookLink: "string | null",
    othersLink1: "string | null",
    othersLink2: "string | null"
}

export interface ProductM {
    id?: any;
    companyID: number;
    title: string;
    description: string;
    imageUrl: string;
    category: string;
    brand: string;
    model: string;
    origin: string;
    additionalInformation: string;
    specialFeature: string;
    catalogURL: string;
    sl: number;
    images: any[];
    relatedProducts: any[];
}

export interface MenuM {
  id: number;
  menuName: string;
  parentMenuId?: any;
  url?: string;
  isActive: boolean;
  icon?: string;
  permissionsKey: string[];
  postBy: string;
}
