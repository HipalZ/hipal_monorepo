
<template>
  <v-container fluid class="px-0">
      <!-- <v-card-title>
        Kitchen name 
        <span class="mx-8">
          20 kots
        </span>
        <v-badge
          bottom
          inline
          left
          class="mx-8"
        >
          <span class="px-2">12 cooking</span>
        </v-badge>
        <v-badge
          bottom
          inline
          left
          class="mx-8"
          color="success"
        >
          <span class="px-2">12 cooked</span>
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
      </v-card-title> -->
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
              v-for="(item,index) in groupedTime"
              :key="index"
            >
              <v-card
                class="ma-4 align-self-center"
                :class="index%2===0?'orderfinsh':'active-card'"
              >
                <v-card-title class="pa-0 ma-0 mt-n4">
                  <v-spacer></v-spacer>
                  <!-- <v-chip
                    style="background-color: white; border-color: orange;"
                    class="primary--text"
                  >
                    <v-icon small class="px-1">restaurant_menu</v-icon> 
                    2/3
                  </v-chip> -->
                  <v-btn 
                    rounded
                    color="primary"
                    outlined
                    class="text-capitalize "
                    style="background-color: white;"
                  >
                  <v-icon small class="px-1">restaurant_menu</v-icon> 
                    {{totalCookingDone(item) }} / {{  ordersBasedOnTime[item].length }}
                  </v-btn>
                  <v-spacer></v-spacer>
                </v-card-title>
                <v-card
                  flat
                  class="overflow-auto"
                  height="40vh"
                  width="55vh"
                >
                  <v-list
                    v-for="(dishes,index) in ordersBasedOnTime[item]"
                    :key="index"
                    class="secondary--text py-0 my-0"
                  >
                    <v-list-item  >
                      <v-list-item-content >
                        <v-card-text class="subtitle-1 secondary--text py-0 my-0">
                          <span class="d-flex">
                            <v-checkbox
                              v-if="dishes.cookedAt===-1"
                              v-model="updateCookingStatusIds"
                              :value="dishes.id"
                              :disabled="dishes.cookedAt!==-1"
                            ></v-checkbox>
                            <v-checkbox
                              v-else
                              input-value="true"
                              :disabled="true"
                            ></v-checkbox>
                          <span class="mt-4">{{ dishes.dish.name }}</span>
                          </span>
                          <div v-for="(extra,index1) in dishes.dish.extras" :key="index1" class="d-flex ml-4">
                            <v-divider vertical class="py-4"></v-divider>
                            <span class="caption ma-2">-{{ extra.name }}</span>
                            <span class="mx-6 my-2 caption ma-2">x {{ extra.qty || extra.quantity }} </span>
                          </div>
                          <span class="caption ma-2">-{{ dishes.dish.portions?.name }}</span>
                          <br>
                          <span class="caption">
                            (Instructions: 
                            {{ dishes.instructions || 'NA' }})
                          </span>
                        </v-card-text>
                      </v-list-item-content>
                      <v-list-item-action >
                        <v-list-item-action-text class="secondary--text subtitle-2">
                          <span class="mx-2">x {{ dishes.dish.qty }} </span>
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
                    @click="orderReady"
                  >
                    mark as ready
                  </v-btn>
                  <v-spacer></v-spacer>
                </v-card-actions>
                <v-divider class="mx-4"></v-divider>
                <v-card-title class="subtitle-2 pb-0">
                  100012
                  <v-spacer></v-spacer>
                  <span class="red--text">{{ ordersBasedOnTime[item][0].kotTime}}</span>
                </v-card-title>
                <v-card-title
                  v-if="$store.getters['zone/zoneTypeById'](ordersBasedOnTime[item][0].tableId) === ('Dine In' ||'Take Away')"
                  class="subtitle-2 py-0"
                >
                  {{ $store.getters['zone/tableNameById'](ordersBasedOnTime[item][0].tableId) }}
                  <v-spacer></v-spacer>
                  <span >{{ $store.getters['zone/zoneTypeById'](ordersBasedOnTime[item][0].tableId) }}</span>
                </v-card-title>
                <v-card-title class="subtitle-2 pt-0">
                  {{ customerName(item) }}
                </v-card-title>
              </v-card>
            </v-slide-item>
          </v-slide-group>
        </v-col>
      </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component,Prop, Watch } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class Cooking extends Vue {
    @Prop({ default: '' }) readonly kitchenId!: any;
    @Prop({ default: '' }) readonly kitchenInfo!: any;

    showSearch = false;

    tab = null;

    model = null;

    comment = 'some thing '

    groupedTime = [] as any;

    ordersBasedOnTime = {} as any;

    info = [] as any;

    tablesIds = [] ;

    latestTime = Date.now();

    updateCookingStatusIds:string[] = [];

    interval = 0;

    get tableid() {
      return [...new Set(this.tablesIds)]
    }

    updateCookingStatus(id:string) {
      this.updateCookingStatusIds.push(id)
    }

    // regroupData() {
    //   // for (const key in this.ordersBasedOnTime) {
    //   //   for (let i = 0; i < this.ordersBasedOnTime[key].length; i++) {
    //   //     if (this.updateCookingStatusIds.includes(this.ordersBasedOnTime[key][i].id)) {
    //   //       this.ordersBasedOnTime[key][i].cookedAt = Date.now();
    //   //     }
    //   //   }
    //   // }

    //   const filteredData = Object.keys(this.ordersBasedOnTime).reduce((acc: any, key) => {
    //   const group = this.ordersBasedOnTime[key];
    //   const hasCookedAt = group.some((order: any) => order.cookedAt === -1);
    //   if (hasCookedAt) {
    //       acc[key] = group;
    //   }
    //   this.$nextTick(() => {
    //     this.updateCookingStatusIds = [];
    //   });
    //   return acc;
    // }, {});
    //   this.ordersBasedOnTime = filteredData;
    //   const paidOrderIds = [] as any;
    //   Object.keys(this.ordersBasedOnTime).forEach((key) => {
    //     if (this.ordersBasedOnTime[key].status === 'PAID') {
    //       paidOrderIds.push(key);
    //     }
    //     this.ordersBasedOnTime[key] = this.ordersBasedOnTime[key]
    //       .filter((value: any, index: number, self: any) => 
    //         self.findIndex((v: any) => v.id === value.id) === index
    //       );
    //     }
    //   );
    //   paidOrderIds.forEach((id: any) => {
    //     delete this.ordersBasedOnTime[id];
    //   });
    //   this.groupedTime = Object.keys(filteredData);
    // }

    // async orderReady() {
    //   if(this.updateCookingStatusIds.length !== 0) {
    //     try {
    //       await this.$axios.put(`/v1/kitchens/kitchenId/kots`,
    //         {
    //           kots:this.updateCookingStatusIds,
    //         },
    //         {
    //             withCredentials: true,
    //         },
    //       )
    //       this.makeAPICall();
    //     } catch (error) {
    //       console.log(error)
    //     }
    //   }
    // }

    get color() {
      return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }

    close() {
      this.$emit('close',false)
    }

    tabs = [
      'Cooking','History','Take Away','List'
    ]

    customerName(id:any) {
      const name = this.ordersBasedOnTime[id] as any;
      if (name.length) {
        return name[0].customerName;
      }
      return ''
    }

    // totalCookingDone(id:any) {
    //   let count = 0;
    //   if(this.ordersBasedOnTime[id]){
    //   this.ordersBasedOnTime[id].forEach((item: any) => {
    //     if(item.cookedAt!==-1) {
    //       count +=1
    //     }
    //   })}
    //   return count
    // }

    // startAPICalls() {
    //   if (process.client) {
    //     this.interval = window.setInterval(() => {
    //       this.makeAPICall();
    //     }, 18000); // 10 seconds interval
    //   }
    // }

    // destroyed() {
    //   if (process.client) {
    //     window.clearInterval(this.interval);
    //   }
    // }

  //  async makeAPICall() {
  //   console.log('kitchenId',this.kitchenId)
  //     try {
  //       const {data} =await this.$axios.get(`/v1/kitchens/${this.kitchenId}/kots?kitchenId=${this.kitchenId}&startedAt=${this.latestTime}`,
  //       {
  //         withCredentials: true,
  //       },
  //       )
       
  //      await this.$nextTick()
  //       const groupedData =  data.filter((order:any) => order.status === "UNPAID")
  //       .reduce((acc: any, order: any) => {
  //         if (!acc[`${order.startedAt}${order.tableId}`]) {
  //             acc[`${order.startedAt}${order.tableId}`] = [];
  //         }
          
  //         acc[`${order.startedAt}${order.tableId}`].push(order);
          
  //         return acc;
  //     }, {});
  //     if(data.length !== 0) {
  //       console.log(groupedData);
  //       const incomingorders = groupedData;
  //       for (const key in incomingorders) {
  //         if(incomingorders[key].status === "PAID"){
  //           continue
  //         }
  //         if (this.ordersBasedOnTime.hasOwnProperty(key)) {
  //             this.ordersBasedOnTime[key] = [...this.ordersBasedOnTime[key], ...incomingorders[key]];
  //         } else {
  //           this.ordersBasedOnTime[key] = incomingorders[key];
  //         }
  //       } 
  //       data.filter((order:any) => order.status === "PAID").forEach((order:any) => {
  //         if(`${order.startedAt}${order.tableId}` in this.ordersBasedOnTime){
  //           delete this.ordersBasedOnTime[`${order.startedAt}${order.tableId}`]
  //         }
  //         if( this.groupedTime.includes(`${order.startedAt}${order.tableId}`)){
  //          let index= this.groupedTime.indexOf(`${order.startedAt}${order.tableId}`)

  //          this.groupedTime.splice(index,1)

           
  //         }

         
  //       })
  //       this.groupedTime.push(...Object.keys(incomingorders));
  //     }
  //       this.regroupData();
  //       this.latestTime = new Date().getTime();
  //     } catch (error) {
  //       console.log(error)
  //     }
  //   }



    // mounted() {
    //   const results = this.kitchenInfo.reduce(function(results: any, org: any) {
    //       (results[org.tableId] = results[org.tableId] || []).push(org);
    //       return results;
    //   }, {})
    //   this.info = results;
    //   this.tablesIds = this.kitchenInfo.map((s: any)=>s.tableId);
    //   const groupedData =  this.kitchenInfo.reduce((acc: any, order: any) => {
          
    //       if (!acc[`${order.startedAt}${order.tableId}`]) {
    //           acc[`${order.startedAt}${order.tableId}`] = [];
    //       }
          
    //       acc[`${order.startedAt}${order.tableId}`].push(order);
          
    //       return acc;
    //   }, {});

    //     const filteredData = Object.keys(groupedData).reduce((acc: any, key) => {
    //       const group = groupedData[key];
    //       const hasCookedAt = group.some((order: any) => order.cookedAt === -1);
          
    //       if (hasCookedAt) {
    //           acc[key] = group;
    //       }
          
    //       return acc;
    //   }, {});
    //   this.ordersBasedOnTime = filteredData;
    //   this.groupedTime = Object.keys(filteredData);
    //   this.startAPICalls();
    // }

    @Watch('updateCookingStatusIds')
    onCookingStatusChange() {
      if (this.updateCookingStatusIds === null) {
        this.updateCookingStatusIds = [];
      }
    }

    // @Watch('kitchenInfo') 
    // update() {
    //   const results = this.kitchenInfo.reduce(function(results: any, org: any) {
    //       (results[org.tableId] = results[org.tableId] || []).push(org);
    //       return results;
    //   }, {})
    //   this.info = results;
    //   this.tablesIds = this.kitchenInfo.map((s: any)=>s.tableId);

    //   const groupedData =  this.kitchenInfo.reduce((acc: any, order: any) => {
    //       if (!acc[`${order.startedAt}${order.tableId}`]) {
    //           acc[`${order.startedAt}${order.tableId}`] = [];
    //       }
          
    //       acc[`${order.startedAt}${order.tableId}`].push(order);
          
    //       return acc;
    //   }, {});
    //     const filteredData = Object.keys(groupedData).reduce((acc: any, key) => {
    //       const group = groupedData[key];
    //       const hasCookedAt = group.some((order: any) => order.cookedAt === -1);
    //       if (hasCookedAt) {
    //           acc[key] = group;
    //       }
    //       return acc;
    //     }, {});
    //   this.ordersBasedOnTime = filteredData;
    //   this.groupedTime = Object.keys(filteredData);
    //   this.updateCookingStatusIds = [];
    // }

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