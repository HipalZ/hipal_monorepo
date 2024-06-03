<template>
   <v-container fluid class="pa-0 ma-0">
    <v-row
      class="text-h5 secondary--text font-weight-medium my-4 ml-6"
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        lg="10"
      >
        <v-card
          class="active-card secondary--text px-8 py-1"
        >
          <v-container class="my-2 px-0" fluid>
            <v-card-title class="subtitle-1 my-0 py-0">
              Business Name
            </v-card-title>
            <v-card-title class="subtitle-1 my-1 py-0">
              Activate the business ?
            </v-card-title>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                rounded
                color="primary"
                large
                class="text-capitalize px-4"
                @click="update"
              >
                {{status?'Deactivate':'Activate'}}
              </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <v-row
      class="ml-6"
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        lg="10"
      >
        <v-card
          class="active-card secondary--text px-8 py-1"
        >
          <v-form
          >
            <v-card-title>
              <span class="text-h5">Account Details</span>
              <v-spacer></v-spacer>
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
                      Business Name
                      </v-col>
                      <v-col
                        cols="6"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="businessName"
                          placeholder="Business Name"
                          class="py-0 my-1"
                          color="orange"
                          :rules="[
                            v => !!v || 'Business Name is required',
                          ]"
                          validate-on-blur
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row
                    >
                      <v-col
                        cols="3"
                      >
                       Registered Business Name
                      </v-col>
                      <v-col
                        cols="6"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="registeredName"
                          placeholder="Registered Business Name"
                          class="py-0 my-1"
                          color="orange"
                          :rules="[
                            v => !!v || 'Registered Business Name is required'
                          ]"
                          validate-on-blur
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row
                    >
                      <v-col
                        cols="3"
                      >
                       Type of business 
                      </v-col>
                      <v-col
                        cols="5"
                        class="py-0 my-0"
                      >
                      <v-combobox
                        v-model="businessType"
                        outlined
                        :items="items"
                        :rules="[(v) => !!v || 'This field is required']"
                        validate-on-blur
                      >
                        <template v-slot:item="data">
                          <span class="prog-title">{{data.item}}</span>
                        </template>
                        <template v-slot:selection="data">
                          <span class="prog-title">{{data.item}}</span>
                        </template>
                      </v-combobox>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-form>
        </v-card>
      </v-col> 
    </v-row>

    <v-row
      class="ml-6"
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        lg="10"
      >
        <v-card
          class="active-card secondary--text px-8 py-1"
        >
          <v-form
          >
            <v-card-title>
              <span class="text-h5">Business Details</span>
              <v-spacer></v-spacer>
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
                        Business Name
                      </v-col>
                      <v-col
                        cols="6"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="businessName"
                          placeholder="Business Name"
                          class="py-0 my-1"
                          color="orange"
                          :rules="[
                            v => !!v || 'Business Name is required',
                          ]"
                          validate-on-blur
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row
                    >
                      <v-col
                        cols="3"
                      >
                       Registered Business Name
                      </v-col>
                      <v-col
                        cols="6"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="registeredName"
                          placeholder="Registered Business Name"
                          class="py-0 my-1"
                          color="orange"
                          :rules="[
                            v => !!v || 'Registered Business Name is required',
                          ]"
                          validate-on-blur
                          readonly
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row
                    >
                      <v-col
                        cols="3"
                      >
                       Type of business 
                      </v-col>
                      <v-col
                        cols="5"
                        class="py-0 my-0"
                      >
                      <v-combobox
                        v-model="businessType"
                        outlined
                        :items="items"
                        :rules="[(v) => !!v || 'This field is required']"
                        validate-on-blur
                        readonly
                      >
                        <template v-slot:item="data">
                          <span class="prog-title">{{data.item}}</span>
                        </template>
                        <template v-slot:selection="data">
                          <span class="prog-title">{{data.item}}</span>
                        </template>
                      </v-combobox>
                      </v-col>
                    </v-row>
                    <v-row
                    >
                      <v-col
                        cols="3"
                        class="mt-1"
                      >
                       Do you Have GST?
                      </v-col>
                      <v-col
                        cols="5"
                        class="py-0 my-0"
                      >
                        <v-radio-group
                          v-model="gstRegistered"
                          row
                          class="mt-3 pt-0"
                          :rules="[
                            v => !!v || 'required',
                          ]"
                          validate-on-blur
                          readonly
                        >
                          <v-radio
                            label="Yes"
                            value="Yes"
                          ></v-radio>
                          <v-radio
                            label="No"
                            value="No"
                          ></v-radio>
                        </v-radio-group>
                      </v-col>
                    </v-row>
                    <v-row
                    >
                      <v-col
                        cols="3"
                        class="mt-1"
                      >
                       Do you Multiple outlets?
                      </v-col>
                      <v-col
                        cols="5"
                        class="py-0 my-0"
                      >
                        <v-radio-group
                          v-model="multipleOutlets"
                          row
                          class="mt-3 pt-0"
                          :rules="[
                            v => !!v || 'required',
                          ]"
                          validate-on-blur
                        >
                          <v-radio
                            label="Yes"
                            value="Yes"
                            readonly
                          ></v-radio>
                          <v-radio
                            label="No"
                            value="No"
                            readonly
                          ></v-radio>
                        </v-radio-group>
                      </v-col>
                    </v-row>
                    <v-row
                    >
                      <v-col
                        cols="3"
                      >
                       Customized Link 
                      </v-col>
                      <v-col
                        cols="4"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          class="py-0 my-1"
                          color="orange"
                          outlined
                          disabled
                        >
                          <template #label>
                            <span class="accent--text">
                              https://hipal.life/{{ customLink }}
                            </span>
                          </template>
                        </v-text-field>
                      </v-col>
                      <v-col
                        cols="4"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="customLink"
                          placeholder="Business name"
                          class="py-0 my-4 text-lowercase"
                          color="orange"
                          hint="No Special characters"
                          :error-messages="customLinkErrors"
                          readonly
                          :rules="[
                            v => !!v || 'Business name is required',
                            v => /^[A-Za-z0-9]+$/.test(v) || 'Business name is invalid',
                            v => !customLinkErrors.length || 'Business name is not available',
                          ]"
                          persistent-hint
                          @keyup="lowercase"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row
                    >
                      <v-col
                        cols="3"
                      >
                       Logo
                      </v-col>
                      <v-col
                        cols="5"
                        class="py-0 my-0"
                      >
                        <input
                          ref="Image"
                          type="file"
                          v-show="false"
                          accept="image/png, image/jpeg"
                          @change="onImageFilesChange"
                        >
                        <v-card
                          class="pa-2"
                          width="180px"
                        >
                          <v-img
                            :src="logo"
                            height="150px"
                            width="180px"
                            contain
                          >
                            <!-- <v-app-bar color="rgba(0,0,0,0)" flat>
                              <v-spacer></v-spacer>
                              <v-btn
                                icon
                                color="white"
                                x-large
                                @click="removeImage"
                              >
                                <v-icon>close</v-icon>
                              </v-btn>
                            </v-app-bar> -->
                          </v-img>
                        </v-card>
                        <span class="error--text">
                          {{ logoError }}
                        </span>
                      </v-col>
                    </v-row>
                    <v-row
                      class="mt-8"
                    >
                      <v-col
                        cols="3"
                      >
                       Address
                      </v-col>
                      <v-col
                        cols="6"
                        class="py-0 my-0"
                      >
                        <v-textarea
                          v-model="address"
                          placeholder="Address"
                          class="py-0 my-1"
                          color="orange"
                          auto-grow
                          rows="1"
                          row-height="15"
                          readonly
                          :rules="[
                            v => !!v || 'Address is required',
                            v => v.length > 50 || 'Address must be greater than 50 characters'
                          ]"
                          validate-on-blur
                        ></v-textarea>
                      </v-col>
                    </v-row>
                    <v-row
                    >
                      <v-col
                        cols="3"
                      >
                      Fssai Licesense Number
                      </v-col>
                      <v-col
                        cols="6"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="fssaiLicenseNumber"
                          label="Fssai Number"
                          readonly
                          class="py-0 my-1"
                          color="orange"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-form>
        </v-card>
      </v-col> 
    </v-row>

    <v-row
      class="text-h5 secondary--text font-weight-medium my-4 ml-6"
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        lg="10"
      >
        <v-card
          class="active-card secondary--text px-8 py-1"
        >
          <v-container class="my-2 px-0" fluid>
            <v-card-title class="subtitle-1 my-0 py-0">
              Current Plan
            </v-card-title>
            <v-card-title class="subtitle-1 my-1 py-0">
              <!-- v-model="icon" -->
              <v-btn-toggle
                v-model="tier"
                borderless
                @change="changeTier"
              >
                <v-btn value="ON THE HOUSE">
                  <span class="hidden-sm-and-down">On the House</span>
                </v-btn>

                <v-btn value="PREMIUM">
                  <span class="hidden-sm-and-down">Premium</span>
                </v-btn>
              </v-btn-toggle>
              <v-spacer></v-spacer>
              <v-btn
                rounded
                color="error"
                large
                class="mx-4 text-capitalize"
              >
                Send a Payment alert
              </v-btn>
            </v-card-title>
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <v-row
      class="text-h5 secondary--text font-weight-medium my-4 ml-6"
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        lg="10"
      >
        <v-card
          class="active-card secondary--text px-8 py-1"
        >
          <v-container class="my-2 px-0" fluid>
            <v-card-title class="subtitle-1 my-0 py-0">
              Deactivate Business
            </v-card-title>
            <v-card-title class="subtitle-1 my-1 py-0">
              Deactivate the business ?
              <v-spacer></v-spacer>
              <v-btn
                rounded
                color="error"
                large
                class="mx-4 text-capitalize"
              >
                Deactivate the business
              </v-btn>
            </v-card-title>
          </v-container>
        </v-card>
      </v-col>
    </v-row>

    <v-row
      class="text-h5 secondary--text font-weight-medium my-4 ml-6"
      align="center"
      justify="center"
    >
      <v-col
        cols="12"
        lg="10"
      >
        <v-card
          class="active-card secondary--text px-8 py-1"
        >
          <v-container class="my-2 px-0" fluid>
            <v-card-title class="subtitle-1 my-0 py-0">
              Delete Business
            </v-card-title>
            <v-card-title class="subtitle-1 my-1 py-0">
              Delete the business ?
              <v-spacer></v-spacer>
              <v-btn
                rounded
                color="error"
                large
                class="mx-4 text-capitalize"
                @click="deleteBusiness"
              >
                Delete Business
              </v-btn>
            </v-card-title>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
 
 <script>
 export default {
   name: 'business',
   data() {
     return {
      items : [
      'QSR',
      'CLASSIC_DINE_IN',
      'CAFE',
      'BAKERY',
      'FOOD_RETAILS',
      'FOOD_PARLOURS',
    ],

    businessName: '',

    registeredName: '',

    businessType: '',

    status: false,

    gstRegistered: null,

    multipleOutlets: null,

    customLink: '',

    logo: '',

    address: '',

    logoFile : '',

    logoError : '',

    customLinkErrors : [],

    gstNumber: '',

    fssaiLicenseNumber: '',

    tier: '',
    }
   },

   methods: {

    async changeTier() {
      try {
        await this.$axios.put(`/v1/businesses/${this.$route.params.business}`,{
          tier: this.tier,
        },
          {
            withCredentials: true,
          }
        );
        this.close();
        this.$router.push("/businesses");
      } catch (error) {
        console.log(error)
      }
    },

    async deleteBusiness() {
      try {
        await this.$axios.delete(`/v1/businesses/${this.$route.params.business}`, {
          withCredentials: true,
        });
        this.$router.push('/businesses');
      } catch (error) {
        console.error(error);
      }
    },

    onImageFilesChange(event) {
      const files = event.target.files;
      for(const file of files) {
        if (file.type.startsWith('image')) {
          this.logo = URL.createObjectURL(file);
          this.logoFile = file;
          this.logoError = '';
        }
      }
    },

    removeImage() {
      this.logo='';
      this.logoFile=''
    },

    close() {
      this.businessName='';
      this.registeredName= '';
      this.businessName='';
      this.businessType='';
      this.gstRegistered=null;
      this.multipleOutlets=null;
      this.customLink='';
      this.logo='';
      this.address='';
      this.logoFile='';
    },

    lowercase() {
      this.customLink = this.customLink.toLowerCase();
    },

     async update(status) {
      try {
        await this.$axios.put(`/v1/businesses/${this.$route.params.business}`,{
          status: !this.status,
        },
          {
            withCredentials: true,
          }
        );
        this.close();
        this.$router.push("/businesses");
      } catch (error) {
        console.log(error)
      }
    },
   }, 
   async mounted() {
      try {
        const { data } = await this.$axios.get(`/v1/businesses/${this.$route.params.business}`, {
          withCredentials: true,
        });
        this.businessName = data.businessName;
        this.registeredName = data.registeredName;
        this.businessType = data.businessType;
        this.gstRegistered = data.gstRegistered===true?'Yes':'No';
        this.multipleOutlets = data.multipleOutlets===true?'Yes':'No';
        this.customLink = data.customLink;
        this.logo = data.logo;
        this.address = data.address;
        this.gstNumber = data.gstNumber;
        this.status= data.status;
        this.fssaiLicenseNumber = data.fssaiLicenseNumber;
        this.tier = data.tier || 'ON THE HOUSE';
      } catch (error) {
        console.error(error);
      };
    },
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