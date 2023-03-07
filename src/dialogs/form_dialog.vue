<template>
  <v-dialog
      :value="dialog"
      @input="$emit('input', $event)"
      width="500px"
      persistent>
    <v-card>
      <v-card-title>
        <v-layout wrap>
          <v-flex xs11>
            <span class="headline">{{formContent.station_name}}</span>
          </v-flex>
          <!--          <v-flex xs1 class="text-right">-->
          <!--            <v-btn icon @click="close">-->
          <!--              <v-icon>close</v-icon>-->
          <!--            </v-btn>-->
          <!--          </v-flex>-->
        </v-layout>
      </v-card-title>
      <v-card-text>
<!--        <p>Dialog content is here</p>-->
        <p>form content: {{ formContent }}</p>
        <p v-if="editedId !== null">{{ "Edited id: " + editedId }}</p>
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
          <v-row>
            <v-col v-for="(value, name, index) in formContent" :key="index" cols="4" sm="6" md="6">
              <v-text-field :value="value" :label="name" required>TEST</v-text-field>
            </v-col>
          </v-row>
<!--          <v-row>-->
<!--            <v-col cols="12" sm="4" md="6">-->
<!--              <v-text-field :value="formContent.name" :label="formContent.name" required></v-text-field>-->
<!--            </v-col>-->
<!--          </v-row>-->


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
  data: () => ({
    valid: false
  }),
  props: {
    editedId: Number,
    dialog: Boolean,
    formContent: {},
  },
  methods: {
    close() {
      this.$emit("close-dialog");
      // if (this.editedId === null) {
      //   this.$emit("open-dialog");
      // }
    },
    created() {
      // doesn't fire
      console.log('created')
      console.log(self.formContent)
    },
    mounted() {
      console.log('mounted')
    },
    updateStation(stationInfo){
      console.log(stationInfo)
    }
  },
};
</script>
