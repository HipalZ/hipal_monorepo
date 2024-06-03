<template>
 <v-container fluid class="pt-0">
    
    <v-row
      class="mt-4"
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
      >
      <v-card
        class="businesscard ma-2"
        :class="business.status?'':'card2'"
        @click="$router.push(
          {
            name: 'businesses-business',
            params: {
              business: business.id
            }
          }
        )"
      >
        <v-card-actions class="px-0 mx-0" >
          <v-list-item class="grow pr-0">
            <v-list-item-avatar tile style="background-color: white;">
              <v-img
                class="elevation-6"
                alt=""
                :src="business.logo"
                contain
              ></v-img>
            </v-list-item-avatar>
            <v-list-item-content class="">
              <v-card-text class="pa-0 ma-0 subtitle-1 text-left black--text">
                {{
                  20 > business.businessName.length ? business.businessName :business.businessName.substr(0, 20) + '...'
                }}
              </v-card-text>
            </v-list-item-content>
            <v-list-item-action class="mt-n6">
              <v-badge
                overlap
                dot
                :color="business.status ? 'success':'error'"
              >
              </v-badge>
            </v-list-item-action>
          </v-list-item>
        </v-card-actions>
        <v-card-title class="subtitle-1 secondary--text align-center justify-center">
          <v-spacer></v-spacer>
          <v-icon class="px-1"  color="secondary">
            boy
          </v-icon> 5
          <v-spacer></v-spacer>
          <v-icon class="px-1" color="secondary">
            restaurant
          </v-icon> 5
          <v-spacer></v-spacer>
        </v-card-title>
        <v-card-actions
          class="mb-4"
        >
          <v-spacer></v-spacer>
            <v-btn
              outlined
              class="text-capitalize"
              color="secondary"
              style="background-color: white;"
            >
              <v-icon class="mr-1 ">
                info_outline
              </v-icon>
              about your business
            </v-btn>
          <v-spacer></v-spacer>
        </v-card-actions>
      </v-card>
      </v-col>
      <!-- <v-text-field
        placeholder="Business Name"
        class="py-0 my-1"
        color="orange"
        validate-on-blur
      ></v-text-field> -->
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'bussinesses',
  data() {
    return {
      businesses : [
      ],
    }
  },
  methods: {
    businessStatusColor(status) {
      switch (status) {
        case 'Pending':
          return {
            color:'card1'
          };
        case 'InActive':
          return {
            color:'card2'
          };
        case 'Blocked':
          return {
            color:'card3'
          };
        default:
          return {
            color:''
          };
      }
    },

    async getBusinesses() {
      try {
        const { data } = await this.$axios.get(`/v1/businesses?clientRole=admin`, {
          withCredentials: true,
        });
        this.businesses = data;
      } catch (error) {
        console.error(error);
      }
    }
  },

  mounted() {
    this.getBusinesses();
  }

}
</script>

<style>
.card1 {
  background: linear-gradient(0deg, rgba(56, 141, 241, 0.3), rgba(56, 141, 241, 0.3)), #FFFFFF !important;
}

.card2 {
  background: linear-gradient(0deg, rgba(191, 6, 3, 0.2), rgba(191, 6, 3, 0.2)), #FFFFFF !important;
}

.card3 {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0.1)), #FFFFFF !important;
}
</style>