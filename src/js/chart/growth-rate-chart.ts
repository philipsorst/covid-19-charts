import {LineChart} from "./line-chart";
import * as d3 from "d3";
import {Margin} from "./margin";
import {DayData} from "../day-data";

export class GrowthRateChart extends LineChart
{
    protected path: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
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
            .attr('stroke', '#BDBDBD');
        // .attr('stroke-width', 0.5);
        // .attr('stroke-dasharray', '5');
        this.path = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#616161')
            .attr('stroke-width', 1.5);
    }

    public update(entries: DayData[])
    {
        super.update(entries);
        this.path
            .datum(entries.filter(entry => entry.getGrowthChangeRate() != null))
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getGrowthChangeRate() as number))
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
    protected getYDomain(entries: DayData[]): [number, number]
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
            .range([this.getInnerHeight(), 0]);
    }
}
