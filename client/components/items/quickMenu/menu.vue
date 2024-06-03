<template>
  <v-data-iterator
    :items="menu"
    :search="dishName"
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:default="props">
      <v-row
        v-for="(item, index) in props.items"
        :key="index"
        class="mx-8"
      >
        <v-col
          cols="12"
          lg="10"
        >
          <v-item v-slot="{active, toggle}">
            <v-card
              class=" secondary--text pl-4 mt-4"
              :class="active ? 'active-card':'businesscard'"
              @mousedown="toggle"
              :id="'sec_'+'0'"
            >
              <v-card-title
                v-if="item.hierarchy === 'PARENT'"
              >
                {{item.categoryName }}
              </v-card-title>
              <v-card-title
                v-else
              >
                {{item.parentCategoryName }}
              </v-card-title>
              <v-card-title>
                <v-row
                  v-if="item.hierarchy === 'PARENT'"
                >
                  <v-col
                    cols="12"
                    lg="2"
                    class="subtitle-1 mt-1"
                  >
                    Visibility
                  </v-col>
                  <v-col
                    cols="12"
                    lg="2"
                    class="py-0 my-0"
                  >
                    <v-switch
                      v-model="item.visibility"
                      color="primary"
                      inset
                      :disabled="showEditVisibility"
                      @change="updateVisibility('PARENT_CATEGORY',item.visibility,item.id)"
                    ></v-switch>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-title class="py-0 my-0">
                <v-row
                  v-if="item.hierarchy === 'PARENT'"
                >
                  <v-col
                    cols="12"
                    lg="2"
                    class="subtitle-1 mt-1"
                  >
                    Availability
                  </v-col>
                  <v-col
                    cols="12"
                    lg="2"
                    class="py-0 my-0"
                  >
                    <v-switch
                      v-model="item.availability"
                      color="primary"
                      inset
                      :disabled="showEditAvailability"
                      @change="updateAvailability('PARENT_CATEGORY',item.availability,item.id)"
                    ></v-switch>
                  </v-col>
                </v-row>
              </v-card-title>
              <v-card-title
                v-if="item.hierarchy === 'CHILD'"
              >
                <v-expansion-panels>
                  <v-expansion-panel class="editdishesborder py-4">
                    <v-expansion-panel-header>{{item.categoryName }}</v-expansion-panel-header>
                    <v-expansion-panel-content>
                      <v-row
                      >
                        <v-col
                          cols="12"
                          lg="2"
                          class="subtitle-1 mt-1"
                        >
                          Visibility
                        </v-col>
                        <v-col
                          cols="12"
                          lg="6"
                          class="py-0 my-0"
                        >
                          <v-switch
                            v-model="item.childCategoryVisibility"
                            color="primary"
                            inset
                            :disabled="showEditVisibility"
                            @change="updateVisibility('PARENT_CATEGORY',item.childCategoryVisibility,item.id)"
                          ></v-switch>
                        </v-col>
                      </v-row>
                      <v-card-title class="px-0 mx-0">
                        <v-row
                        >
                          <v-col
                            cols="12"
                            lg="2"
                            class="subtitle-1 mt-1"
                          >
                            Availability
                          </v-col>
                          <v-col
                            cols="12"
                            lg="2"
                            class="py-0 my-0"
                          >
                            <v-switch
                              v-model="item.childCategoryAvailability"
                              color="primary"
                              inset
                              :disabled="showEditAvailability"
                              @change="updateAvailability('PARENT_CATEGORY',item.childCategoryAvailability,item.id)"
                            ></v-switch>
                          </v-col>
                        </v-row>
                      </v-card-title>
                      <v-card-title>Dishes</v-card-title>
                      <v-card
                        v-for="(dish,index) in item.dishes"
                        :key="index"
                        class="mb-6 pa-4 categories"
                      >
                        <v-row
                        >
                          <v-col  cols="2" class="">
                            <v-card
                              rounded-lg
                              class="pa-2"
                            >
                            <v-img
                              v-if="dish.images.length > 0"
                              :src="dish.images[0]"
                              height="118px"
                              width="118px"
                            >
                            </v-img>
                            <v-img
                              v-else
                              src="/placeholder.png"
                              contain
                            >
                            </v-img>
                            </v-card>
                          </v-col>
                          <v-col 
                            class=" accent--text"
                            cols="6"
                          >
                            <v-card-text class=" accent--text px-0 mx-0 mt-0 pt-0 categoriescardtext">
                              {{dish.name }}
                            </v-card-text>
                            <v-card-subtitle class="px-0 mx-0 pb-0 mb-0 mt-2">
                              <v-col cols="4" class="pa-0">
                                <v-text-field
                                  v-model="dish.price"
                                  readonly
                                  class="py-0 my-1"
                                  color="primary"
                                  prepend-inner-icon="currency_rupee"
                              ></v-text-field>
                              </v-col>
                            </v-card-subtitle>
                          </v-col>
                          <v-col
                            cols="2"
                          >
                          <v-card-subtitle class="subtitle-1 pt-0">
                            Visibility
                          </v-card-subtitle>
                          <v-card-subtitle class="my-0 py-0">
                            <v-switch
                              v-model="dish.visibility"
                              color="primary"
                              inset
                              :disabled="showEditVisibility"
                              @change="updateVisibility('DISH',dish.visibility,dish.id)"
                            ></v-switch>
                          </v-card-subtitle>
                          </v-col>
                          <v-col
                            cols="2"
                          >
                            <v-card-subtitle class="subtitle-1 pt-0">
                              Availability
                            </v-card-subtitle>
                            <v-card-subtitle class="my-0 py-0">
                              <v-switch
                                v-model="dish.availability"
                                color="primary"
                                inset
                                :disabled="showEditAvailability"
                                @change="updateAvailability('DISH',dish.availability,dish.id)"
                              ></v-switch>
                            </v-card-subtitle>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-expansion-panel-content>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-card-title>
              <v-card-title v-else class="pt-0">
                <v-row>
                  <v-col>
                    <v-card-title class="px-0 pt-0">Dishes</v-card-title>
                    <v-card
                      v-for="(dish,index) in item.dishes"
                      :key="index"
                      class="mb-6 pa-4 categories"
                    >
                      <v-row
                      >
                        <v-col  cols="2" class="">
                          <v-card
                            rounded-lg
                            class="pa-2"
                          >
                          <v-img
                            v-if="dish.images.length > 0"
                            :src="dish.images[0]"
                            height="118px"
                            width="118px"
                          >
                          </v-img>
                          <v-img
                            v-else
                            src="/placeholder.png"
                            contain
                          >
                          </v-img>
                          </v-card>
                        </v-col>
                        <v-col 
                          class=" accent--text"
                          cols="6"
                        >
                          <v-card-text class=" accent--text px-0 mx-0 mt-0 pt-0 categoriescardtext">
                            {{dish.name }}
                          </v-card-text>
                          <v-card-subtitle class="px-0 mx-0 pb-0 mb-0 mt-2">
                            <v-col cols="4" class="pa-0">
                              <v-text-field
                                v-model="dish.price"
                                readonly
                                prepend-inner-icon="currency_rupee"
                                class="py-0 my-1"
                                color="primary"
                            ></v-text-field>
                            </v-col>
                          </v-card-subtitle>
                        </v-col>
                        <v-col
                          cols="2"
                        >
                          <v-card-subtitle class="subtitle-1 pt-0">
                            Visibility
                          </v-card-subtitle>
                          <v-card-subtitle class="my-0 py-0">
                            <v-switch
                              v-model="dish.visibility"
                              color="primary"
                              inset
                              :disabled="showEditVisibility"
                              @change="updateVisibility('DISH',dish.visibility,dish.id)"
                            ></v-switch>
                          </v-card-subtitle>
                        </v-col>
                        <v-col
                          cols="2"
                        >
                          <v-card-subtitle class="subtitle-1 pt-0">
                            Availability
                          </v-card-subtitle>
                          <v-card-subtitle class="my-0 py-0">
                            <v-switch
                              v-model="dish.availability"
                              color="primary"
                              inset
                              :disabled="showEditAvailability"
                              @change="updateAvailability('DISH',dish.availability,dish.id)"
                            ></v-switch>
                          </v-card-subtitle>
                        </v-col>
                      </v-row>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-title>
            </v-card>
          </v-item>
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
  @Prop({ default: '' }) readonly menu!: string;
  @Prop({ default: '' }) readonly dishName!: string;
  loading = false;

  updateVisibility(type:string,visibility:boolean,id:number) {
    this.loading = true;
    this.$emit('updateVisibility', {type,visibility,id});
    this.loading = false;
  }

  updateAvailability(type:string,availability:boolean,id:number) {
    this.loading = true;
    this.$emit('updateAvailability', {type,availability,id});
    this.loading = false;
  }

  showEditAvailability = true;

  showEditVisibility = true;
  
  mounted() {
    if (!this.$auth.user || !this.$auth.user.customRole) {
      return;
    }
    const customRole = this.$auth.user.customRole as any;
    if(customRole.length===0) {
      this.showEditAvailability = false;
      this.showEditVisibility = false;
    }
    else {
      if(this.$store.state.permissions.includes('property/get/Availability')) {
        this.showEditAvailability = false;
      }
      if(this.$store.state.permissions.includes('property/get/visibility')) {
        this.showEditVisibility = false;
      }
    };
  }
}
</script>

<style lang='scss' scoped>
</style>