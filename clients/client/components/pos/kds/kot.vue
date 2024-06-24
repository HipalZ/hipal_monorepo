<template>
  <v-card
    class="businesscard ma-6 mt-0 overflow-auto"
    height="70vh"
  >
    <v-row
      align="center"
      justify="center"
      class="mt-2"
    >
      <v-col
        cols="12"
        lg="5"
        sm="6"
        align="center"
      >
        <v-chip
          color="secondary"
          outlined
          class="px-6"
        >
          Reprint all
        </v-chip>
      </v-col>
      <v-col
        cols="12"
        lg="6"
        align="center"
      >
        <v-chip
          color="secondary"
          outlined
          class="px-4"
        >
          Reprint selected
        </v-chip>
      </v-col>
      <v-col
        cols="12"
        align="center"
      >
        <v-chip
          color="secondary"
          outlined
          class="px-4"
        >
          Notify Kitchen
        </v-chip>
      </v-col>
    </v-row>
    <v-card
      :key="refreshKey"
      flat
      class="overflow-auto px-2"
      max-height="40vh"
    >
      <v-radio-group
        v-model="row"
        class="px-2"
        multiple
      >
        <v-radio
          v-for="(item,index) in total"
          :key="index"
          :value="item"
          :input-value="true"
          readonly
        >
          <template v-slot:label>
            <div class="d-flex">
              <v-icon 
                x-large
                color="primary" 
              >
                dinner_dining
              </v-icon>
              <v-card-text class="secondary--text">{{ item.dish.name }}</v-card-text>
            </div>
          </template>
        </v-radio>
      </v-radio-group>
    </v-card>
    <div class="">
      <v-divider class="mx-4"></v-divider>
      <v-card-title class="caption pb-0 secondary--text">
        Total
        <v-spacer></v-spacer>
        ₹ {{ $store.getters['zone/totalPrice'](tableId) }}
      </v-card-title>
    <v-card-actions class="mt-2">
      <v-btn
        rounded
        block
        color="primary"
        class="text-capitalize"
        large
        @click="conformToSettle"
      >
        Confirm to settle
      </v-btn>
    </v-card-actions>
    </div>
  </v-card>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class Kot extends Vue {
  @Prop({ default: '' }) readonly tableId!: any;

  total = [] as any[];
  row = [] as any;
  tablesIds=[]
  interval = 0;
  refreshKey = 0;

  async makeAPICall() {
    try {
      const { data } = await this.$axios.get('/v1/kitchens/any/kots?tableId='+this.tableId);
      this.total = [];
      data.forEach((element: any) => {
        if(element.status === 'UNPAID'){
          this.total.push(
            element
          )
        }
      });
      this.row = [];
      data.forEach((element: any) => {
        if(element.cookedAt!==-1){
          this.row.push(
            element
          )
        }
      });
      this.refreshKey++;
    } catch (error) {
      console.error(error);
    }

  }

  startAPICalls() {
    if (process.client) {
      this.interval = window.setInterval(() => {
        this.makeAPICall();
      }, 10000); // 10 seconds interval
    }
  }

  destroyed() {
    if (process.client) {
      window.clearInterval(this.interval);
    }
  }

  mounted() {
    this.makeAPICall();
    this.startAPICalls();
  }

  conformToSettle() {
    if(this.$store.state.zone.zoneOrders[this.tableId].length === this.row.length) {
      this.$emit('conformToSettle','')
    }
  }

  @Watch('tableId')
  update() {
    this.row = []
    if(this.$store.state.zone.orderedTableIds.includes(this.tableId)) {
      this.$store.state.zone.zoneOrders[this.tableId].forEach((element: any) => {
        if(element.cookedAt!==-1){
          this.row.push(
            element
          )
        }
      });
    }
  }
}
</script>

<style lang='scss' scoped>
</style>