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
    private globalScaleFactor: number;
    private countryMapper: MapCountryCodeMapper;
    private countries: Array<CountryWithGeoFeature>;
    private country: CountryWithGeoFeature | null = null;
    private countryPaths: d3.Selection<SVGPathElement, CountryWithGeoFeature, SVGGElement, unknown>;
    private countryPath: d3.GeoPath;
    private svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any>;
    private zoom: d3.ZoomBehavior<SVGSVGElement, any>;
    private globalTranslate: number[];

    constructor(
        container: d3.Selection<any, unknown, HTMLElement, any>,
        private width: number,
        private height: number,
        private countryData: CountryData,
        worldData: any | undefined)
    {
        this.countryMapper = new MapCountryCodeMapper(countryData);

        let features = TopoJsonClient.feature<{ name: string }>(worldData, worldData.objects.countries as GeometryCollection<{ name: string }>).features;
        this.countries = features
            .filter(feature => {
                const code = this.countryMapper.getCode(feature.properties.name);
                if (null == code) {
                    console.warn(`No code found for ${feature.properties.name}`);
                    return false;
                }
                return null != countryData.getCountry(code);
            })
            .map((feature) =>
                new CountryWithGeoFeature(countryData.fetchCountry(this.countryMapper.getCode(feature.properties.name) as string), feature)
            );

        this.projection = d3.geoNaturalEarth1();
        this.countryPath = d3.geoPath().projection(this.projection);

        this.svg = container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.innerContainer = this.svg.append('g');

        this.countryPaths = this.innerContainer
            .selectAll('path')
            .data(this.countries)
            .enter()
            .append('path')
            .attr('d', d => this.countryPath(d.feature))
            .attr('stroke', Colors.gray["500"])
            .attr('fill', Colors.gray["100"])
            .attr('vector-effect', 'non-scaling-stroke');

        const resultingBbox = Utils.getBoundingClientRect(this.innerContainer);
        this.globalScaleFactor = Math.min(
            width / resultingBbox.width,
            height / resultingBbox.height
        );
        this.globalTranslate = [resultingBbox.width / 2, resultingBbox.height / 2];

        this.zoom = d3.zoom<SVGSVGElement, any>()
            .scaleExtent([0.1, 8])
            .on('zoom', () => this.innerContainer.attr('transform', d3.event.transform));

        // this.svg.call(this.zoom);
        this.svg.call(this.zoom.translateTo, this.globalTranslate[0], this.globalTranslate[1]);
        this.svg.call(this.zoom.scaleTo, this.globalScaleFactor);
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
        if (null == country) {
            this.country = null;
        } else {
            this.country = this.countries.filter(c => country.code === c.country.code).pop() as CountryWithGeoFeature;
        }
        this.updateCountry();
    }

    private updateCountry()
    {
        this.countryPaths.attr(
            'fill',
            d => this.country != null && this.country.country.code === d.country.code ? Colors.red["100"] : Colors.gray["100"]
        );

        if (null == this.country) {
            return null;
        }

        const bounds = this.countryPath.bounds(this.country.feature);
        const dx = bounds[1][0] - bounds[0][0];
        const dy = bounds[1][1] - bounds[0][1];
        const x = (bounds[0][0] + bounds[1][0]) / 2;
        const y = (bounds[0][1] + bounds[1][1]) / 2;
        const scale = Math.max(1, Math.min(8, 0.75 / Math.max(dx / this.width, dy / this.height)));
        const translate = [this.width / 2 - scale * x, this.height / 2 - scale * y];

        this.svg.transition()
            .duration(750)
            .call(this.zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
    }
}
