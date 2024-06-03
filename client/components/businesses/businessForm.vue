<template>
  <v-container fluid class="pa-0 ma-0">
    <v-row
      v-if="$vuetify.breakpoint.mdAndUp"
      :justify="$vuetify.breakpoint.mdAndUp ? 'end' : 'center'" 
      class="secondary--text my-2 mr-2"
    >
      <v-dialog
        v-model="dialog"
        persistent
        max-width="1300px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            rounded
            large
            color="primary"
            width="229px"
            height="49px"
            class="white--text ma-4 mb-0 text-capitalize"
            v-bind="attrs"
            v-on="on"
          >
            add business
          </v-btn>
        </template>
        <v-card
          class="cardborder secondary--text px-8 py-1"
        >
          <v-form
            ref="form"
          >
            <v-card-title>
              <span class="text-h5">Add Business</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="close">
                <v-icon>close</v-icon>
              </v-btn>
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
            <v-card-actions class="pb-6 pt-0 mt-0">
              <v-spacer></v-spacer>
              <v-btn
                color="#BF0603"
                rounded
                class="white--text text-capitalize"
                height="49px"
                width="136px"
                large
                @click="dialog = false"
              >
                <span class="px-4">Cancel</span>
              </v-btn>
              &nbsp;
              <v-btn
                color="primary"
                rounded
                height="49px"
                width="111px"
                large
                class="white--text text-capitalize"
                @click="save()"
              >
                <span class="px-4">Save</span>
              </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>
    </v-row>
    <v-row
      v-else
      align="center"
      justify="center"
      class="py-2"
    >
      <v-btn
        v-if="!dialog"
        rounded
        large
        width="229px"
        height="49px"
        color="primary"
        class="white--text ma-4 mb-0 text-capitalize"
        @click="openMobileScreen"
      >
        add business
      </v-btn>
      <div
        v-else
      >
        <v-container fluid class="pa-0 ma-0">
          <v-row
            class="secondary--text pa-0"
          >
            <v-col
              cols="12"
              class="pa-0"
            >
              <v-form
                ref="form"
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
                        @click="closeMobileScreen"
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
                            v-model="businessName"
                            label="Business Name"
                            color="orange"
                            :rules="[
                              v => !!v || 'Business Name is required',
                            ]"
                            validate-on-blur
                          ></v-text-field>
                        </v-col>
                        <v-col
                          cols="12"
                          class="py-0 my-0 px-8"
                        >
                          <v-text-field
                            v-model="registeredName"
                            label="Registered Business Name"
                            color="orange"
                            :rules="[
                              v => !!v || 'Registered Business Name is required',
                            ]"
                            validate-on-blur
                          ></v-text-field>
                        </v-col>
                        <v-col
                          cols="12"
                          class="py-0 my-0 px-8"
                        >
                          <v-combobox
                            v-model="businessType"
                            label="Type of Business"
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
                            v-model="gstRegistered"
                            row
                            :rules="[
                              v => !!v || 'required',
                            ]"
                            validate-on-blur
                            class="mt-3 pt-0"
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
                            v-model="multipleOutlets"
                            row
                            :rules="[
                              v => !!v || 'required',
                            ]"
                            validate-on-blur
                            class="mt-3 pt-0"
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
                            v-model="customLink"
                            label="Business name"
                            class=""
                            color="orange"
                            hint="No Special characters"
                            persistent-hint
                            :error-messages="customLinkErrors"
                            validate-on-blur
                            :rules="[
                              v => !!v || 'Business name is required',
                              v => /^[A-Za-z0-9]+$/.test(v) || 'Business name is invalid',
                            ]"
                            @keyup="lowercase"
                            @change="checkLinkAvailability"
                          ></v-text-field>
                        </v-col>
                        <v-col
                          cols="12"
                          class="px-8"
                        >
                        Logo
                        </v-col>
                        <input
                          ref="Image"
                          type="file"
                          v-show="false"
                          accept="image/png, image/jpeg"
                          @change="onImageFilesChange"
                        >
                        <v-col
                          cols="12"
                          class="py-0 my-0 px-8"
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
                        <v-col
                          cols="12"
                          class="py-0 my-0 px-8"
                        >
                          <v-textarea
                            v-model="address"
                            label="Address"
                            class=""
                            color="primary"
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
                    </v-card-text>
                    <v-card-actions class=" py-6">
                      <v-spacer></v-spacer>
                      <v-btn
                        color="#BF0603"
                        rounded
                        class="white--text text-capitalize"
                        height="49px"
                        width="136px"
                        @click="closeMobileScreen"
                      >
                        <span class="px-4">Cancel</span>
                      </v-btn>
                      <v-btn
                        color="primary"
                        rounded
                        height="49px"
                        width="111px"
                        class="white--text text-capitalize"
                        @click="save()"
                      >
                        <span class="px-4">Save</span>
                      </v-btn>
                      <v-spacer></v-spacer>
                    </v-card-actions>
                </v-card>
              </v-form>
            </v-col>
          </v-row>
        </v-container>
      </div>
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
  export default class BusinessForm extends Vue {

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

    gstRegistered= null;

    multipleOutlets= null;

    customLink= '';

    logo= '' as any;

    address= '';

    logoFile = '' as any;

    logoError = '';

    customLinkErrors = [] as string[];

    lowercase() {
      this.customLink = this.customLink.toLowerCase();
    }

    openMobileScreen(){
      this.dialog = true;
      this.$emit('openMobileScreen','openMobileScreen')
    }

    closeMobileScreen(){
      this.close();
      this.$emit('closeMobileScreen','closeMobileScreen')
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
      if(form.validate()){
        let image = '' as any;
        if(this.logoFile.length !=0 ){
          image = await this.storeImageFiles(this.logoFile);
        } else {
          this.logoError = 'Please upload logo';
          return;
        }
        try {
          await this.$axios.post('/v1/businesses',{
            businessName: this.businessName.toLowerCase(),
            registeredName: this.registeredName,
            businessType: this.businessType,
            gstRegistered: this.gstRegistered==='Yes'?true:false,
            multipleOutlets: this.multipleOutlets==='Yes'?true:false,
            customLink: this.customLink,
            logo: image,
            address:this.address
          },
            {
              withCredentials: true,
            }
          );
          this.close();
          this.$emit('refresh','refresh')
          this.$emit('closeMobileScreen','closeMobileScreen')
        } catch (error) {
          console.log(error)
        }
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