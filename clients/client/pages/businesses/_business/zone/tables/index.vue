<template>
  <v-container fluid class="pa-0">
    <v-row
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
          <v-col
            v-if="showSearch"
            cols="12"
            xl="2"
            lg="2"
            align="end"
            justify="end"
          >
            <v-text-field
              v-model="TableName"
              label="search"
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
            <v-btn
              color="primary"
              rounded
              large
              class="mr-2 text-capitalize"
              :disabled="showAddTable"
              @click="addFormOpen"
            >
              Add Table
            </v-btn>
          </v-col>
        </v-row>
        <v-row class="px-0 mx-4">
          <span class="text-h4 secondary--text">
            Tables
          </span>
        </v-row>
        
        <tables
          :filteredTable="filteredTable"
          :TableName="TableName"
          @update="update"
          @openEditForm="openEditForm"
        />
      </v-col>
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
          <addTables
            @close="addFormClose"
            @update="update"
            :zones="zones"
            :updateTableInfo="updateTableInfo"
          />
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import tables from '@/components/zone/tables/table.vue'
  import addTables from '@/components/zone/tables/tableForm.vue'

  @Component({
    components: {
      tables,
      addTables,
    },
  })
  export default class Tables extends Vue {

    showSearch = false;

    dialog = false;

    dialog1 = false;

    TableName = '';

    showAddTable = true;

    zones = [];

    updateTableInfo = {};

    filteredTable = [
      {
        ZoneName: 'gold',
      },
      {
        ZoneName: 'gold',
      },
      {
        ZoneName: 'gold',
      },
      {
        ZoneName: 'gold',
      },
    ]

    addFormClose() {
      this.dialog = false;
    }

    addFormOpen() {
      this.updateTableInfo = [];
      this.dialog = true;
    }

    editFormClose() {
      this.dialog = false;
      this.updateTableInfo = [];
    }

    async update() {
      await this.$store.dispatch('zone/getAllTables',this.$route.params.business)
      this.dialog = false;
      this.updateTableInfo = [];
    }

    openEditForm(info:any) {
      this.updateTableInfo = [];
      this.updateTableInfo = info;
      this.dialog = true;
    }

    async getZones() {
      try {
        const {data} =await this.$axios.get(`/v1/zones?businessId=${this.$route.params.business}`,
        {
            withCredentials: true,
        },
        )
        this.zones = data;
      } catch (error) {
        console.log(error)
      }
    }

    async mounted() {
      await this.$store.dispatch('zone/getAllZones',this.$route.params.business)
      await this.$store.dispatch('zone/getAllTables',this.$route.params.business)
      await this.$store.dispatch('zone/getDishes',this.$route.params.business)
      await this.$store.dispatch('zone/getCategories',this.$route.params.business)
      this.filteredTable= this.$store.getters['zone/zoneNames'];
      await this.getZones();
      if (!this.$auth.user || !this.$auth.user.customRole || !this.$auth.user.id) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      if(customRole.length===0) {
        this.showAddTable = false;
      }
      if(this.$store.state.permissions.includes('resource/get/addTables')) {
        this.showAddTable = false;
      }
    }
  }
</script>
