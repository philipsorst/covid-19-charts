import {Margin} from "./margin";
import * as d3 from "d3";
import {ChartUtils} from "./chart-utils";
import {DayData} from "../day-data";

export abstract class LineChart
{
    protected width: number;
    protected height: number;
    protected margin: Margin;
    protected xScale: d3.ScaleTime<number, number>;
    protected xAxis: d3.Axis<Date>;
    protected xAxisSelection: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected yScale: d3.ScaleLinear<number, number>;
    protected yAxis: d3.Axis<number>;
    protected yAxisSelection: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected plotContainer: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected transition: d3.Transition<any, any, any, any>;

    constructor(
        parent: d3.Selection<any, any, any, any>,
        width: number,
        height: number,
        margin: Margin,
        initialXDomain: [Date, Date] = [new Date(), new Date()],
        initialYDomain: [number, number] = [0, 1])
    {
        this.width = width;
        this.height = height;
        this.margin = margin;

        this.plotContainer = ChartUtils.createSvgAndPlotContainer(parent, width, height, margin);

        this.xScale = d3.scaleTime()
            .domain(initialXDomain)
            .range([0, this.getInnerWidth()]);

        this.xAxis = d3.axisBottom(this.xScale) as d3.Axis<Date>;

        this.xAxisSelection = this.plotContainer.append('g')
            .attr('transform', `translate(0,${this.getInnerHeight()})`)
            .call(this.xAxis);

        this.yScale = d3.scaleLinear()
            .domain(initialYDomain)
            .range([this.getInnerHeight(), 0]);

        this.yAxis = d3.axisLeft(this.yScale) as d3.Axis<number>;

        this.yAxisSelection = this.plotContainer.append('g')
            .call(this.yAxis);
        // .call(g => g.selectAll('.tick line').clone() // grid lines
        //     .attr('stroke-opacity', 0.05)
        //     .attr('x2', width));
        this.transition = d3.transition().duration(500);
    }

    public update(entries: DayData[])
    {
        this.xScale.domain(this.getXDomain(entries));
        this.xAxis.scale(this.xScale);

        this.yScale.domain(this.getYDomain(entries));
        this.yAxis.scale(this.yScale);

        this.xAxisSelection.transition(this.transition).call(this.xAxis);
        this.yAxisSelection.transition(this.transition)
            .call(this.yAxis);
    }

    protected getInnerWidth(): number
    {
        return this.width - this.margin.left - this.margin.right;
    }

    protected getInnerHeight(): number
    {
        return this.height - this.margin.top - this.margin.bottom;
    }

    protected getXDomain(entries: DayData[]): [Date, Date]
    {
        return d3.extent(entries, d => d.date) as [Date, Date];
    }

    protected abstract getYDomain(entries: DayData[]): [number, number];
}
