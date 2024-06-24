<template>
  <v-container fluid class="pa-0">
    <v-row
      class="mx-4 mt-2"
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
          lg="12"
          class=""
          >
            <v-row
              class="text-h5 secondary--text px-6 font-weight-medium mb-1"
            >
              Kitchen
              <v-spacer></v-spacer>
              <v-text-field
                v-if="showSearch"
                v-model="kitchenName"
                label="search"
                color="primary"
                class="pt-0"
              ></v-text-field>
              <v-btn
                icon
                large
                @click="showSearch = !showSearch"
              >
                <v-icon
                  :color="showSearch?'primary':'#1C1B1F'"
                >search</v-icon>
              </v-btn>
              <v-btn
                icon
                large
                class="mr-2"
              >
                <v-icon
                  color="#1C1B1F"
                >
                  filter_alt
                </v-icon>
              </v-btn>
              <v-btn
                rounded
                color="primary"
                height="49px"
                large
                class="text-capitalize"
                @click="dialog1 = true"
              >
                Add Kitchen
              </v-btn>
            </v-row>
          </v-col>
        </v-row>
        <kitchens
          :filteredKitchens="filteredKitchens"
          :KitchenName="kitchenName"
          @openEditForm="openEditForm"
          @openKitchen="openKitchen"
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
        color="#f5f5f5"
      >
        <kitchenDisplay
          :key="dialog"
          :kitchenId="kitchenId"
          :kitchenInfo="kitchenInfo"
          @closeKitchen="closeKitchen"
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
        <kitchenForm
          :editKitchen="editKitchen"
          @update="updateKitchens"
          @close="close"
        />
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import kitchens from '@/components/kitchen/kitchens.vue';
  import kitchenForm from '@/components/kitchen/kitchenForm.vue';
  import kitchenDisplay from '@/components/kitchen/kitchenDisplay.vue'
  @Component({
    components: {
      kitchens,
      kitchenForm,
      kitchenDisplay,
    },
  })
  export default class Kitchen extends Vue {

    showSearch = false;

    dialog = false;

    dialog1 = false;

    kitchenName = '';

    filteredKitchens = [];

    editKitchen = [] as any;

    kitchenInfo = [];

    kitchenId = '';

    async getKitchens() {
      try {
        const {data} =await this.$axios.get(`/v1/kitchens?businessId=${this.$route.params.business}`,
        {
            withCredentials: true,
        },
        )
        this.filteredKitchens = data
      } catch (error) {
        console.log(error)
      }
    }

    close(info : boolean) {
      this.dialog1 = info;
      this.editKitchen = [];
    }

    updateKitchens() {
      this.getKitchens();
      this.dialog1 = false;
      this.editKitchen = [];
    }

    openEditForm(info : any) {
      this.editKitchen = info;
      console.log(this.editKitchen)
      this.dialog1 = true;
    }

    closeKitchen() {
      this.dialog = false;
    }

    async openKitchen(id:string) {
      this.kitchenId = id;
      try {
        const {data} =await this.$axios.get(`/v1/kitchens/${id}/kots?kitchenId=${id}`,
        {
            withCredentials: true,
        },
        )
        this.kitchenInfo = data;
      } catch (error) {
        console.log(error)
      }
      this.dialog = true;
    }
    
    async mounted() {
      await this.getKitchens();
      await this.$store.dispatch('zone/getAllZones',this.$route.params.business)
      await this.$store.dispatch('zone/getAllTables',this.$route.params.business)
    }
  }
</script>

<style>
  .status {
    background: linear-gradient(0deg, rgba(241 70 56 /15%), rgba(241 70 56 /15%)), #FFF;
    border: 1px solid rgba(0 0 0 /30%);
  }
</style>