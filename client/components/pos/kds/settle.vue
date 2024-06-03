<template>
  <v-card
    class="businesscard ma-6 mt-0 overflow-auto "
    height="80vh"
  >
    <div id="printable">
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
            {{ businessName }}
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-title
            class="secondary--text caption py-0"
          >
            <v-spacer></v-spacer>
            {{ address }}
            <v-spacer></v-spacer>
          </v-card-title>
          <v-card-title
            class="secondary--text caption py-0"
          >
            <v-spacer></v-spacer>
            GSTIN- {{ gstNumber }}
            <v-spacer></v-spacer>
          </v-card-title>
        </v-col>
      </v-row>
      <v-row class="pb-0 mb-0 billborder">
        <table style="width: 100%;">
          <tr>
            <th style="width: 50%; text-align: left;">
              <v-card-subtitle class="py-2 text-left">Item</v-card-subtitle>
            </th>
            <th style="width: 30%; text-align: left;">
              <v-card-subtitle class="py-2 text-left">Quantity</v-card-subtitle>
            </th>
            <th style="width: 20%; text-align: left;">
              <v-card-subtitle class="py-2 text-right">Amt</v-card-subtitle>
            </th>
          </tr>
        </table>
      </v-row>
      <v-card
        flat
        class="overflow-auto"
        style="overflow-x: hidden !important"
      >
        <table style="width: 100%;">
          <tbody>
            <tr
              v-for="(item, index) in orderDishes"
              :key="index"
            >
              <td style="width: 50%;">
                <v-card-text class="py-0">{{ item.name }}</v-card-text>
              </td>
              <td style="width: 30%;">
                <v-card-text class="py-0 text-center">{{ item.qty }}</v-card-text>
              </td>
              <td style="width: 20%;">
                <v-card-text class="py-0 text-right">{{ dishTotal(item)}}</v-card-text>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- <v-row
          v-for="(item, index) in orderDishes"
          :key="index" 
          class="py-0 my-0 "
        >
          <v-col
            cols="12"
            lg="5"
            class="py-0"
          >
            <v-card-text class="pb-0">{{ item.name }}</v-card-text>
          </v-col>
          <v-col
            class="py-0"
            cols="12"
            lg="4"
          >
            <v-card-text>{{ item.qty }}</v-card-text>
          </v-col>
          <v-col
            class="py-0"
            cols="12"
            lg="3"
          >
            <v-card-text>{{ dishTotal(item)}}</v-card-text>
          </v-col>
        </v-row> -->
        <div class="">
          <v-divider style="border-top: dashed;" class="mx-2"></v-divider>
          <v-card-title class="subtitle-2 py-0 mt-2 mx-4">
          Sub total
          <v-spacer></v-spacer>
          ₹ {{ total }}
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
            ₹ {{ Math.ceil((total - discount)+tax+tax) }}
          </v-card-title>
        </div>
      </v-card>
    </div>
    <div class="text-center mt-1">
      <v-chip
        color="secondary"
        outlined
        small
        class="mx-1 font-weight-bold"
      >
        Add Discount
      </v-chip>
      <v-chip
        color="secondary"
        outlined
        small
        class="mx-1 font-weight-bold"
        @click="printBill"
      >
        Print Bill
      </v-chip>
      <v-chip
        color="secondary"
        outlined
        small
        class="mx-1 font-weight-bold"
      >
        Bill to phone
      </v-chip>
    </div>
    <v-card-actions class="mt-2">
      <v-btn
        rounded
        block
        color="primary"
        class="text-capitalize"
        @click="confirm"
      >
        Confirm 
      </v-btn>
    </v-card-actions>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="290"
    >
      <v-card>
        <v-card-title class="text-h5">
          <v-img
            :src="qrSrc"
            aspect-ratio="1"
            class=""
            contain
            height="166"
            width="166"
          >
          </v-img>
        </v-card-title>
        <v-card-text>
          *Don't refresh until payment made
        </v-card-text>
        <v-card-actions>
          <v-btn @click="updatePaymentStatus('cash')">paid in Cash</v-btn>
          <v-btn @click="updatePaymentStatus('online')">paid Online</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script lang='ts'>
import { Vue, Component, Prop,Watch } from 'vue-property-decorator';
const QRCode = require('qrcode');
@Component({
  components: {
  },
})
export default class Settle extends Vue {
  @Prop({ default: '' }) readonly tableId!: any;
  @Prop({ default: '' }) readonly zoneType!: any;
  @Prop({ default: '' }) readonly dishesAddedToCart!: any;
  @Prop({ default: '' }) readonly zoneId!: any;

  settleBill = [] as any;
  orderDishes = [] as any;
  dialog = false;
  businessName = '';
  gstRegistered = '';
  address = '';
  gstNumber = '';
  dishes = [] as any;
  paymentId = '' as any;

  additionalDiscount = 0;
  customLink = '';
  qrSrc = ''

  get link() {
    return this.generateQRCode('https://hipal.life/' + this.customLink);
  }

  async generateQRCode(link: string) {
    try {
      const url = await QRCode.toDataURL(link);
      return url;
    } catch (error) {
      console.error(error);
    }
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

  get total() {
    let total = 0;
    // for(let i =0; i< this.orderDishes.length; i++) {
    //   total += this.orderDishes[i].price*this.orderDishes[i].qty;
    // }
    for(let i =0; i<this.orderDishes.length; i++ ) {
      for(let j=0; j<this.orderDishes[i].extras.length; j++) {
        total += this.orderDishes[i].extras[j].price*this.orderDishes[i].extras[j].qty;
      }
      if(this.orderDishes[i]?.portions) {
        total += this.orderDishes[i].portions?.price*this.orderDishes[i].qty;
      } else {
        total += this.orderDishes[i].price*this.orderDishes[i].qty
      }
    }
    return total;
  }

  get discount() {
    let discounts = 0;
    for(let i =0; i< this.orderDishes.length; i++) {
      const dish = this.dishes.find((e: any)=>e.id===this.orderDishes[i].dishId);
      if(dish.discount > 0) {
        discounts += (dish.discount*this.orderDishes[i].qty*this.orderDishes[i].price)/100;
      }
    }
    return discounts;
  }

  get tax() {
    let tax = 0;
    for(let i =0; i< this.orderDishes.length; i++) {
      const dish = this.dishes.find((e: any)=>e.id===this.orderDishes[i].dishId);
      const a = this.orderDishes[i].qty*this.orderDishes[i].price;
      const b = (dish.discount*this.orderDishes[i].qty*this.orderDishes[i].price)/100;
      if(dish.tax > 0) {
        tax += ((a-b)*(dish.tax/100)*0.5) ;
      }
    }
    return tax;
  }

  printBill() {
    if (process.client) {

      // Get HTML to print from element
      const prtHtml = document.getElementById('printable');
      if (!prtHtml) {
        return;
      }
  
      // Get all stylesheets HTML
      let stylesHtml = '';
      const allStyles = document.querySelectorAll('link[rel="stylesheet"], style') as any;
      for (const node of [...allStyles]) {
        stylesHtml += node.outerHTML;
      }
  
      // Open the print window
      const WinPrint = window.open('', '', 'left=0,top=0,width=800,toolbar=0,scrollbars=0,status=0') as any;
  
      WinPrint.document.write(`<!DOCTYPE html>
      <html>
        <head>
          ${stylesHtml}
        </head>
        <body>
          ${prtHtml.innerHTML}
        </body>
      </html>`);
  
      WinPrint.document.close();
      WinPrint.focus();
      WinPrint.print();
      WinPrint.close();
    }
  }

  orderedDishes() {
    for(let i = 0 ; i< this.settleBill.length; i++) {
      if(this.orderDishes.length=== 0) {
        this.orderDishes.push(
          this.settleBill[i].dish
        )
      } else if(this.orderDishes.find((e: any)=>e.name===this.settleBill[i].dish.name)) {
        const index = this.orderDishes.findIndex((x: any)=>x.name===this.settleBill[i].dish.name)
        const a = this.settleBill[i].dish.qty+this.orderDishes[index].qty;
        this.orderDishes[index] = {
          name : this.settleBill[i].dish.name,
          dishId: this.settleBill[i].dish.dishId,
          qty: a,
          price: this.settleBill[i].dish.price,
          id:this.settleBill[i].id,
          extras: this.settleBill[i].dish.extras,
          portions:  this.settleBill[i].dish.portions,
        };
        console.log(a )
      }
      else {
        this.orderDishes.push(
         this.settleBill[i].dish
        )
      }
    }
  }

  get kotIds() {
    const ids = [];
    for(let i=0; i<this.settleBill.length;i++) {
      ids.push(this.settleBill[i].id)
    }
    return ids;
  }

  async mounted() {
    if(this.zoneType=== 'DINE_IN') {
      this.settleBill= await this.$store.getters['zone/settleOrders'](this.tableId)
      this.orderedDishes();
      this.dishes = this.$store.state.zone.dishes;
    } else {
      for(let i =0; i<this.dishesAddedToCart.length; i++ ) {
        this.orderDishes.push(this.dishesAddedToCart[i].dish)
      }
      this.dishes = this.$store.state.zone.dishes;
      // this.orderDishes = this.dishesAddedToCart;
      console.log(this.orderDishes)
    }
    const businessId = this.$route.params.business;
    try {
      const { data } = await this.$axios.get(`/v1/businesses/${businessId}`, {
        withCredentials: true,
      });
          this.businessName = data.businessName;
          this.gstRegistered = data.gstRegistered===true?'Yes':'No';
          this.address = data.address;
          this.gstNumber = data.gstNumber;
    } catch (error) {
      console.error(error);
    }
  };

  get dishItems() {
    const items = [];
    for(let i=0; i< this.orderDishes.length; i++) {
      items.push({
        name:this.orderDishes[i].name,
        quantity:this.orderDishes[i].qty,
        amount:this.orderDishes[i].price,
        portions:this.orderDishes[i].portions,
        extras: this.orderDishes[i].extras,
        comments: this.orderDishes[i].comments
      })
    }
    return items;
  }

  async confirm() {
    if(this.zoneType=== 'DINE_IN') {
      try {
        const {data} = await this.$axios.post(`/v1/payments`,
        {
          businessId: this.$route.params.business,
          businessName: this.businessName,
          address: this.address,
          gstin:  this.gstNumber || 'NA',
          items: this.dishItems,
          subTotal: this.total,
          sgst: this.tax,
          cgst: this.tax,
          total:  Math.ceil((this.total - this.discount)+this.tax+this.tax),
          customerId: Math.floor(Math.random() * (999999 - 100000 + 1) + 100000),
          customerName: this.$store.getters['zone/customerName'](this.tableId),
          customerPhone: '',
          discount: 0,
          zoneId:this.$route.params.zone,
          tableId:this.tableId || 'TakeAway' ,
        },
        {
            withCredentials: true,
        },
        )
        this.qrSrc = await this.generateQRCode('https://biz.hipal.life/order/' + data.id)
        this.paymentId = data.id;
        console.log('https://biz.hipal.life/order/' + data.id)
        this.dialog = true
        console.log(data);
      } catch (error) {
        console.log(error)
      }
    }
    else {
      try {
        const {data} = await this.$axios.post(`/v1/payments`,
        {
          businessId: this.$route.params.business,
          businessName: this.businessName,
          address: this.address,
          gstin:  this.gstNumber || 'NA',
          items: this.dishItems,
          subTotal: this.total,
          sgst: this.tax,
          cgst: this.tax,
          total:  Math.ceil((this.total - this.discount)+this.tax+this.tax),
          customerId: Math.floor(Math.random() * (999999 - 100000 + 1) + 100000),
          customerName: this.dishesAddedToCart[0]?.customerName,
          customerPhone: '',
          discount: 0,
          zoneId:this.zoneId,
          tableId:this.tableId || 'TakeAway' ,
        },
        {
            withCredentials: true,
        },
        )
        this.qrSrc = await this.generateQRCode('https://biz.hipal.life/order/' + data.id)
        this.paymentId = data.id;
        console.log('https://biz.hipal.life/order/' + data.id)
        this.dialog = true
        console.log(data);
      } catch (error) {
        console.log(error)
      }
    }
  }

  async clearTable() {
    if(this.zoneType === 'DINE_IN') {
      try {
        const {data} = await this.$axios.put(`/v1/kitchens/kots`,
        {
          kots: this.kotIds
        },
        {
            withCredentials: true,
        },
      )
      this.dialog = false
      await this.$store.dispatch('zone/getZoneOrders',this.$route.params.zone)
      this.$emit('close','');
      console.log(data);
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await this.$axios.post(`/v1/kitchens/kitchenId/kots`,{
          kots:this.dishesAddedToCart,
        },
          {
            withCredentials: true,
          }
        );
        this.dialog = false
        this.$emit('close','');
      } catch (error) {
        console.log(error)
      }
    }
  }

  async updatePaymentStatus(status:string) {
    try {
      const {data} = await this.$axios.put(`/v1/payments/${this.paymentId}`,
      {
        mode: status,
      },
      {
          withCredentials: true,
      },
      )
      await this.clearTable();
      console.log(data);
    } catch (error) {
      console.log(error)
    }
  }
 

  @Watch('tableId')
  update() {
    if(this.$store.state.zone.orderedTableIds.includes(this.tableId)) {
      this.$store.state.zone.zoneOrders[this.tableId].forEach((element: any) => {
        if(element.cookedAt!==-1){
          this.settleBill.push(
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