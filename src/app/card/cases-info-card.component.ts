import {Component, Input, OnChanges, SimpleChanges} from "@angular/core";
import {Country} from "../country/country";
import * as d3 from "d3";
import {CovidService} from "../covid/covid.service";

@Component({
    selector: '[id=ddr-covid-cases-info-card]',
    templateUrl: './cases-info-card.component.html',
    host: {'class': 'card'}
})
export class CasesInfoCardComponent implements OnChanges
{
    @Input()
    public country: Country | null;

    private defaultNumberFormat = d3.format(',');

    private percentageFormat = d3.format('.2%');

    constructor(private covidService: CovidService)
    {
    }

    /**
     * @override
     */
    public ngOnChanges(changes: SimpleChanges)
    {
        console.log(changes, this.country);

        const dayData = this.covidService.getDayData(this.country?.code);
        const lastEntry = dayData[dayData.length - 1];
        d3.select('#totalNumber').datum(lastEntry).html(d => this.defaultNumberFormat(d.getConfirmed()))
        d3.select('#deathsNumber').datum(lastEntry).html(d => this.defaultNumberFormat(d.deaths));
        d3.select('#pendingNumber').datum(lastEntry).html(d => this.defaultNumberFormat(d.getPending()));
        d3.select('#recoveredNumber').datum(lastEntry).html(d => this.defaultNumberFormat(d.getRecovered()));
        d3.select('#deathRatePercentage').datum(lastEntry).html(d => this.percentageFormat(d.getDeathRate()));
    }
}
