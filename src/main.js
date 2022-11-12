import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./locales/i18n.js";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import VueAxios from "vue-axios";
import VueMask from 'v-mask'

Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(VueMask);

new Vue({
  router,
  i18n,
  vuetify,
  render: (h) => h(App)
}).$mount("#wis2box-admin");
