<template>
	<v-row justify="center" class="" >
		<v-col
      cols="12"
      lg="5"
      md="6"
      sm="6"
      class=""
    >
			<v-img
				src="/password.svg"
				height="100vh"
        contain
        position="absolute"
			>
			</v-img>
		</v-col>
		<v-col 
      cols="12"
      lg="7"
      md="7"
      sm="6"
    >
      <v-form
        ref="form"
      >
        <v-row
          class=""
        >
          <v-col>
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
                  have account ?
                  <v-btn text class="pa-0 ma-0 mx-1 mt-n2" color="primary">login</v-btn>
                </v-list-item-icon>
              </v-list-item>
          </v-col>
          <v-col
            cols="12"
          >
            <span class="text-h4 font-weight-bold " style="color: #2C5282;">
              One step away from awesomeness
            </span>
            <v-list-item-subtitle class="caption grey--text">
              Set a password for your account <span class="primary--text font-weight-bold">sainath</span>
            </v-list-item-subtitle>
          </v-col>
          <v-col
            cols="8"
            class="mt-4"
          >
            <span
              v-if="showText"
              class="orange--text"
            >password</span>
            <v-text-field
              v-model="fullName"
              type="password"
              :rules="[
                v => !!v || 'Name is required',
                v => v.length > 2 || 'Name must be valid'
              ]"
              label="password"
              filled
              solo-inverted
              flat
              validate-on-blur
              color="orange"
              class="text-input-blue mt-2"
              @focus="showText = true"
              @blur="showText = false"
            >
            </v-text-field>
          </v-col>
          <v-col
            cols="8"
          >
            <v-text-field
              v-model="email"
              :rules="[
                v => !!v || 'Email is required',
                v => /.+@.+\..+/.test(v) || 'Email must be valid'
              ]"
              label="Re-enter password"
              filled
              flat
              solo-inverted
              color="orange"
              class="text-input-blue"
            >
            </v-text-field>
          </v-col>
          <!-- <v-col cols="8">
            <v-autocomplete
              v-model="value"
              :items="items"
              filled
              flat
              solo-inverted
              color="orange"
              label="your role in business"
              item-color="orange"
              class="text-input-blue"
            >
            </v-autocomplete>
          </v-col> -->
          <v-col cols="8">
            <v-btn
              color="orange rounded-lg"
              width="150px"
              height="46px"
              class="px-6 white--text text-capitalize"
            >
              Next
              <font-awesome-icon
              class="mx-4"
              icon="chevron-right"
              >
              </font-awesome-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
      <v-row
        class="ml-n9"
      >
      <v-spacer></v-spacer>
          <v-footer
          padless
          absolute
          width="70%"
          style="margin-left: 37% !important;"
      >
        <v-card
        class="background flex"
      >
        <v-card-title class="ml-16 pl-16">
          3/3
        </v-card-title>
      </v-card>
      </v-footer>
      </v-row>
    </v-col>
	</v-row>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class passwordInfo extends Vue {
    showText = false;

    fullName = '';

    phoneNumber= '';

    role = '';

    items = [
      'owner',
      'floor manger',
      'floor'
    ]
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