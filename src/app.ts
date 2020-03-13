// require('./app.scss');
// import * as d3 from 'd3';
//
// interface CountryData
// {
//     province: string,
//     country: string,
//     lat: number,
//     long: number,
//     entries: Map<string, DayData>
// }
//
// class DayData
// {
//     constructor(public date: Date)
//     {
//     }
//
//     public confirmed: number = 0;
//     public recovered: number = 0;
//     public deaths: number = 0;
//     public growthRate: number = 0;
// }
//
// const urls = {
//     confirmed: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
//     recovered: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
//     deaths: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'
// };
//
// const data: Map<string, Map<string, DayData>> = new Map<string, Map<string, DayData>>();
// data.set('World', new Map<string, DayData>());
//
// const dateParse = d3.timeParse('%m/%d/%y');
// const dateFormat = d3.timeFormat('%Y-%m-%d');
//
// function addEntry(data: Map<string, Map<string, DayData>>, entry: any, type: string)
// {
//     const country = entry['Country/Region'];
//     delete entry['Country/Region'];
//     delete entry['Province/State'];
//     delete entry['Lat'];
//     delete entry['Long'];
//
//     let countryMap = data.get(country);
//     if (null == countryMap) {
//         countryMap = new Map<string, DayData>();
//         data.set(country, countryMap);
//     }
//
//     let worldMap = data.get('World');
//     if (null == worldMap) {
//         worldMap = new Map<string, DayData>();
//         data.set(country, worldMap);
//     }
//
//     for (let dateString in entry) {
//         if (entry.hasOwnProperty(dateString)) {
//             const date = dateParse(dateString) as Date;
//             const transformedDateString = dateFormat(date);
//             const value = +entry[dateString];
//
//             let countryDayData = countryMap.get(transformedDateString);
//             if (null == countryDayData) {
//                 countryDayData = new DayData(date);
//                 countryMap.set(transformedDateString, countryDayData);
//             }
//
//             let worldDayData = worldMap.get(transformedDateString);
//             if (null == worldDayData) {
//                 worldDayData = new DayData(date);
//                 worldMap.set(transformedDateString, worldDayData);
//             }
//
//             // @ts-ignore
//             countryDayData[type] += value;
//             // @ts-ignore
//             worldDayData[type] += value;
//
//             // console.log(dateString, date, dateFormat(date), entry[dateString]);
//         }
//     }
//     // console.log(country, type, entry);
// }
//
// function draw(data: Map<string, Map<string, DayData>>)
// {
//     let countryMap = data.get('Germany');
//     if (null == countryMap) {
//         throw new Error('Could not find country');
//     }
//     let countryData: DayData[] = Array.from(countryMap.values());
//
//     const margin = {top: 10, right: 30, bottom: 30, left: 60},
//         width = 460 - margin.left - margin.right,
//         height = 400 - margin.top - margin.bottom;
//
//
//     let svg = d3.select('#plot-main')
//         .append("svg")
//         .attr("width", width + margin.left + margin.right)
//         .attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         .attr("transform",
//             "translate(" + margin.left + "," + margin.top + ")");
//
//
//     // Add X axis --> it is a date format
//     let x = d3.scaleTime()
//         .domain(d3.extent(countryData, d => d.date))
//         .range([0, width]);
//     svg.append("g")
//         .attr("transform", "translate(0," + height + ")")
//         .call(d3.axisBottom(x));
//
//     // Add Y axis
//     var y = d3.scaleLinear()
//         .domain([0, d3.max(countryData, d => d.confirmed)])
//         .range([height, 0]);
//     svg.append("g")
//         .call(d3.axisLeft(y));
//
//     // Add the line
//     svg.append("path")
//         .datum(countryData)
//         .attr("fill", "none")
//         .attr("stroke", "steelblue")
//         .attr("stroke-width", 1.5)
//         .attr("d", d3.line()
//             .x(d => d.date)
//             .y(d => d.confirmed)
//         )
// }
//
// Promise.all([d3.csv(urls.confirmed), d3.csv(urls.recovered), d3.csv(urls.deaths)])
//     .then(([confirmed, recovered, deaths]) => {
//         confirmed.forEach(entry => addEntry(data, entry, 'confirmed'));
//         recovered.forEach(entry => addEntry(data, entry, 'recovered'));
//         deaths.forEach(entry => addEntry(data, entry, 'deaths'));
//
//         data.forEach(entries => {
//             let lastValue: number | null = null;
//             entries.forEach(entry => {
//                 let numPending = entry.confirmed - entry.recovered - entry.deaths;
//                 if (null != lastValue && 0 !== lastValue) {
//                     entry.growthRate = numPending / lastValue;
//                 }
//                 lastValue = numPending;
//             });
//         });
//
//         draw(data);
//     });
//
