#!/bin/sh

#env="
#window.VUE_APP_OAPI='${WIS2BOX_API_URL}'\n
#window.VUE_ADMIN_URL='${WIS2BOX_URL}/admin'\n
#"
env="
window.VUE_APP_URL='http://localhost'\n
window.VUE_APP_OAPI='http://localhost/oapi'\n
window.VUE_ADMIN_URL='http://localhost'\n
"
echo $env > /usr/share/nginx/html/env.js
