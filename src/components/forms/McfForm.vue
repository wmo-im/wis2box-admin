<template id="mcf-form">
  <div class="mcf-form">
    <v-card flat>
      <v-toolbar color="#014e9e" dark flat>
        <v-toolbar-title v-html="$t(`datasets.mcf`)" />

        <v-spacer />
        <v-btn color="blue-grey" class="ma-2" title="Reset">
          reset
          <v-icon>mdi-sync</v-icon>
        </v-btn>
        <v-btn color="#009900" class="ma-2" title="Export">
          export
          <v-icon>mdi-cloud-upload</v-icon>
        </v-btn>
      </v-toolbar>

      <v-progress-linear indeterminate color="primary" :active="loading" />
      <v-form v-model="valid">
        <v-jsf
          v-model="model"
          :schema="schema"
          :options="options"
        />
      </v-form>
    </v-card>
  </div>
</template>

<script>
import VJsf from "@koumoul/vjsf/lib/VJsf.js";
import "@koumoul/vjsf/lib/VJsf.css";
import "@koumoul/vjsf/lib/deps/third-party.js";
import $RefParser from "@apidevtools/json-schema-ref-parser";
import mergeAllOf from "json-schema-merge-allof";

import { parse } from "yaml";
import { clean } from "@/scripts/helpers.js";
import mcf from "@/models/mcf.json";

let baseURL = window.VUE_ADMIN_URL;

export default {
  name: "McfForm",
  template: "#mcf-form",
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
        // icons: { calendar: null, clock: null },
        editMode: "inline",
        rootDisplay: "stepper",
      },
    };
  },
  mounted() {
    // await this.$http({
    //   method: "get",
    //   url: oapi + "/collections/discovery-metadata/items/" + self.topic,
    // }).then(function (response) {
    //   // handle success
    //   self.model = response.data;
    // });
    this.loadMCF();
  },
  methods: {
    async loadMCF() {
      this.loading = true;
      var self = this;
      var cc = this.topic.split(".")[0];
      var url = `${baseURL}/metadata/discovery/${cc}-surface-weather-observations.yml`;
      await this.$http({
        method: "get",
        url: url,
      })
        .then(function (response) {
          // handle success
          self.model = parse(response.data);
          console.log(self.model);
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        });

      $RefParser.dereference(mcf, (err, schema) => {
        if (err) {
          console.error(err);
        } else {
          this.title = schema.title;

          const mergedSchema = mergeAllOf(schema);
          const parsedSchema = this.parseSchema("root", mergedSchema);

          this.schema = Object.assign({}, parsedSchema);
          this.loading = false;
        }
      });
    },
    parseSchema(title, node) {
      if (typeof node !== "object") {
        return node;
      } else if (node.length) {
        for (var i = 0; i < node.length; i++) {
          this.parseSchema(`node-${i}`, node[i]);
        }
        return node;
      } else {
        for (const [key, val] of Object.entries(node)) {
          if (title === "properties") this.parseSchema(key, val);
          else this.parseSchema("", val);
        }
      }

      if (!title) return;
      node.title = clean(node.title) | clean(title);
      // if (!node.type) node.type = "object";

      return node;
    },
  },
};
</script>
