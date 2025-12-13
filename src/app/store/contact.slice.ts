import { baseInitialState, BaseState } from "./appStore/base.store";

export interface Contact {
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

export interface contactState extends BaseState {
  contact: Contact;
}

export const contactInitialState: contactState = {
  ...baseInitialState,
  contact: {} as Contact,
};