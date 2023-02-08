<template id="select-locale">
  <div class="select-locale">
    <v-menu>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          class="font-weight-bold"
          v-html="$t('language')"
          color="#FFFFFF"
          plain
          v-bind="attrs"
          v-on="on"
        />
      </template>
      <v-list>
        <v-list-item
          v-for="(name, lang) in languages"
          :key="`lang-${name}`"
          @click="setLocale(lang)"
        >
          <v-list-item-title>{{ name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
// https://www.digitalocean.com/community/tutorials/vuejs-vue-with-i18n
import { loadLocaleMessages } from "@/locales/i18n";
import { defineComponent } from "vue";

export default defineComponent({
  name: "SelectLocale",
  template: "#select-locale",
  computed: {
    languages: function () {
      const temp = {};
      for (const [key, value] of Object.entries(loadLocaleMessages())) {
        temp[key] = value.language;
      }
      return temp;
    },
  },
  methods: {
    setLocale(language) {
      this.$i18n.locale = language;
      this.$vuetify.locale = language;
    },
  },
});
</script>