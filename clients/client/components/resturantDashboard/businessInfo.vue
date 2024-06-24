<template>
  <v-card
    max-height="720px"
    class="topperformaing secondary--text"
  >
    <v-card-title>
      <span class="text-h6 ">Business Details</span>
    </v-card-title>
    <v-card-title>
      <v-img
        :src="qrSrc"
        aspect-ratio="1"
        class=""
        contain
        height="166"
        width="166"
      >
      </v-img>
    </v-card-title>
    <v-card-text>
      <v-text-field
        :value="link"
        class=""
        color="orange"
        outlined
        readonly
      ></v-text-field>
      <v-btn
        rounded
        color="primary"
        block
        outlined
        class="text-capitalize"
        @click="downloadURI(qrSrc, 'businessQr')"
      >
        Download
      </v-btn>
    </v-card-text>
  </v-card>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
const QRCode = require('qrcode');

@Component({
  components: {
  },
})
export default class BusinessInfo extends Vue {
  qrSrc = '';

  customLink = '';

  business = {} as any;

  dialog = false;

  get link() {
    return 'https://hipal.life/n/' + this.customLink;
  }

  async mounted() {
    await this.getBusiness();
    this.customLink = this.business.customLink;
    this.qrSrc = await this.generateQRCode('https://hipal.life/n/' + this.customLink);
    this.$store.commit('updateBusinessLogo', this.business.logo);
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

  async getBusiness() {
    const businessId = this.$route.params.business;
    try {
      const { data } = await this.$axios.get(`/v1/businesses/${businessId}`, {
        withCredentials: true,
      });
      this.business = data;
    } catch (error) {
      console.error(error);
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
