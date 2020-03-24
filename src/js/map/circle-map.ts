import * as TopoJsonClient from "topojson-client";
import {GeometryCollection} from "topojson-specification";
import {Utils} from "../utils";
import * as d3 from 'd3';

export class CircleMap
{
    private innerContainer: d3.Selection<SVGGElement, unknown, HTMLElement, any>;

    constructor(container: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>, worldData: any | undefined)
    {
        let features = TopoJsonClient.feature(worldData, worldData.objects.countries as GeometryCollection).features;

        let containerBounds = Utils.getBoundingClientRect(container);
        const projection = d3.geoNaturalEarth1();
        const path = d3.geoPath().projection(projection);

        const svg = container.append('svg')
            .attr('width', containerBounds.width)
            .attr('height', containerBounds.height);

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
            containerBounds.width / resultingBbox.width,
            containerBounds.height / resultingBbox.height
        );

        const zoom = d3.zoom<SVGSVGElement, any>()
            .scaleExtent([0.5, 8])
            .on('zoom', () => this.innerContainer.attr('transform', d3.event.transform));

        svg.call(zoom);
        svg.call(zoom.translateTo, resultingBbox.width / 2, resultingBbox.height / 2);
        svg.call(zoom.scaleTo, scaleFactor);
    }
}
