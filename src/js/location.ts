import {Country} from "./country";

export interface Location
{
    country: Country;
    province: string | null;
    lat: number;
    long: number;
}
