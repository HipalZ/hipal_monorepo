<template>
  <v-container fluid>
    <v-row
      class="mx-6 mt-2"
    >
      <v-col
        cols="12"
        lg="12"
        class="ma-0 pa-0"
      >
        <v-row
          v-if="$vuetify.breakpoint.mdAndUp"
          class=""
        >
          <v-col
            cols="12"
            xl="2"
            lg="2"
            class="mr-6"
          >
            <v-autocomplete
              outlined
              class="rounded-lg"
              append-icon="expand_more"
            >
              <template #label>
                <span class="accent--text">Advanced</span>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col
            cols="12"
            xl="2"
            lg="2"
            class="mr-6"
          >
            <v-autocomplete
              outlined
              class="rounded-lg"
              append-icon="expand_more"
            >
              <template #label>
                <span class="accent--text">Floor</span>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col
            cols="12"
            xl="2"
            lg="2"
            class="mr-6"
          >
            <v-autocomplete
              outlined
              class="rounded-lg"
              append-icon="expand_more"
            >
              <template #label>
                <span class="accent--text">Status</span>
              </template>
            </v-autocomplete>
          </v-col>
          <v-col
            align="end"
            justify="center"
          >
            <v-btn
              color="primary"
              text
              class="text-capitalize text-h6"
              @click="showItems=!showItems"
            >
              Items
            </v-btn>
            <v-btn
            icon
            x-large
            @click="showSearch = !showSearch"
          >
            <v-icon
              :color="showSearch?'primary':'#1C1B1F'"
            >search</v-icon>
          </v-btn>
          <v-btn
            icon
            x-large
            class="mr-2"
          >
            <v-icon
              color="#1C1B1F"
            >
              filter_alt
            </v-icon>
          </v-btn>
          </v-col>
        </v-row>
        <v-row class="pa-0 ma-0 ">
          <span :class="$vuetify.breakpoint.mdAndUp?'text-h4 secondary--text':'secondary--text title'">
            Dine In
          </span>
          <v-spacer></v-spacer>
          <span v-if="$vuetify.breakpoint.smAndDown" >
            <!-- <v-btn
              color="primary"
              text
              class="text-capitalize text-h6"
            >
              Items
            </v-btn> -->
            <v-btn
            icon
            small
            @click="showSearch = !showSearch"
          >
            <v-icon
              :color="showSearch?'primary':'#1C1B1F'"
            >search</v-icon>
          </v-btn>
          <v-btn
            icon
            small
            class="mr-2"
          >
            <v-icon
              color="#1C1B1F"
            >
              filter_alt
            </v-icon>
          </v-btn>
          </span>
        </v-row>
        <v-row v-if="showItems" class="pa-0 ma-0 mt-4">
          <v-col
            v-for="(item, index) in tables"
            :key="index"
            cols="12"
            xl="2"
            lg="2"
            md="3"
            sm="6"
            :class="$vuetify.breakpoint.mdAndUp?'ma-4':''"
          >
            <v-card
              class="secondary--text zonescard"
              rounded-lg
              @click="openKds(item.id)"
            >
              <v-card-title class="subtitle-1 pr-0 mr-0 align--text">
                {{item.name}} 
                <v-spacer></v-spacer>
                <v-avatar
                  tile
                  class="rounded-lg mt-n8 mr-n4 status"
                  size="50"
                >
                  <v-icon color="#1C1B1F" class="material-symbols-outlined">
                    nightlight
                  </v-icon>
                </v-avatar>
              </v-card-title>
              <v-list-item
                class="mt-4"
              >
                <v-list-item-content>
                  <v-list-item-title class="caption">{{ $store.getters['zone/zoneNameById'](item.id)  }}</v-list-item-title>
                  <v-list-item-subtitle class="subtitle-1 secondary--text">
                    <v-icon class="mr-2" color="secondary">account_circle</v-icon> 0/{{item.capacity}}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <v-list-item-action>
                  <span
                    class="success--text"
                  >
                    {{ $store.getters['zone/tableTime'](item.id) }}
                  </span>
                </v-list-item-action>
              </v-list-item>
            </v-card>
          </v-col>
        </v-row>
        <items v-else />
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      persistent
    >
        <v-card
          color="#f5f5f5"
        >
          <kds
            @close="close"
            :tableId="tableId"
            :zoneType="zoneType"
            :tables="tables"
            @changeTable="changeTable"
          />
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import kds from '@/components/pos/kds/kds.vue';
  import items from '@/components/zone/tables/items.vue';

  @Component({
    components: {
      kds,
      items,
    },
  })
  export default class Tables extends Vue {

    showSearch = false;

    dialog =false;

    showItems = true;

    zoneType = 'DINE_IN'

    time = 0;

    tables = [] as any;

    dishes = [] as any;

    categories = [] as any;

    tableId = '';

    close() {
      this.dialog = false;
      if (process.client) {
        location.reload();
      }
    }

    changeTable(id:string) {
      this.tableId = id;
    }

    openKds(id:string) {
      this.tableId = id;
      this.dialog = true;
    }

    get increaseTime() {
      const interval = setInterval(()=>{
        this.time = this.time+1;
        clearInterval(interval);
      }, 60000 - (new Date().getTime() % 60000));
      return this.time;
    }

    async mounted() {
      await this.$store.dispatch('zone/getAllZones',this.$route.params.business)
      await this.$store.dispatch('zone/getAllTables',this.$route.params.business)
      await this.$store.dispatch('zone/getDishes',this.$route.params.business)
      await this.$store.dispatch('zone/getCategories',this.$route.params.business)
      await this.$store.dispatch('zone/getZoneOrders',this.$route.params.zone)
      const tables =  this.$store.getters['zone/tableNames'](this.$route.params.zone);
      if (!this.$auth.user || !this.$auth.user.customRole || !this.$auth.user.id) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      const userId = this.$auth.user.id as any;
      if(customRole.length===0) {
        this.tables = tables;
      }
      if(this.$store.state.permissions.includes('resource/get/viewZones')) {
        this.tables = tables.filter((table: any) => table.staff.includes(userId));
      }
      // await this.$store.dispatch('zone/getZoneOrders',this.$route.params.zone)
      // this.tables = this.$store.getters['zone/tableNames'](this.$route.params.zone);
    }
  }
  </script>

<style>
  .zonescard {
    box-shadow: 0 1px 2px rgba(0 0 0 /30%), 0 1px 3px 1px rgba(0 0 0 /15%) !important;
    border-radius: 6px !important;
  }

  .categoriescardtext {
    font-style: normal !important;
    font-weight: 400 !important;
    font-size: 18px !important;
    line-height: 22px !important;
  }

  .status {
    background: linear-gradient(0deg, rgba(241 70 56 /15%), rgba(241 70 56 /15%)), #FFF;
    border: 1px solid rgba(0 0 0 /30%);
  }

  .material-symbols-outlined {
    font-variation-settings:
    'FILL' 0 ,
    'wght' 400,
    'GRAD' 0,
    'opsz' 48
  }
</style>