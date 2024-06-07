<template>
  <v-container fluid>
    <v-row
      class="mx-6 mt-2"
    >
      <v-col
        cols="12"
        xl="8"
        lg="8"
        class=""
      >
        <!-- <v-row
          class="pa-0 ma-0 mb-6"
          justify="center"
          align="center"
        >
          <v-col
            cols="12"
            lg="4"
            class="pr-10"
          >
            <v-card
              class="resturantdashboardcard1 white--text mr-4"
              color="primary"
            >
              <v-card-title >
                <v-icon
                  left
                  small
                  color="white"
                >
                real_estate_agent
                </v-icon>
                <span class="text-h6 ">Total sales made</span>
              </v-card-title>
              <v-card-title class="dashboardtest">
                <v-spacer></v-spacer>
                <span class="">
                  ₹ 10000
                </span>
                <v-spacer></v-spacer>
              </v-card-title>
              <v-card-title class="pb-6">
                <v-spacer></v-spacer>
                <span class="subtitle-2 font-weight-light">on 11-10-2022</span>
                <v-spacer></v-spacer>
              </v-card-title>
            </v-card>
          </v-col>
          <v-col
            cols="12"
            lg="4"
            class="pr-10"
          >
            <v-card
              class="resturantdashboardcard2 white--text mr-4 "
              color="secondary"
            >
              <v-card-title>
                <v-icon
                  left
                  small
                  color="white"
                >
                restaurant
                </v-icon>
                <span class="text-h6 ">Most ordered Dish</span>
              </v-card-title>
              <v-card-text class="white--text dashboardtest mb-0 pb-0 ml-6 ">
                  Mushroom chicken paneer Burger...
              </v-card-text>
              <v-card-title class="pb-6">
                <v-spacer></v-spacer>
                <span class="subtitle-2 font-weight-light">on 11-10-2022</span>
                <v-spacer></v-spacer>
              </v-card-title>
            </v-card>
          </v-col>
          <v-col
            cols="12"
            lg="4"
            class="pr-10"
          >
            <v-card
              class="resturantdashboardcard2 white--text  mr-4"
              color="info"
            >
              <v-card-title>
                <v-icon
                  left
                  small
                  color="white"
                >
                  restaurant
                </v-icon>
                <span class="text-h6 ">Most Searched Dish</span>
              </v-card-title>
              <v-card-text class="white--text  mb-0 pb-0 ml-6 dashboardtest">
                  Mushroom chicken paneer Burger...
              </v-card-text>
              <v-card-title class="pb-6">
                <v-spacer></v-spacer>
                <span class="subtitle-2 font-weight-light">on 11-10-2022</span>
                <v-spacer></v-spacer>
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
        <v-row
          class="pa-0 ma-0"
        >
          <v-col class="pa-0 ma-0 pr-10">
            <topPerformingItems/>
          </v-col>
        </v-row> -->
        <v-row>
          <v-col
            cols="12"
            lg="12"
          >
            <v-card
              color="primary"
              class="rounded-lg pb-2"
            >
              <v-card-text class="white--text  mb-0 pb-0 ml-6 dashboardtest">
                  Most Searched Dishes (Top 5)
              </v-card-text>
              <v-divider
                class="mx-6 my-2 white"
              ></v-divider>
              <v-card-title
                v-for="i in 5"
                :key="i"
                class="white--text ml-6 py-1">
                {{i}}-Mushroom chicken paneer Burger
              </v-card-title>
            </v-card>
          </v-col>
          <v-col
            cols="12"
            lg="12"
          >
            <customer-reviews />
          </v-col>
        </v-row>
      </v-col>
      <v-col
        cols="12"
        xl="4"
        lg="4"
        :class="$vuetify.breakpoint.xl?'pr-16':''"
      >
        <v-row
          class="pa-0 ma-0"
        >
          <v-col class="" cols="12">
            <business-info />
          </v-col>
        </v-row>
        <!-- <v-row
          class="pa-0 ma-0 mt-4"
        >
          <v-col >
            <v-card class="topperformaing">
              <v-card-title class="text-h6 secondary--text">
                Top Performing Employees
              </v-card-title>
              <v-divider class="mx-4"></v-divider>
              <v-card-text
                v-for="i in 3"
                :key="i"
                class="py-0 my-0"
              >
                <v-list-item class=" secondary--text subtitle-2 font-weight-medium py-0 my-0">
                    <v-list-item-avatar class="pa-0 ma-0">
                      {{i}}
                    </v-list-item-avatar>
                    <v-list-item-content class="pa-0 ma-0">
                      <v-list-item-title class="pa-0 ma-0" >employee-{{i}}</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col class="">
            <v-card
              height="350px"
              class="topperformaing"
            >
              <v-card-title class="text-h6 secondary--text">
                Revenue By
              </v-card-title>
            </v-card>
          </v-col>
        </v-row> -->
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import topPerformingItems from './topPerforming.vue'
import BusinessInfo from './businessInfo.vue';
import CustomerReviews from './customerReviews.vue';

@Component({
  components: {
    topPerformingItems,
    BusinessInfo,
    CustomerReviews,
  },
})
export default class RestaurantDashboard extends Vue {
  customLink = 'https://biz.hipal.life/businessesName'

  download() {
  }
}
</script>

<style>
.resturantdashboardcard1 {
  box-shadow: 0 1px 2px #E96108, 0 1px 3px 1px rgba(0 0 0 15%) !important;
  border-radius: 16px !important;
}

.resturantdashboardcard2 {
  box-shadow: 0 1px 2px rgba(0 0 0 30%), 0 1px 3px 1px rgba(0 0 0 15%) !important;
  border-radius: 16px !important;
}

.dashboardtest {
  font-style: normal !important;
  font-weight: 700 !important;
  font-size: 25px !important;
  line-height: 140% !important;
}

.dashboardtest1 {
  font-style: normal !important;
  font-weight: 700 !important;
  font-size: 30px !important;
  line-height: 140% !important;
}
</style>