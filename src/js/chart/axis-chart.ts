import {Margin} from "./margin";
import * as d3 from "d3";
import {ChartUtils} from "./chart-utils";
import {DayDatum} from "../day-datum";

export abstract class AxisChart
{
    protected width: number;
    protected height: number;
    protected margin: Margin;
    protected xScale: d3.ScaleTime<number, number>;
    protected xAxis: d3.Axis<Date>;
    protected xAxisSelection: d3.Selection<SVGGElement, unknown, HTMLElement, any>;
    protected yScale: d3.ScaleContinuousNumeric<number, number>;
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

        this.xAxis = d3.axisBottom(this.xScale).tickSizeOuter(0) as d3.Axis<Date>;

        this.xAxisSelection = this.plotContainer.append('g')
            .attr('transform', `translate(0,${this.getInnerHeight()})`)
            .call(this.xAxis);
        this.xAxisSelection.selectAll('.domain').attr('stroke-opacity', 0.125);

        this.yScale = this.createYScale(initialYDomain);

        this.yAxis = this.createYAxis();

        this.yAxisSelection = this.plotContainer.append('g').call(this.yAxis);
        this.yAxisSelection.selectAll('.domain').attr('stroke-opacity', 0.125);
        this.transition = d3.transition().duration(500);
    }

    protected createYScale(initialYDomain: [number, number]): d3.ScaleContinuousNumeric<number, number>
    {
        return d3.scaleLinear()
            .domain(initialYDomain)
            .range([this.getInnerHeight(), 0]);
    }

    public update(entries: DayDatum[])
    {
        this.xScale.domain(this.getXDomain(entries));
        this.xAxis.scale(this.xScale);

        this.yScale.domain(this.getYDomain(entries));
        this.yAxis.scale(this.yScale);

        this.preUpdateXAxis();
        this.xAxisSelection.selectAll('line.grid').remove();
        this.xAxisSelection.transition(this.transition).call(this.xAxis)
            .on('end', () => {
                this.xAxisSelection.call(g =>
                    g.selectAll('.tick line').clone()
                        .classed('grid', true)
                        .attr('stroke-opacity', 0.05)
                        .attr('y1', 0)
                        .attr('y2', -this.getInnerHeight())
                );
            });
        this.postUpdateXAxis();

        this.preUpdateYAxis();
        this.yAxisSelection.selectAll('line.grid').remove();
        this.yAxisSelection.transition(this.transition).call(this.yAxis)
            .on('end', () => {
                this.yAxisSelection.call(g =>
                    g.selectAll('.tick line').clone()
                        .classed('grid', true)
                        .attr('stroke-opacity', 0.05)
                        .attr('x2', this.getInnerWidth())
                );
            });
        this.postUpdateYAxis();
    }

    protected getInnerWidth(): number
    {
        return this.width - this.margin.left - this.margin.right;
    }

    protected getInnerHeight(): number
    {
        return this.height - this.margin.top - this.margin.bottom;
    }

    protected createYAxis(): d3.Axis<number>
    {
        return d3.axisLeft(this.yScale).tickSizeOuter(0) as d3.Axis<number>;
    }

    protected getXDomain(entries: DayDatum[]): [Date, Date]
    {
        return d3.extent(entries, d => d.date) as [Date, Date];
    }


    protected preUpdateXAxis()
    {
        /* Hook */
    }

    protected postUpdateXAxis()
    {
        /* Hook */
    }

    protected preUpdateYAxis()
    {
        /* Hook */
    }

    protected postUpdateYAxis()
    {
        /* Hook */
    }

    protected abstract getYDomain(entries: DayDatum[]): [number, number];
}
