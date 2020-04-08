import {AxisChart} from "./axis-chart";
import {DayDatum} from "../day-datum";
import * as d3 from "d3";
import {Margin} from "./margin";
import {Colors} from "./colors";

export class GrowthChart extends AxisChart
{
    protected linearLine!: d3.Selection<SVGLineElement, unknown, HTMLElement, any>;
    protected paths!: Array<d3.Selection<SVGPathElement, unknown, HTMLElement, any>>;
    protected pendingPaths!: Array<d3.Selection<SVGPathElement, unknown, HTMLElement, any>>;
    protected deathPaths!: Array<d3.Selection<SVGPathElement, unknown, HTMLElement, any>>;

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
        this.linearLine = this.plotContainer.append('line')
            .attr('stroke', Colors.gray["500"])
            .attr('x1', this.xScale.range()[0])
            .attr('x2', this.xScale.range()[1])
            .attr('y1', this.yScale(1))
            .attr('y2', this.yScale(1));

        this.paths = new Array<d3.Selection<SVGPathElement, unknown, HTMLElement, any>>(7);
        const colorScaleGray = d3.scaleLinear<string, string>()
            .domain([0, 6])
            .range(['rgba(13,13,13,0.1)', 'rgba(13,13,13,0.9)']);
        for (let i = 6; i >= 0; i--) {
            this.paths[i] = (
                this.plotContainer.append('path')
                    .attr('fill', 'none')
                    .attr('stroke', colorScaleGray(i))
                    .attr('stroke-width', 1.5)
            );
        }

        this.deathPaths = new Array<d3.Selection<SVGPathElement, unknown, HTMLElement, any>>(7);
        const colorScaleRed = d3.scaleLinear<string, string>()
            .domain([0, 6])
            .range(['rgba(183,28,28,0.1)', 'rgba(183,28,28,0.9)']);
        for (let i = 6; i >= 0; i--) {
            this.deathPaths[i] = (
                this.plotContainer.append('path')
                    .attr('fill', 'none')
                    .attr('stroke', colorScaleRed(i))
                    .attr('stroke-width', 1.5)
            );
        }

        this.pendingPaths = new Array<d3.Selection<SVGPathElement, unknown, HTMLElement, any>>(7);
        const colorScaleBlue = d3.scaleLinear<string, string>()
            .domain([0, 6])
            .range(['rgba(13,71,161,0.1)', 'rgba(13,71,161,0.9)']);
        for (let i = 6; i >= 0; i--) {
            this.pendingPaths[i] = (
                this.plotContainer.append('path')
                    .attr('fill', 'none')
                    .attr('stroke', colorScaleBlue(i))
                    .attr('stroke-width', 1.5)
            );
        }
    }

    /**
     * @inheritDoc
     */
    public update(entries: DayDatum[])
    {
        super.update(entries);
        this.linearLine
            .transition(this.transition)
            .attr('x1', this.xScale.range()[0])
            .attr('x2', this.xScale.range()[1])
            .attr('y1', this.yScale(1))
            .attr('y2', this.yScale(1));

        for (let i = 6; i >= 0; i--) {
            this.paths[i]
                .datum(entries.filter(entry => entry.getMovingAverageCentered(entry.getGrowth, i) != null))
                .transition(this.transition)
                .attr('d', d3.line<DayDatum>()
                    .x(d => this.xScale(d.date))
                    .y(d => this.yScale(d.getMovingAverageCentered(d.getGrowth, i) as number))
                );
        }

        for (let i = 6; i >= 0; i--) {
            this.deathPaths[i]
                .datum(entries.filter(entry => entry.getMovingAverageCentered(entry.getDeathGrowth, i) != null))
                .transition(this.transition)
                .attr('d', d3.line<DayDatum>()
                    .x(d => this.xScale(d.date))
                    .y(d => this.yScale(d.getMovingAverageCentered(d.getDeathGrowth, i) as number))
                );
        }

        for (let i = 6; i >= 0; i--) {
            this.pendingPaths[i]
                .datum(entries.filter(entry => entry.getMovingAverageCentered(entry.getPendingGrowth, i) != null))
                .transition(this.transition)
                .attr('d', d3.line<DayDatum>()
                    .x(d => this.xScale(d.date))
                    .y(d => this.yScale(d.getMovingAverageCentered(d.getPendingGrowth, i) as number))
                );
        }
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        const growthExtend = d3.extent(
            entries.filter(entry => entry.getGrowth() != null), d => d.getGrowth()) as [number, number];
        const pendingGrowthExtend = d3.extent(
            entries.filter(entry => entry.getPendingGrowth() != null), d => d.getPendingGrowth()) as [number, number];
        return [Math.min(growthExtend[0], pendingGrowthExtend[0]), Math.max(growthExtend[1], pendingGrowthExtend[1])];
    }

}
