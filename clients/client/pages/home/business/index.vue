<template>
  <v-container fluid class="pa-0">
    <v-row
    >
      <v-col cols="12" class="ma-0 pa-0">
        <mobileViewAddBusiness/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import mobileViewAddBusiness from '../../../components/home/mobileViewAddBusiness.vue'

  @Component({
    components: {
      mobileViewAddBusiness
    },
  })
  export default class MobileViewAddBusiness extends Vue {
  }
</script>