<template>
    <v-lazy>
        <v-img>
        <l-map 
            :zoom="zoom" 
            :center.sync="rectangle.center" 
            style="height: 300px; width: 100%" 
            ref="leafMap"
        >
            <l-control-layers
                position="bottomleft"
                :collapsed="true"
                :sort-layers="true"
            />
    <!--        <l-control position='topright'>-->
    <!--          <v-btn-->
    <!--              fab-->
    <!--              dark-->
    <!--              color="blue"-->
    <!--              small-->
    <!--          >-->
    <!--            <v-icon dark>-->
    <!--              mdi-plus-->
    <!--            </v-icon>-->
    <!--          </v-btn>-->

    <!--        </l-control>-->
            <!--    <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>-->
            <l-tile-layer
                v-for="tileProvider in tileProviders"
                :key="tileProvider.name"
                :name="tileProvider.name"
                :visible="tileProvider.visible"
                :url="tileProvider.url"
                :attribution="tileProvider.attribution"
                layer-type="base"
            />
            <l-rectangle 
                v-if="rectangle.visible" 
                :autoPan="true"
                :autofocus="true"
                :bounds.sync="rectangle.bounds"
                :draggable="true"
            ></l-rectangle>
        </l-map>
        </v-img>
    </v-lazy>
</template>

<script>
import { LMap, LTileLayer, LControlLayers, LRectangle } from 'vue2-leaflet'
import { LatLng, LatLngBounds } from "leaflet"
//import { LDraw } from 'leaflet-draw'
export default {
    name: "BboxEditor",
    components: {
        LMap,
        LTileLayer,
        LRectangle,
        LControlLayers,
    },
    props: {
        inputFeature: {},
    },
    data() {
        return {
            tileProviders: this.loadBasemaps(),
            zoom: 1.5,
            rectangle: {
                visible: false,
                center: [0, 0],
                bounds: [[0, 0], [0, 0]]
            }
            //elevation: this.inputFeature.coordinates? this.inputFeature.coordinates[2]: null,
        }
    },
    watch: {
        bounds: {
            handler(input) {
                this.$emit('geomUpdate', [input.getNorth(), input.getEast(), input.getSouth(), input.getWest()])
            },
            deep: true
        },
        inputFeature: {
            handler(input) {
                if (input.length === 4) {
                    var topleft = new LatLng(input[0], input[1])
                    var bottomright = new LatLng(input[2], input[3])
                    var tmp = new LatLngBounds(topleft, bottomright)
                    this.rectangle.center = tmp.getCenter()
                    this.rectangle.bounds = [tmp.getNorthWest(), tmp.getSouthEast()]
                    this.rectangle.visible = true
                }
                else {
                    this.rectangle.center = [0, 0]
                    this.rectangle.bounds = [[0, 0], [0, 0]]
                    this.rectangle.visible = false
                }
            },
            deep: true
        }
    },
    methods: {
        //refreshGeometry(someEvent) {
        //    console.log('refreshGeometry', someEvent)
        //    if (this.markerXYPosition.lat === null | this.markerXYPosition.lng === null) {
        //        const currentCenter = this.$refs.leafMap.mapObject.getCenter()
        //        this.markerXYPosition = currentCenter
        //    }
        //    //this.$emit('geomUpdate', [this.markerXYPosition.lng, this.markerXYPosition.lat, this.elevation])
        //    this.$refs.leafMap.mapObject.flyTo(this.markerXYPosition)
        //},
        loadBasemaps() {
            return [
                {
                name: 'OpenStreetMap',
                visible: true,
                attribution:
                    '&copy; <a target="_blank" href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
                },
                {
                name: 'OpenTopoMap',
                visible: false,
                url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
                attribution:
                    'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
                },
                {
                name: 'ESRI World Imagery',
                visible: false,
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
                attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
                }
            ]
        },
    },
}
</script>

<style>
@import "~leaflet/dist/leaflet.css";
@import "~leaflet-draw/dist/leaflet.draw.css";
</style>
