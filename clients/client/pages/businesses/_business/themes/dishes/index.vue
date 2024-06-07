<template>
  <v-container fluid class="pa-0">
    <v-row
      v-if="showDish"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <dishes/>
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
  import dishes from '../../../../../components/themes/dishes/dishes.vue'

  @Component({
    components: {
      dishes
    },
  })
  export default class Dishes extends Vue {
    showDish = false;

    mounted() {
      if (!this.$auth.user || !this.$auth.user.customRole) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      if(customRole.length===0) {
        this.showDish = true;
      }
      if(this.$store.state.permissions.includes('resource/get/dishPage')) {
        this.showDish = true;
      }
    }
  }
</script>