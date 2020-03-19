import {CountryData} from "./country-data";
import {DayData} from "./day-data";
import * as d3 from "d3";

export class CovidData
{
    constructor(private data: Map<string, Map<string, DayData>>, private globalData: Map<string, DayData>, private dates: Date[], private dateStrings: string[])
    {
    }

    public static load(countryData: CountryData): Promise<CovidData>
    {
        const covidDataLoader = new CovidDataLoader();
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
        return Array.from(countryData.values());
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

    private addEntry(entry: any, type: string, countryData: CountryData)
    {
        const countryAbbreviation = countryData.getCountryCode(entry['Country/Region']);
        if (null == countryAbbreviation) {
            return;
        }

        delete entry['Country/Region'];
        delete entry['Province/State'];
        delete entry['Lat'];
        delete entry['Long'];

        let countryMap = this.data.get(countryAbbreviation);
        if (null == countryMap) {
            countryMap = new Map<string, DayData>();
            this.data.set(countryAbbreviation, countryMap);
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

    private postProcess(entries: Map<string, DayData>)
    {
        let lastEntry: DayData;
        entries.forEach((entry: DayData) => {
            entry.previous = lastEntry;
            if (null != lastEntry) {
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

                confirmed.forEach((entry: any) => this.addEntry(entry, 'confirmed', countryData));
                recovered.forEach((entry: any) => this.addEntry(entry, 'recovered', countryData));
                deaths.forEach((entry: any) => this.addEntry(entry, 'deaths', countryData));

                this.data.forEach(entries => this.postProcess(entries));
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
