import * as d3 from 'd3';
import {DayData} from "./day-data";
import {CountryData} from "./country-data";

export const WORLD_ABBR = 'WORLD';

export function loadCovidData(countryData: CountryData): Promise<{ countries: string[], data: Map<string, Map<string, DayData>> }>
{
    const dateParse = d3.timeParse('%m/%d/%y');
    const dateFormat = d3.timeFormat('%Y-%m-%d');
    const data = new Map<string, Map<string, DayData>>();
    data.set(WORLD_ABBR, new Map<string, DayData>());

    function addEntry(entry: any, type: string)
    {
        const countryAbbreviation = countryData.getCountryCode(entry['Country/Region']);

        delete entry['Country/Region'];
        delete entry['Province/State'];
        delete entry['Lat'];
        delete entry['Long'];

        let countryMap = data.get(countryAbbreviation);
        if (null == countryMap) {
            countryMap = new Map<string, DayData>();
            data.set(countryAbbreviation, countryMap);
        }

        let worldMap = data.get(WORLD_ABBR);
        if (null == worldMap) throw 'World Map not defined';

        for (let dateString in entry) {
            if (entry.hasOwnProperty(dateString)) {
                const date = dateParse(dateString);
                if (null == date) throw 'Date could not be parsed';
                const transformedDateString = dateFormat(date);
                const value = +entry[dateString];

                let countryDayData = countryMap.get(transformedDateString);
                if (null == countryDayData) {
                    countryDayData = new DayData(date);
                    countryMap.set(transformedDateString, countryDayData);
                }

                let worldDayData = worldMap.get(transformedDateString);
                if (null == worldDayData) {
                    worldDayData = new DayData(date);
                    worldMap.set(transformedDateString, worldDayData);
                }

                // @ts-ignore
                countryDayData[type] += value;
                // @ts-ignore
                worldDayData[type] += value;
            }
        }
    }

    const urls = {
        confirmed: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
        recovered: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
        deaths: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv',
    };

    return Promise.all([d3.csv(urls.confirmed), d3.csv(urls.recovered), d3.csv(urls.deaths)])
        .then(([confirmed, recovered, deaths]) => {

            confirmed.forEach((entry: any) => addEntry(entry, 'confirmed'));
            recovered.forEach((entry: any) => addEntry(entry, 'recovered'));
            deaths.forEach((entry: any) => addEntry(entry, 'deaths'));

            data.forEach(entries => {
                let lastValue: any = null;
                entries.forEach((entry: any) => {
                    let numPending = entry.confirmed - entry.recovered - entry.deaths;
                    if (null != lastValue && 0 !== lastValue) {
                        // entry.growthRate = numPending / lastValue;
                        entry.growthRate = (numPending - lastValue) / lastValue;
                    }
                    lastValue = numPending;
                });
            });

            const countries = Array.from(data.keys());
            countries.shift();
            countries.sort();
            countries.unshift(WORLD_ABBR);

            return {data, countries}
        });
}
