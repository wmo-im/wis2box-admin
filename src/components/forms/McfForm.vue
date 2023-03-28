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
        <v-menu>
          <template v-slot:activator="{ on, attrs }">
            <v-btn
              color="#FFA500" 
              class="ma-2" 
              title="Download"
              v-bind="attrs"
              v-on="on"
              :disabled="!valid"
            >
              export
              <v-icon>mdi-arrow-down-bold-box-outline</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item @click="downloadForm('json')">
              <v-list-item-title>JSON</v-list-item-title>
            </v-list-item>
            <v-list-item @click="downloadForm('yaml')">
              <v-list-item-title>YAML</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
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
import { parse, stringify } from "yaml";
import { clean } from "@/scripts/helpers.js";
import mcf_schema from "@/models/mcf-form.json";

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
      form: {
        initialized: false,
        manual_ids: false
      }
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
      this.form.initialized = false
    },
    downloadForm(format) {
      var content = encodeURI(JSON.stringify(this.modulateModel(this.model), null, 4))
      if (format === 'yaml') {
        content = encodeURI(stringify(this.modulateModel(this.model), null, 4))
      }
      var element = document.createElement("a")
      element.href = "data:attachment/text," + content
      element.target = "_blank"
      element.download = this.model.identifiers.topic_hierarchy + "." + format
      element.click()
    },
    updateModel($event) {
      this.log(JSON.stringify($event))

      // Only auto-fill on form changes.
      if ( 
        (this.loading === false) && 
        ("fullKey" in $event) && 
        !("oldValue" in $event) 
      ) {

        // Pre-fill form with automatic values.
        if (!this.form.initialized) {

          var today = new Date()

          this.model.identification["date_started"] = today.toISOString().split('T')[0]
          this.model.identification["date_ended"] = null

          this.model.poc.fax = null
          this.model.poc.address = null
          this.model.poc.postalcode = null
          this.model.poc.hoursofservice = 
            `0900h - 1700h ${today.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]}`
          
          this.model.distrib.fax = null
          this.model.distrib.address = null
          this.model.distrib.postalcode = null
          this.model.distrib.hoursofservice = 
            `0900h - 1700h ${today.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]}`

          this.model.identifiers.date_published = today.toISOString().split('T')[0]
          
          this.form.initialized = true

        }

        // Disable editing identifiers if manually changed.
        if (
          ($event.fullKey === "identifiers.topic_hierarchy") ||
          ($event.fullKey === "identifiers.identifier")
        ) {
          this.manual_ids = true
        }

        // Auto-fill topic identifiers.
        if (
          ($event.fullKey === "meta.country") ||
          ($event.fullKey === "meta.centre_id") ||
          ($event.fullKey === "identification.wmo_data_policy") ||
          ($event.fullKey === "identification.wmo_keywords")
        ) {

          // Only auto-fill if all components are entered, but not manually edited.
          if (
            ("country" in this.model.meta) &&
            (this.model.meta.country.length > 0) &&
            ("centre_id" in this.model.meta) &&
            (this.model.meta.centre_id.length > 0) &&
            ("wmo_data_policy" in this.model.identification) &&
            ("wmo_keywords" in this.model.identification) &&
            (this.model.identification.wmo_keywords.length > 0) &&
            !this.form.manual_ids
          ) {

            // Extract topic components.
            var comp1 = this.model.identification.wmo_keywords[0]
            var comp2 = "observations"
            var index = -1
            for (var i = 0; i < this.model.identification.wmo_keywords[0].length; i++) {
              if (this.model.identification.wmo_keywords[0][i] === this.model.identification.wmo_keywords[0][i].toUpperCase()) {
                index = i
                break
              }
            }
            if (index !== -1) {
              comp1 = this.model.identification.wmo_keywords[0].substring(0, index)
              comp2 = this.model.identification.wmo_keywords[0].substring(index).toLowerCase()
            }

            // Create pre-defined topic identifiers.
            this.model.identifiers.topic_hierarchy = 
              `${this.model.meta.country}.${this.model.meta.centre_id}.data.${this.model.identification.wmo_data_policy}.${comp1}.${comp1}-${comp2}`
            this.model.identifiers.identifier = 
              `urn:x-wmo:md:${this.model.meta.country}:${this.model.meta.centre_id}:${comp1}-${comp2}`

          }
        }

        // Auto-fill distributor if copy is selected.
        if ($event.fullKey === "distrib.duplicate_from_poc") {
          if (this.model.distrib.duplicate_from_poc) {
            var tmp = JSON.parse(JSON.stringify(this.model.poc))
            tmp["duplicate_from_poc"] = true
            this.model.distrib = tmp
          }
          else {
            this.model.distrib = {}
          }
        }

        // Automatically make lowercase.
        if ($event.fullKey === "meta.country") {
          this.model.meta.country = this.model.meta.country.toLowerCase()
        }
        if ($event.fullKey === "meta.centre_id") {
          this.model.meta.centre_id = this.model.meta.centre_id.toLowerCase()
        }
        if ($event.fullKey === "meta.language") {
          this.model.meta.language = this.model.meta.language.toLowerCase()
        }
        if ($event.fullKey === "identification.url") {
          this.model.identification.url = this.model.identification.url.toLowerCase()
        }
        if ($event.fullKey === "poc.url") {
          this.model.poc.url = this.model.poc.url.toLowerCase()
        }
        if ($event.fullKey === "poc.email") {
          this.model.poc.email = this.model.poc.email.toLowerCase()
        }
        if ($event.fullKey === "distrib.url") {
          this.model.distrib.url = this.model.distrib.url.toLowerCase()
        }
        if ($event.fullKey === "distrib.email") {
          this.model.distrib.email = this.model.distrib.email.toLowerCase()
        }
        if ($event.fullKey === "identifiers.topic_hierarchy") {
          this.model.identifiers.topic_hierarchy = this.model.identifiers.topic_hierarchy.toLowerCase()
        }
        if ($event.fullKey === "identifiers.identifier") {
          this.model.identifiers.identifier = this.model.identifiers.identifier.toLowerCase()
        }

      }
    },
    modulateModel(input) {

      var output = {}

      output["mcf"] = { version: this.schema.version }

      output["wis2box"] = {}
      output["wis2box"]["country"] = input.meta.country
      output["wis2box"]["centre_id"] = input.meta.centre_id
      output["wis2box"]["retention"] =  `P${input.meta.retention.toUpperCase()}`
      output["wis2box"]["topic_hierarchy"] = input.identifiers.topic_hierarchy


      output["metadata"] = {}
      output["metadata"]["identifier"] = input.identifiers.identifier
      output["metadata"]["hierarchylevel"] = input.meta.hierarchylevel
      output["metadata"]["language"] = input.meta.language
      output["metadata"]["charset"] = input.meta.charset

      output["identification"] = {}
      output["identification"]["title"] = input.identification.title
      output["identification"]["abstract"] = input.identification.abstract
      output["identification"]["url"] = input.identification.url
      output["identification"]["wmo_data_policy"] = input.identification.wmo_data_policy
      output["identification"]["language"] = input.meta.language
      output["identification"]["charset"] = input.meta.charset
      output["identification"]["dates"] = {}
      output["identification"]["dates"]["creation"] = input.identification.date_started
      output["identification"]["dates"]["publication"] = input.identifiers.date_published
      output["identification"]["keywords"] = {}
      output["identification"]["keywords"]["default"] = {}
      output["identification"]["keywords"]["default"]["keywords"] = input.identification.search_keywords
      output["identification"]["keywords"]["wmo"] = {}
      output["identification"]["keywords"]["wmo"]["keywords"] = input.identification.wmo_keywords
      output["identification"]["keywords"]["wmo"]["keywords_type"] = "theme"
      output["identification"]["keywords"]["wmo"]["vocabulary"] = {}
      output["identification"]["keywords"]["wmo"]["vocabulary"]["name"] = "WMO Category Code"
      output["identification"]["keywords"]["wmo"]["vocabulary"]["url"] = "https://github.com/wmo-im/wcmp-codelists/blob/main/codelists/WMO_CategoryCode.csv"
      output["identification"]["extents"] = {}
      output["identification"]["extents"]["spatial"] = {}
      output["identification"]["extents"]["spatial"]["bbox"] = 
        `[${input.identification.leftmost_longitude}, ${input.identification.bottommost_latitude}, ${input.identification.rightmost_longitude}, ${input.identification.topmost_latitude}]`
        output["identification"]["extents"]["spatial"]["crs"] = 4326
      output["identification"]["extents"]["temporal"] = {}
      output["identification"]["extents"]["temporal"]["begin"] = input.identification.date_started
      output["identification"]["extents"]["temporal"]["end"] = input.identification.date_ended
      output["identification"]["extents"]["temporal"]["resolution"] = `P${input.identification.resolution.toUpperCase()}`

      output["contact"] = {}
      output["contact"]["pointOfContact"] = input.poc
      output["contact"]["distributor"] = input.distrib
      delete output["contact"]["distributor"]["duplicate_from_poc"]

      this.log(JSON.stringify(output))

      return output
    },
    demodulateModel(input) {

      alert("#todo not reformatted")
      
      var output = {}

      output["wis2box"] = input.wis2box
      output["wis2box"]["retention"] =  `P${input.wis2box.retention.toUpperCase()}`

      output["metadata"] = input.metadata

      output["identification"] = {}
      output["identification"]["title"] = input.identification.title
      output["identification"]["abstract"] = input.identification.abstract
      output["identification"]["url"] = input.identification.url
      output["identification"]["wmo_data_policy"] = input.identification.wmo_data_policy
      output["identification"]["search_keywords"] = input.identification.keywords.default.keywords
      output["identification"]["wmo_keywords"] = input.identification.keywords.wmo.keywords

      output["poc"] = input.contact.pointOfContact
      output["distrib"] = input.contact.distributor
      output["distrib"]["duplicate_info"] = false

      return output

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
