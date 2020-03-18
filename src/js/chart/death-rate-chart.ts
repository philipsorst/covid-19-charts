import {DayData} from "../day-data";
import {Margin} from "./margin";
import {ChartUtils} from "./chart-utils";
import * as d3 from "d3";
import {LineChart} from "./line-chart";

export class DeathRateChart extends LineChart
{
    private width: number;
    private height: number;
    private margin: Margin;
    private xScale: d3.ScaleTime<number, number>;
    private xAxisCall: d3.Axis<Date>;
    private xAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private yScale: d3.ScaleLinear<number, number>;
    private yAxisCall: d3.Axis<number>;
    private yAxis: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    private path: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    constructor(parent: d3.Selection<any, any, any, any>, width: number, height: number, margin: Margin)
    {
        super();
        this.width = width;
        this.height = height;
        this.margin = margin;

        const plotContainer = ChartUtils.createSvgAndPlotContainer(parent, width, height, margin);

        this.xScale = d3.scaleTime()
            .range([0, this.getInnerWidth()]);

        this.xAxisCall = d3.axisBottom(this.xScale) as d3.Axis<Date>;

        this.xAxis = plotContainer.append('g')
            .attr('transform', `translate(0,${this.getInnerHeight()})`)
            .call(this.xAxisCall);

        this.yScale = d3.scaleLinear()
            .range([this.getInnerHeight(), 0]);

        this.yAxisCall = d3.axisLeft(this.yScale) as d3.Axis<number>;

        this.yAxis = plotContainer.append('g')
            .call(this.yAxisCall);
        // .call(g => g.selectAll('.tick line').clone() // grid lines
        //     .attr('stroke-opacity', 0.05)
        //     .attr('x2', width));

        this.path = plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#808080')
            .attr('stroke-width', 1.5);
    }

    private getInnerWidth(): number
    {
        return this.width - this.margin.left - this.margin.right;
    }

    private getInnerHeight(): number
    {
        return this.height - this.margin.top - this.margin.bottom;
    }

    public update(entries: DayData[])
    {
        this.xScale.domain(d3.extent(entries, d => d.date) as [Date, Date]);
        this.xAxisCall.scale(this.xScale);

        this.yScale.domain([0, d3.max(entries, d => d.getDeathRate()) as number]);
        this.yAxisCall.scale(this.yScale);

        const transition: d3.Transition<any, any, any, any> = d3.transition().duration(500);

        this.xAxis.transition(transition).call(this.xAxisCall);
        this.yAxis.transition(transition)
            .call(this.yAxisCall);

        this.path
            .datum(entries)
            .transition(transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getDeathRate()))
            );
    }
}
