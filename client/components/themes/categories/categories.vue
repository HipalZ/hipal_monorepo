<template>
  <v-container fluid>
    
    <v-row
      class="mt-2"
    >
      <v-col
        cols="12"
        xl="4"
        lg="4"
        md="4"
        class="pa-0 ma-0"
        align="center"
      >
        <v-banner sticky class="pa-0 ma-0" >

          <v-card
            color="#f1f1f1"
            class="py-12 "
            sticky
            height="790px"
          >
            <v-card  class="mobileviewborder" width="299px" height="601px" >
                <v-img
                  src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
                  class="rounded-lg"
                  height="175px"
                  width="100%"
                >
                </v-img>
                <v-card
                  class="mt-n16 rounded-lg rounded-b-0 mb-4"
                  flat
                >
                  <v-card-title class="">
                    <v-icon color="primary" class="">chevron_left</v-icon>
                    <v-row>

                      <v-col cols="10">
                        <v-card
                          outlined
                          class="align-start"
                          style="border: 1px solid #E96108; border-radius: 16px;"
                        >
                          <v-card-title class="py-1 primary--text">
                            <v-icon color="primary">search</v-icon>
                          </v-card-title>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-card-title>
                  <v-row
                      class="px-6 mx-0 pt-0"
                    >
                      <v-col
                        v-for="category in filteredCategories.slice(0, 5)"
                        :key="category.id"
                        cols="6"
                        class="pb-0"
                        align="start"
                      >
                        <v-card
                          flat
                          class="rounded-lg"
                        >
                          <v-img 
                            :src="category.coverImage"
                            height="90px"
                            width="144px"
                            class="rounded-lg"
                          >
                          </v-img>
                          <v-card-title class="pa-0 ma-0 secondary--text align-center subtitle-1 justify-center">
                            {{
                              6 > category.name .length ? category.name : category.name .substr(0, 6) + '...'
                            }}
                          </v-card-title>
                        </v-card>
                      </v-col>
                  </v-row>
                </v-card>
            </v-card>
          </v-card>
        </v-banner>
      </v-col>

      <v-col
        cols="12"
        xl="8"
        lg="8"
        md="8"
        class=""
      >
      <v-row
        class="text-h5 secondary--text px-6 font-weight-medium my-4"
      >
        <v-list-item-content>
            <v-list-item-title class="text-h6 secondary--text">
              Categories
            </v-list-item-title>
            <v-list-item-subtitle class="pb-2">Drag and drop to change order</v-list-item-subtitle>
        </v-list-item-content>
        <v-spacer></v-spacer>
        <v-text-field
          v-if="showSearch"
          v-model="categoryName"
          label="search"
          color="primary"
          class="pt-0"
        ></v-text-field>
        <v-btn
          icon
          x-large
          @click="showSearch = !showSearch"
        >
          <v-icon
            :color="showSearch?'primary':'#1C1B1F'"
            x-large
          >search</v-icon>
        </v-btn>
        <v-btn
          rounded
          x-large
          color="primary"
          class="text-capitalize text-h6"
          @click="save"
        >
          save
        </v-btn>
      </v-row>
        <v-card class="overflow-x-hidden mt-3" height="600px" flat color="#f5f5f5">
          <v-row
            class="pa-0 ma-0"
          >
            <draggable
              v-model="categories"
              class="list-group"
              tag="ul"
              v-bind="dragOptions"
              @start="drag = true"
              @end="drag = false"
            >
              <transition-group
                type="transition"
                :name="!drag ? 'flip-list' : null"
                class="row"
              >
                <v-col
                  v-for="item in categories"
                  :key="item.id"
                  class="list-group-item mb-6"
                  cols="12"
                  :lg="categories.length===1?'':'6'"
                >
                  <v-card
                    class="categories px-4"
                    height="200px"
                    width="357px"
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
                            <!-- {{item.parentCategory}} 
                              <span v-if="item.parentCategory">
                                /
                              </span>  -->
                            {{
                              50 > item.name.length ? item.name : item.name.substr(0, 50) + '...'
                            }}
                          </v-card-text>
                        </v-col>
                        <v-col
                          cols="12"
                          class="d-flex flex-column justify-space-between px-0 mx-0"
                        >
                          <v-card-actions class="caption pt-0">
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
                              class="text-capitalize text-h6"
                              @click="editCategory(item)"
                            >
                              edit
                            </v-btn>
                          </v-card-actions>
                        </v-col>
                      </v-row>
                  </v-card>
                </v-col>
              </transition-group>
            </draggable>
            <v-dialog
              v-model="dialog"
              persistent
              width="1000px"
            >
              <v-card class="cardborder">
                <v-row class="pa-0 ma-0">
                  <input
                    ref="Image"
                    type="file"
                    v-show="false"
                    accept="image/png, image/jpeg"
                    @change="onImageFilesChange"
                  >
                  <v-col
                    v-for="(item, index) in selectedCategory"
                    :key="index"
                    cols="12"
                  >
                    <v-card class="pa-4" flat>
                      <v-row class="pa-0 ma-0">
                        <v-col  cols="3" class="py-0 my-">
                          <v-card
                            v-if="coverImage.length === 0"
                            class="pa-2"
                            @click="$refs.Image.click()"
                          >
                            <v-img
                              src="/addLogo.svg"
                              class="align-center"
                            >
                              <v-card-title class="px-0 mx-0" >
                                <v-spacer></v-spacer>
                                <v-icon
                                  color="secondary"
                                >add</v-icon>
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
                              :src="coverImage"
                              height="150px"
                              width="180px"
                              contain
                            >
                              <v-app-bar color="rgba(0,0,0,0)" flat>
                                <v-spacer></v-spacer>
                                <v-btn
                                  fab
                                  x-small
                                  @click="removeCoverImage"
                                >
                                  <v-icon>close</v-icon>
                                </v-btn>
                              </v-app-bar>
                            </v-img>
                          </v-card>
                        </v-col>
                        <v-col 
                          class="accent--text"
                          cols=""
                        >
                          <v-card-title class=" accent--text px-0 mx-0 mt-0 pt-0 categoriescardtext">
                            {{item.name}}
                            <v-spacer></v-spacer>
                            <v-btn
                              color="primary"
                              outlined
                              rounded
                              class="text-capitalize"
                              @click="update(item.id)"
                            >
                              update
                            </v-btn>
                            <v-btn
                              icon
                              @click="dialog=false"
                            >
                              <v-icon>close</v-icon>
                            </v-btn>
                          </v-card-title>
                          <v-card-subtitle class="px-0 mx-0 pb-0 mb-0 mt-1 prog-title">{{item.hierarchy}}</v-card-subtitle>
                          <v-row
                            class=""
                          >
                            <v-col
                              cols="12"
                              lg="2"
                              class="pt-5"
                            >
                              Timer
                            </v-col>
                            <v-col
                              cols="12"
                              lg="4"
                              class="py-0 my-0"
                            >
                              <v-switch
                              v-model="timerOn"
                              color="primary"
                              inset
                              ></v-switch>
                            </v-col>
                            
                            <v-col
                              v-if="timerOn"
                              cols="12"
                              lg="2"
                            >
                              <v-text-field
                                v-model="timerStart"
                                placeholder="time"
                                type="time"
                                value="12:30:pm"
                                class=""
                                color="orange"
                                label="Start Time *"
                              ></v-text-field>
                            </v-col>
                            <v-col
                              v-if="timerOn"
                              cols="12"
                              lg="2"
                            >
                              <v-text-field
                                v-model="timerEnd"
                                placeholder="time"
                                type="time"
                                value="12:30:pm"
                                class=""
                                color="orange"
                                label="End Time *"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          <v-card-subtitle
                            v-if="timerOn"
                            class="px-0 mx-0 my-1 py-1"
                          >
                            Available on-
                            <v-chip-group
                              v-model="availableDays"
                              multiple
                              active-class="primary"
                              color="primary"
                              >
                              <v-chip
                                v-for="tag in days"
                                :key="tag"
                                label
                                outlined
                                class="mr-2"
                              >
                                {{ tag }}
                              </v-chip>
                            </v-chip-group>
                          </v-card-subtitle>
                        </v-col>
                      </v-row>
                      <v-card
                        height="380px"
                        outlined
                        class="businesscard overflow-auto pa-8 pt-0 ma-6"
                      >
                        <v-app-bar flat color="white">
                          <span class="subtitle-1">Dishes</span>
                          <span class="caption mx-4">{{item.dishes.length}} items</span>
                          <v-spacer></v-spacer>
                          <span class="caption">Drag and drop to change the order</span>
                        </v-app-bar>
                        <v-chip-group
                          v-model="selectedDishes"
                          multiple
                          column
                          active-class="primary"
                          color="primary"
                        >
                          <draggable
                            v-model="recommendationDishes"
                            class="list-group"
                            tag="ul"
                            v-bind="dragOptions"
                            @start="drag = true"
                            @end="drag = false"
                          >
                          <transition-group type="transition" :name="!drag ? 'flip-list' : null">
                            <v-chip
                              v-for="dish in recommendationDishes"
                              :key="dish.id"
                              width="430px"
                              outlined
                              label
                              large
                              :value="dish"
                              class="d-inline-flex ma-4 businesscard"
                            >
                              <v-card-subtitle>{{dish.name}}</v-card-subtitle>
                            </v-chip>
                          </transition-group>
                          </draggable>
                        </v-chip-group> 
                      </v-card>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
            </v-dialog>
          </v-row>
        </v-card>
     </v-col>

    </v-row>
  </v-container>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';
import draggable from 'vuedraggable';
const { v4: uuidv4 } = require('uuid');

@Component({
  components: {
    draggable,
  },
})
export default class categories extends Vue {

  dialog = false;

  days = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'
  ];

  availableDays = [] as any;

  showSearch = false;

  categories= [];

  categoryName = '';

  timerOn = false;

  timerStart = '';

  timerEnd = '';

  selectedCategory = [] as any;

  selectedDishes = [] as any;

  recommendationDishes = [] as any;

  coverImage = '' as any;

  coverImageFile = '' as any;

  selectedDays = [] as any;

  categoryOrder = [] as string[];

  settingsId = '';

  drag = false;

  dragOptions = {
    animation: 200,
    group: "description",
    disabled: false,
    ghostClass: "ghost"
  };

  editCategory(item: any) {
    this.selectedCategory = [];
    this.availableDays = item.availableDays;
    this.selectedDishes = item.dishes;
    this.coverImage = item.coverImage;
    this.timerOn = item.timerOn;
    this.timerStart = item.timerStart;
    this.timerEnd = item.timerEnd;
    this.recommendationDishes = item.dishes;
    this.selectedCategory.push(
      item
    )
    this.dialog=true;
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

  async update(id:string) {
    if(this.coverImageFile.length!==0) {
      this.coverImage= await this.storeImageFiles(this.coverImageFile);
    }
    try {
      const {data} =await this.$axios.put(`v1/categories/${id}`,
        {
          coverImage : this.coverImage,
          availableDays : this.availableDays,
          dishes : this.selectedDishes,
          timerOn:this.timerOn,
          timerStart:this.timerStart,
          timerEnd:this.timerEnd,
        },
        {
            withCredentials: true,
        },
      )
      this.getCategories()
      this.dialog = false;
    } catch (error) {
      console.log(error)
    }
  }

  async getSettings() {
    try {
      const {data} =await this.$axios.get(`/v1/settings?businessId=${this.$route.params.business}`,
      {
        withCredentials: true,
      },
      )
      this.categoryOrder = data[0].categoryOrder;
      this.settingsId = data[0].id;
    } catch (error) {
      console.log(error)
    }
  }

  async getCategories() {
    try {
      const {data} =await this.$axios.get(`/v1/categories?businessId=${this.$route.params.business}`,
      {
        withCredentials: true,
      },
      )
      this.categories = data
    } catch (error) {
      console.log(error)
    }
  }

  async mounted() {
    await this.getCategories();
    await this.getSettings();
    if (this.categoryOrder) {
      this.categories.sort((category1: any, category2: any) => {
        return this.categoryOrder.indexOf(category1.id) -
               this.categoryOrder.indexOf(category2.id);
      });
    }
  }

  onImageFilesChange(event: any) {
    const files = event.target.files;
    for(const file of files) {
      if (file.type.startsWith('image')) {
        this.coverImage = URL.createObjectURL(file);
        this.coverImageFile = file;
      }
    }
  }

  removeCoverImage() {
    this.coverImage = ''
    this.coverImageFile = ''
  }

  async save() {
    if (this.settingsId) {
      try {
        await this.$axios.put(`/v1/settings/${this.settingsId}`, {
          categoryOrder: this.sortedIds,
          businessId: this.$route.params.business,
        }, {
            withCredentials: true,
        });
      } catch (error) {
        console.log(error)
      }
    } else {
      try {
        await this.$axios.post('/v1/settings', {
          businessId: this.$route.params.business,
          categoryOrder: this.sortedIds,
        }, {
            withCredentials: true,
        });
      } catch (error) {
        console.log(error)
      }
    }
  }

  get filteredCategories() {
    return this.categories.filter((search: any) => {
      return this.categoryName.toLowerCase().split(' ').every(v => search.name.toLowerCase().includes(v));
    });
  }

  get sortedIds() {
    const ids = [] as string[];
    this.categories.forEach((category: any) => {
      ids.push(category.id);
    });
    return ids;
  }
}
</script>

  <style>
  .mobileviewborder{
    border: 8px solid rgba(116 119 117 /50%) !important;
    border-radius: 18px !important;
  }

  /* .mobilefixed {
    position: -webkit-sticky !important; 
    position: sticky !important;
  } */

  /* .mobiletext {
    font-style: normal !important;
    font-weight: 700 !important;
    font-size: 13.2222px !important;
    line-height: 140% !important;
    color: #1A202C !important;
  } */

  </style>

<style scoped>
.drop-zone {
  background-color: #eee;
  margin-bottom: 10px;
  padding: 10px;
}

.drag-el {
  background-color: #fff;
  margin-bottom: 10px;
  padding: 5px;
}

.button {
  margin-top: 35px;
}

.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}

.list-group {
  min-height: 20px;
}

.list-group-item {
  cursor: move;
}

.list-group-item i {
  cursor: pointer;
}
</style>