<template>
  <v-container fluid fill-height class="pa-0">
    <v-row class="fill-height align-center px-0 mx-0">
      <v-col
        cols="12"
        md="12"
        class="background fill-height"
      >
        <v-row
          justify="center"
          align="center"
          class="pa-0"
        >
          <v-col
            cols="12"
            md="12"
            sm="12"
            class="px-0"
          >
            <v-card 
              class="rounded-lg"
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
                <phoneNumber
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

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import phoneNumber from './phoneNumber.vue';
  import otpPage from '../signUp/otpVerification.vue';

  @Component({
    components: {
      phoneNumber,
      otpPage,
    },
  })
  export default class logInMain extends Vue {
    model= 'tab-1';

    phone= '';

    nextPageOtp(info: any) {
      this.model = info;
    }

    nextPagePassword(info: any) {
      this.model = info;
    }

    phoneNumber(info:any) {
      this.phone= info;
    }
  }
  </script>