<template>
  <v-container fluid class="pa-0">
    <v-row
      v-if="showExplore"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <explore/>
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
  import explore from '../../../../../components/themes/explore/explore.vue'

  @Component({
    components: {
      explore
    },
  })
  export default class Explore extends Vue {

    showExplore = false;

    mounted() {
      if (!this.$auth.user || !this.$auth.user.customRole) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      if(customRole.length===0) {
        this.showExplore = true;
      }
      if(this.$store.state.permissions.includes('resource/get/explorePage')) {
        this.showExplore = true;
      }
    }
  }
</script>