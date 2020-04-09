import {CircleMap} from "./map/circle-map";
import 'bootstrap';
import {CountryData} from "./country-data";
import {CovidData} from "./covid-data";
import {Utils} from "./utils";
import * as d3 from "d3";
import {Margin} from "./chart/margin";
import {DeathRateChart} from "./chart/death-rate-chart";
import {Location} from "./location";
import {DayDatum} from "./day-datum";
import {InfoPanel} from "./chart/info-panel";
import {CasesChart} from "./chart/cases-chart";
import {GrowthChart} from "./chart/growth-chart";
import {NetReproductionNumberChart} from "./chart/net-reproduction-number-chart";
import {Country} from "./country";

import '../scss/dashboard.scss';

class Dashboard
{
    private contentSelection: d3.Selection<HTMLDivElement, unknown, HTMLElement, any>;
    private plotMargin = new Margin(5, 1, 25, 60);
    private mainChart!: CasesChart;
    // private growthPercentageChangeChart!: GrowthPercentageChangeChart;
    private netReproductionNumberChart!: NetReproductionNumberChart;
    private growthChart!: GrowthChart;
    // private growthPercentageChart!: GrowthPercentageChart;
    private deathRateChart!: DeathRateChart;
    private circleMap!: CircleMap;
    private infoPanel!: InfoPanel;

    private casesInfoParentSelection!: d3.Selection<any, any, any, any>;
    private mapParentSelection!: d3.Selection<any, any, any, any>;
    private casesChartParentSelection!: d3.Selection<any, any, any, any>;
    // private growthPercentageChangeChartParentSelection!: d3.Selection<any, any, any, any>;
    private deathRateChartParentSelection!: d3.Selection<any, any, any, any>;
    private netReproductionNumberChartParentSelection!: d3.Selection<any, any, any, any>;
    private growthChartParentSelection!: d3.Selection<any, any, any, any>;

    // private growthPercentageChartParentSelection!: d3.Selection<any, any, any, any>;

    constructor(private covidData: CovidData, private countryData: CountryData, private worldData: any)
    {
        this.contentSelection = d3.select('#content');
        this.initCountrySelect();
        this.createHtmlLayout();
        this.createVisualizations();
    }

    private initCountrySelect()
    {
        const countries: Array<Country | null> = this.covidData.getCountryCodes()
            .filter(countryCode => this.countryData.getCountry(countryCode) != null)
            .map((countryCode => this.countryData.getCountry(countryCode) as Country));
        countries.sort((a, b) => (a as Country).name.localeCompare((b as Country).name));
        countries.unshift(null);

        const self = this;
        const countrySelections = d3.select('.country-select .country')
            .selectAll('div')
            .data(countries)
            .enter()
            .append('a')
            .attr('href', '#')
            .classed('dropdown-item', true)
            .on('click', d => {
                d3.select('#country-filter').property('value', '');
                filter('');
                self.setCountry(d)
            })
            .html(d => null == d ? 'Global' : d.name);

        function filter(filterText: string)
        {
            d3.selectAll<HTMLAnchorElement, Country | null>('.country-select .country a')
                .style('display', d => {
                    if (null == d || d.name.toLowerCase().includes(filterText.toLowerCase()) || filterText.trim() === '') return null;
                    return 'none';
                });
        }

        d3.select('#country-filter').on('input', d => {
            const filterText: string = d3.select('#country-filter').property('value');
            filter(filterText);
        });
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
            .html('Pending');
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

        let netReproductionNumberSelection = rightColumnSelection.append('section')
            .classed('card flex-lg-fill d-lg-flex flex-lg-column', true);
        netReproductionNumberSelection
            .append('h2')
            .classed('h4 card-header', true)
            .html('Net Reproduction Number');
        this.netReproductionNumberChartParentSelection = netReproductionNumberSelection
            .append('div')
            .classed('flex-lg-grow-1', true);

        let growthSectionSelection = rightColumnSelection.append('section')
            .classed('card flex-lg-fill d-lg-flex flex-lg-column', true);
        growthSectionSelection
            .append('h2')
            .classed('h4 card-header', true)
            .html('Growth');
        this.growthChartParentSelection = growthSectionSelection
            .append('div')
            .classed('flex-lg-grow-1', true);

        // let growthPercentageSectionSelection = rightColumnSelection.append('section')
        //     .classed('card flex-lg-fill d-lg-flex flex-lg-column', true);
        // growthPercentageSectionSelection
        //     .append('h2')
        //     .classed('h4 card-header', true)
        //     .html('Growth Percentage');
        // this.growthPercentageChartParentSelection = growthPercentageSectionSelection
        //     .append('div')
        //     .classed('flex-lg-grow-1', true);

        // let growthPercentageChangeSectionSelection = rightColumnSelection.append('section')
        //     .classed('card flex-lg-fill d-lg-flex flex-lg-column', true);
        // growthPercentageChangeSectionSelection
        //     .append('h2')
        //     .classed('h4 card-header', true)
        //     .html('Growth Percentage Change');
        // this.growthPercentageChangeChartParentSelection = growthPercentageChangeSectionSelection
        //     .append('div')
        //     .classed('flex-lg-grow-1', true);

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
        // const growthPercentageChangeChartBounds = Utils.getBoundingClientRect(this.growthPercentageChangeChartParentSelection);
        // const growthPercentageChartBounds = Utils.getBoundingClientRect(this.growthPercentageChartParentSelection);
        const netReproductionNumberChartBounds = Utils.getBoundingClientRect(this.netReproductionNumberChartParentSelection);
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
            this.countryData,
            this.worldData
        );
        let circleData = this.getCircleMapLastDayData();
        this.circleMap.update(circleData);

        this.netReproductionNumberChart = new NetReproductionNumberChart(
            this.netReproductionNumberChartParentSelection,
            growthChartBounds.width,
            netReproductionNumberChartBounds.height < 150 ? 150 : netReproductionNumberChartBounds.height,
            this.plotMargin,
            d3.extent(this.covidData.getGlobalDayData(), d => d.date) as [Date, Date],
            [0, 3]
            // [0, d3.max(this.covidData.getGlobalDayData(), d => d.getNetReproductionNumber()) as number]
        );

        this.growthChart = new GrowthChart(
            this.growthChartParentSelection,
            growthChartBounds.width,
            growthChartBounds.height < 150 ? 150 : growthChartBounds.height,
            this.plotMargin,
            d3.extent(this.covidData.getGlobalDayData(), d => d.date) as [Date, Date],
            [0, d3.max(this.covidData.getGlobalDayData(), d => d.getConfirmedGrowth()) as number]
        );

        // this.growthPercentageChart = new GrowthPercentageChart(
        //     this.growthPercentageChartParentSelection,
        //     growthChartBounds.width,
        //     growthPercentageChartBounds.height < 150 ? 150 : growthPercentageChartBounds.height,
        //     this.plotMargin,
        //     d3.extent(this.covidData.getGlobalDayData(), d => d.date) as [Date, Date],
        //     [0, d3.max(this.covidData.getGlobalDayData(), d => d.getGrowthPercentage()) as number]
        // );
        //
        // this.growthPercentageChangeChart = new GrowthPercentageChangeChart(
        //     this.growthPercentageChangeChartParentSelection,
        //     growthPercentageChangeChartBounds.width,
        //     growthPercentageChangeChartBounds.height < 150 ? 150 : growthPercentageChangeChartBounds.height,
        //     this.plotMargin,
        //     d3.extent(this.covidData.getGlobalDayData(), d => d.date) as [Date, Date],
        //     [0, d3.max(this.covidData.getGlobalDayData(), d => d.getGrowthChange()) as number]
        // );

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
        // this.growthPercentageChangeChart.update(dayData);
        // this.growthPercentageChart.update(dayData);
        this.infoPanel.update(lastEntry);
        this.netReproductionNumberChart.update(dayData);
    }

    public setCountry(country: Country | null)
    {
        if (null == country) {
            d3.select('#current-location').html('Global');
            history.pushState({}, 'Global', './');
        } else {
            d3.select('#current-location').html(country.name);
            history.pushState({}, country.name, './' + country.code);
        }

        const dayData = this.getDayDataByCountry(country);
        const lastEntry = dayData[dayData.length - 1];
        this.mainChart.update(dayData);
        this.growthChart.update(dayData);
        this.deathRateChart.update(dayData);
        // this.growthPercentageChangeChart.update(dayData);
        // this.growthPercentageChart.update(dayData);
        this.infoPanel.update(lastEntry);
        this.netReproductionNumberChart.update(dayData);
        this.circleMap.setCountry(country);
    }

    private getDayDataByCountry(country: Country | null): DayDatum[]
    {
        if (null == country) {
            return this.covidData.getGlobalDayData();
        }

        return this.covidData.getDayData(country.code);
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
                d3.json('./build/world-atlas/countries-50m.json')
            ]).then(([covidData, worldData]) => {
                return {covidData, countryData, worldData};
            })
        });
    }
}

d3.select('#content')
    .append('div')
    .classed('text-center col-12', true)
    .html('Loading...');
DashboardLoader.load().then(data => {
    d3.select('#content').selectAll('*').remove();
    const dashboard = new Dashboard(data.covidData, data.countryData, data.worldData);
    let pathMatchEx = /.*\/(.*)$/;
    let country = null;
    let match = window.location.pathname.match(pathMatchEx);
    if (null != match) {
        let countryCode = match[1];
        country = data.countryData.getCountry(countryCode);
    }

    dashboard.setCountry(country)
});
