import {Country} from "./country";

export class Location
{
    constructor(country: Country, province: string | null, lat: number, long: number)
    {
        this.country = country;
        this.province = province;
        this.lat = lat;
        this.long = long;
    }

    country: Country;
    province: string | null;
    lat: number;
    long: number;

    public getName()
    {
        return this.country.code + '-' + this.province;
    }
}
