import {Component, OnInit} from "@angular/core";
import {CountryService} from "./country.service";

@Component({
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit
{
    constructor(private countryService: CountryService)
    {
    }

    /**
     * @override
     */
    public ngOnInit()
    {
        this.countries$ = this.countryService.list();
    }
}
