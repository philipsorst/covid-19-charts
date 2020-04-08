import {CountryData} from "../country-data";

export class MapCountryCodeMapper
{
    private countryCodeMap = new Map<string, string>();

    constructor(private countryData: CountryData)
    {
        this.countryCodeMap.set('China', 'CN');
        this.countryCodeMap.set('Dem. Rep. Congo', 'CD');
        this.countryCodeMap.set('Dominican Rep.', 'DO');
        this.countryCodeMap.set('Falkland Is.', 'GB');
        this.countryCodeMap.set('Greenland', 'GL');
        this.countryCodeMap.set('Fr. S. Antarctic Lands', 'FR');
        this.countryCodeMap.set('Timor-Leste', 'TL');
        this.countryCodeMap.set('Puerto Rico', 'PR');
        this.countryCodeMap.set('Côte d\'Ivoire', 'CI');
        this.countryCodeMap.set('Central African Rep.', 'CF');
        this.countryCodeMap.set('Congo', 'CG');
        this.countryCodeMap.set('Eq. Guinea', 'GQ');
        this.countryCodeMap.set('eSwatini', 'SZ');
        this.countryCodeMap.set('Palestine', 'PS');
        this.countryCodeMap.set('Netherlands', 'NL');
        this.countryCodeMap.set('New Caledonia', 'NC');
        this.countryCodeMap.set('Solomon Is.', 'SB');
        this.countryCodeMap.set('Taiwan', 'TW');
        this.countryCodeMap.set('Czechia', 'CZ');
        this.countryCodeMap.set('N. Cyprus', 'TR');
        this.countryCodeMap.set('Cyprus', 'CY');
        this.countryCodeMap.set('Somaliland', 'SO');
        this.countryCodeMap.set('Bosnia and Herz.', 'BA');
        this.countryCodeMap.set('Macedonia', 'MK');
        this.countryCodeMap.set('Kosovo', 'RS');
        this.countryCodeMap.set('S. Sudan', 'SS');

        /* Inofficial */
        // this.countryCodeMap.set('W. Sahara', 'EH');
        this.countryCodeMap.set('W. Sahara', 'MA');
    }

    public getCode(name: string): string | null
    {
        if (this.countryCodeMap.has(name)) {
            return this.countryCodeMap.get(name) as string;
        }

        return this.countryData.getCode(name);
    }
}
