import {CountryData} from "./country-data";
import {DayDatum} from "./day-datum";
import * as d3_time_format from "d3-time-format"
import * as d3_fetch from "d3-fetch"
import {Location} from "./location";

export class CovidData
{
    constructor(
        private locationNameLocationMap: Map<string, Location>,
        private locationNameDayDataMap: Map<string, DayDatum[]>,
        private countryMap: Map<string, Map<string, DayDatum>>,
        private globalMap: Map<string, DayDatum>,
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
        return Array.from(this.locationNameLocationMap.values());
    }

    public getLocationDayData(location: Location): DayDatum[] | undefined
    {
        return this.locationNameDayDataMap.get(location.getName());
    }

    public fetchLocationDayData(location: Location): DayDatum[]
    {
        const dayData = this.getLocationDayData(location);
        if (null == dayData) throw 'Day data not found for ' + location.getName();
        return dayData;
    }

    public getDayData(countryCode: string): DayDatum[]
    {
        const countryData = this.countryMap.get(countryCode);
        if (null == countryData) throw 'No data found for ' + countryCode;
        const arr = Array.from(countryData.values());
        arr.sort((a, b) => a.date.getTime() - b.date.getTime());

        return arr;
    }

    public getDayDataByDateString(countryCode: string, dateString: string): DayDatum | null
    {
        const countryData = this.countryMap.get(countryCode);
        if (null == countryData) throw 'No data found for ' + countryCode;

        const dayData = countryData.get(dateString);
        if (null == dayData) return null;

        return dayData;
    }

    public getGlobalDayData(): DayDatum[]
    {
        const arr = Array.from(this.globalMap.values());
        arr.sort((a, b) => a.date.getTime() - b.date.getTime());

        return arr;
    }

    public getLastDayData(countryCode: string): DayDatum
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
    private locationNameLocationMap = new Map<string, Location>();
    private locationNameDayDataMap = new Map<string, Map<string, DayDatum>>();
    private countryMap = new Map<string, Map<string, DayDatum>>();
    private globalMap = new Map<string, DayDatum>();
    private dateStringSet = new Set<string>();
    private dateParseLongYear = d3_time_format.timeParse('%m/%d/%Y');
    private dateParseShortYear = d3_time_format.timeParse('%m/%d/%y');
    private dateFormat = d3_time_format.timeFormat('%Y-%m-%d');
    private countryNameToCountryCodeMap = new Map<string, string>();

    constructor(private countryData: CountryData)
    {
        this.countryNameToCountryCodeMap.set('Bahamas, The', 'BS');
        this.countryNameToCountryCodeMap.set('Cabo Verde', 'CV');
        this.countryNameToCountryCodeMap.set('China', 'CN');
        this.countryNameToCountryCodeMap.set('Congo (Brazzaville)', 'CG');
        this.countryNameToCountryCodeMap.set('Congo (Kinshasa)', 'CD');
        this.countryNameToCountryCodeMap.set('Cote d\'Ivoire', 'CI');
        this.countryNameToCountryCodeMap.set('Cyprus', 'CY');
        this.countryNameToCountryCodeMap.set('Czechia', 'CZ');
        this.countryNameToCountryCodeMap.set('Gambia, The', 'GM');
        this.countryNameToCountryCodeMap.set('Holy See', 'VA');
        this.countryNameToCountryCodeMap.set('Korea, South', 'KR');
        this.countryNameToCountryCodeMap.set('Kosovo', 'RS');
        this.countryNameToCountryCodeMap.set('Martinique', 'FR');
        this.countryNameToCountryCodeMap.set('Netherlands', 'NL');
        // this.countryNameToCountryCodeMap.set('Taiwan*', 'TW');
        this.countryNameToCountryCodeMap.set('Taiwan*', 'CN');
        this.countryNameToCountryCodeMap.set('US', 'US');
        this.countryNameToCountryCodeMap.set('Burma', 'MM');
        this.countryNameToCountryCodeMap.set('Timor-Leste', 'TL');
        this.countryNameToCountryCodeMap.set('West Bank and Gaza', 'IL');

        /* Entities */
        this.countryNameToCountryCodeMap.set('Diamond Princess', 'JP');
        this.countryNameToCountryCodeMap.set('MS Zaandam', 'CL');
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

        let location = new Location(
            country,
            entry['Province/State'],
            +entry['Lat'],
            +entry['Long']
        );
        if (!this.locationNameLocationMap.has(location.getName())) {
            this.locationNameLocationMap.set(location.getName(), location);
        }

        delete entry['Country/Region'];
        delete entry['Province/State'];
        delete entry['Lat'];
        delete entry['Long'];

        let countryMap = this.countryMap.get(countryCode);
        if (null == countryMap) {
            countryMap = new Map<string, DayDatum>();
            this.countryMap.set(countryCode, countryMap);
        }

        let locationDayData = this.locationNameDayDataMap.get(location.getName());
        if (null == locationDayData) {
            locationDayData = new Map<string, DayDatum>();
            this.locationNameDayDataMap.set(location.getName(), locationDayData);
        }

        for (let dateString in entry) {
            if (entry.hasOwnProperty(dateString)) {
                const value = +entry[dateString];
                if (value > 0) {
                    let date = this.dateParseShortYear(dateString);
                    if (null == date) {
                        console.warn('Date could not be parsed: ' + dateString);
                        date = this.dateParseLongYear(dateString);
                    }
                    if (null == date) throw 'Date could not be parsed: ' + dateString;
                    const transformedDateString = this.dateFormat(date);
                    this.dateStringSet.add(transformedDateString);

                    let countryDayData = countryMap.get(transformedDateString);
                    if (null == countryDayData) {
                        countryDayData = new DayDatum(date);
                        countryMap.set(transformedDateString, countryDayData);
                    }

                    let globalDayData = this.globalMap.get(transformedDateString);
                    if (null == globalDayData) {
                        globalDayData = new DayDatum(date);
                        this.globalMap.set(transformedDateString, globalDayData);
                    }

                    let locationDayDatum = locationDayData.get(transformedDateString);
                    if (null == locationDayDatum) {
                        locationDayDatum = new DayDatum(date);
                        locationDayData.set(transformedDateString, locationDayDatum);
                    }

                    // @ts-ignore
                    countryDayData[type] += value;
                    // @ts-ignore
                    globalDayData[type] += value;
                    // @ts-ignore
                    locationDayDatum[type] += value;
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

    private postProcess(entries: Map<string, DayDatum>)
    {
        this.linkEntries(Array.from(entries.values()));
    }

    private linkEntries(arr: DayDatum[])
    {
        arr.sort((a, b) => a.date.getTime() - b.date.getTime());
        let lastEntry: DayDatum;
        arr.forEach((entry: DayDatum) => {
            if (null != lastEntry) {
                entry.previous = lastEntry;
                lastEntry.next = entry;
                const growth = entry.getGrowth();
                if (null != growth) {
                    entry.pending = lastEntry.pending + growth;
                    const dayDatum14 = entry.getPrevious(14);
                    if (null != dayDatum14 && null != dayDatum14.getGrowth()) {
                        entry.pending -= dayDatum14.getGrowth() as number;
                    }
                }
            } else {
                entry.pending = entry.confirmed;
            }
            lastEntry = entry;
        });

        return arr;
    }

    public load(): Promise<CovidData>
    {
        // const urls = {
        //     confirmed: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
        //     recovered: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
        //     deaths: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv',
        // };

        const urls = {
            confirmed: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv',
            deaths: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv',
        };

        return Promise.all([d3_fetch.csv(urls.confirmed), /*d3_fetch.csv(urls.recovered), */d3_fetch.csv(urls.deaths)])
            .then(([confirmed, /*recovered, */deaths]) => {

                confirmed.forEach((entry: any) => this.addEntry(entry, 'confirmed'));
                /*recovered.forEach((entry: any) => this.addEntry(entry, 'recovered'));*/
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

                const locationNameDayDataArrayMap = new Map<string, DayDatum[]>();
                this.locationNameDayDataMap.forEach((value, key) => {
                    locationNameDayDataArrayMap.set(key, this.linkEntries(Array.from(value.values()) as DayDatum[]))
                });

                return new CovidData(this.locationNameLocationMap, locationNameDayDataArrayMap, this.countryMap, this.globalMap, dates, dateStrings);
            });
    }
}
