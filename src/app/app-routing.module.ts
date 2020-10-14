import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'dashboard/',
        pathMatch: 'full'
    },
    {
        path: 'dashboard',
        redirectTo: 'dashboard/',
        pathMatch: 'full'
    },
    {
        path: 'dashboard/:countryCode',
        component: DashboardComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule
{
}
