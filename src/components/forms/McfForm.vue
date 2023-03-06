<template id="mcf-form">
  <div class="mcf-form">
    <v-card flat>
      <v-toolbar color="#014e9e" dark flat>
        <v-toolbar-title v-html="$t(`datasets.mcf`)" />

        <v-spacer />
        <v-btn color="blue-grey" class="ma-2" title="Reset" @click="resetForm()">
          reset 
          <v-icon>mdi-sync</v-icon>
        </v-btn>
        <v-btn color="#FFA500" class="ma-2" title="Download" :disabled="!valid" @click="downloadForm()">
          export
          <v-icon>mdi-arrow-down-bold-box-outline</v-icon>
        </v-btn>
        <v-btn color="#009900" class="ma-2" title="Submit" :disabled="!valid">
          submit
          <v-icon>mdi-cloud-upload</v-icon>
        </v-btn>
      </v-toolbar>

      <v-progress-linear indeterminate color="primary" :active="loading" />
      <v-form v-model="valid">
        <v-jsf
          v-model="model"
          :schema="schema"
          :options="options"
          @input="updateModel($event)" 
          @change="updateModel($event)" 
          @input-child="updateModel($event)" 
          @change-child="updateModel($event)"
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
import mcf_schema from "@/models/mcf_schema.json";

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
    this.loadForm();
  },
  methods: {
    log(item) {
      console.log(item)
    },
    async loadForm() {
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

      $RefParser.dereference(mcf_schema, (err, schema) => {
        if (err) {
          console.error(err);
        } else {
          this.title = schema.title;

          const mergedSchema = mergeAllOf(schema);
          const parsedSchema = this.prepareSchema("root", mergedSchema);

          this.schema = Object.assign({}, parsedSchema);
          this.loading = false;
        }
      });
    },
    resetForm() {
      this.model = {}
    },
    downloadForm() {
      alert(JSON.stringify(this.prepareModel(this.model)))
      var element = document.createElement("a")
      var content = encodeURI(JSON.stringify(this.prepareModel(this.model), null, 4))
      element.href = "data:attachment/text," + content
      element.target = "_blank"
      element.download = this.model.wis2box.topic_hierarchy + ".json"
      element.click()
    },
    updateModel($event) {
      this.log($event)
    },
    prepareModel(model) {

      model["mcf"] = { version: this.schema.version.toFixed(1) }

      model["identification"]["keywords"]["default"]["keywords"] = model.identification.search_keywords
      delete model.identification.search_keywords
      model["identification"]["keywords"]["wmo"]["keywords"] = model.identification.wmo_keywords
      model["identification"]["keywords"]["wmo"]["keywords_type"] = "theme"
      model["identification"]["keywords"]["wmo"]["vocabulary"]["name"] = "WMO Category Code"
      model["identification"]["keywords"]["wmo"]["vocabulary"]["url"] = "https://github.com/wmo-im/wcmp-codelists/blob/main/codelists/WMO_CategoryCode.csv"
      delete model.identification.search_keywords

      model["contact"]["pointOfContact"] = model.poc
      delete model.poc
      model["contact"]["distributor"] = model.distrib
      delete model.distrib

      return model
    },
    prepareSchema(title, node) {
      if (typeof node !== "object") {
        return node;
      } else if (node.length) {
        for (var i = 0; i < node.length; i++) {
          this.prepareSchema(`node-${i}`, node[i]);
        }
        return node;
      } else {
        for (const [key, val] of Object.entries(node)) {
          if (title === "properties") this.prepareSchema(key, val);
          else this.prepareSchema("", val);
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
