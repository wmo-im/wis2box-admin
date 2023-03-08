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
          :form-content="stationData"
          :station-status="stationStatus"
          :dialog.sync="dialog"
          :submit-func="handleUpdate"
          @open-dialog="
          dialog = true;
        "
          @close-dialog="
          dialog = false;
          stationData={}
        "
      />
      <v-data-table :headers="headers" :items="stations" :search="search">
        <template v-slot:item.name="{ item }">
          <a target="_blank" :href="item.url">
            {{ item.name }}
          </a>
        </template>
        <template v-slot:item.status="{ item }">{{stationStatus.find(x=>x.value === item.status).title}}</template>
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
import {clean} from "@/scripts/helpers.js";
import {parse} from "csv-parse";
// import stations_list from "@/metadata/station/station_list.csv";
import FormDialog from "../dialogs/FormDialog.vue"
// import {stat} from "@babel/core/lib/gensync-utils/fs";

// let baseURL = window.VUE_ADMIN_URL;
let oAPI = window.VUE_APP_OAPI
// const actionControls = [{'text': '', value: 'actionControls', 'sortable': false}]
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


export default {
  components: {"edit-modal": FormDialog},
  name: "StationsView",
  template: "#stations-view",

  data: function () {
    return {
      search: "",
      headers: [],
      stations: [],
      dialog: false,
      // formContent: {},
      stationData: {},
      // todo - get dynamically? from https://codes.wmo.int/wmdr/_ReportingStatus
      stationStatus: [
        {value: 'closed', title: 'Closed'},
        {value: 'nonReporting', title: 'Non-reporting'},
        {value: 'operational', title: 'Operational'},
        {value: 'partlyOperational', title: 'Partly operational'},
        {value: 'planned', title: 'Planned'},
        {value: 'preOperational', title: 'Pre-operational'},
        {value: 'standBy', title: 'Stand-by'},
        {value: 'unknown', title: 'unknown'}
      ]
    };
  },
  async created() {
    // const self = this;
    // var url = `/metadata/station/station_list.csv`;
    // var otherurl = `${baseURL}/metadata/station/station_list.csv`;
    // var url = "http://localhost:8080/admin/station_list.csv";
    await this.loadStations()
  },
  methods: {
    async loadStations(){
      console.log('loadStations')
      const self = this
      await this.$http({
        method: 'get',
        url: stations_url,
        // headers: {'Content-Type': 'application/json'}
      })
          .then(function (response) {
            console.log(response)
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
    handleUpdate(action, updateData){
      console.log('handleUpdate')
      console.log(action)
      console.log(updateData)
      this.loadStations();
    },
    parseCSV(csvString) {
      var self = this;
      this.headers = [];
      parse(csvString, function (err, stations) {
        const headers = stations.shift();
        self.headers = headers.map(function (x) {
          return {text: clean(x), value: x};
        });
        self.stations = stations.map(function (row) {
          var parsed = {};
          for (var i = 0; i < headers.length; i++) {
            parsed[headers[i]] = row[i];
          }
          return parsed;
        });
      });
    },
    openDialog(station_id) {
      const stn = this.stations.find(s => {return s.id === station_id})
      this.stationData = Object.assign({}, stn)
      this.dialog = true
    },
    parseStations(stationsCollection) {
      console.log('parseStations')
      const self = this
      // let stationHeaders = {}
      // stationHeaders = Object.keys(stationsCollection.features[0].properties).map(function (x) {
      //     return {text: clean(x), value: x};
      // });
      // self.headers = [...stationHeaders, ...actionControls]
      self.headers = stationHeaders
      self.stations = stationsCollection.features.map(station => {return {...station.properties, ...station.geometry}})
      // self.stations = stationsCollection.features
    }
  },
};
</script>
