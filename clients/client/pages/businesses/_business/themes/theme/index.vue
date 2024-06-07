<template>
  <v-container fluid class="pa-0">
    <v-row
      v-if="showTheme"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <themes/>
      </v-col>
    </v-row>
    <v-row
      v-else
    >
      <v-spacer></v-spacer>
        seems like you don't have access
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import themes from '../../../../../components/themes/themesView/themes.vue'

  @Component({
    components: {
      themes
    },
  })
  export default class Themes extends Vue {

    showTheme = false;

    mounted() {
      if (!this.$auth.user || !this.$auth.user.customRole) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      if(customRole.length===0) {
        this.showTheme = true;
      }
      if(this.$store.state.permissions.includes('resource/get/themes')) {
        this.showTheme = true;
      }
    }
  }
</script>