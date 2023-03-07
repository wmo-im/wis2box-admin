<template">
  <v-dialog
      :value="dialog"
      @input="$emit('input', $event)"
      width="500px"
      persistent>
    <v-card>
      <v-card-title>
        <v-layout wrap>
          <v-flex xs11>
            <span class="headline">{{ stationData.topic }}</span>
          </v-flex>
          <!--          <v-flex xs1 class="text-right">-->
          <!--            <v-btn icon @click="close">-->
          <!--              <v-icon>close</v-icon>-->
          <!--            </v-btn>-->
          <!--          </v-flex>-->
        </v-layout>
      </v-card-title>
<!--      <v-card-text>-->
<!--        &lt;!&ndash;        <p>Dialog content is here</p>&ndash;&gt;-->
<!--        <p>form content: {{ formContent }}</p>-->
<!--        <p v-if="editedId !== null">{{ "Edited id: " + editedId }}</p>-->
<!--      </v-card-text>-->
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
      <v-form v-model="valid">
        <v-container>
          <!--          <v-row>-->
          <!--            <v-col v-for="(value, name, index) in formContent" :key="index" cols="4" sm="6" md="6">-->
          <!--              <v-text-field :value="value" :label="name" required>TEST</v-text-field>-->
          <!--            </v-col>-->
          <!--          </v-row>-->
          <v-row>
            <v-col cols="12" sm="4" md="6">
              <v-text-field label="Name" required v-model="stationData.name"></v-text-field>
              <!--              <v-text-field :value="formContent.name" label="Name" required v-model="stationData.name" ></v-text-field>-->
            </v-col>
            <v-col cols="12" sm="4" md="6">
              <v-text-field v-model="stationData.wigos_station_identifier" label="WIGOS Station Identifier"
                            required></v-text-field>
            </v-col>
            <v-select
                v-model="stationData.status"
                :items="this.stationStatus"
                item-text='title'
                item-value='value'
                item-label="Status"
                persistent-hint
                hint="Station Status"
                return-object
                single-line
            ></v-select>

            <!--            below works for default value-->
            <!--                        <v-select-->
            <!--                v-model="selected"-->
            <!--                :items="stationStatus"-->
            <!--                item-text='title'-->
            <!--                item-value='value'-->
            <!--                item-label="Status"-->
            <!--                persistent-hint-->
            <!--                hint="Station Status"-->
            <!--                return-object-->
            <!--                single-line-->
            <!--            ></v-select>-->


            <!--            <v-col cols="12" sm="4" md="6">-->
            <!--              <v-text-field :value="formContent.status" label="Status"-->
            <!--                            required></v-text-field>-->
            <!--            </v-col>-->
          </v-row>


        </v-container>
      </v-form>
      <v-card-actions>
        <v-spacer/>
        <v-btn color="blue darken-1" class="mr-1" text @click="close">
          Close
        </v-btn>
        <v-spacer/>
        <v-btn color="blue darken-1" class="mr-1" text @click="updateStation">
          Update
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

  methods: {
    close() {
      //  not sure why stationData needs to be cleared here
      this.stationData = {}
      this.$emit("close-dialog");
      // if (this.editedId === null) {
      //   this.$emit("open-dialog");
      // }
    },
    updateStation() {
      // console.log(eventInfo)
      console.log(this.stationData)
      this.submitFunc(this.stationData)
      this.$emit('stationUpdate', this.stationData)
    },
    getStationData(){
      return this.formContent
    }
  },
};
</script>
