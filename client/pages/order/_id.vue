<template>
  <v-container fluid  class="pa-0">
    <v-row
      justify="center"
      align="center"
    >
      <v-col
        cols="12"
        sm="12"
        lg="4"
      >
      <v-card
        class="businesscard ma-6 mt-0 overflow-auto "
        height="80vh"
      >
        <v-row
          align="center"
          justify="center"
          class="mt-2"
        >
          <v-col
            cols="12"
            align="center"
          >
            <v-card-title
              class="secondary--text caption py-0"
            >
              {{ new Date().toJSON().slice(0, 10) }}
              <v-spacer></v-spacer>
              <!-- CCDI1101894 -->
            </v-card-title>
            <v-card-title
              class="secondary--text subtitle-1 py-0 font-weight-bold"
            >
              <v-spacer></v-spacer>
              {{ payInfo.businessName }}
              <v-spacer></v-spacer>
            </v-card-title>
            <v-card-title
              class="secondary--text caption py-0"
            >
              <v-spacer></v-spacer>
              {{ payInfo.address }}
              <v-spacer></v-spacer>
            </v-card-title>
            <v-card-title
              class="secondary--text caption py-0"
            >
              <v-spacer></v-spacer>
              GSTIN- {{ payInfo.gstin }}
              <v-spacer></v-spacer>
            </v-card-title>
          </v-col>
        </v-row>
        <v-row class="pb-0 mb-0 billborder">
          <v-col
            cols="12"
            lg="5"
            class="py-0 "
          >
            <v-card-subtitle class="py-2">Item</v-card-subtitle>
          </v-col>
          <v-col
            class="py-0"
          >
            <v-card-subtitle class="py-2">Quantity</v-card-subtitle>
          </v-col>
          <v-col
            class="py-0"
          >
            <v-card-subtitle class="py-2">Amt</v-card-subtitle>
          </v-col>
        </v-row>
        <v-card
          flat
          class="overflow-auto"
          max-height="25vh"
          style="overflow-x: hidden !important"
        >
        <v-row
          v-for="(item, index) in payInfo.items"
          :key="index" 
          class="py-0 my-0 "
        >
          <v-col
            cols="12"
            lg="6"
            class="py-0"
          >
            <v-card-text class="pb-0">{{ item.name }}</v-card-text>
          </v-col>
          <v-col
            class="py-0"
          >
            <v-card-text>{{ item.quantity }}</v-card-text>
          </v-col>
          <v-col
            class="py-0"
          >
            <v-card-text>{{ item.quantity*item.amount }}</v-card-text>
          </v-col>
        </v-row>
        </v-card>
        <div class="">
          <v-divider style="border-top: dashed;" class="mx-2"></v-divider>
          <v-card-title class="subtitle-2 py-0 mt-2 mx-4">
          Sub total
          <v-spacer></v-spacer>
          ₹ {{ payInfo.subTotal }}
          </v-card-title>
          <!-- <v-card-title class="subtitle-2 py-0">
            Discount
            <v-spacer></v-spacer>
            ₹ <span class="text-decoration-line-through mr-2">100</span>
            ₹ 100
          </v-card-title> -->
          <v-card-title class="subtitle-2 py-0 secondary--text mx-4">
            S GST
            <v-spacer></v-spacer>
            ₹ {{ payInfo.sgst }}
          </v-card-title>
          <v-card-title class="subtitle-2 py-0 mx-4">
            C GST
            <v-spacer></v-spacer>
            ₹ {{  payInfo.cgst }}
          </v-card-title>
          <v-card-title class="subtitle-2 py-0 mx-4">
            Total
            <v-spacer></v-spacer>
            ₹ {{payInfo.total }}
          </v-card-title>
          <!-- <v-card-actions class="mt-2">
            <v-btn
              rounded
              block
              color="primary"
              class="text-capitalize"
              @click="confirm"
            >
              Confirm 
            </v-btn>
          </v-card-actions> -->
        </div>
      </v-card>
      </v-col>
      <v-col cols="12" class="ma-0 pa-0">
        <v-card flat color="transparent">
          <v-card-title>
            <v-spacer/>
            <form method="post" :action="payInfo.postURL">
              <input hidden name="merchantId" :value="payInfo.merchantId">
              <input hidden name="reqData"
                  :value="payInfo.reqData">
                  <v-btn class="" color="success"  type="submit" :disabled="paid">pay now</v-btn>
          </form>
          <v-spacer/>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
    auth : false
  })
  export default class order extends Vue {

    payInfo = {} as any;

    get paid() {
      return this.payInfo.mode === 'cash' || this.payInfo.mode === 'online' ||
        this.payInfo.tranStatus === 'Ok';
    }

    async mounted() {
      try {
        const {data} =await this.$axios.get(`/v1/payments/${this.$route.params.id}`,
      {
          withCredentials: true,
      },
      )
      this.payInfo = data
      
    } catch (error) {
      console.log(error)
    }
    }

    async pay() {
      try {
        const {data} =await this.$axios.get(`/v1/payments/${this.$route.params.id}`,
      {
          withCredentials: true,
      },
      )
      
    } catch (error) {
      console.log(error)
    }
    }
  }
</script>
