import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BsDropdownModule} from "ngx-bootstrap/dropdown";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {HttpClientModule} from '@angular/common/http';
import {DashboardComponent} from './dashboard/dashboard.component';
import {MapCardComponent} from './card/map-card.component';
import {ReactiveFormsModule} from '@angular/forms';
import {CasesChartComponent} from './chart/cases-chart.component';
import {CasesCardComponent} from './card/cases-card.component';
import {CasesInfoCardComponent} from "./card/cases-info-card.component";

@NgModule({
    declarations: [
        AppComponent,
        DashboardComponent,
        CasesInfoCardComponent,
        CasesCardComponent,
        MapCardComponent,
        CasesChartComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AppRoutingModule,
        HttpClientModule,
        BsDropdownModule.forRoot(),
        ReactiveFormsModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule
{
}
