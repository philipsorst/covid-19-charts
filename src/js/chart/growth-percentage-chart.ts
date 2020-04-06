import {AxisChart} from "./axis-chart";
import * as d3 from "d3";
import {Margin} from "./margin";
import {DayDatum} from "../day-datum";
import {Colors} from "./colors";

export class GrowthPercentageChart extends AxisChart
{
    protected path!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected movingPath!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
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
    }

    protected addPlots()
    {
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
            .datum(entries.filter(entry => entry.getGrowthPercentage() != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getGrowthPercentage() as number))
            );

        this.movingPath
            .datum(entries.filter(entry => entry.getMovingAverageCentered(entry.getGrowthPercentage, this.movingWindowSize) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                    .x(d => this.xScale(d.date))
                    .y(d => this.yScale(d.getMovingAverageCentered(d.getGrowthPercentage, this.movingWindowSize) as number))
                // .curve(d3.curveMonotoneX)
            );
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        return d3.extent(
            entries.filter(entry => entry.getMovingAverageCentered(entry.getGrowthPercentage, this.movingWindowSize) != null),
            d => d.getMovingAverageCentered(d.getGrowthPercentage, this.movingWindowSize)
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
        return d3.scaleLinear()
            .domain(initialYDomain)
            .range([this.getInnerHeight(), 0])
    }
}
