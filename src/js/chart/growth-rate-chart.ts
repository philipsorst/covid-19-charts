import {LineChart} from "./line-chart";
import * as d3 from "d3";
import {Margin} from "./margin";
import {DayData} from "../day-data";

export class GrowthRateChart extends LineChart
{
    protected path: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    constructor(parent: d3.Selection<any, any, any, any>, width: number, height: number, margin: Margin)
    {
        super(parent, width, height, margin);

        this.path = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', '#808080')
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
                .y(d => this.yScale(d.confirmedGrowthRate))
            );
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayData[]): [number, number]
    {
        return d3.extent(entries, d => d.confirmedGrowthRate) as [number, number]
    }
}
