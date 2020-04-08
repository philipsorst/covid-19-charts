import {DayDatum} from "../day-datum";
import {Margin} from "./margin";
import * as d3 from "d3";
import {AxisChart} from "./axis-chart";
import {Colors} from "./colors";

export class DeathRateChart extends AxisChart
{
    protected path!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected pathRolling!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

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

    /**
     * @inheritDoc
     */
    protected addPlots()
    {
        this.path = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.red["100"])
            .attr('stroke-width', 1.5);
        this.pathRolling = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.red["700"])
            .attr('stroke-width', 1.5);
    }

    /**
     * @inheritDoc
     */
    public update(entries: DayDatum[])
    {
        super.update(entries);
        this.path
            .datum(entries)
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getDeathRate()))
            );
        this.pathRolling
            .datum(entries.filter(entry => entry.getMovingAverageCentered(entry.getDeathRate) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getMovingAverageCentered(d.getDeathRate) as number))
            );
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        return [0, d3.max(entries, d => d.getDeathRate()) as number];
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
    protected createYAxis(): d3.Axis<number>
    {
        return super.createYAxis().tickFormat(d3.format('.2%'));
    }
}
