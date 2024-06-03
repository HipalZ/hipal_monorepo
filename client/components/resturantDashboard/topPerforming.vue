<template>
  <v-container fluid class="px-4">
    <template>
      <v-card class="topperformaing secondary--text">
        <v-card-title>
          Top Performing Items
        </v-card-title>
        <v-tabs
          v-model="tab"
          class="text-capitalize"
          fixed-tabs
        >
          <v-tab
            v-for="item in items"
            :key="item.tab"
            class="text-capitalize  ml-n6"
          >
            {{ item.tab }}
          </v-tab>
        </v-tabs>
        <v-divider class="mx-4"></v-divider>

        <v-tabs-items v-model="tab">
          <v-tab-item
            v-for="item in items"
            :key="item.tab"
          >
            <v-card flat class="pa-14 pt-10   secondary--text subtitle-1 font-weight-medium">
              <v-row 
                  v-for="(item, index) in content"
                  :key="index"
              >
                <v-col
                  cols="12"
                  lg="5"
                >
                  {{item.title}}
                </v-col>
                <v-col
                  cols="12"
                  lg="5"
                >
                  {{item.name}}
                </v-col>
              </v-row>
            </v-card>
          </v-tab-item>
        </v-tabs-items>
      </v-card>
    </template>
    <!-- <v-row>
      <v-col
        cols="5"
      >
        <v-card
          outlined
        >
          <v-card-title class="subtitle-1">
            parent
            <v-spacer></v-spacer>
            <v-badge
              overlap
              dot
              color="#3E8914"
            ></v-badge>
          </v-card-title>
          <v-card-title>
            <v-row class="pa-0 ma-0">
              <v-col cols="4" class="pa-0 ma-0">
                <v-list-item-avatar
                  tile
                  size="80"
                  color="grey"
                  ></v-list-item-avatar>
              </v-col>
              <v-col class="pa-0 ma-0">
                Medium with really really long name mushroom Burger
              </v-col>
            </v-row>
          </v-card-title>

          <v-card-actions>
            19 items <v-spacer></v-spacer>
            <v-btn
              outlined
              rounded
              text
            >
              Button
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row> -->
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class TopPerforming extends Vue {
    tab= null;

    items= [
      { tab: 'jan', content: 'Tab 1 Content' },
      { tab: 'feb', content: 'Tab 2 Content' },
      { tab: 'mar', content: 'Tab 3 Content' },
      { tab: 'apr', content: 'Tab 4 Content' },
      { tab: 'may', content: 'Tab 5 Content' },
      { tab: 'jun', content: 'Tab 6 Content' },
      { tab: 'jul', content: 'Tab 7 Content' },
      { tab: 'aug', content: 'Tab 8 Content' },
      { tab: 'sep', content: 'Tab 9 Content' },
      { tab: 'oct', content: 'Tab 10 Content' },
      { tab: 'nov', content: 'Tab 10 Content' },
      { tab: 'dec', content: 'Tab 10 Content' },
    ];

    content = [
      {
        title:'Most ordered dish',
        name:'Mushroom burger'
      },
      {
        title:'Most viewed dish',
        name:'Vodka burger'
      },
      {
        title:'Most ordered dish',
        name:'Briyani'
      },
      {
        title:'Most ordered Category',
        name:'Appetizers'
      },
      {
        title:'Revenue',
        name:'$ 1000'
      },
      {
        title:'Most Revenue earned by',
        name:'Dine-In'
      },
    ]

  }
  </script>

  <style>
  .topperformaing {
    box-shadow: 0 1px 2px rgba(0 0 0 30%), 0 1px 3px 1px rgba(0 0 0 15%) !important;
    border-radius: 16px !important;
  }
  </style>