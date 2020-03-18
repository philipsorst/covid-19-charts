import * as d3 from "d3";
import {Margin} from "./margin";

export class ChartUtils
{
    public static createSvgAndPlotContainer(parent: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, width: number, height: number, margin: Margin)
    {
        return parent
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform',
                `translate(${margin.left},${margin.top})`);
    }
}
