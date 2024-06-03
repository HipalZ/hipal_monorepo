<template>
  <v-container fluid class="px-0">
    <v-row class="pt-0">
      <v-col class="pt-0">
        <v-card
          flat
          class="rounded-0"
          height="50px"
          color="secondary"
        >
        </v-card>
      </v-col>
    </v-row>
    <v-card
      rounded-xl
      class="rounded-xl rounded-b-0 mt-n8 align-self-center"
      flat
    >
      <v-card-title v-if="tab!='tab-2'">
        Kitchen name {{ kitchenId }}
        <span class="mx-8">
          {{ kitchenInfo.length }} kots
        </span>
        <v-badge
          bottom
          inline
          left
          class="mx-8"
        >
          <span class="px-2">0 cooking</span>
        </v-badge>
        <v-badge
          bottom
          inline
          left
          class="mx-8"
          color="success"
        >
          <span class="px-2">0 cooked</span>
        </v-badge>
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="close()"
        >
          <v-icon>
            close
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-tabs-items v-model="tab">
        <v-tab-item
          :value="'tab-' + 1"
        >
          <cooking-dishes
            :key="kitchenId"
            :kitchenId="kitchenId"
            :kitchenInfo="kitchenInfo"
          />
        </v-tab-item>
        <v-tab-item
          :value="'tab-' + 2"
        >
          <history-Dishes
            @close="close"
          />
        </v-tab-item>
        <v-tab-item
          :value="'tab-' + 3"
        >
          <take-Away
            :kitchenInfo="kitchenInfo"
            :kitchenId="kitchenId"
          />
        </v-tab-item>
        <v-tab-item
          :value="'tab-' + 4"
        >
          <list-View
            :kitchenInfo="kitchenInfo"
            :kitchenId="kitchenId"
          />
        </v-tab-item>
      </v-tabs-items>
    </v-card>
    <v-bottom-navigation
      fixed 
      app
    >
      <v-tabs
        v-model="tab"
        color="orange"
        class=""
        hide-slider
      >
        <v-chip-group
          mandatory
          active-class="primary"
        >
          <v-tab
            v-for="item in tabs"
            :key="item.ref"
            class="text-capitalize px-2"
            :href="item.ref"
          >
            <v-chip
              outlined
              color="secondary"
              active-class="primary"
            >
              <span>{{item.name}}</span>
            </v-chip>
          </v-tab>
        </v-chip-group>
        <v-card-title class="py-0 my-0">
          <v-text-field
            label="search"
            class="my-n1"
          >
          </v-text-field>
        </v-card-title>
      </v-tabs>
    </v-bottom-navigation>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import cookingDishes from './cooking2.vue';
  import historyDishes from './history.vue';
  import takeAway from './takeaway.vue';
  import listView from './list.vue'

  @Component({
    components: {
      cookingDishes,
      historyDishes,
      takeAway,
      listView,
    },
  })
  export default class Menu extends Vue {
    @Prop({ default: '' }) readonly kitchenInfo!: any;
    @Prop({ default: '' }) readonly kitchenId!: any;


    showSearch = false;

    tab = null;

    model = null;

    comment = 'some thing'
  
    get color() {
      return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }

    close() {
      this.$emit('closeKitchen','')
    };

    tabs = [
      {
        name:'Cooking',
        ref: '#tab-1'
      },
      {
        name:'History',
        ref: '#tab-2'
      },
      {
        name:'Take Away',
        ref: '#tab-3'
      },
      {
        name:'List',
        ref: '#tab-4'
      },
    ];
  }
</script>

<style>
  .orderfinsh {
    border-top: 1px solid rgb(0 0 0 / 30%) !important;
    border-right: 1px solid rgb(0 0 0 / 30%) !important;
    border-bottom: 1px solid rgb(0 0 0 / 30%) !important;
    box-shadow: 0 4px 6px rgba(0 0 0 / 5%) !important;
    border-radius: 6px !important;
    border-left: 8px solid  !important;
    border-left-color: green !important;
  }
</style>