<template>
  <v-data-iterator
    :items="filteredCategories"
    :search="categoryName"
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:default="props">
      <v-row class="pt-4">
        <v-col
          v-for="(item, index) in props.items"
          :key="index"
          cols="12"
          xl="3"
          lg="4"
          md="4"
          class="px-6 mb-6 pr-12"
        >
          <v-card
            class="categories px-4"
            height="200px"
          >
            <v-card-title class="caption mb-0 pb-0 prog-title">
              {{item.hierarchy}}
              <v-spacer></v-spacer>
              <v-badge
                overlap
                dot
                :color="item.visibility ? 'success' : 'error'"
              ></v-badge>
            </v-card-title>
              <v-row class="pa-0 ma-0">
                <v-col  cols="4" class="py-0 my-">
                  <v-card
                    rounded-lg
                    flat
                    class="mt-5"
                  >
                    <v-img
                      v-if="item.coverImage"
                      :src="item.coverImage"
                      height="60px"
                      width="65px"
                    ></v-img>
                    <v-img
                      v-else
                      src="/placeholder.png"
                      height="60px"
                      width="65px"
                      contain
                    >
                    </v-img>
                  </v-card>
                </v-col>
                <v-col 
                  class=" accent--text ml-n6"
                  cols="8"
                >
                  <v-card-text class=" accent--text pa-0 ma-0 mt-1 categoriescardtext">
                    {{
                      50 > item.name.length ? item.name : item.name.substr(0, 50) + '...'
                    }}
                  </v-card-text>
                </v-col>
                <v-col
                  cols="12"
                  class="d-flex flex-column justify-space-between px-0 mx-0"
                >
                  <v-card-actions class="caption pt-0 ">
                    <v-icon
                    color="#1C1B1F"
                    class="mr-2"
                    >rice_bowl</v-icon>
                    {{item.dishes.length}} items <v-spacer></v-spacer>
                    <v-btn
                      outlined
                      rounded
                      color="primary"
                      large
                      :disabled="showEdit"
                      class="text-capitalize text-h6"
                      @click="edit(item)"
                    >
                      edit
                    </v-btn>
                  </v-card-actions>
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
export default class category extends Vue {
  @Prop({ default: '' }) readonly filteredCategories!: string;
  @Prop({ default: '' }) readonly categoryName!: string;

  edit(category: any){
    this.$store.commit('updateCategoryName', category.name);
    this.$router.push(`categories/${category.id}`)
  }

  showEdit= true;
  
  mounted() {
    if (!this.$auth.user || !this.$auth.user.customRole || !this.$auth.user.id) {
      return;
    }
    const customRole = this.$auth.user.customRole as any;
    if(customRole.length===0) {
      this.showEdit = false;
    }
    if(this.$store.state.permissions.includes('resource/get/editCategories')) {
      this.showEdit = false;
    }
  }
}
</script>

<style>
/* stylelint-disable */
  .v-banner__wrapper {
    border-bottom: none !important;
  }

  .sidenav  {
    border: none !important;
  }
  /* stylelint-enable */
</style>