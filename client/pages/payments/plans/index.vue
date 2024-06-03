<template>
  <v-container fluid class="pa-0">
    <v-row
      justify="center"
      align="center"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <plans/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import plans from '../../../components/payments/plans/plans.vue'

  @Component({
    components: {
      plans
    },
  })
  export default class Plans extends Vue {
  }
</script>
