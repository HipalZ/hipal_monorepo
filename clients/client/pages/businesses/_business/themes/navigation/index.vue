<template>
  <v-container fluid class="pa-0">
    <v-row
      v-if="showNavigation"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <navigation/>
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
  import Navigation from '../../../../../components/themes/navigation/navigation.vue'

  @Component({
    components: {
      Navigation
    },
  })
  export default class ThemeNavigation extends Vue {
    showNavigation = false;

    mounted() {
      if (!this.$auth.user || !this.$auth.user.customRole) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      if(customRole.length===0) {
        this.showNavigation = true;
      }
      if(this.$store.state.permissions.includes('resource/get/navigation')) {
        this.showNavigation = true;
      }
    }
  }
</script>