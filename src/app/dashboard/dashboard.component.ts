import {Component, OnInit} from "@angular/core";
import {Observable} from 'rxjs';
import {ActivatedRoute} from '@angular/router';
import {Country} from '../country/country';
import {CountryService} from '../country/country.service';

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit
{
    public countries$: Observable<Country[]>;

    constructor(private countryService: CountryService, private route: ActivatedRoute)
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
}
