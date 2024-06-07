<template>
  <v-container fluid class="pt-0">
    <v-row>
      <v-col
        cols="12"
        class=""
      >
        <business-form
          @refresh="getBusinesses"
          @openMobileScreen="openMobileScreen"
          @closeMobileScreen="closeMobileScreen"
        />
        <v-row
          v-if="showBusinesses"
          :class="$vuetify.breakpoint.mdAndUp ? 'pl-10' : ''"
        >
          <v-col
            v-for="(business, index) in businesses"
            :key="index"
            align="center"
            cols="12"
            xl="2"
            lg="3"
            md="4"
            sm="12"
            xs="12"
            class="mr-16 mb-4"
          >
            <Business
              :business="business"
            />
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import Business from '@/components/businesses/business.vue';
import BusinessForm from '@/components/businesses/businessForm.vue'

@Component({
  components: {
    Business,
    BusinessForm,
  },
})
export default class Businesses extends Vue {
  businesses = [] as any;

  showBusinesses = true;

  async mounted() {
    await this.getBusinesses();
  }

  openMobileScreen() {
    this.showBusinesses = false;
  }

  closeMobileScreen() {
    this.showBusinesses = true;
  }

  async getBusinesses() {
    if (!this.$auth.user || !this.$auth.user.customRole) {
      return;
    }
    const customRole = this.$auth.user.customRole as any;
    if(customRole.length===0) {
      try {
        const { data } = await this.$axios.get(`/v1/businesses`, {
          withCredentials: true,
        });
        this.businesses = data;
      } catch (error) {
        console.error(error);
      }
    }
    else {
      for(let i=0; i<= customRole.length; i++) {
        try {
          const { data } = await this.$axios.get(`/v1/businesses/${customRole[i].businessId}`, {
            withCredentials: true,
          });
          this.businesses.push(data);
          await this.$store.dispatch('getRolePermissions', customRole[i].customRoleId)
        } catch (error) {
          console.error(error);
        }
      }
    }
  }
}
</script>