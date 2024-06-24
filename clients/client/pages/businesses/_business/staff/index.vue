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
          class="text-h5 secondary--text px-6 font-weight-medium mb-1"
        >
          Staff
          <v-spacer></v-spacer>
          <v-text-field
            v-if="showSearch"
            v-model="staffName"
            label="search"
            color="primary"
            class="pt-0"
          ></v-text-field>
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
            rounded
            color="primary"
            height="49px"
            large
            class="text-capitalize"
            :disabled="showAddStaff"
            @click="(dialog = true)"
          >
            Add staff
          </v-btn>
        </v-row>
        <staffCard 
          :filteredStaff="filteredStaff"
          :staffName="staffName"
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
          <staffForm
            @close="close"
          />
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import staffCard from '@/components/staff/staff.vue'
  import staffForm from '@/components/staff/staffForm.vue'

  @Component({
    components: {
      staffCard,
      staffForm,
    },
  })
  export default class staff extends Vue {

    showSearch = false;

    dialog = false;

    staffName = '';

    showAddStaff = true;

    filteredStaff = [] as any;

    async close(info : boolean) {
      this.dialog = info;
      await this.getUsers();
    }

    async getUsers() {
      try {
        const { data } = await this.$axios.get(`/v1/users/${this.$route.params.business}`, {
          withCredentials: true,
        });
        this.filteredStaff = data;
      } catch (error) {
        console.error(error);
      }
    }

    async mounted() {
      await this.getUsers();
      if (!this.$auth.user || !this.$auth.user.customRole) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      if(customRole.length===0) {
        this.showAddStaff = false;
      }
      if(this.$store.state.permissions.includes('resource/get/addStaff')) {
        this.showAddStaff = false;
      }
    }
  }
  </script>
