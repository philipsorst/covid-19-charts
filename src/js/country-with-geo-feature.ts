import {Country} from "./country";
import * as GeoJSON from "geojson";

export class CountryWithGeoFeature
{
    constructor(public country: Country, public feature: GeoJSON.Feature<GeoJSON.GeometryObject, { name: string }>)
    {
    }

}
