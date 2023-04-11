<template>
  <v-dialog
      :value="dialog"
      v-if="dialog"
      @input="$emit('input', $event)"
      @click:outside="close"
      width="600px"
  >
    <v-card>
      <v-card-title>
        <v-layout wrap>
          <v-flex xs11>
            <span> {{ formTitle }}</span>
          </v-flex>
          <v-flex xs1 class="text-right">
            <v-btn icon @click="close">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-flex>
        </v-layout>
      </v-card-title>
      <v-spacer></v-spacer>
      <v-form v-model="valid" ref="form">
        <v-container>
          <v-row>
            <v-col cols="12" sm="4" md="6">
              <v-text-field label="Name" :rules="rules.required" v-model="stationData.name"></v-text-field>
              <!--              <v-text-field :value="formContent.name" label="Name" required v-model="stationData.name" ></v-text-field>-->
            </v-col>
            <v-col cols="12" sm="4" md="6">
              <v-text-field v-model="stationData.wigos_station_identifier" label="WIGOS Station Identifier"
                            :rules="rules.required"></v-text-field>
            </v-col>

            <v-col cols="12" sm="4" md="6">
              <v-select
                  v-model="stationData.status"
                  :items="this.stationStatus"
                  item-text='title'
                  item-value='value'
                  item-label="Status"
                  label="Station Status"
                  :rules="rules.required"
              ></v-select>
            </v-col>
            <v-col cols="12" sm="4" md="6">
              <v-select
                  v-model="stationData.facility_type"
                  :items="this.facilityTypes"
                  item-text='title'
                  item-value='title'
                  item-label="Facility Type"
                  label="Facility Type"
                  :rules="rules.required"
              ></v-select>
              <!--              <v-text-field v-model="stationData.facility_type" label="Facility Type" :rules="rules.required"></v-text-field>-->
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field v-model="stationData.territory_name" label="Territory Name"
                            :rules="rules.required"></v-text-field>
            </v-col>
            <v-col>
              <!--              <v-text-field v-model="stationData.wmo_region" label="WMO Region"-->
              <!--                            :rules="rules.required" type="number"></v-text-field>-->
              <v-select
                  v-model="stationData.wmo_region"
                  :items="this.wmoRegions"
                  item-text='title'
                  item-value='value'
                  item-label="WMO Region"
                  label="WMO Region"
                  :rules="rules.required"
              ></v-select>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-select
                  v-model="stationData.topic"
                  :items="this.discoData"
                  item-text='title'
                  item-value='title'
                  item-label="Topic Hierarchy"
                  label="Topic Hierarchy"
                  :rules="rules.required"
              ></v-select>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
      <div class="d-flex flex-column">
        <v-btn
            color="success"
            class="mt-4"
            block
            @click="this.validate"
        >
          Validate
        </v-btn>
      </div>
      <v-item style="height: 600px; width: 100%">
        <geometry-editor @geomUpdate="handleGeometryUpdate" v-bind:input-feature="stationData"
        ></geometry-editor>
        <!--                         v-on:updateGeometry="handleGeometryUpdate($event)"></geometry-editor>-->

      </v-item>
      <v-spacer/>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="pink lighten-1" class="mr-1" text @click="close">
          Cancel
        </v-btn>
        <v-spacer/>
        <v-btn v-if="formTitle=='Add Station'" color="blue darken-1" class="mr-1" text @click="updateStation('insert')"
               :disabled="!valid">
          Add Station
        </v-btn>
        <v-btn v-else color="blue darken-1" class="mr-1" text @click="updateStation('update')" :disabled="!valid">
          Update Station
        </v-btn>
        <v-btn color="red darken-1" class="mr-1" text @click="updateStation('delete')">
          Delete Station
        </v-btn>
      </v-card-actions>
    </v-card>
    <div>
    </div>
  </v-dialog>
</template>

<script>

const stationSchema = {
  "id": "",
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [
      null,
      null,
      null
    ]
  },
  "properties": {
    "name": "",
    "wigos_station_identifier": "",
    "facility_type": "",
    "territory_name": "",
    "wmo_region": "",
    "url": "",
    "topic": "",
    "status": "",
    "id": ""
  },
  "links": [
    {
      "rel": "canonical",
      "href": "",
      "type": "application/json",
      "title": ""
    }
  ]
}


import GeometryEditor from "@/components/leaflet/GeometryEditor.vue";


export default {
  components: {
    GeometryEditor
    // DatasetMap,
  },
  props: {
    dialog: Boolean,
    formContent: {},
    stationStatus: [],
    facilityTypes: [],
    wmoRegions:[],
    submitFunc: Function,
    formTitle: null,
    discoData: []
  },
  destroyed() {
    console.log('destroyed')
  },

  data() {
    return {
      valid: false,
      stationData: null,
      rules: {
        required: [v => !!v || 'Required!'],
        // numeric: [x => x.match(/^\d+$/)===true || 'Must be integer!']
      },
      featureGeometry: {}
    }
  },
  watch: {
    formContent(dat) {
      console.log('new form content', dat)
      if (dat !== {}) {
        this.stationData = dat
      }
    }
  },
  computed: {},

  methods: {
    handleGeometryUpdate(newGeom) {
      console.log("handleGeometryUpdate")
      console.log(newGeom)
      this.featureGeometry = newGeom

    },
    validate() {
      const isvalid = this.$refs.form.validate()
      this.valid = isvalid
      if (this.valid) alert('Form is valid')
      if (!this.valid) alert('form is not valid')
    },
    close() {
      console.log('dialog close')
      this.$emit("close-dialog");
    },
    updateStation(eventInfo) {
      if (eventInfo === 'delete') {
        //  todo - replace this with a better alert
        if (confirm("Do you really want to delete this station?")) {
          this.submitFunc('delete', this.stationData)
        }
      } else {
        let featureData = {...stationSchema}
        featureData.properties = {...featureData.properties, ...this.stationData}
        featureData.id = this.stationData.wigos_station_identifier
        featureData.geometry.coordinates = this.featureGeometry
        delete featureData.properties.coordinates
        // links
        featureData.links.href = `${window.VUE_APP_OAPI}/collections/discovery-metadata/items/${featureData.properties.topic}`
        featureData.links.title = featureData.properties.topic
        this.submitFunc(eventInfo, featureData)
      }
      this.$emit("close-dialog");
    },
  },
};
</script>
