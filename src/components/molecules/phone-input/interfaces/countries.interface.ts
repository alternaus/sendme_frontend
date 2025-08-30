import type { CountryCode } from "libphonenumber-js";

export type Country = [
  CountryName: string,
  Iso2: Lowercase<CountryCode>,
  DialCode: string,
  Priority?: number,
  AreaCodes?: string[]
];

export interface CountryObject {
  name: string;
  iso2: CountryCode;
  dialCode: string;
  priority: number;
  areaCodes: string[] | null;
}
