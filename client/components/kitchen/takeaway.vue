<template>
  <v-container fluid class="px-0">
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
            v-for="(item,index) in tableid"
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
                  0/{{  info[item].length }}
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
                  v-for="(dishes,index) in info[item]"
                  :key="index"
                  class="secondary--text py-0 my-0"
                >
                  <v-list-item  >
                    <v-list-item-content >
                      <v-card-text class="subtitle-1 secondary--text py-0 my-0">
                        <span class="d-flex">
                          <v-checkbox
                            :input-value="dishes.cookedAt===-1?false:true"
                            :disabled="dishes.cookedAt===-1 ?false:true"
                            @change="updateCookingStatus(dishes.id)"
                        ></v-checkbox>
                        <span class="mt-4">{{ dishes.dish.name }}</span>
                        </span>
                        <div v-for="(extra,index1) in dishes.dish.extras" :key="index1" class="d-flex ml-4">
                          <v-divider vertical class="py-4"></v-divider>
                          <span class="caption ma-2">-{{ extra.name }}</span>
                        </div>
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
                {{ item.substring(0,6) }}
                <v-spacer></v-spacer>
                <span class="red--text">20:00</span>
              </v-card-title>
              <v-card-title
                class="subtitle-2 py-0"
              >
                <v-spacer></v-spacer>
                <span >Take Away</span>
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
  import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class TakeAway extends Vue {

    @Prop({ default: '' }) readonly kitchenInfo!: any;

    showSearch = false;

    tab = null;

    model = null;

    comment = 'some thing '

    info = '' as any;

    tablesIds = [] ;

    updateCookingStatusIds:string[] = [];

    get tableid() {
      const ids = [...new Set(this.tablesIds)];
      const takeAwayIds :string[] = [];
      ids.forEach((id)=>{
        if(this.$store.getters['zone/zoneTypeById'](id) === 'Take Away') {
          takeAwayIds.push(id)
        }
      })
      return takeAwayIds;
    }

    updateCookingStatus(id:string) {
      this.updateCookingStatusIds.push(id)
    }

    async orderReady() {
      if(this.updateCookingStatusIds.length !== 0) {
        try {
          await this.$axios.put(`/v1/kitchens/kitchenId/kots`,
            {
              kots:this.updateCookingStatusIds,
            },
            {
                withCredentials: true,
            },
          )
        } catch (error) {
          console.log(error)
        }
      }
    }

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
      const name = this.info[id] as any;
      if (name.length) {
        return name[0].customerName;
      }
      return ''
    }

    mounted() {
      const results = this.kitchenInfo.reduce(function(results: any, org: any) {
          (results[org.tableId] = results[org.tableId] || []).push(org);
          return results;
      }, {})
      this.info = results;
      this.tablesIds = this.kitchenInfo.map((s: any)=>s.tableId);
    }

    @Watch('kitchenInfo') 
    update() {
      const results = this.kitchenInfo.reduce(function(results: any, org: any) {
          (results[org.tableId] = results[org.tableId] || []).push(org);
          return results;
      }, {})
      this.info = results;
      this.tablesIds = this.kitchenInfo.map((s: any)=>s.tableId);
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