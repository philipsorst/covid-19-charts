import {CircleMap} from "./map/circle-map";
import {json as d3_json} from 'd3-fetch';
import {select as d3_select} from 'd3-selection';

import {CountryData} from "./country-data";
import {CovidData} from "./covid-data";
import {Utils} from "./utils";
import * as d3 from "d3";
import {Margin} from "./chart/margin";
import {GrowthPercentageChangeChart} from "./chart/growth-percentage-change-chart";
import {DeathRateChart} from "./chart/death-rate-chart";
import {Location} from "./location";
import {DayDatum} from "./day-datum";
import {InfoPanel} from "./chart/info-panel";
import {MainChart} from "./chart/main-chart";

require('../scss/charts.scss');

class Dashboard
{
    private contentSelection: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    private plotMargin = new Margin(5, 1, 30, 60);
    private mainChart!: MainChart;
    private growthChangeChart!: GrowthPercentageChangeChart;
    private deathRateChart!: DeathRateChart;
    private circleMap!: CircleMap;
    private infoPanel!: InfoPanel;

    constructor(private covidData: CovidData, private counryData: CountryData, private worldData: any)
    {
        this.contentSelection = d3_select('#content');

        let leftColumnSelection = this.contentSelection.append('div')
            .classed('col-lg-5 d-lg-flex flex-lg-column', true);
        this.createInfo(leftColumnSelection);
        this.createElementMap(leftColumnSelection);

        this.createElementCharts();
    }

    private createInfo<T extends HTMLElement>(parentSelection: d3.Selection<T, unknown, HTMLElement, any>)
    {
        const lastEntry = this.covidData.getGlobalDayData()[this.covidData.getGlobalDayData().length - 1];
        let divSelection = parentSelection.append('div')
            .classed('d-flex flex-lg-row text-center', true)
            .datum(lastEntry);
        this.infoPanel = new InfoPanel(divSelection);
    }

    private createElementMap<T extends HTMLElement>(parentSelection: d3.Selection<T, unknown, HTMLElement, any>)
    {
        let divSelection = parentSelection.append('div')
            .classed('flex-lg-grow-1', true);
        this.circleMap = new CircleMap(divSelection, this.worldData);

        let circleData = new Array<{ location: Location, dayDatum: DayDatum }>();
        this.covidData.getLocations().forEach(location => {
            const dayData = this.covidData.fetchLocationDayData(location);
            if (dayData.length > 0) {
                const lastEntry = dayData[dayData.length - 1];
                if (lastEntry.getPending() > 0) {
                    circleData.push({
                        location: location,
                        dayDatum: lastEntry
                    })
                }
            }
        });
        this.circleMap.update(circleData);
    }

    private createElementCharts()
    {
        let chartsContainer = this.contentSelection.append('div')
            .classed('col-lg-7 d-lg-flex flex-lg-column', true);

        this.createElementGrowthChangeChart(chartsContainer);
        this.createDeathRateChart(chartsContainer);
        this.createElementMainChart(chartsContainer);

        this.mainChart.update(this.covidData.getGlobalDayData());
        this.deathRateChart.update(this.covidData.getGlobalDayData());
        this.growthChangeChart.update(this.covidData.getGlobalDayData());
    }

    private createElementMainChart(chartsContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>)
    {
        let mainChartSection = chartsContainer
            .append('section')
            .classed('flex-lg-grow-1 d-lg-flex flex-lg-column mb-4', true);

        mainChartSection.append('h3').classed('text-center mb-1', true).html('Cases');

        let mainChartContainer = mainChartSection.append('div').classed('flex-lg-grow-1', true);

        const boundingClientRect = Utils.getBoundingClientRect(mainChartContainer);
        this.mainChart = new MainChart(
            mainChartContainer,
            boundingClientRect.width,
            boundingClientRect.height < 150 ? 150 : boundingClientRect.height,
            this.plotMargin,
            d3.extent(this.getCovidData().getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.getCovidData().getGlobalDayData(), d => d.confirmed) as number]
        );
    }

    private createElementGrowthChangeChart(chartsContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>)
    {
        let sectionSelection = chartsContainer
            .append('section')
            .classed('d-lg-flex flex-lg-column mb-4', true);

        sectionSelection.append('h3').classed('text-center mb-1', true).html('Growth Change');

        let divSelection = sectionSelection.append('div').classed('flex-lg-grow-1', true);


        const boundingClientRect = Utils.getBoundingClientRect(divSelection);
        this.growthChangeChart = new GrowthPercentageChangeChart(
            divSelection,
            boundingClientRect.width,
            150,
            this.plotMargin,
            d3.extent(this.getCovidData().getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.getCovidData().getGlobalDayData(), d => d.getGrowthChange()) as number]
        );
    }

    private createDeathRateChart(chartsContainer: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>)
    {
        let sectionSelection = chartsContainer
            .append('section')
            .classed('d-lg-flex flex-lg-column mb-4', true);

        sectionSelection.append('h3').classed('text-center mb-1', true).html('Death Rate');

        let divSelection = sectionSelection.append('div').classed('flex-lg-grow-1', true);

        const boundingClientRect = Utils.getBoundingClientRect(divSelection);
        this.deathRateChart = new DeathRateChart(
            divSelection,
            boundingClientRect.width,
            150,
            this.plotMargin,
            d3.extent(this.getCovidData().getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.getCovidData().getGlobalDayData(), d => d.getDeathRate()) as number]
        );
    }

    private getCovidData(): CovidData
    {
        return this.covidData as CovidData;
    }
}

class DashboardLoader
{
    public static load(): Promise<{ covidData: CovidData, countryData: CountryData, worldData: any }>
    {
        return CountryData.load().then(countryData => {
            return Promise.all([
                CovidData.load(countryData),
                d3_json('./build/world-atlas/countries-110m.json')
            ]).then(([covidData, worldData]) => {
                return {covidData, countryData, worldData};
            })
        });
    }
}

d3_select('#content').append('div').classed('text-center col-12', true).html('Loading...');
DashboardLoader.load().then(data => {
    d3_select('#content').selectAll('*').remove();
    new Dashboard(data.covidData, data.countryData, data.worldData);
});
