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
import {GrowthChart} from "./chart/growth-chart";

require('../scss/charts.scss');

class Dashboard
{
    private contentSelection: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    private plotMargin = new Margin(5, 1, 25, 60);
    private mainChart!: CasesChart;
    private growthChangeChart!: GrowthPercentageChangeChart;
    private growthChart!: GrowthChart;
    private deathRateChart!: DeathRateChart;
    private circleMap!: CircleMap;
    private infoPanel!: InfoPanel;

    private casesInfoParentSelection!: d3.Selection<any, any, any, any>;
    private mapParentSelection!: d3.Selection<any, any, any, any>;
    private casesChartParentSelection!: d3.Selection<any, any, any, any>;
    private growthPercentageChangeChartParentSelection!: d3.Selection<any, any, any, any>;
    private deathRateChartParentSelection!: d3.Selection<any, any, any, any>;
    private growthChartParentSelection!: d3.Selection<any, any, any, any>;

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

        let mapSectionSelection = leftColumnSelection.append('section')
            .classed('card flex-lg-grow-1 d-lg-flex flex-lg-column', true);
        let mapTabsSelection = mapSectionSelection
            .append('div')
            .classed('card-header', true)
            .append('ul')
            .classed('nav nav-tabs card-header-tabs', true);
        mapTabsSelection
            .append('li')
            .classed('nav-item', true)
            .append('a')
            .classed('nav-link active', true)
            .attr('href', '#')
            .html('Confirmed');
        this.mapParentSelection = mapSectionSelection
            .append('div')
            .classed('flex-lg-grow-1', true);

        let casesInfoSectionSelection = leftColumnSelection.append('section')
            .classed('card', true);
        this.casesInfoParentSelection = casesInfoSectionSelection
            .append('div')
            .classed('card-body d-flex flex-column flex-lg-row text-center', true);

        let mainChartSectionSelection = leftColumnSelection.append('section')
            .classed('card flex-lg-grow-1 d-lg-flex flex-lg-column', true);
        mainChartSectionSelection
            .append('h2')
            .classed('h4 card-header', true)
            .html('Cases');
        this.casesChartParentSelection = mainChartSectionSelection
            .append('div')
            .classed('flex-lg-grow-1', true);

        /* Right column */
        let rightColumnSelection = this.contentSelection.append('div')
            .classed('col-lg-6 d-lg-flex flex-lg-column', true);

        let growthSectionSelection = rightColumnSelection.append('section')
            .classed('card flex-lg-fill d-lg-flex flex-lg-column', true);
        growthSectionSelection
            .append('h2')
            .classed('h4 card-header', true)
            .html('Growth');
        this.growthChartParentSelection = growthSectionSelection
            .append('div')
            .classed('flex-lg-grow-1', true);

        let growthPercentageChangeSectionSelection = rightColumnSelection.append('section')
            .classed('card flex-lg-fill d-lg-flex flex-lg-column', true);
        growthPercentageChangeSectionSelection
            .append('h2')
            .classed('h4 card-header', true)
            .html('Growth Percentage Change');
        this.growthPercentageChangeChartParentSelection = growthPercentageChangeSectionSelection
            .append('div')
            .classed('flex-lg-grow-1', true);

        let deathRateSectionSelection = rightColumnSelection.append('section')
            .classed('card flex-lg-fill d-lg-flex flex-lg-column', true);
        deathRateSectionSelection
            .append('h2')
            .classed('h4 card-header', true)
            .html('Death Rate');
        this.deathRateChartParentSelection = deathRateSectionSelection
            .append('div')
            .classed('flex-lg-grow-1', true);
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
        const deathRateChartBounds = Utils.getBoundingClientRect(this.deathRateChartParentSelection);
        const growthChartBounds = Utils.getBoundingClientRect(this.growthChartParentSelection);

        this.mainChart = new CasesChart(
            this.casesChartParentSelection,
            casesChartBounds.width,
            casesChartBounds.height - 2 < 150 ? 150 : casesChartBounds.height - 2,
            this.plotMargin,
            d3.extent(this.covidData.getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.covidData.getGlobalDayData(), d => d.confirmed) as number]
        );

        this.circleMap = new CircleMap(
            this.mapParentSelection,
            mapBounds.width,
            mapBounds.height < 300 ? 300 : mapBounds.height,
            this.worldData
        );
        let circleData = this.getCircleMapLastDayData();
        this.circleMap.update(circleData);

        this.growthChart = new GrowthChart(
            this.growthChartParentSelection,
            growthChartBounds.width,
            growthChartBounds.height < 150 ? 150 : growthChartBounds.height,
            this.plotMargin,
            d3.extent(this.covidData.getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.covidData.getGlobalDayData(), d => d.getGrowth()) as number]
        );

        this.growthChangeChart = new GrowthPercentageChangeChart(
            this.growthPercentageChangeChartParentSelection,
            growthPercentageChangeChartBounds.width,
            growthPercentageChangeChartBounds.height < 150 ? 150 : growthPercentageChangeChartBounds.height,
            this.plotMargin,
            d3.extent(this.covidData.getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.covidData.getGlobalDayData(), d => d.getGrowthChange()) as number]
        );

        this.deathRateChart = new DeathRateChart(
            this.deathRateChartParentSelection,
            deathRateChartBounds.width,
            deathRateChartBounds.height < 150 ? 150 : deathRateChartBounds.height,
            this.plotMargin,
            d3.extent(this.covidData.getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.covidData.getGlobalDayData(), d => d.getDeathRate()) as number]
        );
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

    public setLocation(location: Location | null)
    {
        if (null == location) {
            d3.select('#current-location').html('Global');
        } else {
            let name = location.country.name;
            if (null != location.province && '' != location.province) {
                name += ' / ' + location.province;
            }
            d3.select('#current-location').html(name);
        }


        const dayData = this.getDayData(location);
        const lastEntry = dayData[dayData.length - 1];
        this.mainChart.update(dayData);
        this.growthChart.update(dayData);
        this.deathRateChart.update(dayData);
        this.growthChangeChart.update(dayData);
        this.infoPanel.update(lastEntry);
    }

    private getDayData(location: Location | null): DayDatum[]
    {
        if (null == location) {
            return this.covidData.getGlobalDayData();
        }

        return this.covidData.fetchLocationDayData(location);
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
    const dashboard = new Dashboard(data.covidData, data.countryData, data.worldData);
    let location = data.covidData.getLocations().filter(location => location.country.code === 'DE').pop() as Location;
    dashboard.setLocation(location)
});
