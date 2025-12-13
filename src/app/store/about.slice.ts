import { baseInitialState, BaseState } from "./appStore/base.store";

export interface About {
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

export interface AboutState extends BaseState {
  about: About;
}

export const aboutInitialState: AboutState = {
  ...baseInitialState,
  about: {
    id: "string",
    companyID: 0,
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
};