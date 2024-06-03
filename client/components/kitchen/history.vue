<template>
  <v-container fluid class="px-0">
      <v-card-title>
        History
        <span class="mx-8">
          200 kots
        </span>
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
      <v-row
      >
        <v-col
          cols="12"
        >
          <v-slide-group
            v-model="model"
            class="pa-4"
            active-class="success"
            show-arrows
          >
            <template #next>
              <v-btn
                fab
                small
              >
                <v-icon>chevron_right</v-icon>
              </v-btn>
            </template>
            <template #prev>
              <v-btn
                fab
                small
              >
                <v-icon>chevron_left</v-icon>
              </v-btn>
            </template>
            <v-slide-item
              v-for="(history,index) in orderHistory"
              :key="index"
            >
              <v-card
                class="ma-4 align-self-center businesscard"
              >
                <v-card-title class="pa-0 ma-0 mt-n4">
                  <v-spacer></v-spacer>
                  <v-chip
                    color="primary"
                  >
                    <v-icon small class="px-1">restaurant_menu</v-icon> 
                    {{history.items.length}}
                  </v-chip>
                  <v-spacer></v-spacer>
                </v-card-title>
                <v-card
                  flat
                  class="overflow-auto"
                  height="40vh"
                  width="55vh"
                >
                  <v-list
                    v-for="dish in history.items"
                    :key="dish"
                    class="secondary--text py-0 my-0"
                  >
                    <v-list-item >
                      <v-list-item-content >
                        <v-card-text class="subtitle-1 secondary--text py-0 my-0">
                          <span class="d-flex">
                            <v-checkbox
                            v-model="check"
                            value="done"
                            disabled
                          ></v-checkbox>
                          <span class="mt-4">{{ dish.name }} </span>
                          </span>
                          <div v-for="(extra, i) in dish.extras" :key="i" class="d-flex ml-4">
                            <v-divider vertical class="py-4"></v-divider>
                            <span class="caption ma-2">-{{ extra.name }}</span>
                          </div>
                        </v-card-text>
                      </v-list-item-content>
                      <v-list-item-action >
                        <v-list-item-action-text class="secondary--text subtitle-2">
                          <span class="mx-2">x {{ dish.quantity }}</span>
                          <span class="mx-2"> ₹ {{ dish.amount }}</span>
                        </v-list-item-action-text>
                      </v-list-item-action>
                    </v-list-item>
                    <!-- <v-list-item v-else >
                      <v-list-item-content >
                        <v-card-text class="subtitle-1 secondary--text py-0 my-0">
                          <span class="d-flex">
                            <v-checkbox
                          ></v-checkbox>
                          <span class="mt-4">panner chicken mushroom burger panner </span>
                          </span>
                          <div v-for="i in 0" class="d-flex ml-4" :key="i">
                            <v-divider vertical class="py-4"></v-divider>
                            <span class="caption ma-2">-panner chicken mushroom burger</span>
                          </div>
                        </v-card-text>
                      </v-list-item-content>
                      <v-list-item-action >
                        <v-list-item-action-text class="secondary--text subtitle-2">
                          <span class="mx-2">x 2</span>
                          <span class="mx-2"> $ 1255</span>
                        </v-list-item-action-text>
                      </v-list-item-action>
                    </v-list-item> -->
                    <v-divider class="mx-4"></v-divider>
                  </v-list>
                </v-card>
                <v-card-title class="ml-4 py-0 ">
                  <v-spacer></v-spacer>
                  <v-text-field
                    v-model="comment"
                    loading
                    readonly
                  >
                    <template #progress>
                      <v-progress-linear
                        color="secondary"
                        absolute
                        height="2"
                      ></v-progress-linear>
                    </template>
                  </v-text-field>
                  <v-spacer></v-spacer>
                </v-card-title>
                <v-divider class="mx-4"></v-divider>
                <v-card-title class="subtitle-2 pb-0">
                  100012
                  <v-spacer></v-spacer>
                  <span class="red--text">{{ convertToHHMM(history.date) }}</span>
                </v-card-title>
                <v-card-title
                  v-if="$store.getters['zone/zoneTypeById'](history?.tableId) === 'Dine In'"
                  class="subtitle-2 py-0"
                >
                  {{ $store.getters['zone/tableNameById'](history?.tableId) }}
                  <v-spacer></v-spacer>
                  <span >{{ $store.getters['zone/zoneTypeById'](history?.tableId)  }}</span>
                </v-card-title>
                <v-card-title class="subtitle-2 pt-0">
                  {{ history.customerName }}
                </v-card-title>
              </v-card>
            </v-slide-item>
          </v-slide-group>
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
  export default class History extends Vue {

    showSearch = false;

    tab = null;

    check = "done";

    model = null;

    comment = 'some thing '

    get color() {
      return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }

    close() {
      this.$emit('close',false)
    }

    tabs = [
      'Cooking','History','Take Away','List'
    ];

    orderHistory = [] as any;

    convertToHHMM(timestamp:any) {
      const dateTime = new Date(timestamp);
      const hours = String(dateTime.getHours()).padStart(2, '0');
      const minutes = String(dateTime.getMinutes()).padStart(2, '0');
      return `${hours}:${minutes}`;
    }

    async mounted() {
      try {
      const {data} =await this.$axios.get(`/v1/payments?id=${this.$route.params.business}`,
        {
          withCredentials: true,
        },
      )
      this.orderHistory = data;
    } catch (error) {
      console.log(error)
    }
    }
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