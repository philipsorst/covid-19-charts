import * as d3 from "d3";
import {Margin} from "./margin";

export class ChartUtils
{
    public static createSvgAndPlotContainer(parent: d3.Selection<d3.BaseType, unknown, HTMLElement, any>, width: number, height: number, margin: Margin): d3.Selection<SVGGElement, unknown, HTMLElement, any>
    {
        return parent
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .append('g')
            .attr('transform',
                `translate(${margin.left},${margin.top})`);
    }

    public static movingAverage(values: Array<number>, size: number)
    {
        let i = 0;
        let sum = 0;
        const means = new Float64Array(values.length).fill(NaN);

        for (let n = Math.min(size - 1, values.length); i < n; ++i) {
            sum += values[i];
        }

        for (let n = values.length; i < n; ++i) {
            sum += values[i];
            means[i] = sum / size;
            sum -= values[i - size + 1];
        }

        return means;
    }
}
