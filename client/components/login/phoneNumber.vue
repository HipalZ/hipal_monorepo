<template>
	<v-container fluid class="pa-0 ma-0">
    <v-row class="">
      <v-col
        cols="12"
        lg="8"
        md="7"
        sm="12"
        class="pr-0 mr-0"
      >
			  <v-img
			  	src="/login.png"
			  	:height="$vuetify.breakpoint.mdAndUp ? '100vh':''"
          position="absolute"
			  >
			  </v-img>
		  </v-col>
      <v-col 
        cols="12"
        lg="4"
        md="5"
        sm="12"
        :class="$vuetify.breakpoint.mdAndUp?'px-0 mx-0 ml-n6':'mt-n14'"
      >
        <v-card
          :class="$vuetify.breakpoint.mdAndUp? '':'rounded-t-xl mr-6'"
          :flat="$vuetify.breakpoint.mdAndUp?'':'true'"
        >
          <v-form
            ref="form"
            @submit.prevent="nextPage"
          >
            <v-row
              class="px-0 mx-0"
              align="center"
              justify="center"
            >
              <v-col
                class="ml-n10 mx-0"
              >
                  <v-list-item
                    class="px-0 mx-0"
                    flat
                  >
                  <v-list-item-icon class="px-0 mx-0">
                    <v-img
                        src="/hipalLogo.svg"
                        contain
                        height="50"
                      >
                    </v-img>
                  </v-list-item-icon>
                  <v-spacer></v-spacer>
                  <v-list-item-icon class="subtitle-2 mt-6">
                    create account ?
                    <v-btn
                      text
                      class="pa-0 ma-0 mx-1 mt-n2 text-capitalize"
                      color="primary"
                      to="/"
                    >
                      signUp
                    </v-btn>
                  </v-list-item-icon>
                  </v-list-item>
              </v-col>
              <v-col
                cols="12"
                :class="$vuetify.breakpoint.mdAndUp?'mt-16 pt-16':''"
                align="center"
                justify="center"
              >
                <span 
                  :class="$vuetify.breakpoint.mdAndUp? 'text-h4 font-weight-bold':'text-h6 font-weight-bold'"
                  style="color: #2C5282;"
                >
                Sign In
                </span>
              </v-col>
            </v-row>
            <v-row
              :class="$vuetify.breakpoint.mdAndUp?'mt-16':''"
              align="center"
              justify="center"
            >
              <v-col
                cols="8"
                align="center"
                class="mt-10"
              >
                <v-text-field
                  v-model="phoneNumber"
                  :rules="[
                      v => !!v || 'Phone is required',
                      v => /^[0-9]{10,12}$/.test(v) || 'Phone is invalid',
                    ]"
                  label="Phone Number"
                  validate-on-blur
                  color="orange"
                  maxlength="10"
                >
                </v-text-field>
                <!-- <v-otp-input
                  v-else
                  v-model="otp"
                  length="6"
                  plain
                  type="number"
                  :rules="[
                    v => !!v || 'OTP is required',
                  ]"
                >
                </v-otp-input> -->
                <v-btn
                  color="primary rounded-xl"
                  width="250px"
                  height="46px"
                  class="white--text text-capitalize my-16"
                  @click="nextPage"
                >
                  <span >Sign In</span>
                </v-btn>
              </v-col>
            </v-row>
          </v-form>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class loginPage extends Vue {
    showOtpField = true;

    otp = '';

    phoneNumber= '';

    async nextPage() {
      const form = this.$refs.form as HTMLFormElement;
      if (form.validate()) {
        try {
          await this.$axios.post('/v1/users/otp?clientRole=user', {
            phone: this.phoneNumber,
          });
          this.$emit('phoneNumber', this.phoneNumber)
          this.$emit('next', 'tab-2');
        } catch (error : any) {
          console.log(error);
        }
      }
    }
      
  }
  </script>

<style lang="scss" scoped>
  .background {
    background: linear-gradient(to right, #38A169 40%, #2FBD4E 30%) !important;
  }
  </style>

<!-- <style >
  .v-input--is-focused .v-input__slot {
    background-color: #fff !important;
    border:1.5px solid orange !important;
    color: black !important;
  }
  .text-input-blue .v-text-field__slot input {
   color: black !important;
  }
  .v-select__selection,
  .v-select__selection--comma,
  .v-select.v-text-field input {
    color: black !important;
  }
  .v-list-item--link::before { background-color: #FBD38D !important; }
  .theme--light.v-list-item:hover::before { opacity: 0.5; }

</style> -->