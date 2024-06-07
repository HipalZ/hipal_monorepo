<template>
	<v-row  class="">
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
        :flat="$vuetify.breakpoint.mdAndUp?'': true"
      >
        <v-form
          ref="form"
        >
          <v-row
            class=""
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
                    >
                  </v-img>
                </v-list-item-icon>
                  <v-spacer></v-spacer>
                  <v-list-item-icon class="subtitle-2 mt-6">
                    Have account ?
                    <v-btn
                      text
                      class="pa-0 ma-0 mx-1 mt-n2 text-capitalize"
                      color="primary"
                      to="/login"
                    >
                      login
                    </v-btn>
                  </v-list-item-icon>
              </v-list-item>
            </v-col>
            <v-col
              cols="12"
              align="center"
              :class="$vuetify.breakpoint.xl? 'mt-16':''"
            >
              <span 
                :class="$vuetify.breakpoint.mdAndUp? 'text-h4 font-weight-bold':'text-h6 font-weight-bold'"
                style="color: #2C5282;"
              >
                Sign Up
              </span>
              <!-- <v-list-item-subtitle class="caption grey--text">
                Take less than 10 minutes to fill out all the information needed to register your business 
              </v-list-item-subtitle> -->
            </v-col>
          </v-row>
          <v-row
            class=""
            align="center"
            justify="center"
          >
            <v-col
              cols="8"
              align="center"
              :class="$vuetify.breakpoint.xl? 'mt-10':''"
            >
              <v-row
              align="center"
              justify="center"
              >
                <v-col
                  cols="12"
                  class="mt-4"
                >
                  <v-text-field
                    v-model="fullName"
                    type="name"
                    :rules="[
                      v => !!v || 'Name is required',
                      v => v.length > 2 || 'Name must be valid'
                    ]"
                    label="Full Name"
                    validate-on-blur
                    color="orange"
                    required
                  >
                  </v-text-field>
                </v-col>
                <v-col
                  cols="12"
                >
                  <v-text-field
                    v-model="email"
                    type="email"
                    :rules="[
                      v => !!v || 'Email is required',
                      v => /.+@.+\..+/.test(v) || 'Email must be valid'
                    ]"
                    label="Email"
                    color="orange"
                    validate-on-blur
                  >
                  </v-text-field>
                </v-col>
                <v-col
                  cols="12"
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
                </v-col>
                <v-col cols="12">
                  <v-combobox
                    v-model="businessRole"
                    :items="items"
                    validate-on-blur
                    color="orange"
                    label="Your role in Business"
                    item-color="orange"
                    :rules="[
                      v => !!v || 'businessRole is required',
                    ]"
                  >
                    <template v-slot:item="data">
                      <span class="prog-title">{{data.item}}</span>
                    </template>
                    <template v-slot:selection="data">
                      <span class="prog-title">{{data.item}}</span>
                    </template>
                  </v-combobox>
                </v-col>
                <v-col cols="12">
                  <v-btn
                    color="#E96108"
                    width="238px"
                    height="43px"
                    class="white--text text-capitalize text-h6"
                    rounded
                    @click="nextPage"
                  >
                    <span >Sign Up</span>
                    <!-- <font-awesome-icon
                    class="mx-4"
                    icon="chevron-right"
                    >
                    </font-awesome-icon> -->
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-col>
	</v-row>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  
  export default class personalInfo extends Vue {
    showText = false;

    email = '';

    fullName = '';

    phoneNumber= '';

    businessRole = '';

    items = [
      'RESTAURANT_OWNER',
      'RESTAURANT_MANAGER',
      'RESTAURANT_FLOOR_MANAGER',
    ];

    

    async nextPage() {
      const form = this.$refs.form as HTMLFormElement;
      if (form.validate()) {
        try {
          await this.$axios.post('/v1/users?action=signup&clientRole=user', {
            name: this.fullName,
            email: this.email,
            phone: this.phoneNumber,
            role: this.businessRole,
          });
          this.$emit('phoneNumber', this.phoneNumber)
          this.$emit('next', 'tab-2');
          // if (data) {
          //   await this.$auth.setUserToken(data.access_token, data.refresh_token);
          //   await this.$auth.fetchUser();
          //   this.$router.push('/home');
          // }
        } catch (error : any) {
          // const errorMessage = error.response.data.errors[0].message;
          // this.$showSnackbar(
          //   errorMessage || 'Something went wrong. Please try later',
          //   'error'
          // );
          console.log(error);
        }
      }
    }

  }
</script>


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