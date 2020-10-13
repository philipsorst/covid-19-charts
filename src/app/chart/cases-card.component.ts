import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {CovidService} from '../covid/covid.service';
import {Country} from '../country/country';

@Component({
    selector: '[ddr-covid-cases-card]',
    templateUrl: './cases-card.component.html',
    host: {'class': 'card'}
})
export class CasesCardComponent implements OnChanges
{
    @Input()
    private country: Country | null;

    @Input()
    private startDate: Date;

    @Input()
    private endDate: Date;

    constructor(private covidService: CovidService)
    {
    }

    /**
     * @override
     */
    public ngOnChanges(changes: SimpleChanges)
    {
        console.log('CHANGES', changes);
    }
}
