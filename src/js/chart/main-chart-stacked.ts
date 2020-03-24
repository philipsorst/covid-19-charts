import {AxisChart} from "./axis-chart";
import {DayDatum} from "../day-datum";
import * as d3 from "d3";
import {Margin} from "./margin";

class MainChartStacked extends AxisChart
{

    constructor(parent: d3.Selection<any, any, any, any>,
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
    public update(entries: DayDatum[])
    {
        super.update(entries);
    }

    /**
     * @inheritDoc
     */
    protected getYDomain(entries: DayDatum[]): [number, number]
    {
        return [0, d3.max(entries, d => d.confirmed) as number]
    }
}
