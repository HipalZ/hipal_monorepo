<template>
  <v-container fluid >
    <v-row
      class="text-h5 secondary--text px-6 font-weight-medium mb-1"
    >
      {{$auth.user.name}}
      <v-spacer></v-spacer>
      <v-btn
        rounded
        color="error"
        height="49px"
        class="text-capitalize text-h6 mx-4"
      >
        Cancel
      </v-btn>
      <v-btn
        rounded
        color="primary"
        height="49px"
        width="97px"
        class="text-capitalize text-h6"
      >
        Save
      </v-btn>
    </v-row>
    <v-row
    >
      <v-col cols="10">
        <v-card
          class="cardborder businesscard secondary--text px-8 py-1"
        >
          <v-card-title>
            <span class="text-h6">Account details</span>
          </v-card-title>
          <v-card-text class="secondary--text">
            <v-container>
              <v-row>
                <v-col
                  class="px-0 mx-0"
                >
                  <v-row
                  >
                    <v-col
                      cols="3"
                    >
                      Name of the account Holder
                    </v-col>
                    <v-col
                      cols="6"
                      class="py-0 my-0"
                    >
                      <v-text-field
                        v-model="name"
                        placeholder="Name of the account Holder"
                        class="py-0 my-1"
                        color="orange"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row
                  >
                    <v-col
                      cols="3"
                    >
                     Phone number
                    </v-col>
                    <v-col
                    cols="6"
                    class="py-0 my-0"
                    >
                      <v-text-field
                        v-model="phone"
                        :rules="[
                          v => !!v || 'Phone is required',
                          v => /^[0-9]{10,12}$/.test(v) || 'Phone is invalid',
                        ]"
                        placeholder="Phone Number"
                        validate-on-blur
                        color="orange"
                        class="py-0 my-1"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row
                  >
                    <v-col
                      cols="3"
                      class="align-self-center"
                    >
                     Logo
                    </v-col>
                    <v-col
                      cols="5"
                      class="py-0 my-0"
                    >
                    <v-card
                      class="pa-2"
                      width="180px"
                    >
                      <v-img
                        src="./addLogo.svg"
                        height="150px"
                        width="180px"
                        contain
                      >
                        <v-card-title class="mt-12">
                          <v-spacer></v-spacer>
                          <v-icon>add</v-icon>
                          <v-spacer></v-spacer>
                        </v-card-title>
                      </v-img>
                    </v-card>
                    </v-col>
                  </v-row>
                  <v-row
                    class="mt-8"
                  >
                    <v-col
                      cols="3"
                    >
                     Email
                    </v-col>
                    <v-col
                      cols="6"
                      class="py-0 my-0"
                    >
                    <v-text-field
                      v-model="email"
                      type="mail"
                      :rules="[
                        v => !!v || 'Email is required',
                        v => /.+@.+\..+/.test(v) || 'Email must be valid'
                      ]"
                      placeholder="Email"
                      color="orange"
                      validate-on-blur
                    >
                    </v-text-field>
                    </v-col>
                  </v-row>
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
  })
  export default class EditProfile extends Vue {
    name = this.$auth.user?.name;

    phone = this.$auth.user?.phone;
    
    logo = '';

    email = this.$auth.user?.email;
  }
</script>