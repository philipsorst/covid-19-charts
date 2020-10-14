import {Directive, Input} from '@angular/core';
import {Country} from '../country/country';

@Directive({
    selector: '[id=ddr-covid-cases-chart]',
})
export class CasesChartComponent
{
    @Input()
    public country: Country;
}
