<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="900px"
  >
    <template v-slot:activator="{ on, attrs }">
      
      <v-btn
        outlined
        class="text-capitalize"
        color="secondary"
        v-bind="attrs"
        v-on="on"
      >
        <v-icon class="mr-1 ">
          info_outline
        </v-icon>
        about your business
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
          @click="dialog = false"                      
        >
        <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card-text>
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
                Business Name
                </v-col>
                <v-col
                  cols="12"
                  lg="6"
                  class="py-0 my-0"
                >
                  <v-text-field
                    :value="businessName"
                    class="py-0 my-1"
                    color="orange"
                    readonly
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row
              >
                <v-col
                  cols="12"
                  lg="3"
                >
                Registered Business Name
                </v-col>
                <v-col
                  cols="12"
                  lg="6"
                  class="py-0 my-0"
                >
                  <v-text-field
                    :value="registeredName"
                    class="py-0 my-1"
                    color="orange"
                    readonly
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row
              >
                <v-col
                  cols="12"
                  lg="3"
                  class="mt-2"
                >
                Your link 
                </v-col>
                <v-col
                  cols="12"
                  lg="4"
                  class="py-0 my-0"
                >
                  <v-text-field
                    :value="'https://hipal.life/n/'"
                    class="py-0 my-1"
                    color="orange"
                    outlined
                    readonly
                  ></v-text-field>
                </v-col>
                <v-col
                  cols="12"
                  lg="4"
                  class="py-0 my-0"
                >
                  <v-text-field
                    :value="customLink"
                    label="Business name"
                    class="py-0 my-4"
                    color="orange"
                    readonly
                  ></v-text-field>
                </v-col>
              </v-row>
              <v-row
              >
                <v-col
                  cols="12"
                  lg="3"
                >
                  QR
                </v-col>
                <v-col
                  cols="12"
                  lg="3"
                  class="py-0 my-0"
                >
                  <v-img
                    :src="qrSrc"
                    aspect-ratio="1"
                    class="mt-3"
                    height="166"
                    width="166"
                    position="left"
                  >
                  </v-img>
                </v-col>
                <v-col
                  cols="12"
                  lg="2"
                  class="py-0 my-0"
                  align="center"
                >
                  <v-btn
                    rounded
                    color="primary"
                    outlined
                    class="text-capitalize mt-16"
                    @click="downloadURI(qrSrc,'bussinessQr')"
                  >
                    Download
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
const QRCode = require('qrcode');

@Component({
  components: {
  },
})
export default class BusinessInfo extends Vue {
  @Prop({ default: ''}) readonly link!: string;

  @Prop({ default: ''}) readonly businessName!: string;

  @Prop({ default: ''}) readonly registeredName!: string;

  @Prop({ default: ''}) readonly customLink!: string;

  qrSrc = '';

  dialog = false;

  async mounted() {
    const qrSrc = await this.generateQRCode('https://hipal.life/n/' + this.customLink);
    this.qrSrc = qrSrc;
  }

  async generateQRCode(link: string) {
    try {
      const url = await QRCode.toDataURL(link);
      return url;
    } catch (error) {
      console.error(error);
    }
  }

  downloadURI(uri: string, name: string) {
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  @Watch('customLink')
  async onLinkChange() {
    try {
      const qrSrc = await this.generateQRCode(this.customLink);
      this.qrSrc = qrSrc;
    } catch (error) {
      console.error(error);
    }
  }

}
</script>

<style lang='scss' scoped>
</style>
