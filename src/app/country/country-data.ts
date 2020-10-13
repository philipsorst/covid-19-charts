import * as d3 from 'd3';
import {Country} from "./country";

export class CountryData
{
    private nameToCodeMap = new Map<string, string>();
    private codeToCountryMap = new Map<string, Country>();

    private constructor()
    {
    }

    static newLoad()
    {
        const sparql = `
        SELECT DISTINCT ?x ?xLabel ?iso3166alpha2 ?population ?area ?hostCountryIso3166alpha2 ?isSouvereignState ?isDisputedTerritory
        WHERE
        {
            ?x wdt:P297 ?iso3166alpha2 .
            OPTIONAL { ?x wdt:P1082 ?population } .
            OPTIONAL { ?x wdt:P2046 ?area } .
            OPTIONAL { ?x wdt:P17 ?hostCountry . ?hostCountry wdt:P297 ?hostCountryIso3166alpha2  } .
            # not a former country
            FILTER NOT EXISTS {?x wdt:P31 wd:Q3024240} .
            BIND( EXISTS { ?x wdt:P31 wd:Q3624078 } as ?isSouvereignState ) .
            BIND( EXISTS { ?x wdt:P31 wd:Q15239622 } as ?isDisputedTerritory ) .

            SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
        }
        ORDER BY ?iso3166alpha2`.trim();
        const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
        return d3.json(url).then((response: any) => {
            const seen = new Set<string>();
            const results = response.results.bindings as Array<any>;
            results.forEach(result => {
                const code = result.iso3166alpha2.value;
                if (seen.has(code)) console.log('Duplicate', code);
                seen.add(code);
            });
        });
    }

    static load(): Promise<CountryData>
    {
        // this.newLoad();

        // const sparql = `
        // SELECT DISTINCT ?x ?xLabel ?iso3166alpha2 ?population ?area ?claimedByIso3166alpha2 ?hostCountryIso3166alpha2 ?iso3166alpha3 ?iso31662 ?isSouvereignState
        // WHERE
        // {
        //   ?x wdt:P297 ?iso3166alpha2 ;
        //      wdt:P298 ?iso3166alpha3 .
        //   OPTIONAL { ?x wdt:P300 ?iso31662 } .
        //   OPTIONAL { ?x wdt:P1082 ?population } .
        //   OPTIONAL { ?x wdt:P2046 ?area } .
        //   OPTIONAL { ?x wdt:P1336 ?claimedBy . ?claimedBy wdt:P31 wd:Q3624078 . ?claimedBy wdt:P297 ?claimedByIso3166alpha2  } .
        //   OPTIONAL { ?x wdt:P17 ?hostCountry . ?hostCountry wdt:P297 ?hostCountryIso3166alpha2  } .
        //   # not a former country
        //   FILTER NOT EXISTS {?x wdt:P31 wd:Q3024240} .
        //   BIND( EXISTS { ?x wdt:P31 wd:Q3624078 } as ?isSouvereignState ) .
        //
        //   SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
        // }
        // ORDER BY ?iso3166alpha2`.trim();

        // const sparql = `
        // SELECT DISTINCT ?countryLabel ?population ?iso3166alpha2
        // WHERE
        // {
        //     ?country wdt:P31 wd:Q3624078 ;
        //              wdt:P1082 ?population ;
        //              wdt:P297 ?iso3166alpha2 .
        //     # not a former country
        //     FILTER NOT EXISTS {?country wdt:P31 wd:Q3024240}
        //     # and no an ancient civilisation (needed to exclude ancient Egypt)
        //     FILTER NOT EXISTS {?country wdt:P31 wd:Q28171280} .
        //
        //     SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
        // }
        // ORDER BY ?iso3166alpha2`.trim();

        // const sparql = `
        // SELECT DISTINCT ?x ?xLabel ?iso3166alpha2 ?population ?area ?hostCountryCode ?isSovereign ?isDisputed
        // WHERE
        // {
        //     ?x wdt:P297 ?iso3166alpha2 .
        //     OPTIONAL { ?x wdt:P1082 ?population } .
        //     OPTIONAL { ?x wdt:P2046 ?area } .
        //     OPTIONAL { ?x wdt:P17 ?hostCountry . ?hostCountry wdt:P297 ?hostCountryCode  } .
        //     # not a former country
        //     FILTER NOT EXISTS {?x wdt:P31 wd:Q3024240} .
        //     BIND( EXISTS { ?x wdt:P31 wd:Q3624078 } as ?isSovereign ) .
        //     BIND( EXISTS { ?x wdt:P31 wd:Q15239622 } as ?isDisputed ) .
        //
        //     SERVICE wikibase:label { bd:serviceParam wikibase:language "en" }
        // }
        // ORDER BY ?iso3166alpha2`.trim();
        //
        // const url = "https://query.wikidata.org/sparql?format=json&query=" + encodeURIComponent(sparql);
        // return d3.json(url).then(response => {
        const countryData = new CountryData();
        // const results = country_data.results.bindings as Array<any>;
        const results = [];
        results.forEach(result => {
            const name = result.xLabel.value;
            const code = result.iso3166alpha2.value;
            const population = (result.population != null) ? +result.population.value : null;
            const area = (result.area != null) ? +result.area.value : null;
            const isSovereign = result.isSovereign.value;
            const isDisputed = result.isDisputed.value;
            const hostCountryCode = (result.hostCountryCode != null) ? result.hostCountryCode.value : null;
            const country = new Country(
                code,
                    name,
                    population,
                    area,
                    hostCountryCode,
                    isSovereign,
                    isDisputed
                );
            countryData.addCodeToCountry(code, country);
            countryData.addNameToCode(name, code);
        });

        return Promise.resolve(countryData);
        // });
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
        if (null == country) return null;

        return country;
    }

    public fetchCountry(code: string): Country
    {
        const country = this.codeToCountryMap.get(code);
        if (null == country) throw `Country not found for ${code}`;

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

    public getCountries(): Country[]
    {
        return Array.from(this.codeToCountryMap.values());
    }
}
