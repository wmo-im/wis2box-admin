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
      <v-data-table :headers="headers" :items="stations" :search="search">
        <template v-slot:item.station_name="props">
          <v-edit-dialog :return-value.sync="props.item.station_name" large>
            {{ props.item.station_name }}
            <template v-slot:input>
              <v-text-field
                v-model="props.item.station_name"
                label="Edit"
                single-line
                counter
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.wigos_station_identifier="props">
          <v-edit-dialog
            :return-value.sync="props.item.wigos_station_identifier"
            large
          >
            {{ props.item.wigos_station_identifier }}
            <template v-slot:input>
              <v-text-field
                v-model="props.item.wigos_station_identifier"
                label="Edit"
                single-line
                counter
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
        <template v-slot:item.traditional_station_identifier="props">
          <v-edit-dialog
            :return-value.sync="props.item.traditional_station_identifier"
            large
          >
            {{ props.item.traditional_station_identifier }}
            <template v-slot:input>
              <v-text-field
                v-model="props.item.traditional_station_identifier"
                label="Edit"
                single-line
                counter
              ></v-text-field>
            </template>
          </v-edit-dialog>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import { clean } from "@/scripts/helpers.js";
import { parse } from "csv-parse";

let baseURL = window.VUE_ADMIN_URL;

export default {
  name: "StationsView",
  template: "#stations-view",
  data: function () {
    return {
      search: "",
      headers: [],
      stations: [],
    };
  },
  async created() {
    var self = this;
    var url = `${baseURL}/metadata/station/station_list.csv`;
    await this.$http({
      method: "get",
      url: url,
    })
      .then(function (response) {
        // handle success
        self.parseCSV(response.data);
      })
      .catch(function (error) {
        // handle error
        console.log(error);
      });
  },
  methods: {
    parseCSV(csvString) {
      var self = this;
      this.headers = [];
      parse(csvString, function (err, stations) {
        const headers = stations.shift();
        self.headers = headers.map(function (x) {
          return { text: clean(x), value: x };
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
  },
};
</script>
