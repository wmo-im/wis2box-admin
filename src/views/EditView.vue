<template id="edit-view">
  <div class="edit-view">
    <v-card>
      <discovery-metadata-form class="mb-8" :topic="topic" />
    </v-card>
  </div>
</template>

<script>
import DiscoveryMetadataForm from "@/components/forms/DiscoveryMetadataForm.vue";

export default {
  name: "EditView",
  template: "#edit-view",
  props: ["topic"],
  components: { DiscoveryMetadataForm },
  data: function () {
    return {
      tab: null,
      loading: true,
      step: 1,
      valid: false,
      model: {},
      schema: {},
      options: {
        rootDisplay: "vertical-stepper",
      },
      title: null,
    };
  },
  created() {
    // await this.$http({
    //   method: "get",
    //   url: oapi + "/collections/discovery-metadata/items/" + self.topic,
    // }).then(function (response) {
    //   // handle success
    //   self.model = response.data;
    // });
  },
};
</script>
