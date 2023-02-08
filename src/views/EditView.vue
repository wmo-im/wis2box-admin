<template id="edit-view">
  <div class="edit-view">
    <v-card class="mx-auto" width="90%">
      <mcf-form :topic="topic" />
    </v-card>
  </div>
</template>

<script>
import McfForm from "@/components/forms/McfForm.vue";

export default {
  name: "EditView",
  template: "#edit-view",
  props: ["topic"],
  components: { McfForm },
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
