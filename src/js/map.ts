import {GeometryCollection} from "topojson-specification";
import * as d3 from 'd3';
import * as TopoJsonClient from 'topojson-client';
import {CountryData} from "./country-data";
import {loadCovidData, WORLD_ABBR} from "./load.coviddata";
import {DayData} from "./day-data";

require('../scss/map.scss');

let container = d3.select("#map");
// const containerWidth = container.node().getBoundingClientRect().width;
const containerWidth = 1000;
const svg = container.append("svg")
    .attr('width', containerWidth)
    .attr('height', 500);
const path = d3.geoPath().projection(d3.geoNaturalEarth1());
const color = d3.scaleOrdinal<number, string>(d3.schemeCategory10);
let countryData: CountryData;
let covidData: { countries: string[], data: Map<string, Map<string, DayData>> };

CountryData.load().then((countryDataResult) => {
    countryData = countryDataResult;
    loadCovidData(countryData).then(covidDataResult => {
        covidData = covidDataResult;

        covidData.countries.forEach(countryCode => {
            if (WORLD_ABBR === countryCode) return;
            const countryMap = covidData.data.get(countryCode);
            if (null == countryMap) throw 'Country map not found for ' + countryCode;

            const dayEntries = Array.from(countryMap.values());
            const lastEntry = dayEntries[dayEntries.length - 1];
            const population = countryData.getPopulation(countryCode);
            console.log(countryCode, lastEntry.confirmed - lastEntry.recovered - lastEntry.deaths, population);
        });


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

                    console.log();
                    return '#ff8000';
                });
        });

    })
});

