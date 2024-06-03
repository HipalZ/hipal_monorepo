<template>
  <v-data-iterator
    :items="filteredZones"
    :search="zoneName"
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:default="props">
      <v-row>
        <v-col
          v-for="(item, index) in props.items"
          :key="index"
          cols="12"
          xl="2"
          lg="2"
          md="3"
          sm="5"
          xs="5"
          align="left"
          justify="left"
          class="ma-4"
        >
          <v-card
            class="secondary--text zonescard"
            height="145px"
            width="240px"
            rounded-lg
          >
            <v-card-title class="subtitle-1 text-capitalize">
              {{item.zoneName}}
            </v-card-title>
            <v-card-title class="subtitle-1 py-0">
              <v-icon
                class="mr-2"
                color="secondary"
              >boy</v-icon> {{ item.staff.length }}
            </v-card-title>
            <v-card-title class="subtitle-1">
              <v-icon
                class="mr-2"
                color="secondary"
              >table_bar</v-icon> {{ item.tables.length }}
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                rounded
                outlined
                class="text-capitalize text-h6"
                :disabled="showEdit"
                @click="editZone(item)"
              >edit
              </v-btn>
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-data-iterator>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class Zone extends Vue {
  @Prop({ default: '' }) readonly filteredZones!: string;
  @Prop({ default: '' }) readonly zoneName!: string;
  loading = false;

  editZone(item:any) {
    this.loading = true;
    this.$emit('openEditForm', item);
    this.loading = false;
  }

  showEdit= true;
  
  mounted() {
    if (!this.$auth.user || !this.$auth.user.customRole) {
      return;
    }
    const customRole = this.$auth.user.customRole as any;
    if(customRole.length===0) {
      this.showEdit = false;
    }
    if(this.$store.state.permissions.includes('resource/get/editZones')) {
      this.showEdit = false;
    }
  }
}
</script>

<style lang='scss' scoped>
</style>