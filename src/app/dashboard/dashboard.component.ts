import {Component, OnInit} from "@angular/core";
import {BehaviorSubject, Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Country} from '../country/country';
import {CountryService} from '../country/country.service';
import {CovidService} from '../covid/covid.service';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit
{
    public selectedCountry$ = new BehaviorSubject<Country | null>(null);

    public countries$: Observable<Country[]>;

    constructor(
        private countryService: CountryService, private route: ActivatedRoute, private covidService: CovidService)
    {
    }

    /**
     * @override
     */
    public ngOnInit()
    {
        this.countries$ = this.countryService.list();

        this.route.paramMap.subscribe(paramMap => console.log('CountryCode', paramMap.get('countryCode')));
    }

    public selectCountry(country: Country | null)
    {
        this.selectedCountry$.next(country);
    }
}
