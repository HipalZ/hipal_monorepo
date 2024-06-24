<template>
  <v-container fluid class="">
    <v-row>
      <v-col
        v-for="(mode, key) in modes"
        :key="key"
      >
        <v-card>
          <v-card-title primary-title>
            {{ key }}
          </v-card-title>
          <v-card-text>
            ₹ {{ invoiceTotalByMode[modes[key]] || 0 }} /-
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row
    >
      <v-col cols="12" class="">
        <v-row>
          <v-col cols="12" md="3">
            <v-menu
              v-model="menu2"
              :close-on-content-click="false"
              :nudge-right="40"
              transition="scale-transition"
              offset-y
              min-width="auto"
            >
              <template v-slot:activator="{ on, attrs }">
                <v-text-field
                  v-model="date"
                  label="Billing Date"
                  prepend-inner-icon="mdi-calendar"
                  readonly
                  outlined
                  v-bind="attrs"
                  v-on="on"
                ></v-text-field>
              </template>
              <v-date-picker
                v-model="date"
                @input="menu2 = false"
              ></v-date-picker>
            </v-menu>
          </v-col>
          <v-spacer></v-spacer>
            <v-btn
            icon
            x-large
          >
            <v-icon
              color="#1C1B1F"
            >search</v-icon>
          </v-btn>
          <v-btn
            icon
            x-large
            class="mr-2"
          >
            <v-icon
              color="#1C1B1F"
            >
              filter_alt
            </v-icon>
          </v-btn>
        </v-row>

        <v-row
        >
          <v-col
            cols="12"
            class="pa-4"
          >
            <v-data-table
              :headers="headers"
              :items="invoices"
              :loading="loading"
              class="elevation-0 cardborder businesscard px-6 secondary--text"
            >
              <!-- <template v-slot:header.name="{ header }" >
                {{ header.text.toUpperCase() }}
              </template> -->
              <template  v-slot:item.discount="{ item }">
                  <span
                  >₹ {{ item.discount }}</span>
              </template>
              <template  v-slot:item.total="{ item }">
                  <span
                  >₹ {{ item.total }}</span>
              </template>
              <template  v-slot:item.date="{ item }">
                  <span
                  >{{ dateformat(item.date) }}</span>
              </template>
              <template  v-slot:item.actions="{ item }"
              >
                <v-dialog
                  width="500"
                >
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      text
                      small
                      class="text-capitalize pa-0 ma-0"
                      color="#219EBC"
                      v-bind="attrs"
                      v-on="on"
                    >
                      View
                    </v-btn>
                  </template>

                  <v-card>
                    <Bill
                      :orderDishes="item.items"
                      :total="item.total"
                      :subTotal="item.subTotal"
                      :discount="item.discount"
                      :tax="item.cgst"
                    />
                  </v-card>
                </v-dialog>

                <v-btn icon x-small color="primary">
                  <v-icon>
                    mdi-download
                  </v-icon>
                </v-btn>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component, Watch } from 'vue-property-decorator';
  import reviews from '@/components/staff/customer/reviews.vue';
  import Bill from '@/components/staff/bill.vue';

  @Component({
    components: {
      reviews,
      Bill,
    },
  })
  export default class Customer extends Vue {
    headers= [
      {
        text: 'Bill Id',
        align: 'start',
        value: 'id',
      },
      { text: 'Name of customer', value: 'customerName' },
      { text: 'Paid On', value: 'date' },
      { text: 'Payment', value: 'mode' },
      { text: 'Discount', value: 'discount' },
      { text: 'Amount Spent', value: 'total' },
      { text: 'Action', value: 'actions' },
    ];

    date = (new Date(Date.now() - (new Date()).getTimezoneOffset() * 60000)).toISOString().substr(0, 10);
    menu2 = false;
      
    invoices = [] as any;

    loading = false;

    modes = {
      'Total Sales': 'dayTotal',
      'Cash': 'cash',
      'Card': 'card',
      'UPI': 'upi',
      'PhonePe': 'phonepe',
      'Paytm': 'paytm',
      'Google Pay': 'googlepay',
    } as any;

    get invoiceTotalByMode() {
      let dayTotal = 0;
      const total = this.invoices.reduce((acc: any, curr: any) => {
        if (acc[curr.mode]) {
          acc[curr.mode] += Number(curr.total);
        } else {
          acc[curr.mode] = Number(curr.total);
        }
        dayTotal += Number(curr.total);
        return acc;
      }, {});
      total['dayTotal'] = dayTotal;
      return total;
    }

    dateformat(timestamp: any) {
      const date = new Date(timestamp);

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();

      const formattedDate = `${day}/${month}/${year}`;
      return formattedDate
    }

    async getInvoices(date: string) {
      this.loading = true;
      try {
        const {data} =await this.$axios.get(`/v1/payments?id=${this.$route.params.business}&date=${date}`,
          {
            withCredentials: true,
          },
        );
        this.invoices = data;
      } catch (error) {
        console.log(error)
      } finally {
        this.loading = false;
      }
    }

    async mounted() {
      await this.getInvoices(this.date);
    }

    @Watch('date')
    async onDateChange() {
      await this.getInvoices(this.date);
    }
  }
</script>