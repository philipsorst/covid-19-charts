import {AxisChart} from "./axis-chart";
import {DayDatum} from "../day-datum";
import * as d3 from "d3";
import {Margin} from "./margin";

export class MainChartStacked extends AxisChart
{
    private areaSelection: d3.Selection<SVGPathElement, unknown, HTMLElement, any>;

    constructor(parent: d3.Selection<any, any, any, any>,
                width: number,
                height: number,
                margin: Margin,
                initialXDomain: [Date, Date] = [new Date(), new Date()],
                initialYDomain: [number, number] = [0, 1])
    {
        super(parent, width, height, margin, initialXDomain, initialYDomain);

        this.areaSelection = this.plotContainer.append("path");
    }

    /**
     * @inheritDoc
     */
    public update(entries: DayDatum[])
    {
        super.update(entries);

        let series = d3.stack<any, DayDatum, string>().keys(['deaths', 'recovered', 'pending']).value((d, key) => {
            switch (key) {
                case('deaths'):
                    return d.deaths;
                case('recovered'):
                    return d.recovered;
                case('pending'):
                    return d.getPending();
            }
            return 0;
        })(entries);

        console.log(series);

        let area = d3.area<any>()
            .x(d => this.xScale(d.data.date))
            .y0(d => this.yScale(d[0]))
            .y1(d => this.yScale(d[1]));

        function color(key: string)
        {
            switch (key) {
                case('deaths'):
                    return '#ff0000';
                case('recovered'):
                    return '#00ff00';
                case('pending'):
                    return '#0000ff';
            }
            return '#000000';
        }

        this.areaSelection
            .data(series)
            .join('path')
            .transition()
            .attr('fill', ({key}) => color(key))
            .attr('d', area);
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        return [0, d3.max(entries, d => d.confirmed) as number]
    }
}
