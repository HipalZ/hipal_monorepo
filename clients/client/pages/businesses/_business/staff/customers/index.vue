<template>
  <v-container fluid class="">
    <v-row
    >
      <v-col cols="12" class="">
        <v-row>
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
        <v-row>
          <v-col>
            <reviews/>
          </v-col>
        </v-row>
        <v-row>
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
              class="elevation-0 cardborder businesscard px-6 secondary--text"
            >
              <!-- <template v-slot:header.name="{ header }" >
                {{ header.text.toUpperCase() }}
              </template> -->
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
                      :tax="item.tax"
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
  import { Vue, Component } from 'vue-property-decorator';
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
        text: 'Customer Id',
        align: 'start',
        value: 'customerId',
      },
      { text: 'Name of customer', value: 'customerName' },
      { text: 'Phone Number', value: 'customerPhone' },
      { text: 'Last Visit', value: 'date' },
      { text: 'Discount', value: 'discount' },
      { text: 'Amount Spent', value: 'total' },
      { text: 'Mode', value: 'mode' },
      { text: 'Action', value: 'actions' },
    ];
      
    invoices = [] as any;

    dateformat(timestamp: any) {
      const date = new Date(timestamp);

      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear().toString();

      const formattedDate = `${day}/${month}/${year}`;
      return formattedDate
    }

    async mounted() {
      try {
      const {data} =await this.$axios.get(`/v1/payments?id=${this.$route.params.business}`,
        {
          withCredentials: true,
        },
      )
      this.invoices = data;
    } catch (error) {
      console.log(error)
    }
    }
  }
</script>