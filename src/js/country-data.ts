import * as d3 from 'd3';
import {WORLD_ABBR} from "./load.coviddata";

export class CountryData
{
    private countryToAbbreviation = new Map<string, string>();
    private abbreviationToCountry = new Map<string, string>();
    private abbreviationToPopulation = new Map<string, number>();
    private nameReplacementMap = new Map<string, string>();

    constructor()
    {
        this.nameReplacementMap.set('SriLanka', 'Sri Lanka');
        this.nameReplacementMap.set('US', 'United States');
        this.nameReplacementMap.set('Holy See', 'Holy See (Vatican City State)');
        this.nameReplacementMap.set('Korea, South', 'South Korea');
        this.nameReplacementMap.set('Cruise Ship', 'Japan');
        this.nameReplacementMap.set('Czechia', 'Czech Republic');
        this.nameReplacementMap.set('Taiwan*', 'Taiwan');
        this.nameReplacementMap.set('Russia', 'Russian Federation');
        this.nameReplacementMap.set('Cote d\'Ivoire', 'Ivory Coast');
        this.nameReplacementMap.set('Côte d\'Ivoire', 'Ivory Coast');
        this.nameReplacementMap.set('Curacao', 'Netherlands');
        this.nameReplacementMap.set('Eswatini', 'Swaziland');
        this.nameReplacementMap.set('eSwatini', 'Swaziland');
        this.nameReplacementMap.set('occupied Palestinian territory', 'Palestine');
        this.nameReplacementMap.set('Fiji', 'Fiji Islands');
        this.nameReplacementMap.set('W. Sahara', 'Western Sahara');
        this.nameReplacementMap.set('United States of America', 'United States');
        this.nameReplacementMap.set('Dominican Rep.', 'Dominican Republic');
        this.nameReplacementMap.set('Falkland Is.', 'Falkland Islands');
        this.nameReplacementMap.set('Fr. S. Antarctic Lands', 'French Southern territories');
        this.nameReplacementMap.set('Central African Rep.', 'Central African Republic');
        this.nameReplacementMap.set('Eq. Guinea', 'Equatorial Guinea');
        this.nameReplacementMap.set('Solomon Is.', 'Solomon Islands');
        this.nameReplacementMap.set('N. Cyprus', 'Turkey');
        this.nameReplacementMap.set('Libya', 'Libyan Arab Jamahiriya');
        this.nameReplacementMap.set('Somaliland', 'Somalia');
        this.nameReplacementMap.set('Bosnia and Herz.', 'Bosnia and Herzegovina');
        this.nameReplacementMap.set('Macedonia', 'North Macedonia');
        this.nameReplacementMap.set('Kosovo', 'Serbia');
        this.nameReplacementMap.set('S. Sudan', 'South Sudan');
    }


    static load(): Promise<CountryData>
    {
        const countryByAbbreviationPromise = d3.json('./build/country-json/country-by-abbreviation.json') as Promise<Array<{ country: string, abbreviation: string }>>;
        const countryByPopulationPromise = d3.json('./build/country-json/country-by-population.json') as Promise<Array<{ country: string, population: number }>>;

        return Promise.all([countryByAbbreviationPromise, countryByPopulationPromise])
            .then(([countryByAbbreviation, countryByPopulation]) => {

                const countryData = new CountryData();

                countryByAbbreviation.forEach(entry => {
                    countryData.addCountryToAbbreviation(entry.country, entry.abbreviation);
                    countryData.addAbbreviationToCountry(entry.abbreviation, entry.country);
                });

                countryData.addAbbreviationToCountry('TW', 'Taiwan');

                countryData.addCountryToAbbreviation('Taiwan', 'TW');
                countryData.addCountryToAbbreviation('Republic of the Congo', 'CG');
                countryData.addCountryToAbbreviation('Dem. Rep. Congo', 'CG');
                countryData.addCountryToAbbreviation('Congo (Brazzaville)', 'CG');
                countryData.addCountryToAbbreviation('Congo (Kinshasa)', 'CG');
                countryData.addCountryToAbbreviation('The Bahamas', 'BS');

                countryByPopulation.forEach(entry => {
                    if (null != entry.population) {
                        countryData.abbreviationToPopulation.set(countryData.getCountryCode(entry.country), entry.population);
                    }
                });

                countryData.abbreviationToPopulation.set('TW', 23780452);

                return countryData;
            });
    }

    private addCountryToAbbreviation(country: string, abbreviation: string)
    {
        this.countryToAbbreviation.set(country, abbreviation);
    }

    private addAbbreviationToCountry(abbreviation: string, country: string)
    {
        this.abbreviationToCountry.set(abbreviation, country);
    }

    public getCountryCode(countryName: string): string
    {
        let lookup = this.nameReplacementMap.get(countryName);
        if (null == lookup) {
            lookup = countryName;
        }

        const abbreviation = this.countryToAbbreviation.get(lookup);
        if (null == abbreviation) throw `Abbreviation not found for ${countryName}`;
        return abbreviation;
    }

    public getName(countryCode: string): string
    {
        if (WORLD_ABBR === countryCode) {
            return 'World';
        }

        const name = this.abbreviationToCountry.get(countryCode);
        if (null == name) throw `Name not found for ${countryCode}`;

        return name;
    }

    public getPopulation(countryCode: string): number | undefined
    {
        return this.abbreviationToPopulation.get(countryCode);
    }
}
