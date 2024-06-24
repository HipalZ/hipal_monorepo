<template>
  <v-data-iterator
    :items="$store.getters['zone/zoneNames']"
    :search="TableName"
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:default="props">
      <v-row>
        <v-col
          v-for="(item, index) in props.items"
          :key="index"
          cols="12"
          xl="3"
          lg="4"
          md="3"
          sm="5"
          xs="5"
          align="left"
          justify="left"
          class="pa-6"
        >
          <v-card
            class="secondary--text zonescard"
            rounded-lg
          >
            <v-card-title class="subtitle-2 pb-0">
              Table  {{item.table.name}}
              <v-spacer></v-spacer>
              <v-btn
                icon
                color="accent"
                @click="editTable(item.table)"
              >
                <v-icon small>border_color</v-icon>
              </v-btn>
              <v-btn
                icon
                color="accent"
                @click="deleteTable(item.table.zoneId,item.table.id)"
              >
                <v-icon>close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-title class="subtitle-2 py-0">
              <v-icon
                class=""
                color="secondary"
              >boy</v-icon> 0/{{item.table.staff.length}}
            </v-card-title>
            <div class="d-flex flex-no-wrap justify-space-between">
              <div class="mt-4">
                <v-card-title class="subtitle-2 ">
                  Zone: &nbsp; {{item.zone.zoneName}}
                </v-card-title>
                <v-card-title class="subtitle-2 py-0">
                  Staff:&nbsp; {{item.table.staff.length}}
                </v-card-title>
              </div>
              <v-card
                class="ma-3 pa-1"
              >
                <v-avatar
                  size="125"
                  tile
                >
                  <v-img
                    :src="qrCodes[index]"
                    aspect-ratio="1"
                  >
                  </v-img>
                </v-avatar>
              </v-card>
            </div>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                rounded
                outlined
                class="mx-4 text-capitalize"
                @click="downloadURI(item.table.id, item.table.name,item.table.zoneId, $route.params.business )"
              >
                <span class="px-2">download</span>
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-data-iterator>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch} from 'vue-property-decorator';
const QRCode = require('qrcode');

@Component({
  components: {
  },
})
export default class Table extends Vue {
  @Prop({ default: '' }) readonly filteredTable!: string;
  @Prop({ default: '' }) readonly TableName!: string;
  loading = false;

  qrCodes = [] as string[];

  editTable(item : any) {
    this.loading = true;
    this.$emit('openEditForm', item);
    this.loading = false;
  }

  async deleteTable(zoneId:string,tableId:string) {
    try {
      await this.$axios.delete(`/v1/zones/${zoneId}/tables/${tableId}`,
        {
          withCredentials: true,
        }
      );
      this.$emit("update",'');
    } catch (error) {
      console.log(error)
    }
  }

  async generateQRCode(link: string) {
    try {
      const url = await QRCode.toDataURL(link);
      return url;
    } catch (error) {
      console.error(error);
      return '';
    }
  }

  async downloadURI(id: string, name: string, zoneId: string, businessId: string) {

  const longUrl =`https://pro.hipal.life/r/${businessId}/explore?tableId=${id}&name=${name}&zoneId=${zoneId}`
  const payload = {
    longUrl: longUrl,
  };

  try {
    const response = await this.$axios.post(`https://api.hipal.life/v1/users/usrShortner`, payload, {
      withCredentials: true,
    });

    const uri = await this.generateQRCode(response.data.shortUrl);
    const link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error(error);
  }
}

  fillQRCodes() {
    const qrCodes = [] as any;
    this.tables.forEach((table: any) => {
      qrCodes.push(this.generateQRCode(`${table.table.id}`));
    });
    Promise.all(qrCodes).then((res) => {
      this.qrCodes = res;
    });
  }

  mounted() {
    this.fillQRCodes();
  }

  get tables() {
    return this.$store.getters['zone/zoneNames'];
  }

  @Watch('tables')
  onTablesChanged() {
    this.fillQRCodes();
  }
}
</script>

<style lang='scss' scoped>
</style>
