<template id="stations-view">
  <div class="stations-view">
    <v-card>
      <v-card-title>
        {{ $t("navigation.stations") }}
        <v-spacer></v-spacer>
        <v-text-field
            v-model="search"
            append-icon="mdi-magnify"
            label="Search"
            single-line
            hide-details
        ></v-text-field>
      </v-card-title>
      <v-spacer/>
      <v-spacer/>
      <edit-modal
          :form-title="formTitle"
          :form-content="stationData"
          :station-status="stationStatus"
          :wmo-regions="wmoRegions"
          :facility-types="facilityTypes"
          :dialog.sync="dialog"
          :submit-func="handleUpdate"
          :disco-data="discoveryMetadata"
          @open-dialog="
          dialog = true;
        "
          @close-dialog="
          dialog = false;
          stationData={}
        "
      />
      <v-btn
          color="primary"
          dark
          class="mb-13"
          @click="openDialog(null)"
      >
        New Station
      </v-btn>
      <v-data-table :headers="headers" :items="stations" :search="search">
        <!--        <template v-slot:activator="{ on, attrs }">-->
        <v-btn
            color="primary"
            dark
              class="mb-2"
          >
            New Item
          </v-btn>

        <template v-slot:item.name="{ item }">
          <a target="_blank" :href="item.url">
            {{ item.name }}
          </a>
        </template>
        <template v-slot:item.status="{ item }">{{stationStatus.find(x=>x.value === item.status).title}}</template>
        <template v-slot:item.facility_type="{ item }">{{facilityTypes.find(x=>x.title === item.facility_type).title}}</template>
        <template v-slot:item.actionControls="props">
          <v-btn class="mx-2" fab small @click="openDialog(props.item.id)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>

      </v-data-table>

    </v-card>
  </div>
</template>

<script>
// import {clean} from "@/scripts/helpers.js";
// import {parse} from "csv-parse";
// import stations_list from "@/metadata/station/station_list.csv";
import FormDialog from "../dialogs/FormDialog.vue"
// import {stat} from "@babel/core/lib/gensync-utils/fs";

// let baseURL = window.VUE_ADMIN_URL;
let oAPI = window.VUE_APP_OAPI
const stations_url = oAPI + "/collections/stations/items?f=json"

const stationHeaders = [
  {
    "text": "Name",
    "value": "name"
  },
  {
    "text": "WIGOS Station Identifier",
    "value": "wigos_station_identifier"
  },
  {
    "text": "Facility Type",
    "value": "facility_type"
  },
  {
    "text": "Territory Name",
    "value": "territory_name"
  },
  {
    "text": "WMO Region",
    "value": "wmo_region"
  },
  // {
  //   "text": "URL",
  //   "value": "url"
  // },
  // {
  //   "text": "Topic",
  //   "value": "topic"
  // },
  {
    "text": "Status",
    "value": "status"
  },
  // {
  //   "text": "Id",
  //   "value": "id"
  // },
  //   for edit icon
  {'text': '', value: 'actionControls', 'sortable': false}
]
const stationStatus = [
        {value: 'closed', title: 'Closed'},
        {value: 'nonReporting', title: 'Non-reporting'},
        {value: 'operational', title: 'Operational'},
        {value: 'partlyOperational', title: 'Partly operational'},
        {value: 'planned', title: 'Planned'},
        {value: 'preOperational', title: 'Pre-operational'},
        {value: 'standBy', title: 'Stand-by'},
        {value: 'unknown', title: 'unknown'}
      ]
const wmoRegions = [
  {value: "I", title: "I: Africa"},
  {value: "II", title: "II: Asia"},
  {value: "III", title: "III: South America"},
  {value: "IV", title: "IV: North America, Central America, Caribbean"},
  {value: "V", title: "V: South-West Pacific"},
  {value: "VI", title: "VI: Europe"}

]

const facilityTypes = [
  {value: 'airFixed', title: 'Air (fixed)'},
  {value: 'airMobile', title: 'Air (mobile)'},
  {value: 'lakeRiverFixed', title: 'Lake/River (fixed)'},
  {value: 'lakeRiverMobile', title: 'Lake/River (mobile)'},
  {value: 'landFixed', title: 'Land (fixed)'},
  {value: 'landMobile', title: 'Land (mobile)'},
  {value: 'landOnIce', title: 'Land (on ice)'},

  {value: 'seaFixed', title: 'Land (on ice)'},
  {value: 'seaMobile', title: 'Sea (mobile)'},
  {value: 'seaOnIce', title: 'Sea (on ice)'},
  {value: 'spaceBased', title: 'Space-based'},
  {value: 'underwaterFixed', title: 'Underwater (fixed)'},
  {value: 'underwaterMobile', title: 'Underwater (mobile)'},
  {value: 'unknown', title: 'unknown'},
]


export default {
  components: {"edit-modal": FormDialog},
  name: "StationsView",
  template: "#stations-view",

  data: function () {
    return {
      search: "",
      headers: [],
      stations: [],
      discoveryMetadata: [],
      dialog: false,
      // formContent: {},
      stationData: {},
      // todo - get dynamically? from https://codes.wmo.int/wmdr/_ReportingStatus
      stationStatus: stationStatus,
      facilityTypes: facilityTypes,
      wmoRegions: wmoRegions,
      formTitle: '',

    };
  },
  async created() {
    // const self = this;
    // var url = `/metadata/station/station_list.csv`;
    // var otherurl = `${baseURL}/metadata/station/station_list.csv`;
    // var url = "http://localhost:8080/admin/station_list.csv";
    await this.loadStations()
    await this.loadDiscovery()
  },
  methods: {
    async loadStations(){
      const self = this
      await this.$http({
        method: 'get',
        url: stations_url,
        // headers: {'Content-Type': 'application/json'}
      })
          .then(function (response) {
            if (response.data.features) {
              self.parseStations(response.data)
            } else {
              console.log('error getting stations collection', response)
            }
          })
          .catch(function (error) {
            console.log(error)
          })
    },
    parseDiscoveryMetadata(discoData) {
      this.discoveryMetadata = discoData.map(d => {return {title: d.id, value: d.id}})
    },
    async loadDiscovery() {
      const self = this
      await this.$http({
        method: 'get',
        url: oAPI + "/collections/discovery-metadata/items?f=json&lang=en-US",
        headers: {'Accept': 'application/geo+json'},
        params: {
          skipGeometry: true,
        }
      })
          .then(function (response) {
            if (response.data.features) {
              self.parseDiscoveryMetadata(response.data.features)
            } else {
              console.log('error getting discovery collection', response)
            }
          })
          .catch(function (error) {
            console.log(error)
          })
    },
    async handleUpdate(action, updateData) {

      if (action === 'delete') {
        // todo - retry until count is decremented by 1 ?
        await this.deleteStation(updateData.id).then(setTimeout(this.loadStations, 1000))
      }
      else if (action === 'insert') {
        await this.insertStation(updateData).then(setTimeout(this.loadStations, 1000))
      }
      else if (action === 'update') {
        await this.updateStation(updateData).then(setTimeout(this.loadStations, 1000))

      }
    },
    // parseCSV(csvString) {
    //   var self = this;
    //   this.headers = [];
    //   parse(csvString, function (err, stations) {
    //     const headers = stations.shift();
    //     self.headers = headers.map(function (x) {
    //       return { text: clean(x), value: x };
    //
    //     });
    //     self.stations = stations.map(function (row) {
    //       var parsed = {};
    //       for (var i = 0; i < headers.length; i++) {
    //         parsed[headers[i]] = row[i];
    //       }
    //       return parsed;
    //     });
    //   });
    // },
    openDialog(station_id) {
      if (station_id == null) {
        this.formTitle = 'Add Station'
        this.stationData = {}
      } else {
        const stn = this.stations.find(s => {
          return s.id === station_id
        })
        this.formTitle = 'Edit Station'

        this.stationData = Object.assign({}, stn)
      }
      this.dialog = true
    },
    parseStations(stationsCollection) {
      // console.log('parseStations')
      const self = this
      self.headers = stationHeaders
      self.stations = stationsCollection.features.map(station => {return {...station.properties, ...station.geometry}})
    },
    async insertStation(stnInfo) {
      delete stnInfo.properties.coordinates
      // console.log(stnInfo)
      await this.$http({
        method: 'post',
        url: oAPI+`/collections/stations/items`,
        data: stnInfo,
        headers: {'Content-Type': 'application/geo+json', 'accept': "*/*"}
      })
          // .then(function (response) {
          //   console.log('added station with response', response.status)
          //   console.log(response)
          // })
          .catch(function (error) {
            console.log(error)
          })
    },
    async updateStation(stnInfo) {
      // for update just get the og station info, and merge in the updated values/keys
      // stnInfo = {...this.stationData, ...stnInfo}
      delete stnInfo.properties.coordinates
      stnInfo.geometry.coordinates = stnInfo.geometry.coordinates.map(c => parseFloat(c))
      await this.$http({
        method: 'put',
        url: oAPI + `/collections/stations/items/${stnInfo.id}`,
        data: stnInfo,
        headers: {'Content-Type': 'application/json'}
      })
          // .then(function (response) {
          //   console.log('updated station with response', response.status)
          //   console.log(response)
          // })
          .catch(function (error) {
            console.log(error)
          })
    },
    async deleteStation(stationID) {
      console.log('deleteStation')
      await this.$http({
        method: 'delete',
        url: oAPI + `/collections/stations/items/${stationID}`,
      })
          .then(function (response) {
            console.log('...deleted station')
            console.log(response)
          })
          .catch(function (error) {
            console.log(error)
          })
    },
  },
};
</script>
