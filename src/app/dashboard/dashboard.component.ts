import {Component, OnInit} from "@angular/core";
import {concat, Observable, of} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Country} from '../country/country';
import {CountryService} from '../country/country.service';
import {CovidService} from '../covid/covid.service';
import {map, tap} from 'rxjs/operators';
import {FormControl} from '@angular/forms';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit
{
    public selectedCountry$: Observable<Country>;
    public countries: Country[];
    public loaded$: Observable<boolean>;
    public countryFilterControl = new FormControl();
    public filteredCountries$: Observable<Country[]>;

    constructor(
        private route: ActivatedRoute,
        private covidService: CovidService,
        private countryService: CountryService
    )
    {
    }

    /**
     * @override
     */
    public ngOnInit()
    {
        this.loaded$ = this.covidService.load().pipe(
            tap(covidService => {
                this.countries = covidService.getCountryCodes()
                    .filter(countryCode => this.countryService.getCountry(countryCode) != null)
                    .map((countryCode => this.countryService.getCountry(countryCode) as Country));
            }),
            map(() => true)
        );

        this.filteredCountries$ = concat(of(null), this.countryFilterControl.valueChanges).pipe(
            map(filterValue => {
                if (null == filterValue || '' == filterValue.trim()) {
                    return this.countries;
                }

                return this.countries.filter(country => country.name.toLowerCase().includes(filterValue.toLowerCase()));
            })
        )

        this.selectedCountry$ = this.route.paramMap.pipe(
            map(paramMap => {
                const countryCode = paramMap.get('countryCode');
                console.log('CountryCode', countryCode);
                if (null == countryCode) {
                    return null;
                }

                return this.countryService.getCountry(countryCode);
            })
        )
    }
}
