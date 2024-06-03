<template>
  <v-container fluid class="pa-0">
    <v-row
      justify="center"
      align="center"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <payment/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import payment from '../../components/payments/paymentView/payment.vue'

  @Component({
    components: {
      payment
    },
  })
  export default class Paymentlans extends Vue {
  }
</script>
