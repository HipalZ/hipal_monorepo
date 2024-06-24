<template>
  <v-data-iterator
    :items="filteredZones"
    :search="zoneName"
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:default="props">
      <v-row class="mt-4">
        <v-col
          v-for="(item, index) in props.items"
          :key="index"
          cols="12"
          xl="2"
          lg="2"
          md="3"
          sm="6"
          xs="5"
          align="left"
          justify="left"
          :class="$vuetify.breakpoint.mdAndUp?'':'ma-2'"
        >
          <v-card
            class="secondary--text zonescard"
            height="145px"
            width="240px"
            rounded-lg
            @click="open(item.id)"

          >
            <v-card-title class="subtitle-1">
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
export default class DineInZones extends Vue {
  @Prop({ default: '' }) readonly filteredZones!: string;
  @Prop({ default: '' }) readonly zoneName!: string;
  @Prop({ default: '' }) readonly zoneType!: string;
  loading = false;

  open(id:string) {
    if(this.zoneType === 'DINE IN') {
      this.$router.push(`dineIn/${id}`)
    }
    else {
      this.$emit('openTakeAway',id)
    }
  }
}
</script>

<style lang='scss' scoped>
</style>