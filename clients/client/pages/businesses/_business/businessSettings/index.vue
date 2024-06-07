<template>
  <v-container fluid class="pa-0 ma-0">
    <v-row
      class="text-h5 secondary--text px-12 font-weight-medium my-4"
    >
       {{businessName}} Business Settings
      <v-spacer></v-spacer>
      <v-btn
        rounded
        color="error"
        height="49px"
        large
        class="mx-4 text-capitalize"
      >
        Cancel
      </v-btn>
      <v-btn
        rounded
        color="primary"
        height="49px"
        width="97px"
        large
        class="text-capitalize"
        @click="save()"
      >
        save
      </v-btn>
    </v-row>
    <v-row
      class="ml-6"
    >
      <v-col
        cols="12"
        lg="11"
      >
        <v-card
          class="active-card secondary--text px-8 py-1"
        >
          <v-form
            ref="form"
          >
            <v-card-title>
              <span class="text-h5">Add Business</span>
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
                              https://hipal.life/n/{{ customLink }}
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
                          :rules="[
                            v => !!v || 'Business name is required',
                            v => /^[A-Za-z0-9]+$/.test(v) || 'Business name is invalid',
                            v => !customLinkErrors.length || 'Business name is not available',
                          ]"
                          persistent-hint
                          @keyup="lowercase"
                          @change="checkLinkAvailability"
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
                          v-if="logo.length === 0"
                          class="pa-2"
                          width="180px"
                          @click="$refs.Image.click()"
                        >
                          <v-img
                            src="./addLogo.svg"
                            height="150px"
                            width="180px"
                            contain
                          >
                            <v-card-title class="mt-12">
                              <v-spacer></v-spacer>
                              <v-icon color="black">add</v-icon>
                              <v-spacer></v-spacer>
                            </v-card-title>
                          </v-img>
                        </v-card>
                        <v-card
                          v-else
                          class="pa-2"
                          width="180px"
                        >
                          <v-img
                            :src="logo"
                            height="150px"
                            width="180px"
                            contain
                          >
                            <v-app-bar color="rgba(0,0,0,0)" flat>
                              <v-spacer></v-spacer>
                              <v-btn
                                icon
                                color="white"
                                x-large
                                @click="removeImage"
                              >
                                <v-icon>close</v-icon>
                              </v-btn>
                            </v-app-bar>
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
                          :rules="[
                            v => !!v || 'Address is required',
                            v => v.length > 50 || 'Address must be greater than 50 characters'
                          ]"
                          validate-on-blur
                        ></v-textarea>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
              </v-container>
            </v-card-text>
          </v-form>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        lg="11"
      >
        <v-card
          class="active-card secondary--text px-8 py-1"
        >
          <v-container class="my-4">
            <v-row
            >
              <v-col
                cols="3"
              >
                GST Number
              </v-col>
              <v-col
                cols="6"
                class="py-0 my-0"
              >
                <v-text-field
                  v-model="gstNumber"
                  label="Gst Number"
                  class="py-0 my-1"
                  color="orange"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>

      <v-col
        cols="12"
        lg="11"
      >
        <v-card
          class="active-card secondary--text px-8 py-1"
        >
          <v-container class="my-4">
            <v-row
            >
              <v-col
                cols="3"
              >
              Add Fssai Licesense Number
              </v-col>
              <v-col
                cols="6"
                class="py-0 my-0"
              >
                <v-text-field
                  v-model="fssaiLicenseNumber"
                  label="Fssai Number"
                  class="py-0 my-1"
                  color="orange"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  const { v4: uuidv4 } = require('uuid');

  @Component({
    components: {
    },
  })
  export default class businessSetting extends Vue {

    dialog = false;

    items = [
      'QSR',
      'CLASSIC_DINE_IN',
      'CAFE',
      'BAKERY',
      'FOOD_RETAILS',
      'FOOD_PARLOURS',
    ]

    businessName= '';

    registeredName= '';

    businessType= '';

    gstRegistered= null as any;

    multipleOutlets= null as any;

    customLink= '';

    logo= '' as any;

    address= '';

    logoFile = '' as any;

    logoError = '';

    customLinkErrors = [] as string[];

    gstNumber= '';

    fssaiLicenseNumber= '';

    lowercase() {
      this.customLink = this.customLink.toLowerCase();
    }


    async checkLinkAvailability() {
      try {
        this.customLinkErrors = ['Checking availability ...'];
        const { data } = await this.$axios.get(`/v1/businesses/${this.customLink}`, {
          params: {
            customLink: true,
          }
        });
        if (data.exists) {
          this.customLinkErrors = ['Business name is not available'];
        } else {
          this.customLinkErrors = [];
        }
      } catch (error) {
        this.customLinkErrors = ['Business name check failed, please try later'];
      }
    }

    async storeImageFiles(image : File) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      const imageId = uuidv4()
      await new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result);
        };
      });
      if (reader.result) {

        const blobBin = atob(reader.result.toString().split(',')[1]);
        const array = [];
        for (let i = 0; i < blobBin.length; i++) {
          array.push(blobBin.charCodeAt(i));
        }
        const file = new Blob([new Uint8Array(array)], {
          type: image.type,
        });
        const formdata = new FormData();
        formdata.append('fileData', file);
        formdata.append("fileName", `${imageId}`);
        formdata.append("bucketName", "assets");
        try {
         await this.$axios.post('/v1/storage', formdata);
         return `https://storage.hipal.life/minio/assets/${imageId}`;
        } catch (error) {
          console.log(error);
        }
      }
    }

    onImageFilesChange(event: any) {
      const files = event.target.files;
      for(const file of files) {
        if (file.type.startsWith('image')) {
          this.logo = URL.createObjectURL(file);
          this.logoFile = file;
          this.logoError = '';
        }
      }
    }

    removeImage() {
      this.logo='';
      this.logoFile=''
    }

    close() {
      this.dialog=false;
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
    }

    async save() {
      const form = this.$refs.form as HTMLFormElement;
      const businessId = this.$route.params.business;
      if(form.validate()){
        let image = '' as any;
        if(this.logoFile.length !=0 ){
          image = await this.storeImageFiles(this.logoFile);
        } else if(this.logo.length === 0) {
          this.logoError = 'Please upload logo';
          return;
        } else {
          image = this.logo;
        }
        try {
          await this.$axios.put(`/v1/businesses/${businessId}`,{
            businessName: this.businessName.toLowerCase(),
            registeredName: this.registeredName,
            businessType: this.businessType,
            gstRegistered: this.gstRegistered==='Yes'?true:false,
            multipleOutlets: this.multipleOutlets==='Yes'?true:false,
            customLink: this.customLink,
            logo: image,
            address:this.address,
            gstNumber: this.gstNumber,
            fssaiLicenseNumber: this.fssaiLicenseNumber,
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
      }
    }

    async mounted() {
      const businessId = this.$route.params.business;
      try {
        const { data } = await this.$axios.get(`/v1/businesses/${businessId}`, {
          withCredentials: true,
        });
            this.businessName = data.businessName;
            this.registeredName = data.registeredName;
            this.businessType = data.businessType;
            this.gstRegistered = data.gstRegistered===true?'Yes':'No';
            this.multipleOutlets = data.multipleOutlets===true?'Yes':'No';;
            this.customLink = data.customLink;
            this.logo = data.logo;
            this.address = data.address;
            this.gstNumber = data.gstNumber;
            this.fssaiLicenseNumber = data.fssaiLicenseNumber;
      } catch (error) {
        console.error(error);
      }
    }

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