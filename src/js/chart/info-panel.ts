import {DayDatum} from "../day-datum";
import {Colors} from "./colors";
import * as d3 from 'd3';

export class InfoPanel
{
    private confirmedNumberSelection: d3.Selection<HTMLDivElement, DayDatum, HTMLElement, any>;
    private deathsNumberSelection: d3.Selection<HTMLDivElement, DayDatum, HTMLElement, any>;
    private pendingNumberSelection: d3.Selection<HTMLDivElement, DayDatum, HTMLElement, any>;
    private recoveredNumberSelection: d3.Selection<HTMLDivElement, DayDatum, HTMLElement, any>;
    private deathRatePercentageSelection: d3.Selection<HTMLDivElement, DayDatum, HTMLElement, any>;
    private defaultNumberFormat = d3.format(',');
    private percentageFormat = d3.format('.2%');

    constructor(private parentSelection: d3.Selection<any, DayDatum, HTMLElement, any>)
    {
        let confirmedSelection = parentSelection.append('div').classed('flex-lg-fill mb-4 mb-lg-0', true);
        confirmedSelection.append('h2').html('Total');
        this.confirmedNumberSelection = confirmedSelection
            .append('div')
            .classed('display-4', true)
            .style('color', Colors.gray["700"])
            .html(d => this.defaultNumberFormat(d.getConfirmed()));

        let pendingSelection = parentSelection.append('div').classed('flex-lg-fill mb-4 mb-lg-0', true);
        pendingSelection.append('h2').html('Pending');
        this.pendingNumberSelection = pendingSelection
            .append('div')
            .classed('display-4', true)
            .style('color', Colors.blue["700"])
            .html(d => this.defaultNumberFormat(d.getPending()));

        let recoveredSelection = parentSelection.append('div').classed('flex-lg-fill mb-4 mb-lg-0', true);
        recoveredSelection.append('h2').html('Recovered');
        this.recoveredNumberSelection = recoveredSelection
            .append('div')
            .classed('display-4', true)
            .style('color', Colors.green["700"])
            .html(d => this.defaultNumberFormat(d.getRecovered()));

        let deathsSelection = parentSelection.append('div').classed('flex-lg-fill mb-4 mb-lg-0', true);
        deathsSelection.append('h2').html('Deaths');
        this.deathsNumberSelection = deathsSelection
            .append('div')
            .classed('display-4', true)
            .style('color', Colors.red["700"])
            .html(d => this.defaultNumberFormat(d.deaths));

        let deathRateSelection = parentSelection.append('div').classed('flex-lg-fill', true);
        deathRateSelection.append('h2').html('Death Rate');
        this.deathRatePercentageSelection = deathRateSelection
            .append('div')
            .classed('display-4', true)
            .html(d => this.percentageFormat(d.getDeathRate()));
    }

    public update(lastEntry: DayDatum)
    {
        this.parentSelection.selectAll('.display-4').datum(lastEntry);
        this.confirmedNumberSelection.html(d => this.defaultNumberFormat(d.getConfirmed()));
        this.deathsNumberSelection.html(d => this.defaultNumberFormat(d.deaths));
        this.pendingNumberSelection.html(d => this.defaultNumberFormat(d.getPending()));
        this.recoveredNumberSelection.html(d => this.defaultNumberFormat(d.getRecovered()));
        this.deathRatePercentageSelection.html(d => this.percentageFormat(d.getDeathRate()));
    }
}
