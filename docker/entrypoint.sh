#!/bin/sh

env="
window.VUE_APP_OAPI='${WIS2BOX_API_URL}'\n
window.VUE_ADMIN_LOC='${WIS2BOX_ADMIN_LOC}'\n
"
#env="
#window.VUE_APP_URL='http://localhost'\n
#window.VUE_APP_OAPI='http://localhost/oapi'\n
#window.VUE_ADMIN_URL='http://localhost'\n
#window.VUE_ADMIN_LOC='manager'\n
#"
echo $env > /usr/share/nginx/html/env.js
