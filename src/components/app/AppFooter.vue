<template id="app-footer">
  <div class="app-footer">
    <v-footer flat height="110">
      <v-row justify="center">
        <v-col cols="12">
          <v-img :src="foot" :lazy-src="foot" />
        </v-col>
        <v-col class="text-center" cols="12">
          <p>
            {{ $t("footer.powered_by") }}
            <a :title="name" :href="home">{{ name }}</a>
            {{ version }}
          </p>
        </v-col>
      </v-row>
    </v-footer>
  </div>
</template>

<script>
import foot from "@/assets/img/wmo-foot.png";
import { name, version, homepage } from "../../../package";

import { defineComponent } from "vue";

export default defineComponent({
  name: "AppFooter",
  template: "#app-footer",
  data: function () {
    return {
      version: version,
      name: name,
      home: homepage,
      foot: foot,
    };
  },
});
</script>
