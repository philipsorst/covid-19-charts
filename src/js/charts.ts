import {CountryData} from "./country-data";
import * as d3 from 'd3';
import './load.coviddata';
import {Utils} from "./utils";
import {DayData} from "./day-data";
import {CovidData} from "./covid-data";
import {Country} from "./country";
import {DeathRateChart} from "./chart/death-rate-chart";
import {Margin} from "./chart/margin";
import {GrowthRateChart} from "./chart/growth-rate-chart";
import {MainChart} from "./chart/main-chart";
import {GrowthChart} from "./chart/growth-chart";

require('../scss/charts.scss');
require('bootstrap');

const growthDeathRateHeight = 150;
const plotMargin = new Margin(5, 1, 30, 60);
let xScale: d3.ScaleTime<number, number>;
let data: CovidData;
let countryData: CountryData;
const COUNTRY_CODE_GLOBAL = 'GLOBAL';
let currentCountry: Country;

let mainChart: MainChart;
let growthRateChart: GrowthRateChart;
let deathRateChart: DeathRateChart;
let growthChart: GrowthChart;

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

    mainChart.update(entries);
    growthRateChart.update(entries);
    deathRateChart.update(entries);
    growthChart.update(entries);
}

function createMainChart()
{
    let parentSelection = d3.select('#plot-main');
    parentSelection.selectAll('*').remove();
    const boundingClientRect = Utils.getBoundingClientRect(parentSelection);
    mainChart = new MainChart(
        parentSelection,
        boundingClientRect.width,
        boundingClientRect.height < 150 ? 150 : boundingClientRect.height,
        plotMargin,
        d3.extent(data.getGlobalDayData(), d => d.date) as [Date, Date],
        [0, d3.max(data.getGlobalDayData(), d => d.confirmed) as number]
    );
}

function createGrowthRateChart()
{
    let parentSelection = d3.select('#plot-growth-rate');
    parentSelection.selectAll('*').remove();
    const boundingClientRect = Utils.getBoundingClientRect(parentSelection);
    // const totalHeight = plotContainer.node().getBoundingClientRect().height;
    growthRateChart = new GrowthRateChart(parentSelection, boundingClientRect.width, growthDeathRateHeight, plotMargin,
        d3.extent(data.getGlobalDayData(), d => d.date) as [Date, Date],
        [0, d3.max(data.getGlobalDayData(), d => d.getConfirmedGrowthRate()) as number]);
}

function createDeathRateChart()
{
    const parentSelection = d3.select('#plot-death-rate');
    parentSelection.selectAll('*').remove();
    const boundingClientRect = Utils.getBoundingClientRect(parentSelection);
    // const totalHeight = plotContainer.node().getBoundingClientRect().height;
    deathRateChart = new DeathRateChart(parentSelection, boundingClientRect.width, growthDeathRateHeight, plotMargin,
        d3.extent(data.getGlobalDayData(), d => d.date) as [Date, Date],
        [0, d3.max(data.getGlobalDayData(), d => d.getDeathRate()) as number]);
}

function createGrowthChart()
{
    const parentSelection = d3.select('#plot-growth');
    parentSelection.selectAll('*').remove();
    const boundingClientRect = Utils.getBoundingClientRect(parentSelection);
    // const totalHeight = plotContainer.node().getBoundingClientRect().height;
    growthChart = new GrowthChart(parentSelection, boundingClientRect.width, growthDeathRateHeight, plotMargin,
        d3.extent(data.getGlobalDayData(), d => d.date) as [Date, Date]);
}

CountryData.load().then(resultCountryData => {
    countryData = resultCountryData;
    CovidData.load(countryData)
        .then(result => {
            data = result;

            createGrowthChart();
            createDeathRateChart();
            createGrowthRateChart();
            createMainChart();

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

d3.select(window).on('resize', debounce(() => {
    createGrowthChart();
    createGrowthRateChart();
    createDeathRateChart();
    createMainChart();
    selectCountry(currentCountry);
}, 250));
