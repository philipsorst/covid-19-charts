import {LineChart} from "./line-chart";
import * as d3 from "d3";
import {Margin} from "./margin";
import {DayDatum} from "../day-datum";
import {Colors} from "./colors";

export class GrowthRateChart extends LineChart
{
    protected path: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected movingPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    private linearLine: d3.Selection<SVGLineElement, unknown, HTMLElement, any>;

    constructor(
        parent: d3.Selection<any, any, any, any>,
        width: number,
        height: number,
        margin: Margin,
        initialXDomain: [Date, Date] = [new Date(), new Date()],
        initialYDomain: [number, number] = [0, 1])
    {
        super(parent, width, height, margin, initialXDomain, initialYDomain);

        this.linearLine = this.plotContainer.append('line')
            .attr('stroke', Colors.blue["500"]);
        // .attr('stroke-width', 0.5);
        // .attr('stroke-dasharray', '5');
        this.path = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.gray["300"])
            .attr('stroke-width', 1.5);
        this.movingPath = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.gray["700"])
            .attr('stroke-width', 1.5);
    }

    public update(entries: DayDatum[])
    {
        super.update(entries);

        this.path
            .datum(entries.filter(entry => entry.getGrowthChangeRate() != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getGrowthChangeRate() as number))
            );

        const movingWindowSize = 3;
        this.movingPath
            .datum(entries.filter(entry => entry.getMovingAverage(entry.getGrowthChangeRate, movingWindowSize) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getMovingAverage(d.getGrowthChangeRate, movingWindowSize) as number))
                .curve(d3.curveMonotoneX)
            );

        this.linearLine
            .transition(this.transition)
            .attr('x1', this.xScale.range()[0])
            .attr('x2', this.xScale.range()[1])
            .attr('y1', this.yScale(1))
            .attr('y2', this.yScale(1));
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        return d3.extent(
            entries.filter(entry => entry.getGrowthChangeRate() != null),
            d => d.getGrowthChangeRate()
        ) as [number, number]
    }

    /**
     * @inheritDoc
     */
    protected createYScale(initialYDomain: [number, number]): d3.ScaleContinuousNumeric<number, number>
    {
        return d3.scaleSymlog()
            .domain(initialYDomain)
            .range([this.getInnerHeight(), 0])
    }
}
