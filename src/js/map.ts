import {GeometryCollection} from "topojson-specification";
import * as d3 from 'd3';
import * as TopoJsonClient from 'topojson-client';
import {CountryData} from "./country-data";
import {CovidData} from "./covid-data";
import {DayDatum} from "./day-datum";
import {MapCountryCodeMapper} from "./map/map-country-code-mapper";

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
let countryCodeMapper: MapCountryCodeMapper;

interface MapPlot
{
    name: string,
    range: ReadonlyArray<string>,
    data: (countryCode: string, dayData: DayDatum | null, covidData: CovidData, countryData: CountryData) => number | null
    scale: d3.ScaleContinuousNumeric<string, string>
}

const pendingPercentagePlot: MapPlot = {
    name: 'Pending Percentage',
    range: ['#FFEBEE', '#B71C1C'],
    scale: d3.scaleLog<string, string>(),
    data: (countryCode: string, dayData, covidData, countryData) => {
        let country = countryData.getCountry(countryCode);
        if (null == country || null == dayData || 0 === dayData.getPending()) {
            return null;
        }
        return dayData.getPending() / country.population;
    }
};

const deathRatePlot: MapPlot = {
    name: 'Death Rate',
    range: ['#FFEBEE', '#B71C1C'],
    scale: d3.scaleLinear<string, string>(),
    data: (countryCode: string, dayData, covidData, countryData) => {
        if (null == dayData) {
            return null;
        }
        return dayData.getDeathRate();
    }
};

const growthRatePlot: MapPlot = {
    name: 'Growth Rate',
    range: ['#FFEBEE', '#B71C1C'],
    scale: d3.scaleLinear<string, string>(),
    data: (countryCode: string, dayData, covidData, countryData) => {
        if (null == dayData) {
            return null;
        }
        return dayData.getPendingGrowthRate();
    }
};

const growthChangeRagePlot: MapPlot = {
    name: 'Growth Rate',
    range: ['#FFEBEE', '#B71C1C'],
    scale: d3.scaleLinear<string, string>(),
    data: (countryCode: string, dayData, covidData, countryData) => {
        if (null == dayData) {
            return null;
        }
        return dayData.getGrowthChangeRate();
    }
};


const confirmedPlot: MapPlot = {
    name: 'Confirmed',
    range: ['#FFEBEE', '#B71C1C'],
    scale: d3.scaleLinear<string, string>(),
    data: (countryCode: string, dayData, covidData, countryData) => {
        if (null == dayData || 0 === dayData.confirmed) {
            return null;
        }
        return dayData.confirmed;
    }
};

const recoveredPlot: MapPlot = {
    name: 'Recovered',
    range: ['#FFEBEE', '#80ff80'],
    scale: d3.scaleLinear<string, string>(),
    data: (countryCode: string, dayData, covidData, countryData) => {
        if (null == dayData) {
            return null;
        }
        return dayData.getRecovered();
    }
};

const recoveredPercentagePlot: MapPlot = {
    name: 'Recovered',
    range: ['#FFEBEE', '#80ff80'],
    scale: d3.scaleLinear<string, string>(),
    data: (countryCode: string, dayData, covidData, countryData) => {
        if (null == dayData) {
            return null;
        }
        return dayData.getRecovered() / dayData.confirmed;
    }
};

function plotMap(
    covidData: CovidData,
    countryData: CountryData,
    features: Array<GeoJSON.Feature<GeoJSON.GeometryObject, {}>>,
    mapPlot: MapPlot,
    dateString: string)
{
    const extents = new Array<[number, number]>();
    features.forEach(feature => {
        const countryName = (feature.properties as { name: string }).name;
        const countryCode = countryCodeMapper.getCode(countryName);
        if (covidData.hasCountryCode(countryCode) && null != countryCode) {
            const dayData = covidData.getDayData(countryCode);
            extents.push(d3.extent(dayData, d => mapPlot.data(countryCode, d, covidData, countryData)) as [number, number]);
        }
    });
    const extent = [d3.min(extents, d => d[0]) as number, d3.max(extents, d => d[1]) as number];

    const color = mapPlot.scale.domain(extent).range(mapPlot.range);
    paths = svg
        .selectAll('path')
        .data(features)
        .transition()
        .duration(0)
        .attr('fill', d => {
            const countryName = (d.properties as { name: string }).name;
            const countryCode = countryCodeMapper.getCode(countryName);
            if (!covidData.hasCountryCode(countryCode) || null == countryCode) {
                return COLOR_UNKNOWN;
            }

            const data = mapPlot.data(countryCode, covidData.getDayDataByDateString(countryCode, dateString), covidData, countryData);
            if (null == data) {
                return COLOR_UNKNOWN;
            }

            return color(data);
        });

}

CountryData.load().then((countryData) => {
    countryCodeMapper = new MapCountryCodeMapper(countryData);
    CovidData.load(countryData).then(covidData => {
        d3.json('./build/world-atlas/countries-110m.json').then(worldData => {

            const mapPlot = pendingPercentagePlot;

            const dateStrings = covidData.getDateStrings();
            d3.select('#dateSlider')
                .attr('min', 0)
                .attr('max', dateStrings.length - 1)
                .attr('value', dateStrings.length - 1)
                .on('change', function () {
                    // @ts-ignore
                    const dateString: string = dateStrings[this.value];
                    plotMap(covidData, countryData, features, mapPlot, dateString);
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

            plotMap(covidData, countryData, features, mapPlot, dateStrings[dateStrings.length - 1]);
        });
    });
});
