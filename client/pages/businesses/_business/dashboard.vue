<template>
  <v-container fluid class="pa-0">
    <v-row
      v-if="showDashboard"
      justify="center"
      align="center"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <dashboard/>
      </v-col>
    </v-row>
    <v-row
      v-else
      class="title text-capitalize"
    >
      <v-spacer></v-spacer>
        seems like you don't have access
      <v-spacer></v-spacer>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import dashboard from '../../../components/resturantDashboard/dashboard.vue'

  @Component({
    components: {
      dashboard
    },
  })
  export default class Dashboard extends Vue {
    showDashboard = false;
    async mounted() {
      try {
        const { data } = await this.$axios.get(`/v1/businesses/${this.$route.params.business}`, {
          withCredentials: true,
        });
        if(data.status === false) {
          this.$router.push('/businesses')
        }
      } catch (error) {
        console.error(error);
      }
      if (!this.$auth.user || !this.$auth.user.customRole || !this.$auth.user.id) {
        return;
      }
      const customRole = this.$auth.user.customRole as any;
      if(customRole.length===0) {
        this.showDashboard = true;
      }
      if(this.$store.state.permissions.includes('resource/get/dashboard')) {
        this.showDashboard = true;
      }
      await this.$store.dispatch('zone/getAllZones',this.$route.params.business)
      await this.$store.dispatch('zone/getAllTables',this.$route.params.business)
      await this.$store.dispatch('zone/getDishes',this.$route.params.business)
      await this.$store.dispatch('zone/getCategories',this.$route.params.business)
    }
  }
</script>