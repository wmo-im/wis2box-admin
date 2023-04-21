<template id="discovery-metadata-form">
  <div class="discovery-metadata-form">

    <v-card flat>

      <v-toolbar color="#014e9e" dark flat>

        <v-toolbar-title v-html="$t(`datasets.dm`)" />

        <v-spacer />

        <div style="width:66%; max-width: 66%"> 
          <v-select
            class="mt-3 text-xs-right"
            v-model="identifier"
            :items="items"
            dense
            @change="loadMetadata()"
          ></v-select>
        </div>

      </v-toolbar>

      <v-progress-linear indeterminate color="primary" :active="working" />

      <v-form v-model="filled" v-if="loaded">
        <bbox-editor @updated="updateGeometry" @loaded="loadGeometry" v-bind:input-feature="form.bounds"
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
          @click="resetMetadata()"
        >
          reset 
          <v-icon>mdi-sync</v-icon>
        </v-btn>

        <v-spacer />

        <v-btn 
          color="#009900" 
          class="ma-2" 
          title="Validate"
          @click="validateMetadata()"
          :disabled="!filled" 
          v-if="!validated"
        >
          validate
          <v-icon>mdi-check-bold</v-icon>
        </v-btn>

        <v-btn 
          color="#FFA500" 
          class="ma-2" 
          title="Export" 
          @click="downloadMetadata()"
          :disabled="!validated || !filled" 
          v-if="validated"
        >
          export
          <v-icon>mdi-arrow-down-bold-box-outline</v-icon>
        </v-btn>

        <v-btn 
          color="#009900" 
          class="ma-2" 
          title="Submit"
          @click = "submitMetadata()"
          :disabled="!validated || !filled"
          v-if="validated && form.modified"
        >
          submit
          <v-icon>mdi-cloud-upload</v-icon>
        </v-btn>

      </v-toolbar>

      <v-card color="#DDD" dark flat v-if="!loaded" class="pa-5">
        <p class="black--text ma-0">{{ message }}</p>
      </v-card>

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
import { clean } from "@/scripts/helpers.js"
import form_schema from "@/models/DiscoveryMetadataForm.json"

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
      message: "Select a discovery metadata file.",
      items: [],
      identifier: "",
      defaults: {},
      model: {},
      is_new: false,
      schema: {},
      options: {
        // icons: { calendar: null, clock: null },
        editMode: "inline",
        rootDisplay: "stepper",
      },
      form: {
        bounds: [0],
        initialized: true,
        modified: false,
        manual_ids: true
      }
    }
  },
  mounted() {
    var tmp = window.location.href.split("/")
    this.loadList(tmp[tmp.length - 1])
  },
  methods: {

    async loadList(identifier) {
      var self = this

      // Load list.
      await this.$http({
        method: "get",
        url: `${oapi}/collections/discovery-metadata/items`
      })
        .then(function (response) {
          response.data.features.forEach(function (item) {
            self.items.push(item.id)
          })
          self.items.push("Create New...")
        })
        .catch(function (error) {
          console.log(error)
          self.items = ["Create New..."]
          self.message = "Error loading discovery metadata list."
        })

      // Load specific file, if specified.
      if (self.items.includes(identifier)) {
        self.identifier = identifier
        await self.loadMetadata()
      }
    },

    async loadMetadata() {
      var self = this
      this.loaded = false
      this.working = true
      this.message = "Working..."
      this.form.modified = false

      if (self.identifier === "Create New...") {
        self.defaults = {}
        self.form.bounds = [0]
        self.form.initialized = false
        self.form.manual_ids = false
        self.validated = false
        self.is_new = true
      }
      else {
        self.is_new = false
        self.validated = true
        var url = `${oapi}/collections/discovery-metadata/items/${self.identifier}`
        await this.$http({
          method: "get",
          url: url,
        })
          .then(function (response) {
            //console.log(response.data)
            self.defaults = self.demodulateModel(response.data)
            //console.log(self.defaults)
            self.form.initialized = true
          })
          .catch(function (error) {
            console.log(error)
            self.message = "Error loading discovery metadata file."
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

      if (!self.message.includes("Error")) {
        self.model = self.defaults
        self.loaded = true
      }
      self.working = false
      self.message = "Select a discovery metadata file."
    },

    resetMetadata() {
      this.model = this.defaults
      this.form.initialized = false
    },

    async validateMetadata() {
      var self = this
      var is_valid = true

      // Validate topic hierachy.
      //await this.$http({
      // method: "post",
      //  url: `${oapi}/processes/pywcmp-wis2-topics-validate/execution`,
      //  data: {
      //    "inputs": {
      //      "topic": `origin/a/wis2/${self.model.settings.topicHierarchy}`,
      //      "fuzzy": true
      //    }
      //  }
      //})
      //  .then(function (response) {
      //    if (!response.data.topic_is_valid) {
      //      is_valid = false
      //      alert("Topic hierarchy is invalid.")
      //    }
      //  })
      //  .catch(function (error) {
      //    console.log(error)
      //    is_valid = false
      //    alert("Error validating topic hierarchy.")
      //  })

      // Validate entire WCMP2.
      if (is_valid) {
        await this.$http({
          method: "post",
          url: `${oapi}/processes/pywcmp-wis2-wcmp2-ets/execution`,
          data: {
            "inputs": {
              "record": self.modulateModel(self.model)
            }
          }
        })
          .then(function (response) {
            console.log(response.data)
            if (("code" in response.data)) {
              is_valid = false
              alert(response.data.description)
            }
          })
          .catch(function (error) {
            console.log(error)
            is_valid = false
            alert("Error validating WCMP2 schema.")
          })
      }
      
      // Update UI.
      if (is_valid) {
        self.validated = true
      }
    },

    downloadMetadata() {
      var content = encodeURI(JSON.stringify(this.modulateModel(this.model), null, 4))
      var element = document.createElement("a")
      element.href = "data:attachment/text," + content
      element.target = "_blank"
      element.download = "discovery-metadata.json"
      element.click()
    },

    async submitMetadata() {
      var self = this

      // POST new.
      if (self.is_new) {
        await this.$http({
          method: "post",
          url: `${oapi}/collections/discovery-metadata/items`,
          data: self.modulateModel(self.model)
        })
          .then(function (response) {
            if (response.status === 201) {
              window.location.href = "/"
            }
            else {
              alert(response.data.description)
            }
          })
          .catch(function (error) {
            console.log(error)
            alert("Error adding discovery metadata.")
          })
      }

      // PUT updated.
      else {
        await this.$http({
          method: "put",
          url: `${oapi}/collections/discovery-metadata/items/${self.defaults.settings.identifier}`,
          data: self.modulateModel(self.model)
        })
        .then(function (response) {
            if (response.status === 204) {
              window.location.href = "/"
            }
            else {
              alert(response.data.description)
            }
          })
          .catch(function (error) {
            console.log(error)
            alert("Error updating discovery metadata.")
          })
      }
    },

    loadGeometry() {
      this.updateModel({"fullKey": "origin.northLatitude"})
    },

    updateGeometry(input) {
      if (input.length === 4) {
        this.form.bounds = input
        if ( !("origin" in this.model)) this.model["origin"] = {}
        this.model.origin["northLatitude"] = input[0]
        this.model.origin["eastLongitude"] = input[1]
        this.model.origin["southLatitude"] = input[2]
        this.model.origin["westLongitude"] = input[4]
      }
    },

    updateModel($event) {
      if ($event.fullKey !== "origin.northLatitude") this.form.modified = true

      // Pre-fill form with automatic values.
      if (!this.form.initialized) {

        var today = new Date()

        this.model.origin["dateStarted"] = today.toISOString().split('T')[0]
        this.model.origin["dateEnded"] = null

        this.model.poc.individual = null
        this.model.poc.positionName = null
        this.model.poc.deliveryPoint = null
        this.model.poc.postalCode = null
        this.model.poc.hoursOfService = 
          `0900h - 1700h ${today.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]}`
        
        this.model.distrib.individual = null
        this.model.distrib.positionName = null
        this.model.distrib.deliveryPoint = null
        this.model.distrib.postalCode = null
        this.model.distrib.hoursOfService = 
          `0900h - 1700h ${today.toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]}`
        
        this.form.initialized = true

      }

      // Disable editing identifiers if manually changed.
      if (
        ($event.fullKey === "settings.identifier") ||
        ($event.fullKey === "settings.topicHierarchy")
      ) {
        this.form.manual_ids = true
        this.validated = false
      }

      // Auto-fill topic identifiers.
      if (
        ($event.fullKey === "poc.country") ||
        ($event.fullKey === "origin.centre_id") ||
        ($event.fullKey === "properties.wmo:dataPolicy")
      ) {

        // Only auto-fill if all components are entered, but not manually edited.
        if (
          ("country" in this.model.poc) &&
          (this.model.poc.country.length > 0) &&
          ("centre_id" in this.model.origin) &&
          (this.model.origin.centre_id.length > 0) &&
          ("wmo:dataPolicy" in this.model.properties) &&
          !this.form.manual_ids
        ) {
          this.validated = false
          this.model.settings.identifier = 
            `urn:x-wmo:md:${this.model.poc.country.toLowerCase()}:${this.model.origin.centre_id.toLowerCase()}:weather-observations`
          this.model.settings.topicHierarchy = 
            `${this.model.poc.country.toLowerCase()}/${this.model.origin.centre_id.toLowerCase()}/data/${this.model.properties["wmo:dataPolicy"]}/weather/observations`
        }
      }

      // Null out stop date if empty.
      if ($event.fullKey === "origin.dateStoped") {
        if (
          ( !("dateStoped" in this.model.origin)) ||
          (this.model.origin.dateStoped === null) ||
          (this.model.origin.dateStoped === "") 
        ) {
          this.model.origin["dateStoped"] = null
        }
      }

      // Update map if coordinates are schanged.
      if (
        ($event.fullKey === "origin.northLatitude") ||
        ($event.fullKey === "origin.eastLongitude") ||
        ($event.fullKey === "origin.southLatitude") ||
        ($event.fullKey === "origin.westLongitude")
      ) {
        try {
          if (
            ((parseFloat(this.model.origin.northLatitude) >= -90) && (parseFloat(this.model.origin.northLatitude) <= 90)) &&
            ((parseFloat(this.model.origin.eastLongitude) >= -180) && (parseFloat(this.model.origin.eastLongitude) <= 180)) &&
            ((parseFloat(this.model.origin.southLatitude) >= -90) && (parseFloat(this.model.origin.southLatitude) <= 90)) &&
            ((parseFloat(this.model.origin.westLongitude) >= -180) && (parseFloat(this.model.origin.westLongitude) <= 180))
          ) {
            this.form.bounds = [
              parseFloat(this.model.origin.northLatitude),
              parseFloat(this.model.origin.eastLongitude),
              parseFloat(this.model.origin.southLatitude),
              parseFloat(this.model.origin.westLongitude)
            ]
          }
        }
        catch { false }
      }

      // Auto-fill distributor if copy is selected.
      if ($event.fullKey === "distrib.duplicateFromContact") {
        if (this.model.distrib.duplicateFromContact) {
          var tmp = JSON.parse(JSON.stringify(this.model.poc))
          tmp["duplicateFromContact"] = true
          this.model.distrib = tmp
        }
        else {
          this.model.distrib = {}
        }
      }

      // Automatically correct case.
      if ($event.fullKey === "properties.language") {
        this.model.properties.language = this.model.properties.language.toLowerCase()
      }
      if ($event.fullKey === "origin.centre_id") {
        this.model.origin.centre_id = this.model.origin.centre_id.toLowerCase()
      }
      if ($event.fullKey === "poc.email") {
        this.model.poc.email = this.model.poc.email.toLowerCase()
      }
      if ($event.fullKey === "poc.postalCode") {
        this.model.poc.postalCode = this.model.poc.postalCode.toUpperCase()
      }
      if ($event.fullKey === "poc.country") {
        this.model.poc.country = this.model.poc.country.toUpperCase()
      }
      if ($event.fullKey === "distrib.email") {
        this.model.distrib.email = this.model.distrib.email.toLowerCase()
      }
      if ($event.fullKey === "distrib.postalCode") {
        this.model.distrib.postalCode = this.model.distrib.postalCode.toUpperCase()
      }
      if ($event.fullKey === "distrib.country") {
        this.model.distrib.country = this.model.distrib.country.toUpperCase()
      }

    },

    modulateModel(input) {
      var today = new Date()
      var output = {}

      // "id"
      output["id"] = input.settings.identifier

      // "conformsTo"
      output["conformsTo"] = [ this.schema.version ]

      // "time"
      output["time"] = {}
      if (input.origin.dateStopped == null) {
        output.time["interval"] = [input.origin.dateStarted.split(" ")[0], null]
      }
      else if (input.origin.dateStopped === input.origin.dateStarted) {
        if (input.origin.dateStarted.split(" ").length > 1) {
          var chunk = input.origin.dateStarted.split(" ")
          output.time["timestamp"] = `${chunk[0]}T${chunk[1]}Z`
        }
        else {
          output.time["timestamp"] = input.origin.dateStarted
        }
      }
      else {
        output.timestamp["interval"] = [input.origin.dateStarted.split(" ")[0], input.origin.dateStopped.split(" ")[0]]
      }

      // "type"
      output["type"] = "Feature"

      // "geometry"
      output["geometry"] = {}
      output["geometry"]["type"] = "Polygon"
      output["geometry"]["coordinates"] = [[
        [input.origin.westLongitude, input.origin.southLatitude],
        [input.origin.westLongitude, input.origin.northLatitude],
        [input.origin.eastLongitude, input.origin.northLatitude],
        [input.origin.eastLongitude, input.origin.southLatitude],
        [input.origin.westLongitude, input.origin.southLatitude]
      ]]

      // "properties"
      output["properties"] = input.properties
      output["properties"]["type"] = "dataset"
      output["properties"]["wmo:topicHierarchy"] = `origin/a/wis2/${input.settings.topicHierarchy}`
      output["properties"]["wmo:dataPolicy"] = input.settings["wmo:dataPolicy"]
      output["properties"]["updated"] = today.toISOString().split('T')[0]
      if (!("created" in output["properties"])) {
        output["properties"]["created"] = today.toISOString().split('T')[0]
      }

      // "properties"."wis2box"
      output["properties"]["wis2box"] = {}
      output["properties"]["wis2box"]["country"] = input.poc.country.toLowerCase()
      output["properties"]["wis2box"]["centre_id"] = input.origin.centre_id
      output["properties"]["wis2box"]["retention"] =  `P${input.settings.retention.toUpperCase()}`

      // "properties"."themes"
      output["properties"]["themes"] = []
      input.settings.keywords.forEach(function (keyword) {
        output.properties.themes.push({ "concepts": [{ "id": keyword }] })
      })

      // "properties"."providers"
      output["properties"]["providers"] = []
      var poc = this.modulateContact(input.poc)
      poc.roles.push({ "name": "pointOfContact" })
      if (input.distrib.duplicateFromContact) {
        poc.roles.push({ "name": "distributor" })
      }
      else {
        var distrib = this.modulateContact(input.distrib)
        distrib.roles.push({ "name": "distributor" })
        output.properties.providers.push(distrib)
      }
      output.properties.providers.push(poc)

      // "links"
      output["links"] = []
      output.links.push({
        "rel": "collection",
        "href": `${oapi}/oapi/collections/${input.settings.identifier}`,
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
        "href": `${oapi}/oapi/collections/discovery-metadata/items/${input.settings.identifier}`,
        "type": "OARec",
        "title": input.settings.identifier
      })

      return output
    },

    modulateContact(input) {
      var output = JSON.parse(JSON.stringify(input))

      output["contactInfo"] = {}

      output["name"] = JSON.parse(JSON.stringify(output.organizationName))
      delete output.organizationName

      output.contactInfo["phone"] = {}
      output.contactInfo.phone = JSON.parse(JSON.stringify({ "office": output.phone }))
      delete output.phone

      output.contactInfo["email"] = {}
      output.contactInfo.email = JSON.parse(JSON.stringify({ "office": output.email }))
      delete output.email

      output.contactInfo["address"] = {}
      output.contactInfo.address = JSON.parse(JSON.stringify({ 
        "office": {
          "deliveryPoint": output.deliveryPoint,
          "city": output.city,
          "administrativeArea": output.administrativeArea,
          "postalCode": output.postalCode,
          "country": output.country
        }
      }))
      delete output.deliveryPoint
      delete output.city
      delete output.administrativeArea
      delete output.postalCode
      delete output.country

      output.contactInfo["hoursOfService"] = JSON.parse(JSON.stringify(output.hoursOfService))
      delete output.hoursOfService

      output.contactInfo["contactInstructions"] = JSON.parse(JSON.stringify(output.contactInstructions))
      delete output.contactInstructions

      if ((input.url != null) && (input.url != "")) {
        console.log(input.url)
        output.contactInfo["url"] = {}
        output.contactInfo.url = JSON.parse(JSON.stringify({ 
          "rel": "canonical",
          "type": "text/html",
          "href": input.url
        }))
      }
      else {
        delete output.url
      }

      output["roles"] = []

      return output
    },

    demodulateModel(input) {
      var self = this
      var today = new Date()
      var output = {}

      if ( !("wis2box" in input.properties)) {
        input.properties["wis2box"] = {}
        input.properties.wis2box["country"] = input.properties["wmo:topicHierarchy"].split("/")[0]
        input.properties.wis2box["centre_id"] = input.properties["wmo:topicHierarchy"].split("/")[1]
        input.properties.wis2box["retention"] = "30d"
      }

      output["properties"] = {}
      output.properties["title"] = input.properties.title
      output.properties["description"] = input.properties.description
      output.properties["wmo:dataPolicy"] = input.properties["wmo:dataPolicy"]
      output.properties["created"] = input.properties.created

      output.properties["language"] = "en"
      if (("language" in input.properties) && (input.properties.language != null)) output.properties["language"] = input.properties.language

      output["origin"] = {}
      output.origin["centre_id"] = input.properties.wis2box.centre_id
      if ("interval" in input.time) {
        output.origin["dateStarted"] = input.time.interval[0]
        output.origin["dateStopped"] = input.time.interval[1]
      }
      else if ("timestamp" in input.time) {
        output.origin["dateStarted"] = input.time.timestamp.replace("T", "").replace("Z", "")
        output.origin["dateStopped"] = input.time.timestamp.replace("T", "").replace("Z", "")
      }
      else {
        output.origin["dateStarted"] = today.toISOString().split('T')[0]
        output.origin["dateStopped"] = null
      }

      try {
        output.origin["northLatitude"] = input.geometry.coordinates[0][0][1][1]
        output.origin["eastLongitude"] = input.geometry.coordinates[0][0][2][0]
        output.origin["southLatitude"] = input.geometry.coordinates[0][0][0][1]
        output.origin["westLongitude"] = input.geometry.coordinates[0][0][0][0]
      }
      catch {
        output.origin["northLatitude"] = input.geometry.coordinates[0][1][1]
        output.origin["eastLongitude"] = input.geometry.coordinates[0][2][0]
        output.origin["southLatitude"] = input.geometry.coordinates[0][0][1]
        output.origin["westLongitude"] = input.geometry.coordinates[0][0][0]
      }

      input.properties.providers.forEach(function (provider) {
        var is_poc = false
        var is_distrib = false
        provider.roles.forEach(function (role) {
          if (role.name === "pointOfContact") is_poc = true
          if (role.name === "pointOfContact") is_distrib = true
        })
        if (is_poc) output["poc"] = self.demodulateContact(provider)
        if (is_distrib) {
          output["distrib"] = self.demodulateContact(provider)
          if (is_poc) output.distrib["duplicateFromContact"] = true
          else output.distrib["duplicateFromContact"] = false
        }
      })

      output["settings"] = {}
      output.settings["identifier"] = input.id
      output.settings["topicHierarchy"] = input.properties["wmo:topicHierarchy"].replace("origin/a/wis2/", "")
      output.settings["retention"] = input.properties.wis2box.retention.toLowerCase().replace("p", "")

      output.settings["wmo:dataPolicy"] = "core"
      if ("wmo:dataPolicy" in input.properties) output.settings["wmo:dataPolicy"] = input.properties["wmo:dataPolicy"]

      output.settings["keywords"] = []
      input.properties.themes.forEach(function (theme) {
        theme.concepts.forEach(function (concept) {
          output.settings.keywords.push(concept.id)
        })
      })

      return JSON.parse(JSON.stringify(output))

    },
    
    demodulateContact(input) {
      var output = {}
    
      output["individual"] = null
      if ("individual" in input) output["individual"] = input.individual
      
      output["positionName"] = null
      if ("positionName" in input) output["positionName"] = input.positionName

      output["organizationName"] = null
      if ("name" in input) output["organizationName"] = input.name

      output["url"] = null
      if ("url" in input) output["url"] = input.url

      output["phone"] = input.contactInfo.phone.office
      output["email"] = input.contactInfo.email.office
      output["deliveryPoint"] = input.contactInfo.address.office.deliveryPoint
      output["city"] = input.contactInfo.address.office.city
      output["administrativeArea"] = input.contactInfo.address.office.administrativeArea
      output["postalCode"] = input.contactInfo.address.office.postalCode
      output["country"] = input.contactInfo.address.office.country
      output["hoursOfService"] = input.contactInfo.hoursOfService
      output["contactInstructions"] = input.contactInfo.contactInstructions

      return JSON.parse(JSON.stringify(output))
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
    }
  },
}
</script>
