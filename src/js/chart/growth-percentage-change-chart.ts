import {AxisChart} from "./axis-chart";
import * as d3 from "d3";
import {Margin} from "./margin";
import {DayDatum} from "../day-datum";
import {Colors} from "./colors";

export class GrowthPercentageChangeChart extends AxisChart
{
    protected path: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected movingPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    private linearLine: d3.Selection<SVGLineElement, unknown, HTMLElement, any>;
    private movingWindowSize = 3;

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
            .attr('stroke', Colors.gray["500"]);
        // .attr('stroke-width', 0.5);
        // .attr('stroke-dasharray', '5');
        this.path = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.blue["100"])
            .attr('stroke-width', 1.5);
        this.movingPath = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.blue["700"])
            .attr('stroke-width', 1.5);
    }

    public update(entries: DayDatum[])
    {
        super.update(entries);

        this.path
            .datum(entries.filter(entry => entry.getGrowthPercentageChange() != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getGrowthPercentageChange() as number))
            );

        this.movingPath
            .datum(entries.filter(entry => entry.getMovingAverageCentered(entry.getGrowthPercentageChange, this.movingWindowSize) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                    .x(d => this.xScale(d.date))
                    .y(d => this.yScale(d.getMovingAverageCentered(d.getGrowthPercentageChange, this.movingWindowSize) as number))
                // .curve(d3.curveMonotoneX)
            );

        this.linearLine
            .transition(this.transition)
            .attr('x1', this.xScale.range()[0])
            .attr('x2', this.xScale.range()[1])
            .attr('y1', this.yScale(0))
            .attr('y2', this.yScale(0));
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        return d3.extent(
            entries.filter(entry => entry.getMovingAverageCentered(entry.getGrowthPercentageChange, this.movingWindowSize) != null),
            d => d.getMovingAverageCentered(d.getGrowthPercentageChange, this.movingWindowSize)
        ) as [number, number];

        // return d3.extent(
        //     entries.filter(entry => entry.getGrowthPercentageChange() != null),
        //     d => d.getGrowthPercentageChange(),
        // ) as [number, number];
    }

    /**
     * @inheritDoc
     */
    protected preUpdateYAxis()
    {
        this.yAxis.ticks(this.getInnerHeight() / 20);
    }

    /**
     * @inheritDoc
     */
    protected createYScale(initialYDomain: [number, number]): d3.ScaleContinuousNumeric<number, number>
    {
        return d3.scaleSymlog()
            // return d3.scaleLinear()
            .domain(initialYDomain)
            .range([this.getInnerHeight(), 0])
    }
}
