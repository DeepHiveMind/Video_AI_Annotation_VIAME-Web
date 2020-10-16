<script lang="ts">
import { defineComponent } from '@vue/composition-api';
import NavigationTitle from 'viame-web-common/components/NavigationTitle.vue';

import { openFromDisk } from '../api/main';

export default defineComponent({
  components: {
    NavigationTitle,
  },
  setup(_, { root }) {
    async function open() {
      const ret = await openFromDisk();
      if (!ret.canceled) {
        root.$router.push({
          name: 'viewer',
          params: { path: ret.filePaths[0] },
        });
      }
    }
    return { open };
  },
});
</script>

<template>
  <v-main>
    <v-app-bar app>
      <NavigationTitle>VIAME Desktop</NavigationTitle>
      <v-tabs
        icons-and-text
        color="accent"
      >
        <v-tab
          :to="{ name: 'recent' }"
        >
          Recents
          <v-icon>mdi-folder-open</v-icon>
        </v-tab>
        <v-tab to="/settings">
          Settings<v-icon>mdi-settings</v-icon>
        </v-tab>
      </v-tabs>
      <v-spacer />
    </v-app-bar>
    <v-container>
      <v-btn @click="open">
        Open
      </v-btn>
    </v-container>
  </v-main>
</template>
