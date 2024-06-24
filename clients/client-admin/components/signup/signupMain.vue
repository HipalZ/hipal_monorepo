<template>
 <v-container fluid fill-height class="pa-0">
    <v-row class="fill-height align-center px-0 mx-0 ">
      <v-col
        cols="12"
        md="12"
        class="background fill-height"
      >
        <v-row
          justify="center"
          align="center"
          class=""
        >
          <v-col
            cols="12"
            md="12"
            sm="12"
            class="px-0 "
          >
            <v-card 
              class=""
              flat
            >
              <template>
              <v-tabs
                v-model="model"
                slider-color="#fee486"
                centered
                style="display: none;"
              >
                <v-tab
                  class="pr-6 grey--text"
                  :href="`#tab-1`"
                >
                  personalInfo
                </v-tab>
                <v-tab
                  class="pr-6 grey--text"
                  :href="`#tab-2`"
                >
                  OtpVerification
                </v-tab>
              </v-tabs>
            </template>
            <v-tabs-items v-model="model" touchless >
              <v-tab-item
                :value="`tab-1`"
              >
                <personal-info
                  @next="nextPageOtp"
                  @phoneNumber="phoneNumber"
                />
              </v-tab-item>
              <v-tab-item
                :value="`tab-2`"
              >
                <otp-page
                  @next="nextPagePassword"
                  :phoneNumber="phone"
                />
              </v-tab-item>
            </v-tabs-items>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
 import personalInfo from './personalInfo.vue';
import otpPage from './otpVerification.vue';
export default {
 name: 'signup',
  components : {
   personalInfo,
   otpPage,
  },
 data() {
   return {
    model: 'tab-1',

    phone: '',
   }
 },

 methods: {
  nextPageOtp(info) {
    this.model = info;
  },

  nextPagePassword(info) {
    this.model = info;
  },

  phoneNumber(info) {
    this.phone = info;
  },

 }
}
</script>

<style>
.cardborder {
 border-left: 8px solid #E96108 !important;
}

.td {
 border-bottom: none !important;
}
</style>
