import {LineChart} from "./line-chart";
import * as d3 from "d3";
import {Margin} from "./margin";
import {DayData} from "../day-data";

export class MainChart extends LineChart
{
    protected confirmedPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected pendingPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected recoveredPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected deathsPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    constructor(parent: d3.Selection<any, any, any, any>, width: number, height: number, margin: Margin)
    {
        super(parent, width, height, margin);

        this.confirmedPath = this.plotContainer.append('path')
            .attr('fill', "none")
            .attr('stroke', "#616161")
            .attr('stroke-width', 1.5);

        this.pendingPath = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', "#1976D2")
            .attr("stroke-width", 1.5);

        this.recoveredPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", "#388E3C")
            .attr("stroke-width", 1.5);

        this.deathsPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", "#D32F2F")
            .attr("stroke-width", 1.5);
    }

    public update(entries: DayData[])
    {
        super.update(entries);
        this.confirmedPath
            .datum(entries)
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.confirmed))
            );

        this.pendingPath
            .datum(entries)
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getPending()))
            );

        this.recoveredPath
            .datum(entries)
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.recovered))
            );

        this.deathsPath
            .datum(entries)
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.deaths))
            );
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayData[]): [number, number]
    {
        return [0, d3.max(entries, d => d.confirmed) as number]
    }
}
