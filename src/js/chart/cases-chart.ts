import {AxisChart} from "./axis-chart";
import * as d3 from "d3";
import {Margin} from "./margin";
import {DayDatum} from "../day-datum";
import {Colors} from "./colors";

export class CasesChart extends AxisChart
{
    protected confirmedPath!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected confirmedRollingPath!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected deathsPath!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected deathsRollingPath!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected pendingPath!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected pendingRollingPath!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected recoveredPath!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;
    protected recoveredRollingPath!: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

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
        this.confirmedPath = this.plotContainer.append('path')
            .attr('fill', "none")
            .attr('stroke', Colors.gray["100"])
            .attr('stroke-width', 1.5);

        this.confirmedRollingPath = this.plotContainer.append('path')
            .attr('fill', "none")
            .attr('stroke', Colors.gray["700"])
            .attr('stroke-width', 1.5);

        this.deathsPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.red["100"])
            .attr("stroke-width", 1.5);

        this.deathsRollingPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.red["700"])
            .attr("stroke-width", 1.5);

        this.pendingPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.blue["100"])
            .attr("stroke-width", 1.5);

        this.pendingRollingPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.blue["700"])
            .attr("stroke-width", 1.5);

        this.recoveredPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.green["100"])
            .attr("stroke-width", 1.5);

        this.recoveredRollingPath = this.plotContainer.append("path")
            .attr("fill", "none")
            .attr("stroke", Colors.green["700"])
            .attr("stroke-width", 1.5);
    }

    public update(entries: DayDatum[])
    {
        super.update(entries);

        this.confirmedPath
            .datum(entries.filter(d => d.confirmed > 0))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.confirmed))
            );
        this.confirmedRollingPath
            .datum(entries.filter(entry => {
                const d = entry.getMovingAverageCentered(entry.getConfirmed);
                return d != null && d > 0;
            }))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getMovingAverageCentered(d.getConfirmed) as number))
            );

        this.deathsPath
            .datum(entries.filter(d => d.deaths > 0))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.deaths))
            );

        this.deathsRollingPath
            .datum(entries.filter(entry => {
                const d = entry.getMovingAverageCentered(entry.getDeaths, 1, true);
                return d != null && d > 0;
            }))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getMovingAverageCentered(d.getDeaths) as number))
            );

        this.pendingPath
            .datum(entries.filter(d => d.pending > 0))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.pending))
            );

        this.pendingRollingPath
            .datum(entries.filter(entry => {
                const d = entry.getMovingAverageCentered(entry.getPending, 1, true);
                return d != null && d > 0;
            }))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getMovingAverageCentered(d.getPending) as number))
            );

        this.recoveredPath
            .datum(entries.filter(d => d.getRecovered() > 0))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getRecovered()))
            );

        this.recoveredRollingPath
            .datum(entries.filter(entry => {
                const d = entry.getMovingAverageCentered(entry.getRecovered, 1, true);
                return d != null && d > 0;
            }))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getMovingAverageCentered(d.getRecovered) as number))
            );
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        return [1, d3.max(entries, d => d.confirmed) as number]
    }

    /**
     * @inheritDoc
     */
    protected createYScale(initialYDomain: [number, number]): d3.ScaleContinuousNumeric<number, number>
    {
        return d3.scaleLog()
            // return d3.scaleLinear()
            .domain(initialYDomain)
            .range([this.getInnerHeight(), 0])
    }

    /**
     * @inheritDoc
     */
    protected preUpdateYAxis()
    {
        this.yAxis.ticks(Math.log10(this.yScale.domain()[1]));
    }

    /**
     * @inheritDoc
     */
    protected createYAxis(): d3.Axis<number>
    {
        return super
            .createYAxis()
            .tickFormat(d3.format(','));
    }
}
