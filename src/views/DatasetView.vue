<template id="dataset-view">
  <div class="dataset-view">
    <v-card flat class="pa-2">
      <v-row v-for="(item, i) in datasets" :key="i" fill-height>
        <v-col sm="12" md="3">
          <v-hover>
            <template v-slot:default="{ hover }">
              <v-card
                class="pa-0 mx-auto"
                @click="loadMap(item.id)"
                height="160px"
                width="256px"
              >
                <v-fade-transition>
                  <v-overlay v-if="hover" absolute>
                    <v-btn>
                      {{ $t("datasets.edit") }}
                    </v-btn>
                  </v-overlay>
                </v-fade-transition>
                <dataset-map :dataset="item" />
              </v-card>
            </template>
          </v-hover>
        </v-col>
        <v-col sm="12" md="9" class="text-center">
          <v-col>
            <h2>
              {{ item.properties.title }}
            </h2>
          </v-col>
          <v-col class="flex-nowrap">
            <span class="pt-2">
              <strong>{{ $t("datasets.topic") + ": " }}</strong>
              <code>{{ item.id }}</code>
            </span>
          </v-col>
          <v-col>
            <v-btn-toggle v-show="$vuetify.breakpoint.mdAndUp" borderless>
              <v-btn
                v-for="(item, i) in item.links"
                :key="i"
                :title="item.type"
                :href="item.href"
                :to="item.target"
                :target="`_window_${item.type}`"
                depressed
                large
              >
                {{ $t(`datasets.${item.msg}`) }}
                <v-icon> {{ item.icon }} </v-icon>
              </v-btn>
            </v-btn-toggle>
            <v-row
              v-show="$vuetify.breakpoint.smAndDown"
              v-for="(item, i) in item.links"
              :key="i"
              justify="center"
              class="my-1"
            >
              <v-btn
                block
                :title="item.type"
                :href="item.href"
                :to="item.target"
                :target="`_window_${item.type}`"
              >
                {{ $t(`datasets.${item.msg}`) }}
                <v-icon end :icon="item.icon" />
              </v-btn>
            </v-row>
          </v-col>
        </v-col>
        <v-divider v-if="i + 1 < datasets.length" />
      </v-row>
    </v-card>
  </div>
</template>

<script>
import DatasetMap from "../components/leaflet/DatasetMap.vue";

let oapi = window.VUE_APP_OAPI;

export default {
  name: "DatasetView",
  template: "#dataset-view",
  components: {
    DatasetMap,
  },
  data: function () {
    return {
      datasets: [],
    };
  },
  async created() {
    const response = await fetch(
      oapi + "/collections/discovery-metadata/items?f=json"
    );
    const data = await response.json();
    for (var c of data.features) {
      const links = [
        {
          href: undefined,
          target: `/${c.id}`,
          type: "Edit",
          msg: "edit",
          icon: "mdi-pencil-outline",
        },
      ];
      for (var link of c.links) {
        if (link.type === "OARec") {
          links.push({
            href: link.href,
            target: undefined,
            type: "OARec",
            msg: "dm",
            icon: "mdi-open-in-new",
          });
        } else if (link.type === "OAFeat") {
          links.push({
            href: link.href,
            target: undefined,
            type: "OAFeat",
            msg: "oafeat",
            icon: "mdi-open-in-new",
          });
        }
      }
      c.bbox = [
        c.geometry.coordinates[0][0][0],
        c.geometry.coordinates[0][0][1],
        c.geometry.coordinates[0][2][0],
        c.geometry.coordinates[0][2][1],
      ];
      c.links = links;
      this.datasets.push(c);
    }
  },
  methods: {
    loadMap(topic) {
      this.$router.push(`/${topic}`);
    },
  },
};
</script>
