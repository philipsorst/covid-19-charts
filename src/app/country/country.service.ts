import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Country} from './country';
import {HttpClient} from '@angular/common/http';
import {map, shareReplay, tap} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class CountryService
{
    constructor(private httpClient: HttpClient)
    {
    }

    public list(): Observable<Country[]>
    {
        const query = `
            SELECT DISTINCT ?x ?xLabel ?iso3166alpha2 ?population ?area ?hostCountryCode ?isSovereign ?isDisputed
            WHERE
            {
                ?x wdt:P297 ?iso3166alpha2 .
                OPTIONAL { ?x wdt:P1082 ?population } .
                OPTIONAL { ?x wdt:P2046 ?area } .
                OPTIONAL { ?x wdt:P17 ?hostCountry . ?hostCountry wdt:P297 ?hostCountryCode  } .
                # not a former country
                FILTER NOT EXISTS {?x wdt:P31 wd:Q3024240} .
                BIND( EXISTS { ?x wdt:P31 wd:Q3624078 } as ?isSovereign ) .
                BIND( EXISTS { ?x wdt:P31 wd:Q15239622 } as ?isDisputed ) .
    
                SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
            }
            ORDER BY ?iso3166alpha2`.trim();
        // const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
        return this.httpClient.get('https://query.wikidata.org/sparql', {params: {format: 'json', query}}).pipe(
            tap(console.log),
            map(sparqlResult => sparqlResult.results.bindings.map(result => {
                console.log(result);
                const name = result.xLabel.value;
                const code = result.iso3166alpha2.value;
                const population = (result.population != null) ? +result.population.value : null;
                const area = (result.area != null) ? +result.area.value : null;
                const isSovereign = result.isSovereign.value;
                const isDisputed = result.isDisputed.value;
                const hostCountryCode = (result.hostCountryCode != null) ? result.hostCountryCode.value : null;
                return new Country(
                    code,
                    name,
                    population,
                    area,
                    hostCountryCode,
                    isSovereign,
                    isDisputed
                );
            })),
            shareReplay(1)
        );
    }
}
