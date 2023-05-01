<template id="app-nav">
  <div class="app-nav">
    <v-app-bar flat class="mb-2" color="#FFFFFF">
      <v-app-bar-title flat color="#FFFFFF" class="text-no-wrap">
        <div>WIS2.0 Admin Console</div></v-app-bar-title>
      <v-spacer />
      <v-btn-toggle borderless>
        <v-hover
          v-for="(item, i) in items"
          :key="i"
          v-slot="{ isHovering, props }"
        >
          <v-btn
            :href="item.href"
            :to="item.target"
            :target="`_window_${item.text}`"
            :color="isHovering ? '#014e9e' : undefined"
            class="font-weight-bold"
            variant="text"
            v-bind="props"
          >
            {{ $t(`navigation.${item.text}`) }}
            <v-icon v-if="item.href !== undefined"> mdi-open-in-new </v-icon>
          </v-btn>
        </v-hover>
      </v-btn-toggle>
    </v-app-bar>
  </div>
</template>

<script>
import { documentation } from "../../../package";
// let baseURL = window.VUE_ADMIN_URL;

import { defineComponent } from "vue";

export default defineComponent({
  name: "AppNav",
  template: "#app-nav",
  data: function () {
    return {
      items: [
        {
          text: "home",
          target: undefined,
          href: "/",
        },
        {
          text: "datasets",
          target: "/",
          href: undefined,
        },
        {
          text: "stations",
          target: "/stations",
          href: undefined,
        },
        // {
        //   text: "monitoring",
        //   target: undefined,
        //   href: `${baseURL}monitoring`,
        // },
        {
          text: "documentation",
          target: undefined,
          href: documentation,
        },
      ],
    };
  },
});
</script>
