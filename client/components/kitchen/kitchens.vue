<template>
  <v-data-iterator
    :items="filteredKitchens"
    :search="KitchenName"
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
          lg="3"
          md="3"
          sm="6"
          align="left"
          justify="left"
          class="pa-8"
        >
          <v-card
            class="secondary--text zonescard"
            rounded-lg
          >
            <v-card-title
              class="subtitle-1 pr-0 mr-0 align--text"
              @click="openKitchen(item.id)"
            >
              {{item.kitchenName}}
              <v-spacer></v-spacer>
              <v-avatar
                tile
                class="rounded-lg mt-n8 mr-n4 status"
                size="50"
              >
                <v-icon color="#1C1B1F" class="material-symbols-outlined">
                  nightlight
                </v-icon>
              </v-avatar>
            </v-card-title>
            <v-list-item
              class="mt-4"
            >
              <v-list-item-content>
                <!-- <v-list-item-title class="caption">Gold Zone</v-list-item-title> -->
              </v-list-item-content>
              <v-list-item-action>
                <v-btn
                  outlined
                  rounded
                  color="primary"
                  large
                  class="text-capitalize text-h6"
                  @click.prevent="editKitchen(item)"
                >
                  edit
                </v-btn>
              </v-list-item-action>
            </v-list-item>
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
export default class kitchens extends Vue {
  @Prop({ default: '' }) readonly filteredKitchens!: string;
  @Prop({ default: '' }) readonly KitchenName!: string;
  loading = false;

  editKitchen(item: object) {
    this.loading = true;
    this.$emit('openEditForm', item);
    this.loading = false;
  }
  
  openKitchen(id:string) {
    this.$emit('openKitchen', id);
  }
}
</script>

<style lang='scss' scoped>
</style>