<template>
  <v-data-iterator
    :items="filteredDishes"
    :search="dishName"
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:default="props">
      <v-row class="pt-4">
        <v-col
          v-for="(item, index) in props.items"
          :key="index"
          cols="12"
          xl="4"
          lg="4"
          class="mb-6 align-left justify-space-around"
        >
          <v-card
            class="categories pa-4"
            width="419px"
          >
            <v-row class="pa-0 ma-0">
              <v-col  cols="4" class="pa-0 mt-1">
                <v-card 
                  rounded-lg
                  flat
                >
                  <v-img
                    v-if="item.images[0]"
                    :src="item.images[0]"
                    height="118px"
                    width="118px"
                  >
                  </v-img>
                  <v-img
                    v-else
                    src="/placeholder.png"
                    height="118px"
                    width="118px"
                  >
                  </v-img>
                </v-card>
              </v-col>
              <v-col
                class="my-0 pr-0 ml-n2 d-flex flex-column justify-space-between"
                cols="8"
              >
                <v-card-text
                  class="categoriescardtext pl-1 py-0 pr-0 accent--text"
                >
                  {{
                    50 > item.name.length ? item.name : item.name.substr(0, 50) + '...'
                  }}
                </v-card-text>
                <v-card-title
                  class="pb-0  ma-0 "
                >
                  <!-- <v-icon color="success">stop</v-icon>  -->
                  <v-row align="center">
                    <v-avatar
                      size="20"
                      color="transparent"
                      tile
                    >
                      <v-img
                        v-if="item.dishType === 'VEG'"
                        src="/vegIcon.svg"
                        contain
                      ></v-img>
                      <v-img
                        v-else-if="item.dishType === 'NON_VEG'"
                        src="/non_vegIcon.svg"
                        contain
                      ></v-img>
                      <!-- <v-img
                        v-else
                        src="/non_vegIcon.svg"
                        contain
                      ></v-img> -->
                    </v-avatar>
                    <span class="caption font-weight-bold ">
                      &nbsp;
                      ₹ {{item.price}}
                    </span>
                    <v-spacer></v-spacer>
                    <v-btn
                      outlined
                      rounded
                      class="text-capitalize text-h6"
                      color="primary"
                      large
                      :disabled="showEdit"
                      :to="`dishes/${item.id}`"
                    >
                      Edit
                    </v-btn>
                  </v-row>
                </v-card-title>
              </v-col>
            </v-row>
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
export default class Dish extends Vue {
  @Prop({ default: '' }) readonly filteredDishes!: string;
  @Prop({ default: '' }) readonly dishName!: string;
  loading = false;

  confirm() {
    this.loading = true;
    this.$emit('confirm', {});
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
    if(this.$store.state.permissions.includes('resource/get/editDish')) {
      this.showEdit = false;
    }
  }
}
</script>

<style lang='scss' scoped>
</style>