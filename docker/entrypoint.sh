#!/bin/sh

env="
window.VUE_APP_OAPI='${WIS2BOX_API_URL}'\n
window.VUE_BASE_URL='${WIS2BOX_UI_ADMIN_BASEURL}'\n
window.VUE_APP_URL='${WIS2BOX_URL}'\n
window.VUE_ADMIN_URL='http://localhost/${WIS2BOX_UI_ADMIN_BASEURL}'\n
window.MQTT_HOST='${WIS2BOX_BROKER_HOST}'\n
window.VUE_APP_BASEMAP_URL='https://\{s\}.tile.openstreetmap.org/\{z\}/\{x\}/\{y\}.png'\n
window.VUE_APP_BASEMAP_ATTRIBUTION='$&copy; <a href=\"https://osm.org/copyright\">OpenStreetMap</a> contributors'\n
"
echo $env > /usr/share/nginx/html/env.js
