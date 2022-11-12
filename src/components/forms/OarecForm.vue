<template id="oarec-form">
  <div class="oarec-form">
    <v-card flat>
      <v-progress-linear indeterminate color="primary" :active="loading" />
      <v-form v-model="valid">
        <v-jsf
          class="pa-12"
          v-model="model"
          :schema="schema"
          :options="options"
        />
        <v-btn color="success"> export </v-btn>
        <v-btn> reset </v-btn>
      </v-form>
    </v-card>
  </div>
</template>

<script>
import VJsf from "@koumoul/vjsf/lib/VJsf.js";
import "@koumoul/vjsf/lib/VJsf.css";
import "@koumoul/vjsf/lib/deps/third-party.js";

import wcmp2 from "@/models/wcmp2.json";

let oapi = window.VUE_APP_OAPI;

export default {
  name: "OarecForm",
  template: "#oarc-form",
  props: ["topic"],
  components: { VJsf: VJsf },
  data: function () {
    return {
      loading: true,
      step: 1,
      valid: false,
      model: {},
      schema: {},
      options: {
        rootDisplay: "vertical-stepper",
      },
    };
  },
  mounted() {
    setTimeout(this.loadOARec, 1000);
    // this.loadOARec();
  },
  methods: {
    async loadOARec() {
      this.loading = true;
      var self = this;
      await this.$http({
        method: "get",
        url: oapi + "/collections/discovery-metadata/items/" + self.topic,
      })
        .then(function (response) {
          // handle success
          self.model = response.data;
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(() => {
          // handle success
          this.title = wcmp2.title;
          console.log(wcmp2);
          //   delete wcmp2.properties["geometry"];
          //   delete wcmp2.properties["id"];
          //   delete wcmp2.properties["links"];
          //   delete wcmp2.properties["properties"];
          //   delete wcmp2.properties["time"];

          this.schema = Object.assign({}, wcmp2);
          this.loading = false;
        });
    },
  },
};
</script>
