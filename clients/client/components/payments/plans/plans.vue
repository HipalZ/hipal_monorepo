<template>
  <v-container fluid>
    <v-row
      class="mx-6"
    >
      <v-col
        cols="12"
        lg="12"
        md="4"
        class=""
      >
      <v-row class="title ml-2">
        Plans
      </v-row>
      <v-row>
        <v-col
          cols="12"
        >
          <v-card class="px-6 cardborder">
            <v-card-title
              class="pb-0 pb-0"
            >
              <v-icon
                left
              >
                mdi-home
              </v-icon>
              <span class="ml-5">On the house</span>
              <v-spacer></v-spacer>
              <span class="success--text">0/month/Outlet</span>
            </v-card-title>
            <v-list-item
              class="pt-0 mt-0"
              three-line
            >
              <v-list-item-avatar>
                <v-img></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="orange--text" >All functions unlocked </v-list-item-title>
                <v-list-item-subtitle class="my-4">
                  Every owner will receive a voucher in the House Plan that will allow 
                  him to utilise our suite for free for one quarter, with all features activated. 
                  This is part of our GTM to familiarise businesses with functions and show them
                  the savings they may make.
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
            <v-divider class="mx-4"></v-divider>
            <v-card-title
              class="pb-0 pb-0"
            >
              <v-icon
                left
              >
                mdi-coffee
              </v-icon>
              <span class="ml-5">Starter coffee plan</span>
              <v-spacer></v-spacer>
              <span class="success--text">899/month/Outlet</span>
            </v-card-title>
            <v-list-item
              class="pt-0 mt-0"
              three-line
            >
              <v-list-item-avatar>
                <v-img></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="orange--text" >User Side + POS + KDS + Digital Billing</v-list-item-title>
                <v-list-item-subtitle class="my-4">
                  Basic plan: This plan focuses on entry-level functions at a very competitive price and helps 
                  us onboard all their customers.Market cost for same functions - ₹1000 - 2000 / month Total saving- ₹200 - 1200 for plan 
                  & ₹1500 - 2500 on paper wastage 
                </v-list-item-subtitle>
              </v-list-item-content>
            </v-list-item>
          </v-card>
        </v-col>
      </v-row>
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
  export default class plans extends Vue {
  }
  </script>