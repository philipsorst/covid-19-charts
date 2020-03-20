import {CountryData} from "./country-data";
import {DayData} from "./day-data";
import * as d3 from "d3";

export class CovidData
{
    constructor(
        private data: Map<string, Map<string, DayData>>,
        private globalData: Map<string, DayData>,
        private dates: Date[],
        private dateStrings: string[])
    {
    }

    public static load(countryData: CountryData): Promise<CovidData>
    {
        const covidDataLoader = new CovidDataLoader(countryData);
        return covidDataLoader.load(countryData);
    }

    public hasCountryCode(countryCode: string | null): boolean
    {
        if (null == countryCode) {
            return false;
        }
        return this.data.has(countryCode);
    }

    public getCountryCodes(): string[]
    {
        return Array.from(this.data.keys());
    }

    public getDayData(countryCode: string): DayData[]
    {
        const countryData = this.data.get(countryCode);
        if (null == countryData) throw 'No data found for ' + countryCode;
        const arr = Array.from(countryData.values());
        arr.sort((a, b) => a.date.getTime() - b.date.getTime());

        return arr;
    }

    public getDayDataByDateString(countryCode: string, dateString: string): DayData | null
    {
        const countryData = this.data.get(countryCode);
        if (null == countryData) throw 'No data found for ' + countryCode;

        const dayData = countryData.get(dateString);
        if (null == dayData) return null;

        return dayData;
    }

    public getGlobalDayData(): DayData[]
    {
        return Array.from(this.globalData.values());
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
    private data = new Map<string, Map<string, DayData>>();
    private globalData = new Map<string, DayData>();
    private dateStringSet = new Set<string>();
    private dateParse = d3.timeParse('%m/%d/%y');
    private dateFormat = d3.timeFormat('%Y-%m-%d');
    private countryNameToCountryCodeMap = new Map<string, string>();

    constructor(private countryData: CountryData)
    {
        this.countryNameToCountryCodeMap.set('Bahamas, The', 'BS');
        this.countryNameToCountryCodeMap.set('Martinique', 'FR');
        this.countryNameToCountryCodeMap.set('Taiwan*', 'TW');
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

        delete entry['Country/Region'];
        delete entry['Province/State'];
        delete entry['Lat'];
        delete entry['Long'];

        let countryMap = this.data.get(countryCode);
        if (null == countryMap) {
            countryMap = new Map<string, DayData>();
            this.data.set(countryCode, countryMap);
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

                    let worldDayData = this.globalData.get(transformedDateString);
                    if (null == worldDayData) {
                        worldDayData = new DayData(date);
                        this.globalData.set(transformedDateString, worldDayData);
                    }

                    // @ts-ignore
                    countryDayData[type] += value;
                    // @ts-ignore
                    worldDayData[type] += value;
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

    private postProcess(entries: Map<string, DayData>, countryCode: string | null = null)
    {
        let arr = Array.from(entries.values());
        arr.sort((a, b) => a.date.getTime() - b.date.getTime());
        let lastEntry: DayData;
        arr.forEach((entry: DayData) => {
            if (null != lastEntry) {
                entry.previous = lastEntry;
                lastEntry.next = entry;
            }
            lastEntry = entry;
        });
    }

    public load(countryData: CountryData): Promise<CovidData>
    {
        const urls = {
            confirmed: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
            recovered: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
            deaths: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv',
        };

        return Promise.all([d3.csv(urls.confirmed), d3.csv(urls.recovered), d3.csv(urls.deaths)])
            .then(([confirmed, recovered, deaths]) => {

                confirmed.forEach((entry: any) => this.addEntry(entry, 'confirmed'));
                recovered.forEach((entry: any) => this.addEntry(entry, 'recovered'));
                deaths.forEach((entry: any) => this.addEntry(entry, 'deaths'));

                this.data.forEach((entries, countryCode) => this.postProcess(entries, countryCode));
                this.postProcess(this.globalData);

                const dates = new Array<Date>();
                const dateStrings = new Array<string>();
                const parser = d3.timeParse('%Y-%m-%d');
                this.dateStringSet.forEach(dateString => {
                    dateStrings.push(dateString);
                    const date = parser(dateString);
                    if (null != date) {
                        dates.push(date);
                    }
                });

                return new CovidData(this.data, this.globalData, dates, dateStrings);
            });
    }
}
