import {Injectable} from "@angular/core";
import {Topology} from "topojson-specification";
import {HttpClient} from "@angular/common/http";

@Injectable({providedIn: 'root'})
export class WorldAtlasService
{
    constructor(private httpClient: HttpClient)
    {
    }

    /**
     * @override
     */
    public loadTopology()
    {
        return this.httpClient.get<Topology>('https://unpkg.com/world-atlas@2.0.2/countries-50m.json');
    }
}
