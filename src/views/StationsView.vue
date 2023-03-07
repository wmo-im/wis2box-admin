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
          :edited-id="editedId"
          :form-content="formContent"
          :dialog.sync="dialog"
          @open-dialog="
          editedId = 999;
          dialog = true;
          formContent=self.formContent;
        "
          @close-dialog="
          editedId = null;
          dialog = false;
          formContent={}
        "
      />
      <v-data-table :headers="headers" :items="stations" :search="search">
        <template v-slot:item.name="{ item }">
          <a target="_blank" :href="item.url">
            {{ item.name }}
          </a>
        </template>
        <template v-slot:item.status="{ item }">{{stationStatus[item.status]}}</template>
        <template v-slot:item.actionControls="props">
          <v-btn class="mx-2" fab small @click="openDialog(props.item.id)">
            <v-icon>mdi-pencil</v-icon>
          </v-btn>
        </template>
        <!--        <template v-slot:item="row">-->
        <!--          <tr>-->
        <!--&lt;!&ndash;            <td>{{ row.item.no }}</td>&ndash;&gt;-->
        <!--&lt;!&ndash;            <td>{{ row.item.result }}</td>&ndash;&gt;-->
        <!--            <td>-->
        <!--              <v-btn class="mx-2" fab dark small color="pink" @click="onButtonClick(row.item)">-->
        <!--                <v-icon dark>mdi-heart</v-icon>-->
        <!--              </v-btn>-->
        <!--            </td>-->
        <!--          </tr>-->
        <!--        </template>-->

        <!--        <template v-slot:item.station_name="props">-->
        <!--          <v-edit-dialog :return-value.sync="props.item.station_name" large>-->
        <!--            {{ props.item.station_name }}-->
        <!--            <template v-slot:input>-->
        <!--              <v-text-field-->
        <!--                v-model="props.item.station_name"-->
        <!--                label="Edit"-->
        <!--                single-line-->
        <!--                counter-->
        <!--              ></v-text-field>-->
        <!--            </template>-->
        <!--          </v-edit-dialog>-->
        <!--        </template>-->
        <!--        <template v-slot:item.wigos_station_identifier="props">-->
        <!--          <v-edit-dialog-->
        <!--            :return-value.sync="props.item.wigos_station_identifier"-->
        <!--            large-->
        <!--          >-->
        <!--            {{ props.item.wigos_station_identifier }}-->
        <!--            <template v-slot:input>-->
        <!--              <v-text-field-->
        <!--                v-model="props.item.wigos_station_identifier"-->
        <!--                label="Edit"-->
        <!--                single-line-->
        <!--                counter-->
        <!--              ></v-text-field>-->
        <!--            </template>-->
        <!--          </v-edit-dialog>-->
        <!--        </template>-->
        <!--        <template v-slot:item.traditional_station_identifier="props">-->
        <!--          <v-edit-dialog-->
        <!--            :return-value.sync="props.item.traditional_station_identifier"-->
        <!--            large-->
        <!--          >-->
        <!--            {{ props.item.traditional_station_identifier }}-->
        <!--            <template v-slot:input>-->
        <!--              <v-text-field-->
        <!--                v-model="props.item.traditional_station_identifier"-->
        <!--                label="Edit"-->
        <!--                single-line-->
        <!--                counter-->
        <!--              ></v-text-field>-->
        <!--            </template>-->
        <!--          </v-edit-dialog>-->
        <!--        </template>-->
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import {clean} from "@/scripts/helpers.js";
import {parse} from "csv-parse";
// import stations_list from "@/metadata/station/station_list.csv";
import form_dialog from "../dialogs/form_dialog.vue"
// import {stat} from "@babel/core/lib/gensync-utils/fs";

// let baseURL = window.VUE_ADMIN_URL;
let oAPI = window.VUE_APP_OAPI
// const actionControls = [{'text': '', value: 'actionControls', 'sortable': false}]
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
  {'text': '', value: 'actionControls', 'sortable': false}
]


export default {
  components: {"edit-modal": form_dialog},
  name: "StationsView",
  template: "#stations-view",

  data: function () {
    return {
      search: "",
      headers: [],
      stations: [],
      dialog: false,
      editedId: null,
      formContent: {},
      // todo - get dynamically from https://codes.wmo.int/wmdr/_ReportingStatus
      stationStatus: {
        'closed': 'Closed',
        'nonReporting': 'Non-reporting',
        'operational': 'Operational',
        'partlyOperational': 'Partly operational',
        'planned': 'Planned',
        'preOperational': 'Pre-operational',
        'standBy': 'Stand-by',
        'unknown': 'unknown'
      }
    };
  },
  async created() {
    const self = this;
    // var url = `/metadata/station/station_list.csv`;
    // var otherurl = `${baseURL}/metadata/station/station_list.csv`;
    // var url = "http://localhost:8080/admin/station_list.csv";
    const stations_url = oAPI + "/collections/stations/items?f=json&lang=en-US&limit=10&skipGeometry=false&offset=0"
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

    // await this.$http({
    //   method: "get",
    //   url: url,
    // })
    //   .then(function (response) {
    //     // handle success
    //     self.parseCSV(response.data);
    //   })
    //   .catch(function (error) {
    //     // handle error
    //     console.log(error);
    //   });
    // self.parseCSV(stations)
    // const csv_data = parse(stations, {bom: true, delimiter: ",", encoding: "utf-8"})
    // console.log(csv_data)
    // console.log(stations_list)
    // self.parseCSV([stations]);
    // var self = this;
    // self.headers = [];


    // let headers;
    // headers = stations_list.shift();
    // self.stations = stations_list
    // headers = headers.map(function (x) {
    //   return {text: clean(x), value: x};
    // });
    // // headers.push(self.actionControls)
    // self.headers = [...headers, ...self.actionControls]
    // // self.headers = Array.from(headers);
    // self.stations = stations_list.map(function (row) {
    //   var parsed = {};
    //   for (var i = 0; i < headers.length; i++) {
    //     parsed[headers[i].value] = row[i];
    //   }
    //   return parsed;
    // });
  },
  methods: {
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
      console.log(station_id);

      this.formContent = this.stations.find(s => {return s.id === station_id})
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
      self.stations = stationsCollection.features.map(station => station.properties)
    }
  },
};
</script>
