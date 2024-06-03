<template>
  <v-container fluid class="pa-0">
    <v-row
      v-if="showCategories"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <categories/>
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
  import categories from '../../../../../components/themes/categories/categories.vue'

  @Component({
    components: {
      categories
    },
  })
  export default class Categories extends Vue {
    showCategories = false;

    mounted() {
      if (!this.$auth.user || !this.$auth.user.customRole) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      if(customRole.length===0) {
        this.showCategories = true;
      }
      if(this.$store.state.permissions.includes('resource/get/themesForCategories')) {
        this.showCategories = true;
      }
    }
  }
</script>