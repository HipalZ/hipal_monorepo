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
        Payments
      </v-row>
      <v-row>
        <v-col
          cols="8"
        >
          <v-card class="px-6 cardborder" outlined>
            <v-card-title class="pb-0 mb-0">Your Cart</v-card-title>
            <v-card-title
              class="py-0 my-0"
            >
            <v-checkbox
              input-value="true"
              value
              color="orange"
            ></v-checkbox>
              <span class="ml-5">the house cup</span>
              <v-spacer></v-spacer>
              <span class="success--text">₹ 0</span>
            </v-card-title>
            <v-list-item
              class="pt-0 mt-0"
              three-line
            >
              <v-list-item-avatar>
                <v-img></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="orange--text" >Currently on   </v-list-item-title>
                <v-list-item-subtitle class="mt-n8">
                  Some satctics showing how many sales were made
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-combobox
                  label="On the House"
                  outlined
                  :items="items"
                ></v-combobox>
              </v-list-item-action>
            </v-list-item>
            <v-divider class="mx-4"></v-divider>
            <v-card-title
              class="py-0 my-0"
            >
            <v-checkbox
              input-value="true"
              value
              color="orange"
            ></v-checkbox>
              <span class="ml-5">the house cup</span>
              <v-spacer></v-spacer>
              <span class="success--text">₹ 1500</span>
            </v-card-title>
            <v-list-item
              class="pt-0 mt-0"
              three-line
            >
              <v-list-item-avatar>
                <v-img></v-img>
              </v-list-item-avatar>
              <v-list-item-content>
                <v-list-item-title class="orange--text" >Currently on   </v-list-item-title>
                <v-list-item-subtitle class="mt-n8">
                  Some satctics showing how many sales were made
                </v-list-item-subtitle>
              </v-list-item-content>
              <v-list-item-action>
                <v-combobox
                  outlined
                  label="The Coffee plan"
                ></v-combobox>
              </v-list-item-action>
            </v-list-item>
          </v-card>
        </v-col>
        <v-col
          cols="4"
        >
          <v-card
            outlined
          >
            <v-card-title>Billings</v-card-title>
            <v-card-title class="subtitle-1">
              Total (2 plans)
              <v-spacer></v-spacer>
              ₹ 1299
            </v-card-title>
            <v-divider class="mx-4"></v-divider>
            <v-card-title class="subtitle-2">
              The Coffee cup
              <v-spacer></v-spacer>
              ₹ 0
            </v-card-title>
            <v-card-title class="subtitle-2">
              QSR Coffee cup
              <v-spacer></v-spacer>
              ₹ 1299
            </v-card-title>
            <v-card-actions class="my-6">
              <v-spacer></v-spacer>
              <v-btn
                  color="success"
                  rounded
                  class="white--text text-capitalize mb-4"
                >
                  <span class="px-4"> proceed to pay</span>
                </v-btn>
                <v-spacer></v-spacer>
            </v-card-actions>
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
  export default class payments extends Vue {

    items=[
      'Start coffee plan',
      'Pizza plan',
      'Buffet plan'
    ]
  }
  </script>