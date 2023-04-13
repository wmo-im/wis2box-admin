<template id="discovery-metadata-form">
  <div class="discovery-metadata-form">

    <v-card flat>

      <v-toolbar color="#014e9e" dark flat>

        <v-toolbar-title v-html="$t(`datasets.discovery_metadata`)" />

        <v-spacer />

        <div style="width:66%; max-width: 66%"> 
          <v-select
            class="mt-3 text-xs-right"
            v-model="identifier"
            :items="items"
            dense
            @change="loadForm(identifier)"
          ></v-select>
        </div>

      </v-toolbar>

      <v-progress-linear indeterminate color="primary" :active="working" />

      <v-form v-model="filled" v-if="loaded">
        <bbox-editor @geomUpdate="updateGeometry" v-bind:input-feature="form.bounds"
        ></bbox-editor>
        <v-jsf
          v-model="model"
          :schema="schema"
          :options="options"
          @change-child="updateModel($event)"
        />
      </v-form>

      <v-toolbar color="#DDD" dark flat v-if="loaded">

        <v-btn 
          color="red" 
          class="ma-2" 
          title="Reset" 
          @click="resetForm()"
        >
          reset 
          <v-icon>mdi-sync</v-icon>
        </v-btn>

        <v-spacer />

        <v-btn 
          color="#009900" 
          class="ma-2" 
          title="Check Availability"
          @click="validateForm()"
          :disabled="filled" 
          v-if="!validated"
        >
          check availability
          <v-icon>mdi-check-bold</v-icon>
        </v-btn>

        <v-btn 
          color="#FFA500" 
          class="ma-2" 
          title="Export" 
          @click="downloadForm()"
          :disabled="!validated" 
          v-if="validated"
        >
          export
          <v-icon>mdi-arrow-down-bold-box-outline</v-icon>
        </v-btn>

        <v-btn 
          color="#009900" 
          class="ma-2" 
          title="Submit"
          
          :disabled="!validated" 
          v-if="validated"
        >
          submit
          <v-icon>mdi-cloud-upload</v-icon>
        </v-btn>

      </v-toolbar>

    </v-card>
    
  </div>
</template>

<script>
import VJsf from "@koumoul/vjsf/lib/VJsf.js"
import BboxEditor from "@/components/leaflet/BboxEditor.vue";
import "@koumoul/vjsf/lib/VJsf.css"
import "@koumoul/vjsf/lib/deps/third-party.js"
import $RefParser from "@apidevtools/json-schema-ref-parser"
import mergeAllOf from "json-schema-merge-allof"
import { parse } from "yaml"
import { clean } from "@/scripts/helpers.js"
import form_schema from "@/models/DiscoveryMetadataForm.json"

let baseURL = window.VUE_ADMIN_URL
let oapi = window.VUE_APP_OAPI

export default {
  name: "DiscoveryMetadataForm",
  template: "#discovery-metadata-form",
  props: ["topic"],
  components: { 
    VJsf: VJsf,
    BboxEditor
  },
  data: function () {
    return {
      loaded: false,
      working: false,
      validated: false,
      filled: false,
      items: [],
      identifier: "",
      model: {},
      schema: {},
      options: {
        // icons: { calendar: null, clock: null },
        editMode: "inline",
        rootDisplay: "stepper",
      },
      form: {
        bounds: null,
        initialized: false,
        manual_ids: false
      }
    }
  },
  mounted() {
    this.loadMetadata()
  },
  methods: {
    log(item) {
      console.log(item)
    },
    async loadMetadata() {
      var self = this
      await this.$http({
        method: "get",
        url: `${oapi}/collections/discovery-metadata/items`
      })
        .then(function (response) {
          // handle success
          response.data.features.forEach(function (item) {
            self.items.push(item.id)
          })
          self.items.push("Create New...")
        })
        .catch(function (error) {
          // handle error
          console.log(error)
        })
    },
    async loadForm(identifier) {
      this.loaded = false
      this.working = true
      var is_errored = false

      if (identifier === "Create New...") {
        this.model = {}
      }
      else {
        var self = this
        var cc = this.topic.split(".")[0]
        var url = `${baseURL}/metadata/discovery/${cc}-surface-weather-observations.yml`
        await this.$http({
          method: "get",
          url: url,
        })
          .then(function (response) {
            // handle success
            self.model = parse(response.data)
            console.log(self.model)
          })
          .catch(function (error) {
            // handle error
            console.log(error)
            is_errored = true
            alert("Error loading metadata control file.")
          })
        }

      $RefParser.dereference(form_schema, (err, schema) => {
        if (err) {
          console.error(err)
        } else {
          this.title = schema.title

          const mergedSchema = mergeAllOf(schema)
          const parsedSchema = this.prepareSchema("root", mergedSchema)

          this.schema = Object.assign({}, parsedSchema)
        }
      })

      this.working = false
      if (!is_errored) {
        this.loaded = true
      }
    },
    updateGeometry(input) {
      console.log(input)
    },
    resetForm() {
      this.model = {}
      this.form.initialized = false
    },
    validateForm() {
      this.validated = true
      this.form.bounds = [0,10,20,30]
    },
    downloadForm() {
      var content = encodeURI(JSON.stringify(this.modulateModel(this.model), null, 4))
      var element = document.createElement("a")
      element.href = "data:attachment/text," + content
      element.target = "_blank"
      element.download = "discovery-metadata.json"
      element.click()
    },
    updateModel($event) {
      this.validated = false

      // Only auto-fill on form changes.
      if ( 
        (this.loaded === false) && 
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
      var today = new Date()
      var output = {}

      // "id"
      output["conformsTo"] = input.settings.identifier

      // "conformsTo"
      output["conformsTo"] = [ this.schema.version ]

      // "time"

      // "type"
      output["type"] = "Feature"

      // "geometry"
      output["geometry"] = {}
      output["geometry"]["type"] = "Polygon"

      // "properties"
      output["properties"] = JSON.parse(JSON.stringify(input.properties))
      output["properties"]["type"] = "dataset"
      output["properties"]["wmo:topicHierarchy"] = `origin/a/wis2/${input.settings.topicHierarchy}`
      output["properties"]["updated"] = today.toISOString().split('T')[0]
      if (!("created" in output["properties"])) {
        output["properties"]["created"] = today.toISOString().split('T')[0]
      }

      // "properties"."themes"
      output["properties"]["themes"] = []
      input.settings.keywords.forEach(function (keyword) {
        output.properties.themes.push({ "concepts": [{ "id": keyword }] })
      })

      // "properties"."wis2box"
      output["properties"]["wis2box"] = {}
      output["properties"]["wis2box"]["country"] = input.poc.country.toUpperCase()
      output["properties"]["wis2box"]["centre_id"] = input.settings.centre_id
      output["properties"]["wis2box"]["retention"] =  `P${input.settings.retention.toUpperCase()}`

      // "properties"."providers"
      output["properties"]["providers"] = []


      // "links"
      output["links"] = []
      output.links.push({
        "rel": "collection",
        "href": `http://localhost/oapi/collections/${input.settings.identifier}`,
        "type": "OAFeat",
        "title": input.settings.identifier
      })
      output.links.push({
        "rel": "data",
        "href": "mqtt://everyone:everyone@mosquitto:1883",
        "type": "MQTT",
        "title": input.settings.topicHierarchy.replace(/\//g, "."),
        "channel": `origin/a/wis2/${input.settings.topicHierarchy}`
      })
      output.links.push({
        "rel": "canonical",
        "href": `http://localhost/oapi/collections/discovery-metadata/items/${input.settings.identifier}`,
        "type": "OARec",
        "title": input.settings.identifier
      })

      return output
    },
    demodulateModel(input) {

      alert("#todo not reformatted")
      
      var output = input

      return output

    },
    prepareSchema(title, node) {
      if (typeof node !== "object") {
        return node
      } else if (node.length) {
        for (var i = 0; i < node.length; i++) {
          this.prepareSchema(`node-${i}`, node[i])
        }
        return node
      } else {
        for (const [key, val] of Object.entries(node)) {
          if (title === "properties") this.prepareSchema(key, val)
          else this.prepareSchema("", val)
        }
      }

      if (!title) return
      node.title = clean(node.title) | clean(title)

      return node
    },
  },
}
</script>
