<template>
  <v-container fluid class="pa-0 ma-0">
    <v-row
      class="secondary--text py-1"
    >
      <v-col
        cols="12"
      >
      <v-card
          class="secondary--text"
          flat
        >
          <v-card-title class="px-6 mx-0">
            <span class="text-h5">Add Business</span>
            <v-spacer></v-spacer>
            <v-btn
              icon
              text
              @click="$router.push('/home')"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </v-card-title>
          <v-card-text class="secondary--text">
            <v-row
              align="center"
              justify="center"
            >
              <v-col
                cols="12"
                class="py-0 my-0 px-8"
              >
                <v-text-field
                  label="Business Name"
                  color="orange"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                class="py-0 my-0 px-8"
              >
                <v-text-field
                  label="Registered Business Name"
                  color="orange"
                ></v-text-field>
              </v-col>
              <v-col
                  cols="12"
                  class="py-0 my-0 px-8"
                >
                <v-combobox
                  label="Type of business"
                ></v-combobox>
              </v-col>
              <v-col
                cols="12"
                class="px-8"
              >
               Do you Have GST?
              </v-col>
              <v-col
                cols="12"
                class="py-0 my-0 px-8"
              >
                <v-radio-group
                  v-model="row"
                  row
                  class="mt-3 pt-0"
                >
                  <v-radio
                    label="Yes"
                    value="radio-1"
                  ></v-radio>
                  <v-radio
                    label="No"
                    value="radio-2"
                  ></v-radio>
                </v-radio-group>
              </v-col>
              <v-col
                cols="12"
                class="px-8"
              >
                Do you Multiple outlets?
              </v-col>
              <v-col
                cols="12"
                class="py-0 my-0 px-8"
              >
                <v-radio-group
                  v-model="row"
                  row
                  class="mt-3 pt-0"
                >
                  <v-radio
                    label="Yes"
                    value="radio-1"
                  ></v-radio>
                  <v-radio
                    label="No"
                    value="radio-2"
                  ></v-radio>
                </v-radio-group>
              </v-col>
              <v-col
                cols="12"
                class="px-8"
              >
               Customized Link 
              </v-col>
              <v-col
                cols="6"
                class="py-0 my-0 pl-8"
              >
               <span class="caption">
                https://hipal/bussiness
               </span>
              </v-col>
              <v-col
                cols="6"
                class="py-0 my-0 pr-8"
              >
                <v-text-field
                  label="Business name"
                  class=""
                  color="orange"
                  hint="No Special characters"
                  persistent-hint
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                class="px-8"
              >
               Logo
              </v-col>
              <v-col
                cols="12"
                class="py-0 my-0 px-8"
              >
                <v-card
                  class="pa-2"
                  width="180px"
                >
                  <v-img
                    src="/addLogo.svg"
                    height="150px"
                    width="180px"
                    contain
                  >
                    <v-card-title class="mt-12">
                      <v-spacer></v-spacer>
                      <font-awesome-icon
                        icon="plus"
                        color="black"
                      >
                      </font-awesome-icon>
                      <v-spacer></v-spacer>
                    </v-card-title>
                  </v-img>
                </v-card>
              </v-col>
              <v-col
                cols="12"
                class="py-0 my-0 px-8"
              >
                <v-textarea
                  label="Address"
                  class=""
                  color="primary"
                  auto-grow
                  rows="1"
                  row-height="15"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class=" py-6">
            <v-spacer></v-spacer>
            <v-btn
              color="#BF0603"
              rounded
              class="white--text text-capitalize"
              height="49px"
              width="136px"
              @click="dialog = false"
            >
              <span class="px-4">Cancel</span>
            </v-btn>
            <v-btn
              color="primary"
              rounded
              height="49px"
              width="111px"
              class="white--text text-capitalize"
              @click="dialog = false"
            >
              <span class="px-4">Save</span>
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
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
  export default class MobileAddBusiness extends Vue {

    dialog = false;

    row= null;

  }
</script>

<style>
/* .cardborder {
  border-left: 8px solid  !important;
  border-left-color: #E96108 !important;
} */
/* stylelint-disable */
.v-messages__message {
  color: red !important;
}
/* stylelint-enable */
</style>