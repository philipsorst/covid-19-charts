import * as TopoJsonClient from "topojson-client";
import {GeometryCollection} from "topojson-specification";
import {Utils} from "../utils";
import * as d3 from 'd3';
import {DayDatum} from "../day-datum";
import {Location} from "../location";
import {Colors} from "../chart/colors";
import {CountryData} from "../country-data";
import {MapCountryCodeMapper} from "./map-country-code-mapper";
import {Country} from "../country";
import {CountryWithGeoFeature} from "../country-with-geo-feature";

export class CircleMap
{
    private innerContainer: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private projection: d3.GeoProjection;
    private scaleFactor: number;
    private countryMapper: MapCountryCodeMapper;
    private country: Country | null = null;
    private countryPaths: d3.Selection<SVGPathElement, CountryWithGeoFeature, SVGGElement, unknown>;

    constructor(
        container: d3.Selection<any, unknown, HTMLElement, any>,
        private width: number,
        private height: number,
        private countryData: CountryData,
        worldData: any | undefined)
    {
        this.countryMapper = new MapCountryCodeMapper(countryData);

        let features = TopoJsonClient.feature<{ name: string }>(worldData, worldData.objects.countries as GeometryCollection<{ name: string }>).features;
        const countries = features
            .filter(feature => countryData.getCountry(this.countryMapper.getCode(feature.properties.name)) != null)
            .map((feature) =>
                new CountryWithGeoFeature(countryData.fetchCountry(this.countryMapper.getCode(feature.properties.name) as string), feature)
            );

        this.projection = d3.geoNaturalEarth1();
        const path = d3.geoPath().projection(this.projection);

        const svg = container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.innerContainer = svg.append('g');

        this.countryPaths = this.innerContainer
            .selectAll('path')
            .data(countries)
            .enter()
            .append('path')
            .attr('d', d => path(d.feature))
            .attr('stroke', '#808080')
            .attr('fill', '#f0f0f0')
            .attr('vector-effect', 'non-scaling-stroke');

        const resultingBbox = Utils.getBoundingClientRect(this.innerContainer);
        this.scaleFactor = Math.min(
            width / resultingBbox.width,
            height / resultingBbox.height
        );

        const zoom = d3.zoom<SVGSVGElement, any>()
            .scaleExtent([0.1, 8])
            .on('zoom', () => this.innerContainer.attr('transform', d3.event.transform));

        svg.call(zoom);
        svg.call(zoom.translateTo, resultingBbox.width / 2, resultingBbox.height / 2);
        svg.call(zoom.scaleTo, this.scaleFactor);
    }

    public update(data: Array<{ location: Location, dayDatum: DayDatum }>)
    {
        const circleScale = d3.scaleSqrt()
            .domain([0, d3.max(data, d => d.dayDatum.getPending()) as number])
            .range([0, 50]);

        const fillColor = Utils.colorWithOpacity(Colors.blue["700"], 0.25);

        this.innerContainer
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('transform', d => 'translate(' + this.projection([d.location.long, d.location.lat]) + ')')
            .attr('r', d => circleScale(d.dayDatum.getPending()))
            // .attr('fill', 'rgba(255,255,255,0.125)')
            .attr('fill', fillColor.toString())
            // .attr('stroke', 'rgba(0,128,255,0.125)');
            .attr('stroke', 'none');
    }

    public setCountry(country: Country | null)
    {
        this.country = country;
        this.updateCountry();
    }

    private updateCountry()
    {
        this.countryPaths.attr('stroke', d => this.country != null && this.country.code === d.country.code ? 'red' : '#808080')
    }
}
