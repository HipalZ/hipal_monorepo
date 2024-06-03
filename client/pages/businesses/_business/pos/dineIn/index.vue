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
        <v-row class="px-0 mx-0">
          <span
            :class="$vuetify.breakpoint.mdAndUp?'text-h4 secondary--text':'secondary--text title'"
          >
            Dine In
          </span>
          <v-spacer></v-spacer>
          <span v-if="$vuetify.breakpoint.smAndDown">
            <v-text-field
              v-if="showSearch"
              v-model="zoneName"
              label="search"
              color="primary"
              class="pt-0"
            ></v-text-field>
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
        <dine-in-zone
          :filteredZones="filteredZones"
          :zoneName="zoneName"
          :zoneType="zoneType"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import dineInZone from '@/components/pos/dineIn/dineIn.vue'

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
      dineInZone
    },
  })
  export default class DineIn extends Vue {

    showSearch = false;

    zoneType = 'DINE IN'

    zoneName = '';

    kitchens = [];

    filteredZones :zoneModel[] = [];

    async getZones() {
      try {
        const {data} =await this.$axios.get(`/v1/zones?businessId=${this.$route.params.business}`,
        {
            withCredentials: true,
        },
        )
        this.filteredZones = data.filter((zone: any) => zone.zoneType=== 'Dine In'); 
      } catch (error) {
        console.log(error)
      }
    }

    async mounted() {
      await this.$store.dispatch('zone/getAllZones',this.$route.params.business)
      await this.$store.dispatch('zone/getAllTables',this.$route.params.business)
      await this.$store.dispatch('zone/getDishes',this.$route.params.business)
      await this.$store.dispatch('zone/getCategories',this.$route.params.business)
      const zones =  this.$store.state.zone.zones;
      if (!this.$auth.user || !this.$auth.user.customRole || !this.$auth.user.id) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      const userId = this.$auth.user.id as any;
      if(customRole.length===0) {
        this.filteredZones = zones.filter((zone: any) => zone.zoneType=== 'Dine In'); 
      }
      if(this.$store.state.permissions.includes('resource/get/viewZones')) {
        this.filteredZones = zones.filter((zone: any) => zone.zoneType=== 'Dine In' && zone.staff.includes(userId));
      }
    }
  }
</script>
