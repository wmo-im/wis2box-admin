import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import i18n from "./locales/i18n.js";
import vuetify from "./plugins/vuetify";
import axios from "axios";
import VueAxios from "vue-axios";
import VueMask from 'v-mask'
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});
Vue.config.productionTip = false;
Vue.use(VueAxios, axios);
Vue.use(VueMask);

new Vue({
  router,
  i18n,
  vuetify,
  render: (h) => h(App)
}).$mount("#wis2box-admin");
