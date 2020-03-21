import {CountryData} from "./country-data";
import {DayData} from "./day-data";
// import * as d3 from "d3";
import * as d3_time_format from "d3-time-format"
import * as d3_fetch from "d3-fetch"
import {Location} from "./location";

export class CovidData
{
    constructor(
        private locationDayDataMap: Map<Location, DayData[]>,
        private countryMap: Map<string, Map<string, DayData>>,
        private globalMap: Map<string, DayData>,
        private dates: Date[],
        private dateStrings: string[])
    {
    }

    public static load(countryData: CountryData): Promise<CovidData>
    {
        const covidDataLoader = new CovidDataLoader(countryData);
        return covidDataLoader.load();
    }

    public hasCountryCode(countryCode: string | null): boolean
    {
        if (null == countryCode) {
            return false;
        }
        return this.countryMap.has(countryCode);
    }

    public getCountryCodes(): string[]
    {
        return Array.from(this.countryMap.keys());
    }

    public getLocations(): Location[]
    {
        return Array.from(this.locationDayDataMap.keys());
    }

    public getLocationDayDataMap(): Map<Location, DayData[]>
    {
        return this.locationDayDataMap;
    }

    public getDayData(countryCode: string): DayData[]
    {
        const countryData = this.countryMap.get(countryCode);
        if (null == countryData) throw 'No data found for ' + countryCode;
        const arr = Array.from(countryData.values());
        arr.sort((a, b) => a.date.getTime() - b.date.getTime());

        return arr;
    }

    public getDayDataByDateString(countryCode: string, dateString: string): DayData | null
    {
        const countryData = this.countryMap.get(countryCode);
        if (null == countryData) throw 'No data found for ' + countryCode;

        const dayData = countryData.get(dateString);
        if (null == dayData) return null;

        return dayData;
    }

    public getGlobalDayData(): DayData[]
    {
        return Array.from(this.globalMap.values());
    }

    public getLastDayData(countryCode: string): DayData
    {
        const allDayData = this.getDayData(countryCode);
        return allDayData[allDayData.length - 1];
    }

    public getDates(): Date[]
    {
        return this.dates;
    }

    public getDateStrings(): string[]
    {
        return this.dateStrings;
    }
}

class CovidDataLoader
{
    private locationDayDataMap = new Map<Location, Map<string, DayData>>();
    private countryMap = new Map<string, Map<string, DayData>>();
    private globalMap = new Map<string, DayData>();
    private dateStringSet = new Set<string>();
    private dateParse = d3_time_format.timeParse('%m/%d/%y');
    private dateFormat = d3_time_format.timeFormat('%Y-%m-%d');
    private countryNameToCountryCodeMap = new Map<string, string>();

    constructor(private countryData: CountryData)
    {
        this.countryNameToCountryCodeMap.set('Bahamas, The', 'BS');
        this.countryNameToCountryCodeMap.set('Cabo Verde', 'CV');
        this.countryNameToCountryCodeMap.set('Martinique', 'FR');
        this.countryNameToCountryCodeMap.set('Taiwan*', 'CN');
        this.countryNameToCountryCodeMap.set('Republic of the Congo', 'CG');
        this.countryNameToCountryCodeMap.set('Dem. Rep. Congo', 'CG');
        this.countryNameToCountryCodeMap.set('Congo (Brazzaville)', 'CG');
        this.countryNameToCountryCodeMap.set('Congo (Kinshasa)', 'CG');
        this.countryNameToCountryCodeMap.set('The Bahamas', 'BS');
        this.countryNameToCountryCodeMap.set('The Gambia', 'GM');
        this.countryNameToCountryCodeMap.set('Gambia, The', 'GM');
        this.countryNameToCountryCodeMap.set('US', 'US');
        this.countryNameToCountryCodeMap.set('China', 'CN');
        this.countryNameToCountryCodeMap.set('Netherlands', 'NL');
        this.countryNameToCountryCodeMap.set('Greenland', 'DK');
        this.countryNameToCountryCodeMap.set('Czechia', 'CZ');
        this.countryNameToCountryCodeMap.set('Cruise Ship', 'JP');
        this.countryNameToCountryCodeMap.set('Cote d\'Ivoire', 'CI');
        this.countryNameToCountryCodeMap.set('Cyprus', 'CY');
        this.countryNameToCountryCodeMap.set('Holy See', 'VA');
        this.countryNameToCountryCodeMap.set('Korea, South', 'KR');
        this.countryNameToCountryCodeMap.set('Kosovo', 'RS');
    }

    private addEntry(entry: any, type: string)
    {
        const countryCode = this.getCountryCode(entry['Country/Region']);
        if (null == countryCode) {
            return;
        }

        const country = this.countryData.getCountry(countryCode);
        if (null == country) {
            console.log('Country not found', countryCode);
            return;
        }

        let location: Location = {
            country: country,
            province: entry['Province/State'],
            lat: +entry['Lat'],
            long: +entry['Long']
        };

        delete entry['Country/Region'];
        delete entry['Province/State'];
        delete entry['Lat'];
        delete entry['Long'];

        let countryMap = this.countryMap.get(countryCode);
        if (null == countryMap) {
            countryMap = new Map<string, DayData>();
            this.countryMap.set(countryCode, countryMap);
        }

        let locationMap = this.locationDayDataMap.get(location);
        if (null == locationMap) {
            locationMap = new Map<string, DayData>();
            this.locationDayDataMap.set(location, countryMap);
        }

        for (let dateString in entry) {
            if (entry.hasOwnProperty(dateString)) {
                const value = +entry[dateString];
                if (value > 0) {
                    const date = this.dateParse(dateString);
                    if (null == date) throw 'Date could not be parsed';
                    const transformedDateString = this.dateFormat(date);
                    this.dateStringSet.add(transformedDateString);

                    let countryDayData = countryMap.get(transformedDateString);
                    if (null == countryDayData) {
                        countryDayData = new DayData(date);
                        countryMap.set(transformedDateString, countryDayData);
                    }

                    let globalDayData = this.globalMap.get(transformedDateString);
                    if (null == globalDayData) {
                        globalDayData = new DayData(date);
                        this.globalMap.set(transformedDateString, globalDayData);
                    }

                    let locationDayData = locationMap.get(transformedDateString);
                    if (null == locationDayData) {
                        locationDayData = new DayData(date);
                        locationMap.set(transformedDateString, locationDayData);
                    }

                    // @ts-ignore
                    countryDayData[type] += value;
                    // @ts-ignore
                    globalDayData[type] += value;
                    // @ts-ignore
                    locationDayData[type] += value;
                }
            }
        }
    }

    private getCountryCode(countryName: string): string | null
    {
        if (this.countryNameToCountryCodeMap.has(countryName)) {
            return this.countryNameToCountryCodeMap.get(countryName) as string;
        }

        return this.countryData.getCode(countryName);
    }

    private postProcess(entries: Map<string, DayData>)
    {
        this.linkEntries(Array.from(entries.values()));
    }

    private linkEntries(arr: DayData[])
    {
        arr.sort((a, b) => a.date.getTime() - b.date.getTime());
        let lastEntry: DayData;
        arr.forEach((entry: DayData) => {
            if (null != lastEntry) {
                entry.previous = lastEntry;
                lastEntry.next = entry;
            }
            lastEntry = entry;
        });

        return arr;
    }

    public load(): Promise<CovidData>
    {
        const urls = {
            confirmed: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
            recovered: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
            deaths: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv',
        };

        return Promise.all([d3_fetch.csv(urls.confirmed), d3_fetch.csv(urls.recovered), d3_fetch.csv(urls.deaths)])
            .then(([confirmed, recovered, deaths]) => {

                confirmed.forEach((entry: any) => this.addEntry(entry, 'confirmed'));
                recovered.forEach((entry: any) => this.addEntry(entry, 'recovered'));
                deaths.forEach((entry: any) => this.addEntry(entry, 'deaths'));

                this.countryMap.forEach((entries) => this.postProcess(entries));
                this.postProcess(this.globalMap);

                const dates = new Array<Date>();
                const dateStrings = new Array<string>();
                const parser = d3_time_format.timeParse('%Y-%m-%d');
                this.dateStringSet.forEach(dateString => {
                    dateStrings.push(dateString);
                    const date = parser(dateString);
                    if (null != date) {
                        dates.push(date);
                    }
                });

                const locationDayDataArrayMap = new Map<Location, DayData[]>();
                this.locationDayDataMap.forEach((value, key) => {
                    locationDayDataArrayMap.set(key, this.linkEntries(Array.from(value.values()) as DayData[]))
                });

                return new CovidData(locationDayDataArrayMap, this.countryMap, this.globalMap, dates, dateStrings);
            });
    }
}
