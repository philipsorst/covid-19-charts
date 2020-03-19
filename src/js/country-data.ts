import * as d3 from 'd3';
import {Country} from "./country";

export class CountryData
{
    private nameToCodeMap = new Map<string, string>();
    private codeToCountryMap = new Map<string, Country>();

    private constructor()
    {
    }

    static load(): Promise<CountryData>
    {
        const sparql = ` 
        SELECT DISTINCT ?countryLabel ?population ?iso3166alpha2
        WHERE
        {
            ?country wdt:P31 wd:Q3624078 ;
                     wdt:P1082 ?population ;
                     wdt:P297 ?iso3166alpha2 .
            #not a former country
            FILTER NOT EXISTS {?country wdt:P31 wd:Q3024240}
            #and no an ancient civilisation (needed to exclude ancient Egypt)
            FILTER NOT EXISTS {?country wdt:P31 wd:Q28171280} .

            SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
        }
        ORDER BY ?iso3166alpha2`.trim();
        const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
        return d3.json(url).then(response => {
            const countryData = new CountryData();
            const results = response.results.bindings as Array<any>;
            results.forEach(result => {
                const name = result.countryLabel.value;
                const code = result.iso3166alpha2.value;
                const population = +result.population.value;
                const country = new Country(code, name, population);
                countryData.addCodeToCountry(code, country);
                countryData.addNameToCode(name, code);
            });
            return countryData;
        });
    }

    private addNameToCode(country: string, abbreviation: string)
    {
        this.nameToCodeMap.set(country, abbreviation);
    }

    private addCodeToCountry(code: string, country: Country)
    {
        this.codeToCountryMap.set(code, country);
    }

    public getCountry(code: string): Country | null
    {
        const country = this.codeToCountryMap.get(code);
        if (null == country) {
            return null;
        }

        return country;
    }

    public getCode(name: string): string | null
    {
        let code: string | null | undefined = this.nameToCodeMap.get(name);
        if (null == code) {
            console.warn(`Abbreviation not found for ${name}`);
            code = null;
        }

        return code;
    }

    public getCountries(): Country[]
    {
        return Array.from(this.codeToCountryMap.values());
    }
}
