import {DayData} from "../day-data";
import {Margin} from "./margin";
import * as d3 from "d3";
import {LineChart} from "./line-chart";

export class DeathRateChart extends LineChart
{
    protected path: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected pathRolling: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    constructor(
        parent: d3.Selection<any, any, any, any>,
        width: number,
        height: number,
        margin: Margin,
        initialXDomain: [Date, Date] = [new Date(), new Date()],
        initialYDomain: [number, number] = [0, 1])
    {
        super(parent, width, height, margin, initialXDomain, initialYDomain);

        this.path = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#E0E0E0')
            .attr('stroke-width', 1.5);
        this.pathRolling = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#616161')
            .attr('stroke-width', 1.5);
    }

    public update(entries: DayData[])
    {
        super.update(entries);
        this.path
            .datum(entries)
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getDeathRate()))
            );
        this.pathRolling
            .datum(entries.filter(entry => entry.previous != null && entry.next != null))
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getDeathRateRolling()))
            );
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayData[]): [number, number]
    {
        return [0, d3.max(entries, d => d.getDeathRate()) as number];
    }
}
