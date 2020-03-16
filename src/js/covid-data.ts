import {CountryData} from "./country-data";
import {DayData} from "./day-data";
import * as d3 from "d3";

export class CovidData
{
    private data = new Map<string, Map<string, DayData>>();
    private globalData = new Map<string, DayData>();
    private dateParse = d3.timeParse('%m/%d/%y');
    private dateFormat = d3.timeFormat('%Y-%m-%d');

    private addEntry(entry: any, type: string, countryData: CountryData)
    {
        const countryAbbreviation = countryData.getCountryCode(entry['Country/Region']);

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
                const date = this.dateParse(dateString);
                if (null == date) throw 'Date could not be parsed';
                const transformedDateString = this.dateFormat(date);
                const value = +entry[dateString];

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

    private computeGrowthRate(entries: Map<string, DayData>)
    {
        let lastValue: any = null;
        entries.forEach((entry: any) => {
            let numPending = entry.confirmed - entry.recovered - entry.deaths;
            if (null != lastValue && 0 !== lastValue) {
                // entry.growthRate = numPending / lastValue;
                entry.growthRate = (numPending - lastValue) / lastValue;
            }
            lastValue = numPending;
        });
    }

    public static load(countryData: CountryData): Promise<CovidData>
    {
        const urls = {
            confirmed: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
            recovered: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
            deaths: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv',
        };

        return Promise.all([d3.csv(urls.confirmed), d3.csv(urls.recovered), d3.csv(urls.deaths)])
            .then(([confirmed, recovered, deaths]) => {

                const covidData = new CovidData();

                confirmed.forEach((entry: any) => covidData.addEntry(entry, 'confirmed', countryData));
                recovered.forEach((entry: any) => covidData.addEntry(entry, 'recovered', countryData));
                deaths.forEach((entry: any) => covidData.addEntry(entry, 'deaths', countryData));

                covidData.data.forEach(entries => covidData.computeGrowthRate(entries));
                covidData.computeGrowthRate(covidData.globalData);

                return covidData;
            });
    }

    public hasCountryCode(countryCode: string): boolean
    {
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

    public getGlobalDayData(): DayData[]
    {
        return Array.from(this.globalData.values());
    }

    public getLastDayData(countryCode: string): DayData
    {
        const allDayData = this.getDayData(countryCode);
        return allDayData[allDayData.length - 1];
    }
}
