require('./app.scss');
var $ = require('jquery');
require('bootstrap');
import * as d3 from 'd3';

const urls = {
    confirmed: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Confirmed.csv',
    recovered: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Recovered.csv',
    deaths: 'https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_time_series/time_series_19-covid-Deaths.csv'
};

const data = new Map();
data.set('World', new Map());

const dateParse = d3.timeParse('%m/%d/%y');
const dateFormat = d3.timeFormat('%Y-%m-%d');
const growthDeathRateHeight = 150;
const plotMargin = {top: 10, right: 1, bottom: 30, left: 60};
const country = 'World';
let xScale = null;

function deathRate(d) {
    if (d.deaths + d.recovered === 0) {
        return 0;
    }
    return d.deaths / (d.deaths + d.recovered);
}

function pending(d) {
    return d.confirmed - d.deaths - d.recovered;
}

function addEntry(data, entry, type) {
    const country = entry['Country/Region'];
    delete entry['Country/Region'];
    delete entry['Province/State'];
    delete entry['Lat'];
    delete entry['Long'];

    let countryMap = data.get(country);
    if (null == countryMap) {
        countryMap = new Map();
        data.set(country, countryMap);
    }

    let worldMap = data.get('World');
    if (null == worldMap) {
        worldMap = new Map();
        data.set(country, worldMap);
    }

    for (let dateString in entry) {
        if (entry.hasOwnProperty(dateString)) {
            const date = dateParse(dateString);
            const transformedDateString = dateFormat(date);
            const value = +entry[dateString];

            let countryDayData = countryMap.get(transformedDateString);
            if (null == countryDayData) {
                countryDayData = {date: date, confirmed: 0, recovered: 0, deaths: 0, growthRate: 0};
                countryMap.set(transformedDateString, countryDayData);
            }

            let worldDayData = worldMap.get(transformedDateString);
            if (null == worldDayData) {
                worldDayData = {date: date, confirmed: 0, recovered: 0, deaths: 0, growthRate: 0};
                worldMap.set(transformedDateString, worldDayData);
            }

            countryDayData[type] += value;
            worldDayData[type] += value;

            // console.log(dateString, date, dateFormat(date), entry[dateString]);
        }
    }
    // console.log(country, type, entry);
}

function drawPlotMain(entries) {
    let plotContainer = d3.select('#plot-main');

    const totalWidth = plotContainer.node().getBoundingClientRect().width;
    const containerHeight = plotContainer.node().getBoundingClientRect().height;
    const width = totalWidth - plotMargin.left - plotMargin.right;
    let height = 150;
    if (containerHeight < 150) {
        height = 150 - plotMargin.top - plotMargin.bottom;
    } else {
        height = containerHeight - (2 * growthDeathRateHeight) - plotMargin.top - plotMargin.bottom;
    }

    let svg = plotContainer
        .append("svg")
        .attr("width", width + plotMargin.left + plotMargin.right)
        .attr("height", height + plotMargin.top + plotMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + plotMargin.left + "," + plotMargin.top + ")");


    xScale = d3.scaleTime()
        .domain(d3.extent(entries, d => d.date))
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // Add Y axis
    var y = d3
        .scaleLinear()
        // .scaleSymlog().constant(1000)
        .domain([0, d3.max(entries, d => d.confirmed)])
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.selectAll(".tick line").clone() // grid lines
            .attr("stroke-opacity", 0.05)
            .attr("x2", width));

    // Add the line
    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#dedede")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.date))
            .y(d => y(d.confirmed))
        );

    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#80ff80")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.date))
            .y(d => y(d.recovered))
        );

    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#ff8080")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.date))
            .y(d => y(d.deaths))
        );

    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#0080ff")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.date))
            .y(d => y(pending(d)))
        );
}

function drawPlotGrowthRate(entries) {
    let plotContainer = d3.select('#plot-growth-rate');

    const totalWidth = plotContainer.node().getBoundingClientRect().width;
    // const totalHeight = plotContainer.node().getBoundingClientRect().height;
    const totalHeight = growthDeathRateHeight;
    const width = totalWidth - plotMargin.left - plotMargin.right;
    const height = totalHeight - plotMargin.top - plotMargin.bottom;

    let svg = plotContainer
        .append("svg")
        .attr("width", width + plotMargin.left + plotMargin.right)
        .attr("height", height + plotMargin.top + plotMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + plotMargin.left + "," + plotMargin.top + ")");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain(d3.extent(entries, d => d.growthRate))
        .range([height, 0]);

    svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.selectAll(".tick line").clone() // grid lines
            .attr("stroke-opacity", 0.05)
            .attr("x2", width));

    svg.append("g").append("line")
        .attr("transform", "translate(0," + y(0) + ")")
        .attr("x1", 0)
        .attr("x2", width)
        .attr("y1", 0)
        .attr("y2", 0)
        .attr("fill", "none")
        .attr("stroke", "#bfbfbf")
        .attr('stroke-dasharray', 5)
        .attr("stroke-width", 1);

    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#0080ff")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.date))
            .y(d => y(d.growthRate))
        );
}

function drawPlotDeathRate(entries) {
    let plotContainer = d3.select('#plot-death-rate');

    const totalWidth = plotContainer.node().getBoundingClientRect().width;
    // const totalHeight = plotContainer.node().getBoundingClientRect().height;
    const totalHeight = growthDeathRateHeight;
    const width = totalWidth - plotMargin.left - plotMargin.right;
    const height = totalHeight - plotMargin.top - plotMargin.bottom;

    let svg = plotContainer
        .append("svg")
        .attr("width", width + plotMargin.left + plotMargin.right)
        .attr("height", height + plotMargin.top + plotMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + plotMargin.left + "," + plotMargin.top + ")");


    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, d3.max(entries, deathRate)])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.selectAll(".tick line").clone() // grid lines
            .attr("stroke-opacity", 0.05)
            .attr("x2", width));

    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#0080ff")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line()
            .x(d => xScale(d.date))
            .y(d => y(deathRate(d)))
        );
}

function drawInfo(entry) {
    d3.select('#info-num-confirmed').html(d3.format(",")(entry.confirmed));
    d3.select('#info-num-recovered').html(d3.format(",")(entry.recovered));
    d3.select('#info-num-deaths').html(d3.format(",")(entry.deaths));
    d3.select('#info-num-pending').html(d3.format(",")(pending(entry)));
    d3.select('#info-death-rate').html(d3.format(".2%")(deathRate(entry)));
}

function selectCountry(country) {
    let countryMap = data.get(country);
    if (null == countryMap) {
        throw new Error('Could not find country');
    }
    let entries = Array.from(countryMap.values());

    let lastEntry = entries[entries.length - 1];
    drawInfo(lastEntry);

    d3.select('#heading').html(country);

    d3.select('#plot-main').selectAll('*').remove();
    d3.select('#plot-growth-rate').selectAll('*').remove();
    d3.select('#plot-death-rate').selectAll('*').remove();

    drawPlotMain(entries);
    drawPlotGrowthRate(entries);
    drawPlotDeathRate(entries);
}

Promise.all([d3.csv(urls.confirmed), d3.csv(urls.recovered), d3.csv(urls.deaths)])
    .then(([confirmed, recovered, deaths]) => {
            confirmed.forEach(entry => addEntry(data, entry, 'confirmed'));
            recovered.forEach(entry => addEntry(data, entry, 'recovered'));
            deaths.forEach(entry => addEntry(data, entry, 'deaths'));

            data.forEach(entries => {
                let lastValue = null;
                entries.forEach(entry => {
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
            countries.unshift('World');

            d3.select('.country-select .row')
                .selectAll("div")
                .data(countries)
                .enter()
                .append("div")
                .classed("col-md-4 col-lg-3", true)
                .append("a")
                .attr('href', '#')
                .classed("dropdown-item", true)
                .on('click', selectCountry)
                .html(d => d);

            selectCountry(country);
        }
    );

