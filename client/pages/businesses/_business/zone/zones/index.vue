<template>
  <v-container fluid class="pa-0">
    <v-row
      v-if="showZones"
      class="mx-4"
    >
      <v-col
        cols="12"
        lg="12"
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
          <v-col>
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
            class="d-flex"
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
          <v-btn
            color="primary"
            rounded
            large
            class="mr-2 text-capitalize"
            @click="(dialog = true)"
          >
            Add Zones
          </v-btn>
          </v-col>
        </v-row>
        <v-row class="px-0 mx-4">
          <span class="text-h4 secondary--text">
            Dine In Zones
          </span>
        </v-row>
        <zone
          :filteredZones="filteredZones"
          :zoneName="zoneName"
          @openEditForm="openEditForm"
        />
      </v-col>
    </v-row>
    <v-row
      v-else
    >
      <v-spacer></v-spacer>
        seems like you don't have access
      <v-spacer></v-spacer>
    </v-row>
    <v-dialog
      v-model="dialog"
      fullscreen
      transition="dialog-bottom-transition"
      persistent
    >
      <v-card
        color="#f5f5f5"
      >
        <zoneForm
          @close="addFormClose"
          @update="update"
          :kitchens="kitchens"
        />
      </v-card>
    </v-dialog>
    <v-dialog
      v-model="dialog1"
      fullscreen
      transition="dialog-bottom-transition"
      persistent
    >
      <v-card
        color="#f5f5f5"
      >
        <editZoneForm
          @close="editFormClose"
          @update="update"
          :zoneUpdateInfo="zoneUpdateInfo"
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import zoneForm from '@/components/zone/zones/zoneForm.vue';
  import editZoneForm from '@/components/zone/zones/editZoneForm.vue'
  import zone from '@/components/zone/zones/zone.vue'

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
      zoneForm,
      editZoneForm,
      zone,
    },
  })
  export default class zones extends Vue {

    showSearch = false;

    showZones = false;

    dialog = false;

    dialog1 = false;

    zoneName = '';

    kitchens = [];

    filteredZones :zoneModel[] = [];

    zoneUpdateInfo = [];

    addFormClose() {
      this.dialog = false;
    }

    editFormClose() {
      this.dialog1 = false;
    }

    openEditForm(info:any) {
      this.zoneUpdateInfo = info;
      console.log(this.$store.getters['zone/tableNames'](info.id));
      this.dialog1 = true;
    }

    async update() {
      await this.$store.dispatch('zone/getAllZones',this.$route.params.business)
      this.dialog = false;
      this.filteredZones = this.$store.state.zone.zones;
    }

    async getZones() {
      try {
        const {data} =await this.$axios.get(`/v1/zones?businessId=${this.$route.params.business}`,
          {
            withCredentials: true,
          },
        )
        this.filteredZones = data;
      } catch (error) {
        console.log(error)
      }
    }

    async mounted() {
      await this.$store.dispatch('zone/getAllZones',this.$route.params.business)
      await this.$store.dispatch('zone/getAllTables',this.$route.params.business)
      await this.$store.dispatch('zone/getDishes',this.$route.params.business)
      await this.$store.dispatch('zone/getCategories',this.$route.params.business)
      this.filteredZones = this.$store.state.zone.zones;
      if (!this.$auth.user || !this.$auth.user.customRole) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      if(customRole.length===0) {
        this.showZones = true;
      }
      if(this.$store.state.permissions.includes('resource/get/viewZones')) {
        this.showZones = true;
      }
    }
  }
  </script>
