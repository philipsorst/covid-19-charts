import {GeometryCollection} from "topojson-specification";
import * as d3 from 'd3';
import * as TopoJsonClient from 'topojson-client';
import {CountryData} from "./country-data";
import {CovidData} from "./covid-data";
import {DayDatum} from "./day-datum";
import {Location} from "./location";

require('../scss/map.scss');

let container = d3.select("#map");
// const containerWidth = container.node().getBoundingClientRect().width;
const containerWidth = 1000;
const svg = container.append("svg")
    .attr('width', containerWidth)
    .attr('height', 500);
let innerContainer: d3.Selection<SVGGElement, any, any, any>;
const projection = d3.geoNaturalEarth1();
const path = d3.geoPath().projection(projection);
let paths;
const COLOR_UNKNOWN = '#f0f0f0';
const zoom = d3.zoom<SVGSVGElement, any>()
    .scaleExtent([1, 8])
    .on('zoom', zoomed);

function zoomed()
{
    innerContainer.attr('transform', d3.event.transform);
}

interface MapPlot
{
    name: string,
    range: ReadonlyArray<string>,
    data: (countryCode: string, dayData: DayDatum | null, covidData: CovidData, countryData: CountryData) => number | null
}

const pendingPercentagePlot: MapPlot = {
    name: 'Pending Percentage',
    range: ['#FFEBEE', '#B71C1C'],
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
    data: (countryCode: string, dayData, covidData, countryData) => {
        if (null == dayData) {
            return null;
        }
        return dayData.recovered;
    }
};

const recoveredPercentagePlot: MapPlot = {
    name: 'Recovered',
    range: ['#FFEBEE', '#80ff80'],
    data: (countryCode: string, dayData, covidData, countryData) => {
        if (null == dayData) {
            return null;
        }
        return dayData.recovered / dayData.confirmed;
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
        const countryCode = countryData.getCode(countryName);
        if (covidData.hasCountryCode(countryCode) && null != countryCode) {
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
            const countryCode = countryData.getCode(countryName);
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
    CovidData.load(countryData).then(covidData => {
        d3.json('./build/world-atlas/countries-110m.json').then(worldData => {

            // const mapPlot = pendingPercentagePlot;

            // const dateStrings = covidData.getDateStrings();
            // d3.select('#dateSlider')
            //     .attr('min', 0)
            //     .attr('max', dateStrings.length - 1)
            //     .attr('value', dateStrings.length - 1)
            //     .on('change', function () {
            //         // @ts-ignore
            //         const dateString: string = dateStrings[this.value];
            //         plotMap(covidData, countryData, features, mapPlot, dateString);
            //     });

            let features = TopoJsonClient.feature(worldData, worldData.objects.countries as GeometryCollection).features;

            innerContainer = svg.append('g');
            svg.call(zoom);

            innerContainer
                .selectAll('path')
                .data(features)
                .enter()
                .append('path')
                .attr('d', path)
                .attr('stroke', '#808080')
                .attr('fill', '#f0f0f0')
                .attr('vector-effect', 'non-scaling-stroke');

            let circleData = new Array<{ location: Location, dayDatum: DayDatum }>();
            covidData.getLocations().forEach(location => {
                const dayData = covidData.fetchLocationDayData(location);
                if (dayData.length > 0) {
                    const lastEntry = dayData[dayData.length - 1];
                    if (lastEntry.getPending() > 0) {
                        circleData.push({
                            location: location,
                            dayDatum: lastEntry
                        })
                    }
                }
            });

            innerContainer
                .selectAll('circle')
                .data(circleData)
                .enter()
                .append('circle')
                .attr('cx', 0)
                .attr('cy', 0)
                .attr('transform', d => 'translate(' + projection([d.location.long, d.location.lat]) + ')')
                .attr('r', d => Math.sqrt(d.dayDatum.getPending()) / 5)
                // .attr('fill', 'rgba(255,255,255,0.125)')
                .attr('fill', 'rgba(0,128,255,0.25)')
                // .attr('stroke', 'rgba(0,128,255,0.125)');
                .attr('stroke', 'none');

            // plotMap(covidData, countryData, features, mapPlot, dateStrings[dateStrings.length - 1]);
        });
    });
});
