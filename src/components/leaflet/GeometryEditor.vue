<template>
  <v-lazy>
    <v-img>
      <v-container>
        <v-form>
          <v-row>
            <v-col>
              <v-text-field :rules="this.rules" label="Lat" variant="outlined" v-model.number="markerXYPosition.lat"
                            type="number"></v-text-field>
            </v-col>
            <v-col>
              <v-text-field :rules="this.rules" label="Lon" variant="outlined" v-model.number="markerXYPosition.lng"
                            type="number"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field :rules="this.rules" label="Elevation" variant="outlined" v-model.number="elevation"
                            type="number"></v-text-field>
            </v-col>
          </v-row>
          <!--          <v-row>-->
          <!--            <v-btn color="blue" @click="refreshGeometry()" block>Update Map</v-btn>-->
          <!--          </v-row>-->
        </v-form>
      </v-container>

      <l-map :zoom="zoom" :center.sync="center" style="height: 400px; width: 100%" ref="leafMap">
        <l-control-layers
            :position="layersPosition"
            :collapsed="true"
            :sort-layers="true"
        />
        <l-tile-layer
            v-for="tileProvider in tileProviders"
            :key="tileProvider.name"
            :name="tileProvider.name"
            :visible="tileProvider.visible"
            :url="tileProvider.url"
            :attribution="tileProvider.attribution"
            layer-type="base"
        />

        <l-marker v-if="markerXYPosition.lat!==null && markerXYPosition.lng !== null" :autoPan="false"
                  :autofocus="false" ref="mapMarker" :lat-lng.sync="markerXYPosition" :draggable="true"></l-marker>
        <l-control position="bottomleft">
          <v-btn
              class="mx-2"
              fab
              dark
              small
              color="primary"
              @click="snackbar = !snackbar"
          >
            <v-icon dark>
              mdi-information
            </v-icon>
          </v-btn>
        </l-control>
        <v-snackbar centered light
            v-model="snackbar"
            location="center"
        >
          <h3>
            Tips:
          </h3>
          <ul>
            <li>Click and drag to move map</li>
            <li>Zoom with mouse wheel, or buttons</li>
            <li>Drag the icon to reposition, or edit lat/lon</li>
            <li>Use the basemap widget to change the map view</li>
          </ul>
          <template>
            <v-btn
                text
                @click="snackbar = false"
            >
              Close
            </v-btn>
          </template>
        </v-snackbar>
      </l-map>
    </v-img>

  </v-lazy>


</template>
<style>
@import "~leaflet/dist/leaflet.css";
</style>

<script>
import {LMap, LTileLayer, LControlLayers, LMarker, LControl} from 'vue2-leaflet';
import {LatLng} from "leaflet";

export default {
  name: "GeometryEditor",
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LControlLayers,
    LControl
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
      elevation: this.inputFeature.coordinates ? this.inputFeature.coordinates[2] : 0,
      rules: [
        value => {
          if (value | String(parseFloat(value)) === '0') return true
          return 'Required!'
        },
      ],
      snackbar: false,
    };
  },
  watch: {
    markerXYPosition: {
      handler(newVal) {
        console.log(newVal)
        this.$emit('geomUpdate', [parseFloat(newVal.lng), parseFloat(newVal.lat), parseFloat(this.elevation)])
        // when dragging the marker - the timeout helps reduce the jittering
        setTimeout(() => {
          this.$refs.leafMap.mapObject.invalidateSize()
          this.$refs.leafMap.mapObject.flyTo(this.markerXYPosition)
        }, 500)
      },
      deep: true
    },
  },
  methods: {
    onInfoClick() {
      this.snackbar = false;
    },

    parseInputGeom(inputGeom) {
      if (Object.keys(inputGeom).length > 0) {
        console.log(inputGeom)
        const markerLatLng = new LatLng(inputGeom.coordinates[1], inputGeom.coordinates[0])
        this.$emit('geomUpdate', [markerLatLng.lng, markerLatLng.lng, inputGeom.coordinates[2]])

        return markerLatLng
      } else {
        // console.log('error parsing input geometry')

        this.$emit('geomUpdate', [0, 0, 0])
        return {lat: 0, lng: 0}
      }
    },
    refreshGeometry(someEvent) {
      console.log('refreshGeometry', someEvent)
      if (this.markerXYPosition.lat === null | this.markerXYPosition.lng === null) {
        const currentCenter = this.$refs.leafMap.mapObject.getCenter()
        this.markerXYPosition = currentCenter
      }
      this.$emit('geomUpdate', [parseFloat(this.markerXYPosition.lng), parseFloat(this.markerXYPosition.lat), parseFloat(this.elevation)])
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