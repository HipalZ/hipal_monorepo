<template>
  <v-container fluid class="pa-0">
    <v-row
      class="mx-4 mt-2"
    >
      <v-col
        cols="12"
        lg="12"
        sm="12"
        class=""
      >
        <v-row
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
            justify="end"
          >
            <v-text-field
              v-if="showSearch"
              v-model="zoneName"
              label="search"
              color="primary"
              class="pt-0"
            ></v-text-field>
          </v-col>
          <v-col
            align="end"
            justify="center"
          >
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
        <v-row class="px-0 mx-4">
          <span class="text-h4 secondary--text">
            TakeAway Zones
          </span>
        </v-row>
        <dine-in-zone
          :filteredZones="filteredZones"
          :zoneName="zoneName"
          @openTakeAway="openTakeAway"
          :zoneType="zoneType"
        />
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
        >
          <takeAway
            :zoneId="zoneId"
            @close="closeTakeAway"
          />
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import dineInZone from '@/components/pos/dineIn/dineIn.vue'
  import takeAway from '@/components/pos/takeAway/takeAway.vue'

  interface zoneModel {
    businessId: string;
    zoneName: string;
    zoneType: string;
    startTime: string;
    endTime: string;
    staff: string[];
    tables: string[];
  };

  @Component({
    components: {
      dineInZone,
      takeAway
    },
  })
  export default class TakeAway extends Vue {

    showSearch = false;

    zoneName = '';

    dialog = false;

    kitchens = [];

    zoneType = 'TakeAway';

    zoneId = '';

    filteredZones :zoneModel[] = [];

    openTakeAway(info:string) {
      this.dialog = true;
      this.zoneId = info;
    }

    closeTakeAway() {
      this.dialog = false;
    }

    async getZones() {
      try {
        const {data} =await this.$axios.get(`/v1/zones?businessId=${this.$route.params.business}`,
        {
            withCredentials: true,
        },
        )
        this.filteredZones = data.filter((zone: any) => zone.zoneType=== 'Take Away'); 
      } catch (error) {
        console.log(error)
      }
    }

    mounted() {
      const zones =  this.$store.state.zone.zones;
      this.filteredZones = zones.filter((zone: any) => zone.zoneType=== 'Take Away'); 
    }
  }
</script>
