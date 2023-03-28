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
      <span class="text-md-subtitle-2">{{ stationData.topic }}</span>
      <v-card-text>
        <!--        <p>Dialog content is here</p>-->
        <p>data : {{ getStationData() }}</p>
      </v-card-text>
      <v-spacer></v-spacer>
      <!--      <v-card-text>-->
      <!--        <v-container>-->
      <!--          <v-row>-->
      <!--            <v-col v-for="(value, name, index) in formContent" :key="index" cols="12" sm="6" md="4">-->
      <!--              <v-text-field :value="value" :label="name" required>TEST</v-text-field>-->
      <!--            </v-col>-->
      <!--&lt;!&ndash;            <v-col cols="12" sm="6" md="4">&ndash;&gt;-->
      <!--&lt;!&ndash;              <v-text-field label="Facility Type*" hint="example of helper text only on focus"></v-text-field>&ndash;&gt;-->
      <!--&lt;!&ndash;            </v-col>&ndash;&gt;-->
      <!--          </v-row>-->
      <!--        </v-container>-->
      <!--      </v-card-text>-->
<!--      <v-form v-model="valid">-->
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
              <v-text-field v-model="stationData.wmo_region" label="WMO Region"
                            :rules="rules.required" type="number"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
<!--            <v-col cols="12" sm="4" md="6">-->
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
              <!--              <v-text-field v-model="stationData.facility_type" label="Facility Type" :rules="rules.required"></v-text-field>-->
            </v-col>
<!--            <v-col>-->
<!--              <v-text-field v-model="stationData.topic" label="Topic Hierarchy" :rules="rules.required"></v-text-field>-->
<!--            </v-col>-->
          </v-row>


        </v-container>
<!--        <v-btn type="submit" block class="mt-2">Submit</v-btn>-->
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
      <!--      <v-container style="height: 400px; width: 100%">-->
<!--      </v-container>-->
      <v-card-actions>
        <v-spacer/>
        <v-btn color="pink lighten-1" class="mr-1" text @click="close">
          Cancel
        </v-btn>
        <v-spacer/>
        <v-btn v-if="formTitle=='Add Station'" color="blue darken-1" class="mr-1" text @click="updateStation('insert')" :disabled="!valid">
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
      <!--      <dataset-map :dataset="stationData"/>-->

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
      if (dat !== {}){
        this.stationData = dat
      }
    }
  },
  computed: {

  },

  methods: {
    handleGeometryUpdate(newGeom){
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

      console.log(eventInfo)
      console.log(this.stationData)
      // "https://oscar.wmo.int/surface/#/search/station/stationReportDetails/0-20000-0-16252"
      //   "topic": "urn:x-wmo:md:ita:roma_met_centre:surface-weather-observations",
      //     "href": "http://localhost/oapi/collections/discovery-metadata/items/urn:x-wmo:md:ita:roma_met_centre:surface-weather-observations",
      //     "title": "urn:x-wmo:md:ita:roma_met_centre:surface-weather-observations"
      //
      if (eventInfo === 'delete') {
         //  todo - replace this with a better alert
         if(confirm("Do you really want to delete?")){
         //   now delete
           console.log('relay to delete...')
           this.submitFunc('delete', this.stationData)
         }
      }
      else {
        let featureData = {...stationSchema}
        featureData.properties = {...featureData.properties, ...this.stationData}
        featureData.id = featureData.properties.wigos_station_identifier
        featureData.geometry.coordinates = this.featureGeometry

        this.submitFunc(eventInfo, featureData)


      }
      this.$emit("close-dialog");
    },

    getStationData(){
      return this.formContent
    }
  },
};
</script>
