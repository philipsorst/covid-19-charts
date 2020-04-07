import {AxisChart} from "./axis-chart";
import {DayDatum} from "../day-datum";
import * as d3 from "d3";
import {Margin} from "./margin";
import {Colors} from "./colors";

export class NetReproductionNumberChart extends AxisChart
{
    private linearLine!: d3.Selection<SVGLineElement, unknown, HTMLElement, any>;
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
        this.linearLine = this.plotContainer.append('line')
            .attr('stroke', Colors.gray["500"])
            .attr('x1', this.xScale.range()[0])
            .attr('x2', this.xScale.range()[1])
            .attr('y1', this.yScale(1))
            .attr('y2', this.yScale(1));
        this.path = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.blue["100"])
            .attr('stroke-width', 1.5);
        this.pathRolling = this.plotContainer.append('path')
            .attr('fill', 'none')
            .attr('stroke', Colors.blue["700"])
            .attr('stroke-width', 1.5);
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
        this.path
            .datum(entries.filter(entry => entry.getNetReproductionNumber() != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getNetReproductionNumber() as number))
            );
        this.pathRolling
            .datum(entries.filter(entry => entry.getMovingAverageCentered(entry.getNetReproductionNumber) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(d.getMovingAverageCentered(d.getNetReproductionNumber) as number))
            );
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        // return d3.extent(
        //     entries.filter(entry => entry.getNetReproductionNumber() != null), d => d.getNetReproductionNumber()) as [number, number]
        return [0, 10];
    }
}