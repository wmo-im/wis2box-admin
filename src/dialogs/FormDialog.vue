<template>
  <v-dialog
      :value="dialog"
      @input="$emit('input', $event)"
      width="600px"
      persistent>
    <v-card>
      <v-card-title>
        <v-layout wrap>
          <v-flex xs11>
            <span class="text-md-subtitle-2">{{ stationData.topic }}</span>
          </v-flex>
                    <v-flex xs1 class="text-right">
                      <v-btn icon @click="close">
                        <v-icon>mdi-close</v-icon>
                      </v-btn>
                    </v-flex>
        </v-layout>
      </v-card-title>
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
              <v-text-field v-model="stationData.facility_type" label="Facility Type" :rules="rules.required"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field v-model="stationData.territory_name" label="Territory Name"
                            :rules="rules.required"></v-text-field>
            </v-col>
            <v-col>
              <v-text-field v-model="stationData.wmo_region" label="WMO Region"
                            :rules="rules.required"></v-text-field>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-text-field v-model="stationData.topic" label="Topic Hierarchy" :rules="rules.required"></v-text-field>
            </v-col>
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
      <v-card-actions>
        <v-spacer/>
        <v-btn color="pink lighten-1" class="mr-1" text @click="close">
          Cancel
        </v-btn>
        <v-spacer/>
        <v-btn color="blue darken-1" class="mr-1" text @click="updateStation('update')" :disabled="!valid">
          Update Station
        </v-btn>
        <v-btn color="red darken-1" class="mr-1" text @click="updateStation('delete')">
          Delete Station
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>

export default {
  props: {
    dialog: Boolean,
    formContent: {},
    stationStatus: [],
    submitFunc: Function,
  },
  data() {
    return {
      valid: false,
      stationData: {},
      rules: {
        required: [v => !!v || 'Required!'],
        // numeric: [x => x.match(/^\d+$/)===true || 'Must be integer!']
      }
    }
  },
  watch: {
    formContent(dat) {
    console.log('watch')
      if (dat !== {}){
        this.stationData = dat
      }
    }
  },
  computed: {

  },

  methods: {
    validate() {
      const isvalid = this.$refs.form.validate()
      this.valid = isvalid

      if (this.valid) alert('Form is valid')
      if (!this.valid) alert('form is not valid')
    },
    close() {
      this.$emit("close-dialog");
    },
    updateStation(eventInfo) {
      console.log(eventInfo)
      console.log(this.stationData)
      if (eventInfo === 'update'){
        this.submitFunc('update', this.stationData)
      }
      if (eventInfo === 'delete') {
         if(confirm("Do you really want to delete?")){
         //   now delete
           console.log('relay to delete...')
           this.submitFunc('delete', this.stationData)
         }

      }
      this.$emit("close-dialog");
    },

    getStationData(){
      return this.formContent
    }
  },
};
</script>
