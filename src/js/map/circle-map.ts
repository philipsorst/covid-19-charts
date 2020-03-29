import * as TopoJsonClient from "topojson-client";
import {GeometryCollection} from "topojson-specification";
import {Utils} from "../utils";
import * as d3 from 'd3';
import {DayDatum} from "../day-datum";
import {Location} from "../location";

export class CircleMap
{
    private innerContainer: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private projection: d3.GeoProjection;

    constructor(container: d3.Selection<any, unknown, HTMLElement, any>, private width: number, private height: number, worldData: any | undefined)
    {
        let features = TopoJsonClient.feature(worldData, worldData.objects.countries as GeometryCollection).features;

        this.projection = d3.geoNaturalEarth1();
        const path = d3.geoPath().projection(this.projection);

        const svg = container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        this.innerContainer = svg.append('g');

        this.innerContainer
            .selectAll('path')
            .data(features)
            .enter()
            .append('path')
            .attr('d', path)
            .attr('stroke', '#808080')
            .attr('fill', '#f0f0f0')
            .attr('vector-effect', 'non-scaling-stroke');

        const resultingBbox = Utils.getBoundingClientRect(this.innerContainer);
        const scaleFactor = Math.min(
            width / resultingBbox.width,
            height / resultingBbox.height
        );

        const zoom = d3.zoom<SVGSVGElement, any>()
            .scaleExtent([0.1, 8])
            .on('zoom', () => this.innerContainer.attr('transform', d3.event.transform));

        // svg.call(zoom);
        svg.call(zoom.translateTo, resultingBbox.width / 2, resultingBbox.height / 2);
        svg.call(zoom.scaleTo, scaleFactor);
    }

    public update(data: Array<{ location: Location, dayDatum: DayDatum }>)
    {
        this.innerContainer
            .selectAll('circle')
            .data(data)
            .enter()
            .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('transform', d => 'translate(' + this.projection([d.location.long, d.location.lat]) + ')')
            .attr('r', d => Math.sqrt(d.dayDatum.confirmed) / (this.width / 100))
            // .attr('fill', 'rgba(255,255,255,0.125)')
            .attr('fill', 'rgba(244,67,54,0.25)')
            // .attr('stroke', 'rgba(0,128,255,0.125)');
            .attr('stroke', 'none');
    }
}
