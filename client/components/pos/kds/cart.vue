<template>
  <v-card
    class="businesscard ma-6 overflow-auto"
    height="70vh"
  >
    <v-card-title class="primary--text subtitle-2">
      <v-spacer></v-spacer>
      Add comments+
    </v-card-title>
    <v-card
      flat
      class="overflow-auto"
      height="30vh"
    >
      <v-list
        class="secondary--text"
        v-for="(item,index) in addedToCart"
        :key="index"
      >
        <v-list-item @click="editDish(index)" >
          <v-list-item-content >
            <v-card-text class="subtitle-1 secondary--text py-0 my-0">
              {{ item.dish.name }}
              <div v-for="(extra,index1) in item.dish.extras" class="d-flex" :key="index1">
                <v-divider vertical class="py-4"></v-divider>
                <span class="caption ma-2">-{{ extra.name }}  x{{ extra.qty }}</span>
              </div>
            </v-card-text>
            <span class="caption ma-2">-{{ item.dish.portions?.name }}</span>
          </v-list-item-content>
          <v-list-item-action >
            <v-list-item-action-text class="secondary--text subtitle-2">
              <span class="mx-2">x {{ item.dish.qty }}</span>
              <span class="mx-2"> ₹ {{ dishTotal(item.dish) }}</span>
            </v-list-item-action-text>
          </v-list-item-action>
        </v-list-item>
        <!-- <v-divider class="mx-4"></v-divider> -->
      </v-list>
    </v-card>
    <div class="">
      <v-divider class="mx-4"></v-divider>
    <v-card-title class="primary--text subtitle-2">
      <v-spacer></v-spacer>
      Add comments+
    </v-card-title>
    <v-card-title class="subtitle-2 py-0">
      Sub total
      <v-spacer></v-spacer>
      ₹ {{ total }}
    </v-card-title>
    <v-card-title class="subtitle-2 py-0">
      Discount
      <v-spacer></v-spacer>
      ₹ <span class="text-decoration-line-through mr-2">{{ discount }}</span>
      ₹ {{ total-discount }}
    </v-card-title>
    <v-card-title class="subtitle-2 py-0">
      CGST
      <v-spacer></v-spacer>
      ₹ {{ tax }}
    </v-card-title>
    <v-card-title class="subtitle-2 py-0">
      SGST
      <v-spacer></v-spacer>
      ₹ {{ tax }}
    </v-card-title>
    <v-card-title class="subtitle-2 py-0">
      Total
      <v-spacer></v-spacer>
      ₹ {{ Math.ceil(total-tax) }}
    </v-card-title>
    <v-card-actions class="mt-2">
      <v-btn
        rounded
        block
        color="primary"
        class="text-capitalize"
        @click="conform"
      >
        Confirm to cook
      </v-btn>
    </v-card-actions>
    </div>
  </v-card>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class Cart extends Vue {
  @Prop({ default: '' }) readonly addedToCart!: any;
  @Prop({ default: '' }) readonly discount!: any;
  @Prop({ default: '' }) readonly tax!: any;

  conform() {
    this.$emit('conform','')
  }

  editDish(index:any) {
    this.$emit("openEditDialog",index)
  }

  get total() {
    let total = 0;
    for(let i =0; i<this.addedToCart.length; i++ ) {
      for(let j=0; j<this.addedToCart[i].dish.extras.length; j++) {
        total += this.addedToCart[i].dish.extras[j].price*this.addedToCart[i].dish.extras[j].qty;
      }
      if(this.addedToCart[i].dish?.portions) {
        total += this.addedToCart[i].dish.portions?.price*this.addedToCart[i].dish.qty;
      } else {
        total += this.addedToCart[i].dish.price*this.addedToCart[i].dish.qty
      }
    }
    return total;
  }

  dishTotal(dish:any) {
    let total = 0;
    for(let i=0; i<dish.extras.length;i++) {
      total += dish.extras[i].price*dish.extras[i].qty;
    }
    if(dish.portions) {
      total += dish.portions?.price*dish.qty;
    } else {
      total += dish.price*dish.qty;
    }
    return total;
  }
}
</script>

<style lang='scss' scoped>
</style>