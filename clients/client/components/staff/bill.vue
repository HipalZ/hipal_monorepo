<template>
  <v-container>
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
      v-for="(item, index) in orderDishes"
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
        <v-card-text>{{ item.amount }}</v-card-text>
      </v-col>
    </v-row>
    </v-card>
    <div class="">
      <v-divider style="border-top: dashed;" class="mx-2"></v-divider>
      <v-card-title class="subtitle-2 py-0 mt-2 mx-4">
      Sub total
      <v-spacer></v-spacer>
      ₹ {{ subTotal }}
      </v-card-title>
      <v-card-title class="subtitle-2 py-0 mt-2 mx-4">
        Discount
      <v-spacer></v-spacer>
      ₹ {{  discount }}
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
        ₹ {{ tax }}
      </v-card-title>
      <v-card-title class="subtitle-2 py-0 mx-4">
        C GST
        <v-spacer></v-spacer>
        ₹ {{  tax }}
      </v-card-title>
      <v-card-title class="subtitle-2 py-0 mx-4">
        Total
        <v-spacer></v-spacer>
        <!-- ₹ {{ Math.ceil((total - discount)+tax+tax) }} -->
        ₹ {{ total}}

      </v-card-title>
      
    </div>
  </v-container>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class Bill extends Vue {
  @Prop({ default: [] }) readonly orderDishes!: any;
  @Prop({ default: 0 }) readonly total!: any;
  @Prop({ default: 0 }) readonly subTotal!: any;
  @Prop({ default: 0 }) readonly discount!: any;
  @Prop({ default: 0 }) readonly tax!: any;
}
</script>

<style lang='scss' scoped>
</style>
