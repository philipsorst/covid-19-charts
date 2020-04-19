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
    private minNumConfirmed = 100;
    private minVal = 0.0;

    constructor(
        parent: d3.Selection<any, any, any, any>,
        width: number,
        height: number,
        margin: Margin,
        initialXDomain: [Date, Date] = [new Date(), new Date()],
        initialYDomain: [number, number] = [0.0, 1])
    {
        super(parent, width, height, margin, initialXDomain, initialYDomain);
    }

    /**
     * @inheritDoc
     */
    protected addPlots()
    {
        console.log(this.xScale.range()[0], this.xScale.range()[0], this.yScale(1))

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
            .datum(entries
                .filter(entry => entry.confirmed > this.minNumConfirmed)
                .filter(entry => entry.getNetReproductionNumber() != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(Math.max(this.minVal, d.getNetReproductionNumber() as number)))
            );
        this.pathRolling
            .datum(entries
                .filter(entry => entry.confirmed > this.minNumConfirmed)
                .filter(entry => entry.getMovingAverageCentered(entry.getNetReproductionNumber, 3) != null))
            .transition(this.transition)
            .attr('d', d3.line<DayDatum>()
                .x(d => this.xScale(d.date))
                .y(d => this.yScale(Math.max(this.minVal, d.getMovingAverageCentered(d.getNetReproductionNumber, 3) as number)))
            );
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        const max = d3.max(
            entries
                .filter(entry => entry.confirmed > this.minNumConfirmed)
                .filter(
                    entry => entry.getNetReproductionNumber() != null),
            d => d.getNetReproductionNumber()
        ) as number;
        let extend: [number, number] = [this.minVal, max];

        if (null == extend[0] || null == extend[1]) extend = [this.minVal, 1];
        console.log('extend', extend);

        return extend;
    }

    /**
     * @inheritDoc
     */
    protected createYScale(initialYDomain: [number, number]): d3.ScaleContinuousNumeric<number, number>
    {
        return d3.scaleSymlog().constant(0.125)
            // return d3.scaleLinear()
            // return d3.scaleLog()
            //     .base(10)
            .domain(initialYDomain)
            .range([this.getInnerHeight(), 0]);
    }

    /**
     * @inheritDoc
     */
    protected createYAxis(): d3.Axis<number>
    {
        return super
            .createYAxis()
            .tickValues([0.25, 0.5, 1, 2, 4, 8])
            .tickFormat(d3.format('.2'));
    }
}
