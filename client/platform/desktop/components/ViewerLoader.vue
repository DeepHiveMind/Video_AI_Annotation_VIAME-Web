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
    // datasetId: {
    //   type: String,
    //   required: true,
    // },
  },

  setup() {
    const datasetId = ref('noop');
    const dataset = ref('noop');
    const frameRate = ref(30);
    const annotatorType = ref('VideoAnnotator');
    const imageData = ref([]);
    const videoUrl = ref('');

    return {
      dataset,
      datasetId,
      frameRate,
      annotatorType,
      imageData,
      videoUrl,
    };
  },
});
</script>

<template>
  <Viewer
    :frame-rate="frameRate"
    :annotator-type="annotatorType"
    :image-data="imageData"
    :video-url="videoUrl"
    :dataset-id="datasetId"
  >
    <template #title>
      <v-tabs
        icons-and-text
        hide-slider
        style="flex-basis:0; flex-grow:0;"
      >
        <v-tab>
          Data
          <v-icon>mdi-database</v-icon>
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
