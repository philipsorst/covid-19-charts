import {DayDatum} from "../day-datum";
import {Colors} from "./colors";
import * as d3 from 'd3';

export class InfoPanel
{
    private confirmedNumberSelection: d3.Selection<HTMLDivElement, DayDatum, HTMLElement, any>;
    private deathsNumberSelection: d3.Selection<HTMLDivElement, DayDatum, HTMLElement, any>;
    private deathRatePercentageSelection: d3.Selection<HTMLDivElement, DayDatum, HTMLElement, any>;
    private defaultNumberFormat = d3.format(',');
    private percentageFormat = d3.format('.2%');

    constructor(parentSelection: d3.Selection<HTMLDivElement, DayDatum, HTMLElement, any>)
    {
        let confirmedSelection = parentSelection.append('div').classed('flex-lg-fill', true);
        confirmedSelection.append('h3').html('Confirmed');
        this.confirmedNumberSelection = confirmedSelection
            .append('div')
            .classed('display-4', true)
            .html(d => this.defaultNumberFormat(d.getConfirmed()));

        let deathsSelection = parentSelection.append('div').classed('flex-lg-fill', true);
        deathsSelection.append('h3').html('Deaths');
        this.deathsNumberSelection = deathsSelection.append('div').classed('display-4', true)
            .style('color', Colors.red["700"])
            .html(d => this.defaultNumberFormat(d.deaths));

        let deathRateSelection = parentSelection.append('div').classed('flex-lg-fill', true);
        deathRateSelection.append('h3').html('Death Rate');
        this.deathRatePercentageSelection = deathRateSelection.append('div').classed('display-4', true)
            .html(d => this.percentageFormat(d.getDeathRate()));
    }
}
