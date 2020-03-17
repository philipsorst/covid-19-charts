import {GeometryCollection} from "topojson-specification";
import * as d3 from 'd3';
import * as TopoJsonClient from 'topojson-client';
import {CountryData} from "./country-data";
import {CovidData} from "./covid-data";
import {DayData} from "./day-data";

require('../scss/map.scss');

let container = d3.select("#map");
// const containerWidth = container.node().getBoundingClientRect().width;
const containerWidth = 1000;
const svg = container.append("svg")
    .attr('width', containerWidth)
    .attr('height', 500);
const projection = d3.geoNaturalEarth1();
console.log(projection.scale());
const path = d3.geoPath().projection(projection);
let paths;
const COLOR_UNKNOWN = '#f0f0f0';

interface MapPlot
{
    name: string,
    range: ReadonlyArray<string>,
    data: (countryCode: string, dayData: DayData, covidData: CovidData, countryData: CountryData) => number | null
}

const pendingPercentagePlot: MapPlot = {
    name: 'Pending Percentage',
    range: ['#FFEBEE', '#B71C1C'],
    data: (countryCode: string, dayData, covidData, countryData) => {
        const population = countryData.getPopulation(countryCode);
        if (null == population) {
            return null;
        }
        return dayData.getPending() / population;
    }
};

const deathRatePlot: MapPlot = {
    name: 'Death Rate',
    range: ['#FFEBEE', '#B71C1C'],
    data: (countryCode: string, dayData, covidData, countryData) => {
        return dayData.getDeathRate();
    }
};

const growthRatePlot: MapPlot = {
    name: 'Growth Rate',
    range: ['#FFEBEE', '#B71C1C'],
    data: (countryCode: string, dayData, covidData, countryData) => {
        return dayData.growthRate;
    }
};

const confirmedPlot: MapPlot = {
    name: 'Confirmed',
    range: ['#FFEBEE', '#B71C1C'],
    data: (countryCode: string, dayData, covidData, countryData) => {
        return dayData.confirmed;
    }
};

const recoveredPlot: MapPlot = {
    name: 'Recovered',
    range: ['#FFEBEE', '#80ff80'],
    data: (countryCode: string, dayData, covidData, countryData) => {
        return dayData.recovered;
    }
};

const recoveredPercentagePlot: MapPlot = {
    name: 'Recovered',
    range: ['#FFEBEE', '#80ff80'],
    data: (countryCode: string, dayData, covidData, countryData) => {
        return dayData.recovered / dayData.confirmed;
    }
};

function plotMap(
    covidData: CovidData,
    countryData: CountryData,
    features: Array<GeoJSON.Feature<GeoJSON.GeometryObject, {}>>,
    mapPlot: MapPlot)
{
    const extents = new Array<[number, number]>();
    features.forEach(feature => {
        const countryName = (feature.properties as { name: string }).name;
        const countryCode = countryData.getCountryCode(countryName);
        if (covidData.hasCountryCode(countryCode)) {
            const dayData = covidData.getDayData(countryCode);
            extents.push(d3.extent(dayData, d => mapPlot.data(countryCode, d, covidData, countryData)) as [number, number]);
        }
    });
    const extent = [d3.min(extents, d => d[0]) as number, d3.max(extents, d => d[1]) as number];

    const color = d3.scaleLinear<string, string>().domain(extent).range(mapPlot.range);
    paths = svg
        .selectAll('path')
        .data(features)
        .transition()
        .duration(0)
        .attr('fill', d => {
            const countryName = (d.properties as { name: string }).name;
            const countryCode = countryData.getCountryCode(countryName);
            if (!covidData.hasCountryCode(countryCode)) {
                return COLOR_UNKNOWN;
            }

            const data = mapPlot.data(countryCode, covidData.getLastDayData(countryCode), covidData, countryData);
            if (null == data) {
                return COLOR_UNKNOWN;
            }

            return color(data);
        });

}

CountryData.load().then((countryData) => {
    CovidData.load(countryData).then(covidData => {
        d3.json('./build/world-atlas/countries-110m.json').then(worldData => {

            d3.select('#dateSlider').on('change', function () {
                // @ts-ignore
                console.log(this.value)
            });

            let features = TopoJsonClient.feature(worldData, worldData.objects.countries as GeometryCollection).features;
            svg
                .selectAll('path')
                .data(features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('stroke', '#808080')
                .attr('fill', '#FFEBEE');

            plotMap(covidData, countryData, features, pendingPercentagePlot);
        });
    });
});
