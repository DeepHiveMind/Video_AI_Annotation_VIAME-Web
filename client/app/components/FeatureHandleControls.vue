<script lang="ts">
import Vue, { PropType } from 'vue';
import { Ref } from '@vue/composition-api';

export default Vue.extend({
  props: {
    selectedFeatureHandle: {
      type: Object as PropType<Ref<number>>,
      required: true,
    },
    innerMode: {
      type: Object as PropType<Ref<string>>,
      required: true,
    },
  },
});
</script>

<template>
  <span>
    <v-btn
      v-if="selectedFeatureHandle.value >= 0"
      color="error"
      @click="$emit('delete-point')"
    >
      <v-icon>mdi-delete</v-icon>
      delete point {{ selectedFeatureHandle.value }}
    </v-btn>
    <v-btn
      v-if="innerMode.value != 'none'"
      color="warning"
      @click="$emit('toggle-poly-mode')"
    >
      Poly:{{ innerMode.value }}
    </v-btn>
  </span>
</template>
