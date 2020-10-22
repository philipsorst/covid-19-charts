import {Component, OnInit} from '@angular/core';
import {CountryService} from "../country/country.service";
import {Colors} from "../../js/chart/colors";
import * as TopoJsonClient from "topojson-client";
import {GeometryCollection} from "topojson-specification";
import {CountryWithGeoFeature} from "../../js/country-with-geo-feature";
import * as d3 from "d3";
import {WorldAtlasService} from "../world-atlas/world-atlas.service";
import {MapCountryCodeMapper} from "../../js/map/map-country-code-mapper";

@Component({
    selector: '[id=ddr-covid-map-card]',
    templateUrl: './map-card.component.html',
    host: {'class': 'card'}
})
export class MapCardComponent implements OnInit
{
    constructor(private countryService: CountryService, private worldAtlasService: WorldAtlasService)
    {
    }

    /**
     * @override
     */
    public ngOnInit(): void
    {
        this.worldAtlasService.loadTopology().subscribe({
            next: (topoJson) => {
                const countryMapper = new MapCountryCodeMapper()
                const globalFeatureCollection = TopoJsonClient.feature<{ name: string }>(topoJson, topoJson.objects.countries as GeometryCollection<{ name: string }>);
                this.countries = globalFeatureCollection.features
                    .filter(feature => {
                        const code = this.countryMapper.getCode(feature.properties.name);
                        if (null == code) {
                            console.warn(`No code found for ${feature.properties.name}`);
                            return false;
                        }
                        return null != this.countryService.getCountry(code);
                    })
                    .map((feature) =>
                        new CountryWithGeoFeature(countryData.fetchCountry(this.countryMapper.getCode(feature.properties.name) as string), feature)
                    );

                this.projection = d3.geoNaturalEarth1();
                this.countryPath = d3.geoPath().projection(this.projection);

                this.globalBounds = this.countryPath.bounds(globalFeatureCollection);

                this.svg = container.append('svg')
                    .attr('width', this.width)
                    .attr('height', this.height);

                this.innerContainer = this.svg.append('g');

                this.countryPaths = this.innerContainer
                    .selectAll('path')
                    .data(this.countries)
                    .enter()
                    .append('path')
                    .attr('d', d => this.countryPath(d.feature))
                    .attr('stroke', Colors.gray["500"])
                    .attr('fill', Colors.gray["100"])
                    .attr('vector-effect', 'non-scaling-stroke');

                this.zoom = d3.zoom<SVGSVGElement, any>()
                    .scaleExtent([0.1, 8])
                    .on('zoom', () => this.innerContainer.attr('transform', d3.event.transform));
            }
        });

        // this.countryPaths = this.innerContainer
        //     .selectAll('path')
        //     .data(this.countries)
        //     .enter()
        //     .append('path')
        //     .attr('d', d => this.countryPath(d.feature))
        //     .attr('stroke', Colors.gray["500"])
        //     .attr('fill', Colors.gray["100"])
        //     .attr('vector-effect', 'non-scaling-stroke');
    }
}
