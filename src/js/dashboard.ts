import {CircleMap} from "./map/circle-map";
import {json as d3_json} from 'd3-fetch';
import {select as d3_select} from 'd3-selection';

import {CountryData} from "./country-data";
import {CovidData} from "./covid-data";
import {MainChart} from "./chart/main-chart";
import {Utils} from "./utils";
import * as d3 from "d3";
import {Margin} from "./chart/margin";

require('../scss/charts.scss');

class Dashboard
{
    private contentSelection: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    private countryData: CountryData | undefined;
    private covidData: CovidData | undefined;
    private worldData: any | undefined;
    private plotMargin = new Margin(5, 1, 30, 60);

    constructor()
    {
        this.contentSelection = d3_select('#content');
        this.contentSelection.append('div').classed('text-center col-12', true).html('Loading...');
        this.loadData().then(() => {
            this.contentSelection.selectAll('*').remove();
            this.createElements();
        });
    }

    private loadData(): Promise<any>
    {
        return CountryData.load().then(countryData => {
            return Promise.all([
                CovidData.load(countryData),
                d3_json('./build/world-atlas/countries-110m.json')
            ]).then(([covidData, worldData]) => {
                this.countryData = countryData;
                this.covidData = covidData;
                this.worldData = worldData;
            });
        });
    }

    private createElements()
    {
        this.createElementMap();
        this.createElementCharts();
    }

    private createElementMap()
    {
        let mapContainer = this.contentSelection.append('div')
            .classed('col-lg-5 d-lg-flex flex-lg-column', true)
            .append('div')
            .classed('flex-lg-grow-1', true);
        new CircleMap(mapContainer, this.worldData);
    }

    private createElementCharts()
    {
        let chartsContainer = this.contentSelection.append('div')
            .classed('col-lg-7 d-lg-flex flex-lg-column', true);

        this.createElementMainChart(chartsContainer);
    }

    private createElementMainChart(chartsContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>)
    {
        let mainChartSection = chartsContainer
            .append('section')
            .classed('flex-lg-grow-1 d-lg-flex flex-lg-column mb-4', true);

        mainChartSection.append('h3').classed('text-center mb-1', true).html('Cases');

        let mainChartContainer = mainChartSection.append('div').classed('flex-lg-grow-1', true);


        const boundingClientRect = Utils.getBoundingClientRect(mainChartContainer);
        new MainChart(
            mainChartContainer,
            boundingClientRect.width,
            boundingClientRect.height < 150 ? 150 : boundingClientRect.height,
            this.plotMargin,
            d3.extent(this.getCovidData().getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.getCovidData().getGlobalDayData(), d => d.confirmed) as number]
        );
    }

    private getCovidData(): CovidData
    {
        return this.covidData as CovidData;
    }
}

new Dashboard();
