<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import Viewer from 'viame-web-common/components/Viewer.vue';
/**
 * ViewerLoader is responsible for loading
 * data from girder.
 */
export default defineComponent({
  components: { Viewer },
  props: {
    path: {
      type: String,
      required: true,
    },
  },
});
</script>

<template>
  <Viewer :dataset-id="path">
    <template #title>
      <v-tabs
        icons-and-text
        hide-slider
        style="flex-basis:0; flex-grow:0;"
      >
        <v-tab to="/recent">
          Recent
          <v-icon>mdi-folder-open</v-icon>
        </v-tab>
        <v-tab to="/settings">
          Settings<v-icon>mdi-settings</v-icon>
        </v-tab>
      </v-tabs>
      <span
        v-if="dataset"
        class="title pl-3"
      >
        Hello!
        <!-- {{ dataset.name }} -->
      </span>
    </template>
  </Viewer>
</template>
