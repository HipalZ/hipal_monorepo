<template>
  <v-container fluid>
    <v-row
      v-if="$vuetify.breakpoint.mdAndUp"
      class="mx-6"
    >
      <v-col
        cols="12"
        lg="12"
        md="4"
        sm="12"
        class=""
      >
        <v-row class="title ml-7">
          Invoices and dues
        </v-row>
        <v-row
          class="ml-4"
        >
          <v-col
            cols="12"
            class=""

          >
            <v-card
              outlined
            >
              <v-card-title>
                Due for September
                <span class="subtitle-2 orange--text ml-2">
                  (on 19-11-2021)
                </span>
                <v-spacer></v-spacer>
                ₹ 1290
              </v-card-title>
              <v-card-title class="subtitle-2 mt-0 pt-0">
                Coffee Cup, QSR cup
                <v-spacer></v-spacer>
                <v-btn
                  color="#3E8914"
                  rounded
                  height="49px"
                  width="149px"
                  class="white--text text-capitalize"
                >
                  <span class="px-4">pay now</span>
                </v-btn>
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <v-row
          class="ml-4"
        >
          <v-col
            cols="12"
          >
            <v-data-table
              :headers="headers"
              :items="desserts"
              class="elevation-1 cardborder px-6"
            >
              <template v-slot:header.name="{ header }" >
                {{ header.text.toUpperCase() }}
              </template>
              <template  v-slot:item.calories="{ item }">
                  <span
                    :class="item.calories==='Successful'?'success--text':'error--text'"
                  >{{item.calories}}</span>
              </template>
              <template  v-slot:item.actions="{ item }"
              >
                <v-btn 
                  text
                  small
                  class="text-capitalize pa-0 ma-0"
                  color="#219EBC"
                > 
                  view
                  <!-- <font-awesome-icon
                    icon="download"
                    size="1x"
                    color="#E96108"
                    class="ml-2"
                  >
                  </font-awesome-icon> -->
                </v-btn>
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

    <v-row
      v-else
    >
      <v-spacer></v-spacer>
      view plans
      <v-col
        cols="12"
      >
        <v-card
          outlined
        >
          <!-- <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  Due for September
                </v-list-item-title>
                <v-list-item-subtitle>
                  (on 1-1-22)
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                $ 1299
              </v-list-item-action>
            </v-list-item>
          </v-list> -->
          <v-card-title>
            Due for September
            <v-spacer></v-spacer>
            $100
          </v-card-title>
          <v-card-subtitle class="error--text">
            (on 1-1-22)
          </v-card-subtitle>
          <v-row
            align="center"
            justify="center"
            class=""
          >
            <v-col
              cols="6"
            >
              <v-card-text>
                Due for September Due for September
              </v-card-text>
            </v-col>
            <v-col
              cols="6"
              justify="center"
              align="end"
              class="ml-n4"
            >
            <v-btn
              color="#3E8914"
              rounded
              class="white--text text-capitalize "
            >
              <span class="">pay now</span>
            </v-btn>
            </v-col>
          </v-row>
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
  })
  export default class Invoices extends Vue {

    headers= [
        {
          text: 'Invoice Id',
          align: 'start',
          value: 'name',
        },
        { text: 'Status', value: 'calories' },
        { text: 'Details', value: 'fat' },
        { text: 'Paid on', value: 'carbs' },
        { text: 'Amount', value: 'protein' },
        { text: 'Action', value: 'actions' },
      ];
      desserts= [
        {
          name: '1111111',
          calories: 'Successful',
          fat: 'Hipal November Invoice',
          carbs: '1-11-2022',
          protein: '999',
        },
        {
          name: '1111111',
          calories: 'failed',
          fat: 'Hipal November Invoice',
          carbs: '1-11-2022',
          protein: '999',
        },
        {
          name: '1111111',
          calories: 'Successful',
          fat: 'Hipal November Invoice',
          carbs: '1-11-2022',
          protein: '999',
        },
        {
          name: '1111111',
          calories: 'failed',
          fat: 'Hipal November Invoice',
          carbs: '1-11-2022',
          protein: '999',
        },
      ]
  }
</script>

<style>
.cardborder {
  border-left: 8px solid #E96108 !important;
}

.td {
  border-bottom: none !important;
}
</style>