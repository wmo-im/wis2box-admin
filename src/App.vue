<template>
  <v-app id="v-app">
    <app-header />

    <v-main>
      <v-responsive class="pa-4">
        <v-row justify="center">
          <v-card flat width="90%" max-width="1130">
            <app-nav />
            <router-view />
          </v-card>
        </v-row>
      </v-responsive>
    </v-main>

    <app-footer app class="pt-4" />
  </v-app>
</template>

<script>
import AppFooter from "@/components/app/AppFooter.vue";
import AppHeader from "@/components/app/AppHeader.vue";
import AppNav from "@/components/app/AppNav.vue";

export default {
  components: {
    AppFooter,
    AppHeader,
    AppNav,
  },
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    toggleDialog: function () {
      this.dialog = this.dialog === true ? false : true;
    },
  },
};
</script>