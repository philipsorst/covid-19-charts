import {GeometryCollection} from "topojson-specification";
import * as d3 from 'd3';
import * as TopoJsonClient from 'topojson-client';
import {CountryData} from "./country-data";
import {CovidData} from "./covid-data";

require('../scss/map.scss');

let container = d3.select("#map");
// const containerWidth = container.node().getBoundingClientRect().width;
const containerWidth = 1000;
const svg = container.append("svg")
    .attr('width', containerWidth)
    .attr('height', 1000);
const projection = d3.geoNaturalEarth1();
console.log(projection.scale());
const path = d3.geoPath().projection(projection);
// const color = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
let countryData: CountryData;
let covidData: CovidData;

CountryData.load().then((countryDataResult) => {
    countryData = countryDataResult;
    CovidData.load(countryData).then(covidDataResult => {
        covidData = covidDataResult;

        let maxPendingRate = 0;
        covidData.getCountryCodes().forEach(countryCode => {
            const lastEntry = covidData.getLastDayData(countryCode);
            const population = countryData.getPopulation(countryCode);
            if (null != population) {
                const pendingRate = lastEntry.getPending() / population;
                if (pendingRate > maxPendingRate) {
                    maxPendingRate = pendingRate;
                    console.log(maxPendingRate, countryCode);
                }
            }
        });
        console.log(maxPendingRate);

        const color = d3.scaleSymlog<string, string>().domain([0, maxPendingRate]).range(['#dedede', '#ff0000']);

        d3.json('./build/world-atlas/countries-110m.json').then(world => {
            console.log(world);
            let features = TopoJsonClient.feature(world, world.objects.countries as GeometryCollection).features;
            console.log(features);
            svg.selectAll("path")
                .data(features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('fill', d => {
                    const countryName = (d.properties as { name: string }).name;
                    const countryCode = countryData.getCountryCode(countryName);
                    if (!covidData.hasCountryCode(countryCode)) {
                        return color(0);
                    }//throw 'Country map not found for ' + countryCode;
                    const population = countryData.getPopulation(countryCode);
                    if (null == population) {
                        return color(0);
                    }
                    const lastEntry = covidData.getLastDayData(countryCode);
                    const pendingRate = lastEntry.getPending() / population;

                    return color(pendingRate);
                });
        });

    })
});

