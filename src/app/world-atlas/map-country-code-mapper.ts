import {CountryData} from "../country-data";

export class MapCountryCodeMapper
{
    private countryCodeMap = new Map<string, string>();

    constructor(private countryData: CountryData)
    {
        this.countryCodeMap.set('Åland', 'AX');
        this.countryCodeMap.set('Antarctica', 'AQ');
        this.countryCodeMap.set('Antigua and Barb.', 'AG');
        this.countryCodeMap.set('Central African Rep.', 'CF');
        this.countryCodeMap.set('Côte d\'Ivoire', 'CI');
        this.countryCodeMap.set('Congo', 'CG');
        this.countryCodeMap.set('Bosnia and Herz.', 'BA');
        this.countryCodeMap.set('British Virgin Is.', 'VG');
        this.countryCodeMap.set('Cabo Verde', 'CV');
        this.countryCodeMap.set('Cayman Is.', 'KY');
        this.countryCodeMap.set('China', 'CN');
        this.countryCodeMap.set('Cyprus', 'CY');
        this.countryCodeMap.set('Cook Is.', 'CK');
        this.countryCodeMap.set('Czechia', 'CZ');
        this.countryCodeMap.set('Dem. Rep. Congo', 'CD');
        this.countryCodeMap.set('Dominican Rep.', 'DO');
        this.countryCodeMap.set('Eq. Guinea', 'GQ');
        this.countryCodeMap.set('eSwatini', 'SZ');
        this.countryCodeMap.set('Falkland Is.', 'FK');
        this.countryCodeMap.set('Faeroe Is.', 'FO');
        this.countryCodeMap.set('Fr. Polynesia', 'PF');
        this.countryCodeMap.set('Fr. S. Antarctic Lands', 'TF');
        this.countryCodeMap.set('Greenland', 'GL');
        this.countryCodeMap.set('Heard I. and McDonald Is.', 'HM');
        // this.countryCodeMap.set('Kosovo', 'RS');
        this.countryCodeMap.set('Macao', 'MO');
        this.countryCodeMap.set('Macedonia', 'MK');
        this.countryCodeMap.set('Marshall Is.', 'MH');
        this.countryCodeMap.set('Micronesia', 'FM');
        this.countryCodeMap.set('N. Mariana Is.', 'MP');
        // this.countryCodeMap.set('New Caledonia', 'NC');
        // this.countryCodeMap.set('Netherlands', 'NL');
        this.countryCodeMap.set('Palestine', 'PS');
        this.countryCodeMap.set('Pitcairn Is.', 'PN');
        // this.countryCodeMap.set('Puerto Rico', 'PR');
        this.countryCodeMap.set('S. Geo. and the Is.', 'GS');
        this.countryCodeMap.set('S. Sudan', 'SS');
        this.countryCodeMap.set('Saint Helena', 'SH');
        this.countryCodeMap.set('Sint Maarten', 'SX');
        this.countryCodeMap.set('São Tomé and Principe', 'ST');
        this.countryCodeMap.set('St. Kitts and Nevis', 'KN');
        this.countryCodeMap.set('St. Pierre and Miquelon', 'PM');
        this.countryCodeMap.set('St. Vin. and Gren.', 'VC');
        this.countryCodeMap.set('St-Barthélemy', 'BL');
        this.countryCodeMap.set('St-Martin', 'MF');
        this.countryCodeMap.set('Solomon Is.', 'SB');
        this.countryCodeMap.set('Somaliland', 'SO');
        this.countryCodeMap.set('Taiwan', 'TW');
        this.countryCodeMap.set('Timor-Leste', 'TL');
        this.countryCodeMap.set('Turks and Caicos Is.', 'TC');
        this.countryCodeMap.set('U.S. Virgin Is.', 'VI');
        this.countryCodeMap.set('Vatican', 'VA');
        this.countryCodeMap.set('W. Sahara', 'EH');
        this.countryCodeMap.set('Wallis and Futuna Is.', 'WF');

        /* Not mapped */
        this.countryCodeMap.set('Ashmore and Cartier Is.', '');
        this.countryCodeMap.set('Br. Indian Ocean Ter.', '');
        this.countryCodeMap.set('Siachen Glacier', '');
        this.countryCodeMap.set('N. Cyprus', '');
        this.countryCodeMap.set('Indian Ocean Ter.', '');
    }

    public getCode(name: string): string | null
    {
        if (this.countryCodeMap.has(name)) {
            return this.countryCodeMap.get(name) as string;
        }

        return this.countryData.getCode(name);
    }
}
