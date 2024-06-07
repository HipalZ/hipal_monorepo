<template>
  <v-container fluid class="px-0">
    <v-row>
      <v-col cols="12">
        <v-slide-group
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
            v-for="(kots, key) in orders"
            :key="key"
          >
            <v-card
              class="ma-4 align-self-center"
            >
              <v-card
                flat
                class="overflow-auto"
                height="40vh"
                width="55vh"
              >
                <v-list
                  v-for="(kot, index) in kots"
                  :key="index"
                  class="secondary--text py-0 my-0"
                >
                  <v-list-item>
                    <v-list-item-content>
                      <v-card-text class="subtitle-1 secondary--text py-0 my-0">
                        <span class="d-flex">
                          <v-checkbox
                            v-if="kot.cookedAt === -1"
                            v-model="selectedKots"
                            :value="kot.id"
                            :disabled="kot.cookedAt !== -1"
                          ></v-checkbox>
                          <v-checkbox
                            v-else
                            input-value="true"
                            :disabled="true"
                          ></v-checkbox>
                        <span class="mt-4">{{ kot.dish.name }}</span>
                        </span>
                        <div v-for="(extra,index1) in kot.dish.extras" :key="index1" class="d-flex ml-4">
                          <v-divider vertical class="py-4"></v-divider>
                          <span class="caption ma-2">-{{ extra.name }}</span>
                          <span class="mx-6 my-2 caption ma-2">x {{ extra.qty || extra.quantity }} </span>
                        </div>
                        <span class="caption ma-2">-{{ kot.dish.portions?.name }}</span>
                        <br>
                        <span class="caption">
                          (Instructions: 
                          {{ kot.instructions || 'NA' }})
                        </span>
                      </v-card-text>
                    </v-list-item-content>
                    <v-list-item-action>
                      <v-list-item-action-text class="secondary--text subtitle-2">
                        <span class="mx-2">x {{ kot.dish.qty }} </span>
                        <!-- <span class="mx-2"> $ 1255</span> -->
                      </v-list-item-action-text>
                    </v-list-item-action>
                  </v-list-item>
                  <v-divider class="mx-4"></v-divider>
                </v-list>
              </v-card>
              <v-card-title class="ml-4 py-0 ">
                <v-spacer></v-spacer>
                <v-text-field
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
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                  outlined
                  color="primary"
                  class="text-capitalize pa-4"
                  rounded
                  @click="markAsReady"
                >
                  mark as ready
                </v-btn>
                <v-spacer></v-spacer>
              </v-card-actions>
              <v-divider class="mx-4"></v-divider>
              <v-card-title class="subtitle-2 pb-0">
                {{ key.toString()?.slice(-5) }}
                <v-spacer></v-spacer>
                <span class="red--text">{{ kots[0]?.kotTime?.slice(0,5)}}</span>
              </v-card-title>
              <v-card-title
                v-if="$store.getters['zone/zoneTypeById'](kots[0].tableId) === ('Dine In' ||'Take Away')"
                class="subtitle-2 py-0"
              >
                {{ $store.getters['zone/tableNameById'](kots[0].tableId) }}
                <v-spacer></v-spacer>
                <span >{{ $store.getters['zone/zoneTypeById'](kots[0].tableId) }}</span>
              </v-card-title>
              <v-card-title class="subtitle-2 pt-0">
                {{ customerName(key) }}
              </v-card-title>
            </v-card>
          </v-slide-item>
        </v-slide-group>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class Cooking extends Vue {
  @Prop({ default: '' }) readonly kitchenId!: any;
  @Prop({ default: '' }) readonly kitchenInfo!: any;

  selectedKots = [] as string[];

  orders = {} as any;

  latestTime = Date.now();

  interval = 0;

  kotsToProcess = [] as any;

  customerName(id:any) {
    const kots = this.orders[id] as any;
    if (kots.length) {
      return kots[0].customerName;
    }
    return ''
  }

  async mergeLatest(kots: any[]) {
    if (this.kotsToProcess.length) {
      this.kotsToProcess.push(kots);
      return;
    }
    let orders = {} as any;
    orders = JSON.parse(JSON.stringify(this.orders));
    for (let kotIndex = 0; kotIndex < kots.length; kotIndex += 1) {
      const kot = kots[kotIndex];
      
      if (kot.status === 'PAID') {
        delete orders[kot.tableId + kot.startedAt];
      }
      if (kot.kitchenId !== this.kitchenId) {
        continue;
      }
      // existing order
      if (kot.tableId + kot.startedAt in orders) {
        let kotExists = false;
        let existingKotIndex = -1;
        for (let orderIndex = 0; orderIndex < orders[kot.tableId + kot.startedAt].length; orderIndex += 1) {
          const existingKot = orders[kot.tableId + kot.startedAt][orderIndex];
          if (existingKot.id === kot.id) {
            kotExists = true;
            existingKotIndex = orderIndex;
            break;
          }
        }
        if (!kotExists) {
          orders[kot.tableId + kot.startedAt].push(kot);
        } else {
          orders[kot.tableId + kot.startedAt][existingKotIndex] = kot;
        }
      } else {
        // new order
        orders[kot.tableId + kot.startedAt] = [kot];
      }
    }
    // remove id if all kots are cooked
    let cookedKots = [] as string[];
    Object.keys(orders).forEach((orderKey) => {
      const uncooked = orders[orderKey].some((kot: any) => {
        return kot.cookedAt === -1;
      });
      if (!uncooked) {
        cookedKots.push(orderKey);
      }
    });
    cookedKots.forEach((cookedKot) => {
      delete orders[cookedKot];
    });
    this.orders = orders;
    await this.$nextTick();
    this.kotsToProcess.shift([]);
    if (this.kotsToProcess.length) {
      this.mergeLatest(this.kotsToProcess[0]);
    }
  }

  async getLatestKots() {
    const { data } = await this.$axios.get(
      `/v1/kitchens/${this.kitchenId}/kots?kitchenId=${this.kitchenId}&startedAt=${this.latestTime}`,
      {
        withCredentials: true,
      },
    )
    this.latestTime = new Date().getTime();
    this.mergeLatest(data);
  }

  async markAsReady() {
    try {
      await this.$axios.put(`/v1/kitchens/kitchenId/kots`,
        {
          kots:this.selectedKots,
        },
        {
            withCredentials: true,
        },
      )
      this.selectedKots = [];
      this.getLatestKots();
    } catch (error) {
      console.log(error)
    }
  }

  mounted() {
    this.orders = {}
    this.mergeLatest(this.kitchenInfo);
    if (process.client) {
        this.interval = window.setInterval(() => {
          this.getLatestKots();
        }, 18000); // 10 seconds interval
      }
  }
}
</script>

<style lang='scss' scoped>
</style>
