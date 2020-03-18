import {LineChart} from "./line-chart";
import * as d3 from "d3";
import {Margin} from "./margin";
import {DayData} from "../day-data";
import {Colors} from "./colors";

export class MainChart extends LineChart
{
    protected confirmedPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected confirmedRollingPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    protected pendingPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected pendingRollingPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    protected recoveredPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected recoveredRollingPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    protected deathsPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected deathsRollingPath: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    constructor(
        parent: d3.Selection<any, any, any, any>,
        width: number,
        height: number,
        margin: Margin,
        initialXDomain: [Date, Date] = [new Date(), new Date()],
        initialYDomain: [number, number] = [0, 1])
    {
        super(parent, width, height, margin, initialXDomain, initialYDomain);

        this.confirmedPath = this.plotContainer.append('path')
            .attr('fill', "none")
            .attr('stroke', Colors.gray["300"])
            .attr('stroke-width', 1.5);
        this.confirmedRollingPath = this.plotContainer.append('path')
            .attr('fill', "none")
            .attr('stroke', Colors.gray["700"])
            .attr('stroke-width', 1.5);

        this.pendingPath = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.blue["300"])
            .attr("stroke-width", 1.5);
        this.pendingRollingPath = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.blue["700"])
            .attr("stroke-width", 1.5);

        this.recoveredPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.green["300"])
            .attr("stroke-width", 1.5);
        this.recoveredRollingPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.green["700"])
            .attr("stroke-width", 1.5);

        this.deathsPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.red["300"])
            .attr("stroke-width", 1.5);
        this.deathsRollingPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.red["700"])
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
        this.confirmedRollingPath
            .datum(entries.filter(entry => entry.getRolling(entry.getConfirmed) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getRolling(d.getConfirmed) as number))
            );

        this.pendingPath
            .datum(entries)
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getPending()))
            );
        this.pendingRollingPath
            .datum(entries.filter(entry => entry.getRolling(entry.getPending) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getRolling(d.getPending) as number))
            );

        this.recoveredPath
            .datum(entries)
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.recovered))
            );
        this.recoveredRollingPath
            .datum(entries.filter(entry => entry.getRolling(entry.getRecovered) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getRolling(d.getRecovered) as number))
            );

        this.deathsPath
            .datum(entries)
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.deaths))
            );

        this.deathsRollingPath
            .datum(entries.filter(entry => entry.getRolling(entry.getDeaths) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayData>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getRolling(d.getDeaths) as number))
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
