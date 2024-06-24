<template>
	<v-container fluid class="pa-0 ma-0">
    <v-row class="">
      <v-col
        cols="12"
        lg="8"
        md="7"
        sm="12"
        class="px-0 mx-0"
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
        :class="$vuetify.breakpoint.mdAndUp?'px-0 mx-0 ml-n14':'mt-n14'"
      >
        <v-card
          :class="$vuetify.breakpoint.mdAndUp? '':'rounded-t-xl mr-6'"
          :flat="$vuetify.breakpoint.mdAndUp?'':'true'"
        >
          <v-form
            ref="form"
          >
          <v-row
            class="px-0 mx-0"
            align="center"
            justify="center"
          >
            <v-col
              class="ml-n16 mx-0"
            >
                <v-list-item
                  class="px-0 mx-0"
                  flat
                >
                <v-list-item-icon class="px-0 mx-0">
                  <v-img
                      src="/hipalLogo.svg"
                      contain
                    >
                  </v-img>
                </v-list-item-icon>
                </v-list-item>
              </v-col>
            </v-row>
            <v-row
              :class="$vuetify.breakpoint.mdAndUp?'mt-16':''"
              align="center"
              justify="center"
            >
            <v-col
                cols="8"
                :class="$vuetify.breakpoint.mdAndUp?'mt-16':''"
              >
                <span
                  :class="$vuetify.breakpoint.mdAndUp? 'text-h4 font-weight-bold':'text-h6 font-weight-bold'"
                  style="color: #2C5282;"
                >
                  Please Enter OTP
                </span>
                <v-list-item-subtitle class="mt-10">
                  Sent to <span style="color: #3182CE;">{{phone}} <span class="ml-2">Edit</span></span> 
                </v-list-item-subtitle>
              </v-col>
              <v-col
                cols="8"
                align="center"
                class="mt-16"
              >
                <v-otp-input
                  v-model="otp"
                  length="4"
                  plain
                  type="number"
                  :rules="[
                    v => !!v || 'OTP is required',
                  ]"
                  @finish="onFinish"
                ></v-otp-input>
                <v-list-title class="caption">
                  Did not recieve the code?
                  <v-btn text small class="text-capitalize secondary--text">send again</v-btn>
                  <v-spacer></v-spacer>
                </v-list-title>
                <v-btn
                  color="primary"
                  width="238px"
                  height="49px"
                  rounded
                  class="white--text text-capitalize mt-16"
                >
                  <span >Sign Up</span>
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
  import { Vue, Component, Prop } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class otpInfo extends Vue {
    @Prop({ default:()=>{}}) private readonly phoneNumber!: any;

    showText = false;

    fullName = '';

    phone= this.phoneNumber;

    otp: string = '';

    async onFinish(otp: string) {
      await this.$auth.loginWith('local', {
        data: {
          phone: this.phone,
          otp: this.otp,
          role: 'RESTAURANT_OWNER'
        },
        withCredentials: true,
      });
      const { data } = await this.$axios.get('/v1/users?clientRole=user', {
        withCredentials: true,
      });
      if (data.currentUser) {
        this.$auth.setUser(data.currentUser);
        this.$store.commit('auth/SET', {
          key: 'loggedIn',
          value: true,
        });
      }
      this.$router.push('/businesses');
      // await this.$axios.post('/v1/users?action=login', {
      //   phone: this.phone,
      //   otp: this.otp,
      // }, {
      //   withCredentials: true,
      // })
      // const {data} = await this.$axios.get('/v1/users', {
      //   withCredentials: true,
      // });
      // this.$auth.setUser(data.currentUser);
      // this.$store.commit('auth/SET', {
      //   key: 'loggedIn',
      //   value: true,
      // });
      // this.$auth.loggedIn = true;
      // this.$router.push('/home');
    }
    

    async mounted() {
      // if (this.$auth.loggedIn) {
        // this.$router.push(this.$auth.redirect);
      // } else 
      if (this.$auth.user) {
        this.$store.commit('auth/SET', {
          key: 'loggedIn',
          value: true,
        });
        this.$router.push('/businesses');
      }
      try {
        await this.$axios.post('/v1/users/otp?clientRole=user',{
          phone: this.phone,
        });
      } catch (error) {
        this.otp = '';
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