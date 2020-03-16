import {CountryData} from "./country-data";
import * as d3 from 'd3';
import './load.coviddata';
import {Utils} from "./utils";
import {DayData} from "./day-data";
import {CovidData} from "./covid-data";
import {Country} from "./country";

require('../scss/charts.scss');
require('bootstrap');

const growthDeathRateHeight = 150;
const plotMargin = {top: 5, right: 1, bottom: 30, left: 60};
let xScale: d3.ScaleTime<number, number>;
let data: CovidData;
let countryData: CountryData;
const COUNTRY_CODE_GLOBAL = 'GLOBAL';
let currentCountry: Country;

function drawPlotMain(entries: DayData[])
{
    let plotContainer = d3.select('#plot-main');
    const boundingClientRect = Utils.getBoundingClientRect(plotContainer);

    const width = boundingClientRect.width - plotMargin.left - plotMargin.right;
    let height = 150;
    if (boundingClientRect.height < 150) {
        height = 150 - plotMargin.top - plotMargin.bottom;
    } else {
        height = boundingClientRect.height - (2 * growthDeathRateHeight) - plotMargin.top - plotMargin.bottom;
    }

    let svg = plotContainer
        .append("svg")
        .attr("width", width + plotMargin.left + plotMargin.right)
        .attr("height", height + plotMargin.top + plotMargin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + plotMargin.left + "," + plotMargin.top + ")");


    xScale = d3.scaleTime()
        .domain(d3.extent(entries, d => d.date) as [Date, Date])
        .range([0, width]);
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale));

    // Add Y axis
    const y = d3
        .scaleLinear()
        // .scaleSymlog().constant(1000)
        .domain([0, d3.max(entries, d => d.confirmed) as number])
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
        .attr("stroke", "#808080")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<DayData>()
            .x(d => xScale(d.date))
            .y(d => y(d.confirmed))
        );

    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#388E3C")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<DayData>()
            .x(d => xScale(d.date))
            .y(d => y(d.recovered))
        );

    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#D32F2F")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<DayData>()
            .x(d => xScale(d.date))
            .y(d => y(d.deaths))
        );

    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#1976D2")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<DayData>()
            .x(d => xScale(d.date))
            .y(d => y(d.getPending()))
        );
}

function drawPlotGrowthRate(entries: DayData[])
{
    let plotContainer = d3.select('#plot-growth-rate');
    const boundingClientRect = Utils.getBoundingClientRect(plotContainer);

    // const totalHeight = plotContainer.node().getBoundingClientRect().height;
    const totalHeight = growthDeathRateHeight;
    const width = boundingClientRect.width - plotMargin.left - plotMargin.right;
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
        .domain(d3.extent(entries, d => d.growthRate) as [number, number])
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
        .attr("stroke", "#808080")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<DayData>()
            .x(d => xScale(d.date))
            .y(d => y(d.growthRate))
        );
}

function drawPlotDeathRate(entries: DayData[])
{
    let plotContainer = d3.select('#plot-death-rate');
    const boundingClientRect = Utils.getBoundingClientRect(plotContainer);

    // const totalHeight = plotContainer.node().getBoundingClientRect().height;
    const totalHeight = growthDeathRateHeight;
    const width = boundingClientRect.width - plotMargin.left - plotMargin.right;
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
        .domain([0, d3.max(entries, d => d.getDeathRate()) as number])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y))
        .call(g => g.selectAll(".tick line").clone() // grid lines
            .attr("stroke-opacity", 0.05)
            .attr("x2", width));

    svg.append("path")
        .datum(entries)
        .attr("fill", "none")
        .attr("stroke", "#808080")
        .attr("stroke-width", 1.5)
        .attr("d", d3.line<DayData>()
            .x(d => xScale(d.date))
            .y(d => y(d.getDeathRate()))
        );
}

function drawInfo(country: Country, entry: DayData)
{
    let population = countryData.getPopulation(country.code);
    d3.select('#info-population').classed('d-none', null == population);
    if (null != population) {
        d3.select('#info-num-population').html(d3.format(".2s")(population));
    }
    d3.select('#info-num-confirmed').html(d3.format(",")(entry.confirmed));
    d3.select('#info-num-recovered').html(d3.format(",")(entry.recovered));
    d3.select('#info-num-deaths').html(d3.format(",")(entry.deaths));
    d3.select('#info-num-pending').html(d3.format(",")(entry.getPending()));
    d3.select('#info-death-rate').html(d3.format(".2%")(entry.getDeathRate()));
}

function selectCountry(country: Country)
{
    let entries;
    if (COUNTRY_CODE_GLOBAL === country.code) {
        entries = data.getGlobalDayData();
    } else {
        entries = data.getDayData(country.code);
    }
    currentCountry = country;

    let lastEntry = entries[entries.length - 1];
    drawInfo(country, lastEntry);

    d3.select('#heading').html(country.name);

    d3.select('#plot-main').selectAll('*').remove();
    d3.select('#plot-growth-rate').selectAll('*').remove();
    d3.select('#plot-death-rate').selectAll('*').remove();

    drawPlotMain(entries);
    drawPlotGrowthRate(entries);
    drawPlotDeathRate(entries);
}

CountryData.load().then(resultCountryData => {
    countryData = resultCountryData;
    CovidData.load(countryData)
        .then(result => {
            data = result;

            const countries = new Array<Country>();
            data.getCountryCodes().forEach(countryCode => {
                countries.push(new Country(countryCode, countryData.getName(countryCode)));
            });
            countries.sort((a, b) => a.name.localeCompare(b.name));
            const global = new Country(COUNTRY_CODE_GLOBAL, 'Global');
            countries.unshift(global);

            d3.select('.country-select .row')
                .selectAll('div')
                .data(countries)
                .enter()
                .append('div')
                .classed('col-md-4 col-lg-3', true)
                .append('a')
                .attr('href', '#')
                .classed('dropdown-item', true)
                .on('click', selectCountry)
                .html(d => d.name);

            selectCountry(global);
            }
        );
});

function debounce(timerHandler: TimerHandler, timeout: number)
{
    let timeoutID = -1;
    return () => {
        if (timeoutID > -1) {
            window.clearTimeout(timeoutID);
        }
        timeoutID = window.setTimeout(timerHandler, timeout);
    }
}

d3.select(window).on('resize', debounce(() => selectCountry(currentCountry), 250));
