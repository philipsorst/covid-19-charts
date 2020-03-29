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
import {CasesChart} from "./chart/cases-chart";

require('../scss/charts.scss');

class Dashboard
{
    private contentSelection: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    private plotMargin = new Margin(5, 1, 25, 60);
    private mainChart!: CasesChart;
    private growthChangeChart!: GrowthPercentageChangeChart;
    private deathRateChart!: DeathRateChart;
    private circleMap!: CircleMap;
    private infoPanel!: InfoPanel;

    private casesInfoParentSelection!: d3.Selection<any, any, any, any>;
    private mapParentSelection!: d3.Selection<any, any, any, any>;
    private casesChartParentSelection!: d3.Selection<any, any, any, any>;
    private growthPercentageChangeChartParentSelection!: d3.Selection<any, any, any, any>;
    private deathRateParentChartSelection!: d3.Selection<any, any, any, any>;

    constructor(private covidData: CovidData, private counryData: CountryData, private worldData: any)
    {
        this.contentSelection = d3_select('#content');
        this.createHtmlLayout();
        this.createVisualizations();

        // this.createElementGrowthChangeChart(growthPercentageChangeSectionSelection);
        // this.createDeathRateChart(deathRateSectionSelection);
        // this.createInfo(infoSectionSelection);
        // this.createElementMap(mapSectionSelection);
        // this.createElementMainChart(mainChartContainerSelection);
    }

    private createHtmlLayout()
    {
        /* Left column */
        let leftColumnSelection = this.contentSelection.append('div')
            .classed('col-lg-6 d-lg-flex flex-lg-column', true);

        this.mapParentSelection = leftColumnSelection.append('section')
            .classed('flex-lg-grow-1 d-lg-flex flex-lg-column', true);

        this.casesInfoParentSelection = leftColumnSelection.append('section')
            .classed('d-flex flex-column flex-lg-row text-center', true);

        let mainChartSectionSelection = leftColumnSelection.append('section')
            .classed('flex-lg-grow-1 d-lg-flex flex-lg-column', true);
        this.casesChartParentSelection = mainChartSectionSelection
            .append('div')
            .classed('flex-lg-grow-1', true);
        mainChartSectionSelection.append('h2').classed('h4', true).html('Cases');

        /* Right column */
        let rightColumnSelection = this.contentSelection.append('div')
            .classed('col-lg-6 d-lg-flex flex-lg-column', true);

        let growthPercentageChangeSectionSelection = rightColumnSelection.append('section')
            .classed('flex-lg-fill d-lg-flex flex-lg-column', true);
        this.growthPercentageChangeChartParentSelection = growthPercentageChangeSectionSelection
            .append('div')
            .classed('flex-lg-grow-1', true);
        growthPercentageChangeSectionSelection.append('h2').classed('h4', true).html('Growth Percentage Change');

        let deathRateSectionSelection = rightColumnSelection.append('section')
            .classed('flex-lg-fill d-lg-flex flex-lg-column', true);
        this.deathRateParentChartSelection = deathRateSectionSelection
            .append('div')
            .classed('flex-lg-grow-1', true);
        deathRateSectionSelection.append('h2').classed('h4', true).html('Death Rate');
    }

    private createVisualizations()
    {
        /* Info first so we now how much space it uses */
        const lastEntry = this.covidData.getGlobalDayData()[this.covidData.getGlobalDayData().length - 1];
        this.infoPanel = new InfoPanel(this.casesInfoParentSelection.datum(lastEntry));

        /* Precompute bounding boxes */
        const mapBounds = Utils.getBoundingClientRect(this.mapParentSelection);
        const casesChartBounds = Utils.getBoundingClientRect(this.casesChartParentSelection);
        const growthPercentageChangeChartBounds = Utils.getBoundingClientRect(this.growthPercentageChangeChartParentSelection);
        const deathRateChartBounds = Utils.getBoundingClientRect(this.deathRateParentChartSelection);

        this.mainChart = new CasesChart(
            this.casesChartParentSelection,
            casesChartBounds.width,
            casesChartBounds.height < 150 ? 150 : casesChartBounds.height,
            this.plotMargin,
            d3.extent(this.getCovidData().getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.getCovidData().getGlobalDayData(), d => d.confirmed) as number]
        );

        this.circleMap = new CircleMap(
            this.mapParentSelection,
            mapBounds.width,
            mapBounds.height < 300 ? 300 : mapBounds.height,
            this.worldData
        );
        let circleData = this.getCircleMapLastDayData();
        this.circleMap.update(circleData);

        this.growthChangeChart = new GrowthPercentageChangeChart(
            this.growthPercentageChangeChartParentSelection,
            growthPercentageChangeChartBounds.width,
            growthPercentageChangeChartBounds.height < 150 ? 150 : growthPercentageChangeChartBounds.height,
            this.plotMargin,
            d3.extent(this.getCovidData().getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.getCovidData().getGlobalDayData(), d => d.getGrowthChange()) as number]
        );

        this.deathRateChart = new DeathRateChart(
            this.deathRateParentChartSelection,
            deathRateChartBounds.width,
            deathRateChartBounds.height < 150 ? 150 : deathRateChartBounds.height,
            this.plotMargin,
            d3.extent(this.getCovidData().getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.getCovidData().getGlobalDayData(), d => d.getDeathRate()) as number]
        );

        this.mainChart.update(this.covidData.getGlobalDayData());
        this.deathRateChart.update(this.covidData.getGlobalDayData());
        this.growthChangeChart.update(this.covidData.getGlobalDayData());
    }

    private getCircleMapLastDayData()
    {
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
        return circleData;
    }

    private createElementMainChart<T extends HTMLElement>(parentSelection: d3.Selection<T, unknown, HTMLElement, any>)
    {
        const boundingClientRect = Utils.getBoundingClientRect(parentSelection);
        this.mainChart = new CasesChart(
            parentSelection,
            boundingClientRect.width,
            boundingClientRect.height < 150 ? 150 : boundingClientRect.height,
            this.plotMargin,
            d3.extent(this.getCovidData().getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.getCovidData().getGlobalDayData(), d => d.confirmed) as number]
        );
    }

    private createElementGrowthChangeChart<T extends HTMLElement>(parentSelection: d3.Selection<T, unknown, HTMLElement, any>)
    {
        const boundingClientRect = Utils.getBoundingClientRect(parentSelection);
        this.growthChangeChart = new GrowthPercentageChangeChart(
            parentSelection,
            boundingClientRect.width,
            boundingClientRect.height < 150 ? 150 : boundingClientRect.height,
            this.plotMargin,
            d3.extent(this.getCovidData().getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.getCovidData().getGlobalDayData(), d => d.getGrowthChange()) as number]
        );
    }

    private createDeathRateChart<T extends HTMLElement>(parentSelection: d3.Selection<T, unknown, HTMLElement, any>)
    {
        const boundingClientRect = Utils.getBoundingClientRect(parentSelection);
        this.deathRateChart = new DeathRateChart(
            parentSelection,
            boundingClientRect.width,
            boundingClientRect.height < 150 ? 150 : boundingClientRect.height,
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
