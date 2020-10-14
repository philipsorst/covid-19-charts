import {Injectable} from "@angular/core";
import {Observable} from "rxjs";
import {Country} from './country';
import {HttpClient} from '@angular/common/http';
import {map, shareReplay, tap} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class CountryService
{
    private nameToCodeMap = new Map<string, string>();
    private codeToCountryMap = new Map<string, Country>();
    private loader$ = null;

    constructor(private httpClient: HttpClient)
    {
    }

    public load(): Observable<CountryService>
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

        if (null == this.loader$) {
            this.loader$ = this.httpClient.get<any>('https://query.wikidata.org/sparql', {
                params: {
                    format: 'json',
                    query
                }
            }).pipe(
                map(sparqlResult => sparqlResult.results.bindings.map(result => {
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
                tap(countries => {
                    countries.forEach(country => {
                        this.addCodeToCountry(country.code, country);
                        this.addNameToCode(country.name, country.code);
                    })
                }),
                map(() => this),
                shareReplay(1)
            );
        }

        return this.loader$;
    }

    public getCountry(code: string): Country | null
    {
        const country = this.codeToCountryMap.get(code);
        if (null == country) return null;

        return country;
    }

    public getCode(name: string): string | null
    {
        let code: string | null | undefined = this.nameToCodeMap.get(name);
        if (null == code) {
            console.warn(`Code not found for ${name}`);
            code = null;
        }

        return code;
    }

    private addNameToCode(country: string, abbreviation: string)
    {
        this.nameToCodeMap.set(country, abbreviation);
    }

    private addCodeToCountry(code: string, country: Country)
    {
        this.codeToCountryMap.set(code, country);
    }
}
