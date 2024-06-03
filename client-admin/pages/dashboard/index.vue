<template>
  <v-container fluid class="pt-0">
    <v-row>
      <v-col
        cols="12"
        class=""
      >
        <v-row
          justify="end"
          align="end"
          class="pa-4"
        >
          <v-dialog
            v-model="dialog"
            persistent
            max-width="900px"
          >
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                rounded
                large
                color="primary"
                height="49px"
                v-bind="attrs"
                v-on="on"
                class="white--text ma-4 mb-0 text-capitalize"
              >
                Add SuperAdmin
              </v-btn>
            </template>
            <v-card
              class="cardborder px-4"
            >
              <v-card-title class="mb-4">
                <span class="text-h5 secondary--text">Your Business Details</span>
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  @click="close()"                      
                >
                <v-icon>close</v-icon>
                </v-btn>
              </v-card-title>
              <v-card-text>
                <v-form ref="form">
                  <v-container>
                    <v-row>
                      <v-col
                        class="px-0 mx-0 secondary--text"
                      >
                        <v-row
                        >
                          <v-col
                            cols="12"
                            lg="3"
                            class="secondary--text"
                          >
                          Name
                          </v-col>
                          <v-col
                            cols="12"
                            lg="6"
                            class="py-0 my-0"
                          >
                            <v-text-field
                              v-model="name"
                              :rules="[
                                v => !!v || 'Name is required',
                                v => v.length > 2 || 'Name must be valid'
                              ]"
                              class="py-0 my-1"
                              color="orange"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row
                        >
                          <v-col
                            cols="12"
                            lg="3"
                          >
                            Phone Number
                          </v-col>
                          <v-col
                            cols="12"
                            lg="6"
                            class="py-0 my-0"
                          >
                            <v-text-field
                              v-model="phoneNumber"
                              :rules="[
                                v => !!v || 'Phone is required',
                                v => /^[0-9]{10,12}$/.test(v) || 'Phone is invalid',
                              ]"
                              class="py-0 my-1"
                              color="orange"
                              maxlength="10"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                        <v-row
                        >
                          <v-col
                            cols="12"
                            lg="3"
                          >
                            Email
                          </v-col>
                          <v-col
                            cols="12"
                            lg="6"
                            class="py-0 my-0"
                          >
                            <v-text-field
                              v-model="email"
                              class="py-0 my-1"
                              color="orange"
                              :rules="[
                                v => !!v || 'Email is required',
                                v => /.+@.+\..+/.test(v) || 'Email must be valid'
                              ]"
                            ></v-text-field>
                          </v-col>
                        </v-row>
                      </v-col>
                    </v-row>
                    <v-card-actions>
                      <v-spacer></v-spacer>
                      <v-btn
                        rounded
                        color="error"
                        large
                        class="mx-4 text-capitalize"
                        @click="close"
                      >
                        Cancel
                      </v-btn>
                      <v-btn
                        rounded
                        color="primary"
                        large
                        class="text-capitalize"
                        @click="createUser()"
                      >
                        Save
                      </v-btn>
                      <v-spacer></v-spacer>
                    </v-card-actions>
                  </v-container>
                </v-form>
              </v-card-text>
            </v-card>
          </v-dialog>
        </v-row>
        <v-row
        >
          <v-col
            v-for="(business, index) in allBusinesse"
            :key="index"
            align="center"
            class=""
          >
            <v-card
              height="100%"
              width="200px"
              class="rounded-xl mx-auto"
            >
              <v-card-text class="title secondary--text justify-center  mb-0 pb-0">
                {{ business?.title }}
              </v-card-text>
              <v-card-title  class="secondary--text justify-center">
                {{ business?.count }}
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'dashboard',
  data() {
    return {
      businesses: [],
      allBusinesse : [
    {
      title: 'Total business',
      count: 0,
    },
    {
      title: 'Cash',
      count:0,
    },
    {
      title: 'Business for approvals',
      count:0,
    },
    {
      title: 'New businesses',
      count:0,
    },
    {
      title: 'New Owner sign up',
      count:0,
    },
    {
      title: 'Business who paused',
      count:0,
    },
  ],

  showBusinesses : true,

  dialog: false,
  name: '',
  userId: '',
  phoneNumber: '',
  password: '',
  email: '',
  }
  },

  methods: {
    async createUser() {
      const form = this.$refs.form;
      if (form.validate()) {
        try {
          await this.$axios.post('/v1/users?action=signup&clientRole=admin', {
            name: this.name,
            email: this.email,
            phone: this.phoneNumber,
            role: 'HIPAL_ADMIN',
          });
          this.dialog = false
        } catch (error) {
          console.log(error);
        }
      }
    },

    async close() {
      // const form = this.$refs.form as HTMLFormElement;
      // this.$refs.form.reset()
      this.dialog = false;
    },

    async getBusinesses() {
      try {
        const { data } = await this.$axios.get(`/v1/businesses?clientRole=admin`, {
          withCredentials: true,
        });
        this.businesses = data;
        this.allBusinesse[0].count = this.businesses.length;
        this.allBusinesse[2].count = this.businesses.filter((item)=>(item.status === false)).length;
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
