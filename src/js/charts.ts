import {CountryData} from "./country-data";
import * as d3 from 'd3';
import './load.coviddata';
import {loadCovidData, WORLD_ABBR} from "./load.coviddata";
import {Utils} from "./utils";
import {DayData} from "./day-data";

require('../scss/charts.scss');
require('bootstrap');

const growthDeathRateHeight = 150;
const plotMargin = {top: 5, right: 1, bottom: 30, left: 60};
let currentCountry = WORLD_ABBR;
let xScale: d3.ScaleTime<number, number>;
let data: Map<string, Map<string, DayData>>;
let countryData: CountryData;

function deathRate(d: DayData)
{
    if (d.deaths + d.recovered === 0) {
        return 0;
    }
    return d.deaths / (d.deaths + d.recovered);
}

function pending(d: DayData)
{
    return d.confirmed - d.deaths - d.recovered;
}

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
            .y(d => y(pending(d)))
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
        .domain([0, d3.max(entries, deathRate) as number])
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
            .y(d => y(deathRate(d)))
        );
}

function drawInfo(countryCode: string, entry: DayData)
{
    let population = countryData.getPopulation(countryCode);
    console.log(countryCode, population);
    d3.select('#info-population').classed('d-none', null == population);
    if (null != population) {
        d3.select('#info-num-population').html(d3.format(".2s")(population));
    }
    d3.select('#info-num-confirmed').html(d3.format(",")(entry.confirmed));
    d3.select('#info-num-recovered').html(d3.format(",")(entry.recovered));
    d3.select('#info-num-deaths').html(d3.format(",")(entry.deaths));
    d3.select('#info-num-pending').html(d3.format(",")(pending(entry)));
    d3.select('#info-death-rate').html(d3.format(".2%")(deathRate(entry)));
}

function selectCountry(countryCode: string)
{
    currentCountry = countryCode;
    let countryMap = data.get(countryCode);
    if (null == countryMap) throw 'Could not find countryCode';
    let entries = Array.from(countryMap.values());

    let lastEntry = entries[entries.length - 1];
    drawInfo(countryCode, lastEntry);

    d3.select('#heading').html(countryData.getName(countryCode));

    d3.select('#plot-main').selectAll('*').remove();
    d3.select('#plot-growth-rate').selectAll('*').remove();
    d3.select('#plot-death-rate').selectAll('*').remove();

    drawPlotMain(entries);
    drawPlotGrowthRate(entries);
    drawPlotDeathRate(entries);
}

CountryData.load().then(resultCountryData => {
    countryData = resultCountryData;
    loadCovidData(countryData)
        .then(result => {
                data = result.data;
                d3.select('.country-select .row')
                    .selectAll('div')
                    .data(result.countries)
                    .enter()
                    .append('div')
                    .classed('col-md-4 col-lg-3', true)
                    .append('a')
                    .attr('href', '#')
                    .classed('dropdown-item', true)
                    .on('click', selectCountry)
                    .html(d => countryData.getName(d));

                selectCountry(currentCountry);
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
