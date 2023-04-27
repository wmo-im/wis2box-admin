import Vue from "vue";
import VueRouter from "vue-router";
import DatasetView from "../views/DatasetView.vue";
import EditView from "../views/EditView.vue";
import StationsView from "../views/StationsView.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    name: "home",
    component: DatasetView
  },
  {
    path: "/stations",
    name: "Stations",
    component: StationsView
  },
  {
    path: "/:topic",
    props: true,
    name: "Dataset Editor",
    component: EditView
  }
];

const router = new VueRouter({
  mode: "history",
  base: window.VUE_ADMIN_LOC,
  routes
});

export default router;
