<template>
  <v-lazy>
    <v-img>
      <v-container>
        <v-form>
          <v-row>
            <v-text-field :rules="this.rules" label="Lat" variant="outlined" v-model="markerXYPosition.lat"
                          prepend-icon="mdi:map-marker-plus" type="number"></v-text-field>
            <v-text-field :rules="this.rules" label="Lon" variant="outlined" v-model="markerXYPosition.lng"
                          prepend-icon="mdi:map-marker-plus-outline" type="number"></v-text-field>
            <v-text-field :rules="this.rules" label="Elevation" variant="outlined" v-model="elevation"
                          prepend-icon="mdi:elevation-rise" type="number"></v-text-field>
          </v-row>
          <v-row>
            <v-btn color="blue" @click="refreshGeometry()" block>Update Map</v-btn>
          </v-row>
        </v-form>
      </v-container>

      <l-map :zoom="zoom" :center.sync="center" style="height: 400px; width: 100%" ref="leafMap">
        <l-control-layers
            :position="layersPosition"
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

        <l-marker v-if="markerXYPosition.lat!==null && markerXYPosition.lng !== null" :autoPan="true" :autofocus="true" ref="mapMarker" :lat-lng.sync="markerXYPosition" :draggable="true"></l-marker>
        <!--    <l-marker :lat-lng="markerLatLng"></l-marker>-->
      </l-map>
    </v-img>
  </v-lazy>

</template>
<style>
@import "~leaflet/dist/leaflet.css";
</style>

<script>
import {LMap, LTileLayer, LControlLayers, LMarker} from 'vue2-leaflet';
import {LatLng} from "leaflet";
export default {
  name: "GeometryEditor",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LControlLayers,
    // LControl
  },
  props: {
    inputFeature: {},
  },
  data() {
    return {
      tileProviders: this.loadBasemaps(),
      zoom: 5,
      layersPosition: 'topright',
      ogInputData: {},
      center: this.parseInputGeom(this.inputFeature),
      markerXYPosition: this.parseInputGeom(this.inputFeature),
      elevation: this.inputFeature.coordinates? this.inputFeature.coordinates[2]: null,
      rules: [
        value => {
          if (value | String(value) ==='0') return true
          return 'Required!'
        },
      ],
    };
  },
  watch: {
    markerXYPosition: {
      handler(newVal) {
        this.$emit('geomUpdate', [newVal.lng, newVal.lat, parseFloat(this.elevation)])
      },
      deep: true
    },
  },
  methods: {

    parseInputGeom(inputGeom) {
      if (Object.keys(inputGeom ).length > 0) {
        console.log(inputGeom)
        const markerLatLng = new LatLng(inputGeom.coordinates[1], inputGeom.coordinates[0])
        return markerLatLng
      }
      else {
        // console.log('error parsing input geometry')
        return {lat: null, lng: null}
      }
    },
    refreshGeometry(someEvent) {
      console.log('refreshGeometry', someEvent)
      if (this.markerXYPosition.lat === null | this.markerXYPosition.lng === null) {
        const currentCenter = this.$refs.leafMap.mapObject.getCenter()
        this.markerXYPosition = currentCenter
      }
      this.$emit('geomUpdate', [this.markerXYPosition.lng, this.markerXYPosition.lat, this.elevation])
      this.$refs.leafMap.mapObject.flyTo(this.markerXYPosition)
    },
    loadBasemaps() {
      return [
        {
          name: 'OpenStreetMap',
          // default on
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
      ];
    },
  },
}
</script>

<!--<style scoped>-->

<!--</style>-->