import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CovidService} from '../covid/covid.service';
import {Country} from '../country/country';

@Component({
    selector: '[id=ddr-covid-cases-card]',
    templateUrl: './cases-card.component.html',
    host: {'class': 'card'}
})
export class CasesCardComponent implements OnChanges
{
    @Input()
    public country: Country | null;

    constructor(private covidService: CovidService)
    {
    }

    /**
     * @override
     */
    public ngOnChanges(changes: SimpleChanges)
    {
        console.log(changes, this.country);
    }
}
