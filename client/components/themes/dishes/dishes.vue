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
        <v-banner sticky class="pa-0 ma-0">

          <v-card
            color="#f1f1f1"
            class="py-12 "
          >
            <v-card 
              class="mobileviewborder"
              width="299px"
              height="601px"
            >
              <v-carousel
                :show-arrows="false"
                height="300px"
                class="rounded-lg rounded-b-0"
                cycle
                hide-delimiter-background
              >
                <v-carousel-item
                  v-for="(item,i) in selectedCardDish.images"
                  :key="i"
                  :src="item"
                  class="rounded-lg"
                  contain
                ></v-carousel-item>
              </v-carousel>
              <v-card class="mt-n4 rounded-lg" flat>
                <v-card-title class="mb-0 pb-0">
                  <v-icon color="primary" class="">chevron_left</v-icon>
                  {{selectedCardDish.name}}
                </v-card-title>
                <v-list-item
                  class="my-0 py-0"
                >
                  <v-list-item-avatar tile class="px-0 mx-0" size="20">
                    <v-img
                      v-if="selectedCardDish.dishType === 'VEG'"
                      src="/vegIcon.svg"
                      contain
                    ></v-img>
                    <v-img
                      v-else-if="selectedCardDish.dishType === 'NON_VEG'"
                      src="/non_vegIcon.svg"
                      contain
                    ></v-img>
                  </v-list-item-avatar>
                  <v-list-item-content class="">
                    <v-list-item-title class="ml-2 text-left red--text">Seasonal</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action class="subtitle-2 accent--text">
                    ₹ {{selectedCardDish.price}}
                  </v-list-item-action>
                </v-list-item>
                <v-card-text class="caption py-0 my-0 text-left accent--text">
                  In publishing and graphic design, Lorem ipsum is a placeholder 
                  In publishing and graphic design,
                  <span class="font-weight-bold">Read more..</span>
                </v-card-text>
                <v-card-title
                  class="subtitle-2 grey--text"
                >
                  full-late| half-plate
                  <v-spacer></v-spacer>
                  <v-btn
                    outlined
                    color="primary"
                    rounded
                    class="text-capitalize"
                  >Add</v-btn>
                </v-card-title>
                <v-card-actions class="pa-2">
                  <v-btn
                    rounded
                    class="text-capitalize white--text"
                    color="#F14638"
                    block
                    x-large
                  >
                    <v-icon class="mx-2" color="white">local_dining</v-icon>
                    Final Cart
                  </v-btn>
                </v-card-actions>
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
          Dishes
          <v-spacer></v-spacer>
          <v-text-field
            v-if="showSearch"
            v-model="dishName"
            label="search"
            color="primary"
            class="pt-0"
          ></v-text-field>
          <v-btn
            icon
            x-large
            @click="showSearch = !showSearch"
            class="mr-2"
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
          >
            save
          </v-btn>
        </v-row>
        <v-list-item-content>
          <!-- <v-list-item-title class="text-h6 secondary--text">
            Dishes
          </v-list-item-title> -->
          <!-- <v-list-item-subtitle class="pb-2">Drag and drop to change order</v-list-item-subtitle> -->
        </v-list-item-content>
        <v-card class="overflow-auto mt-3" height="600px" flat color="#f5f5f5">
          <v-item-group
            v-model="selectedCardDish"
            mandatory
          >
          <v-row
            class="pa-0 ma-0"
          >
            <v-col
              v-for="(item,index) in dish"
              :key="index"
              cols="12"
              lg="5"
              class="mb-6"
            >
              <v-item
                v-slot="{ active, toggle }"
                :value="item"
              >
                <v-card
                  class="categories pa-4"
                  width="419px"
                  :class="active ?'userflow':''"
                  @click="toggle"
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
                          contain
                        >
                        </v-img>
                      </v-card>
                    </v-col>
                    <v-col
                      class="my-0 pr-0 ml-n2 d-flex flex-column justify-space-between"
                      cols="8"
                    >
                      <v-card-text
                        class="categoriescardtext  py-0 pr-0 accent--text"
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
                            @click="editDish(item)"
                          >
                            Edit
                          </v-btn>
                        </v-row>
                      </v-card-title>
                    </v-col>
                  </v-row>
                </v-card>
              </v-item>
            </v-col>
          </v-row>
        </v-item-group>
        </v-card>
     </v-col>
    </v-row>
    <!-- edit dish -->
    <v-dialog
      v-model="dialog"
      persistent
      width="1000px"
    >
      <v-card class="cardborder">
        <v-row class="pa-0 ma-0" >
          <input
            ref="Image"
            type="file"
            v-show="false"
            accept="image/png, image/jpeg"
            @change="onImageFilesChange"
          >
          <v-col
            v-for="(item,index) in selectedDish"
            :key="index"
            cols="12"
          >
            <v-card class="pa-4" flat>
              <v-row class="pa-0 ma-0">
                <v-col  cols="3" class="py-0 my-">
                  <span class="caption secondary--text">Cover Image</span>
                  <v-card
                    v-if="(coverImage.length != 0)"
                    rounded-lg
                    class="pa-2"
                  >
                    <v-img
                      :src="coverImage"
                      height="174px"
                      position="top"
                    >
                      <v-app-bar
                        color="rgba(0,0,0,0)"
                        flat
                      >
                        <v-spacer></v-spacer>
                        <v-btn
                          fab
                          color="grey lighten-1"
                          x-small
                          @click="removeCoverImage"
                        >
                          <v-icon color="secondary">close</v-icon>
                        </v-btn>
                      </v-app-bar>
                    </v-img>
                  </v-card>
                  <v-card
                    v-else
                    rounded-lg
                    class="pa-2"
                    @click="$refs.Image.click()"
                  >
                    <v-img 
                      src="/addLogo.svg"
                      height="174px"
                      position="top"
                      class="align-center"
                    >
                      <v-card-title >
                        <v-spacer></v-spacer>
                        <v-btn icon large>
                          <v-icon>add</v-icon>
                        </v-btn>
                        <v-spacer></v-spacer>
                      </v-card-title>
                    </v-img>
                  </v-card>
                </v-col>
                <v-col 
                  class=" accent--text"
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
                    @click="updateDish(item.id)"
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
                  <v-card-subtitle class="px-0 mx-0 pb-0 mb-0 mt-2">
                    <v-textarea
                      v-model="description"
                      label="Description"
                      class="py-0 my-1"
                      color="primary"
                      auto-grow
                      rows="1"
                      row-height="15"
                    ></v-textarea>
                  </v-card-subtitle>
                  <!-- <v-card-subtitle class="px-0 mx-0 my-1 py-1">Available on-</v-card-subtitle> -->
                </v-col>
              </v-row>
              <v-row>
                <v-col
                  v-for="(itemImage,index) in item.images"
                  :key="index"
                  cols="12"
                  :xl="(index!=0 ?'3':'0')"
                  :lg="(index!=0 ?'3':'0')"
                  class="pa-4"
                >
                  <v-card
                    v-if="(index!=0)"
                    rounded-lg
                    class="pa-2"
                  >
                    <v-img
                      :src="item.images[index]"
                      height="174px"
                      position="top"
                    >
                      <!-- <v-app-bar color="rgba(0,0,0,0)" flat>
                        <v-spacer></v-spacer>
                        <v-btn
                          fab
                          color="grey lighten-1"
                          x-small
                        >
                          <v-icon color="secondary">close</v-icon>
                        </v-btn>
                      </v-app-bar> -->
                    </v-img>
                  </v-card>
                </v-col>
              </v-row>
              <v-card
                height="380px"
                outlined
                class="editdishesborder overflow-auto pa-8 pt-0 ma-6"
              >
                <v-app-bar flat color="white" >
                  <span class="subtitle-1">Add Recommendations</span>
                  <!-- <span class="caption mx-4">10 items</span> -->
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
                      <span
                        v-for="dish in recommendationDishes"
                        :key="dish.id"
                      >
                        <v-chip
                          v-if="item.name != dish.name"
                          :value="{ name: dish.name, id: dish.id }"
                          width="430px"
                          outlined
                          label
                          large
                          filter
                          filter-icon="close"
                          class="d-inline-flex ma-4 businesscard"
                        > 
                          <v-card-subtitle>
                            {{ dish.name }}
                          </v-card-subtitle>
                        </v-chip>
                      </span>
                    </transition-group>
                  </draggable>
                </v-chip-group> 
              </v-card>

              <v-card
                class="secondary--text editdishesborder pa-4 ma-6"
              >
                <v-app-bar flat color="white" >
                  <span class="subtitle-1 secondary--text">Tags</span>
                  <!-- <span class="caption mx-4">10 items</span> -->
                  <v-spacer></v-spacer>
                  <!-- <span class="caption">Drag and drop to change the order</span> -->
                </v-app-bar>
                <v-row>
                  <v-col
                    cols="8"
                  >
                    <v-chip-group
                      v-model="createdTags"
                      multiple
                      column
                      active-class="primary"
                      color="primary"
                    >
                      <v-chip
                        v-for="(item , index) in preDefinedTagNames"
                        :key="index"
                        width="430px"
                        outlined
                        placeholder
                        large
                        :value="item"
                        class="d-inline-flex ma-4 businesscard"
                      >
                        <v-icon :color="item.color">{{item.icon}}</v-icon>
                        <v-card-subtitle >{{item.text}} </v-card-subtitle>
                      </v-chip>
                    </v-chip-group>
                      <v-chip
                        v-for="(item , index) in createdTags"
                        :key="index"
                        width="430px"
                        outlined
                        placeholder
                        close
                        large
                        :value="item"
                        color="primary"
                        class="d-inline-flex ma-4 businesscard primary"
                        @click:close="removeCreatedTags(index)"
                      >
                        <v-icon :color="item.color">{{item.icon}}</v-icon>
                        <v-card-subtitle >{{item.text}} </v-card-subtitle>
                      </v-chip>
                  </v-col>
                </v-row>
                <v-col
                  cols="4"
                  class="mb-2"
                >
                  <v-card 
                    class="businesscard ml-4"
                    @click="showTags=!showTags"
                  >
                    <v-card-title class="subtitle-1">
                      <v-icon>add</v-icon>
                      Add Tag
                    </v-card-title>
                  </v-card>
                </v-col>
                <v-expand-transition>
                  <div v-show="showTags" class="px-8 pb-6">
                    <v-divider class="mx-6"></v-divider>
                    <v-card-title
                      class=""
                    >
                      Add Tags
                      <v-spacer></v-spacer>
                      <v-btn
                        outlined
                        color="primary"
                        rounded
                        class="text-capitalize"
                        @click="updateTags"
                      >
                        update
                      </v-btn>
                    </v-card-title>
                    <v-row
                      class="pl-5"
                      align="left"
                      justify="left"
                    >
                      <v-col
                        cols="12"
                        lg="5"
                      >
                        <v-text-field
                          v-model="tagName"
                          counter
                          maxlength="60"
                          placeholder="Name of tag"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        lg="8"
                        class=""
                      >
                      <v-card-title class="px-0">colors</v-card-title>
                      <v-btn-toggle
                        v-model="tagColor"
                        tile
                        color="transparent"
                        group
                        rounded
                      >
                        <v-btn
                          v-for="(color, index) in tagColors"
                          :key="index"
                          :value="color"
                        >
                          <v-avatar
                            v-if="color === tagColor"
                            :color="color"
                            size="48"
                          >
                            <v-icon
                              color="black"
                            >
                              check
                            </v-icon>
                          </v-avatar>
                          <v-avatar
                            v-else
                            :color="color"
                            size="48"
                          >
                          </v-avatar>
                        </v-btn>
                      </v-btn-toggle>
                      <!-- <v-row>
                        <v-col
                          v-for="i in 10"
                          :key="i"
                          cols="12"
                          lg="1"
                          class="pr-0 mr-0"
                        >
                          <v-avatar
                            color="primary"
                            size="48"
                          ></v-avatar>
                        </v-col>
                      </v-row> -->
                      </v-col>
                      <v-col
                        cols="12"
                        lg="8"
                        class=""
                      >
                      <v-card-title class="px-0">Icons</v-card-title>
                      <!-- <v-row>
                        <v-col
                          v-for="i in 10"
                          :key="i"
                          cols="12"
                          lg="1"
                          class="pr-0 mr-0"
                        >
                          <v-avatar
                            color="grey"
                            size="48"
                          ></v-avatar>
                        </v-col>
                      </v-row> -->
                      <v-btn-toggle
                        v-model="tagIcon"
                        tile
                        color="transparent"
                        group
                        rounded
                      >
                        <v-btn
                          v-for="(icon, index) in tagIcons"
                          :key="index"
                          :value="icon"
                        >
                          <v-avatar
                            v-if="icon === tagIcon"
                            size="48"
                            color="primary"
                          >
                            <v-icon
                              color="black"
                            >
                              {{icon}}
                            </v-icon>
                          </v-avatar>
                          <v-avatar
                            v-else
                            size="48"
                          >
                            <v-icon
                              color="black"
                            >
                              {{icon}}
                            </v-icon>
                          </v-avatar>
                        </v-btn>
                      </v-btn-toggle>
                      </v-col>
                      <v-col
                        cols="12"
                        lg="8"
                        class=""
                      >
                      <v-card-title class="px-0">color of Font and icon</v-card-title>
                      <v-btn-toggle
                        v-model="textColor"
                        tile
                        color="transparent"
                        group
                        rounded
                      >
                        <v-btn
                          v-for="(color, index) in textColors"
                          :key="index"
                          :value="color"
                        >
                          <v-avatar
                            v-if="color === textColor"
                            :color="color"
                            size="48"
                          >
                            <v-icon
                              color="black"
                            >
                              check
                            </v-icon>
                          </v-avatar>
                          <v-avatar
                            v-else
                            :color="color"
                            size="48"
                          >
                          </v-avatar>
                        </v-btn>
                      </v-btn-toggle>
                        <!-- <v-row>
                          <v-col
                            v-for="i in 3"
                            :key="i"
                            cols="12"
                            lg="1"
                            class="pr-0 mr-0"
                          >
                            <v-avatar
                              color="black"
                              size="48"
                            ></v-avatar>
                          </v-col>
                        </v-row> -->
                      </v-col>
                    </v-row>
                  </div>
                </v-expand-transition>
              </v-card>
            </v-card>
          </v-col>
        </v-row>
      </v-card>
    </v-dialog>
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
  export default class Dishes extends Vue {

    dialog = false;

    showSearch = false;

    selectedDishes = [];

    description = '';

    showTags = false;

    dragOptions = {
      animation: 200,
      group: "description",
      disabled: false,
      ghostClass: "ghost",
    }

    drag = false;

    tagColor = '';

    tagIcon = '';

    tagName = '';

    textColor = '';

    selectedDishImages = [] as any;

    preDefinedTagNames = [
      {
        text : 'Chef special',
        icon : 'star_outline',
        color : '#8ECAE6',
        iconTextColor: '#2D3748'
      },
      {
        text : 'On offer',
        icon : 'local_offer',
        color : '#3E8914',
        iconTextColor: '#2D3748'
      },
      {
        text : 'The very seasonal special and exotic blah',
        icon : 'wb_sunny',
        color : '#E96108',
        iconTextColor: '#2D3748'
      },
    ]

    tagColors = [
      'primary',
      'secondary',
      'success',
    ];

    tagIcons = [
      'star_outline',
      'local_offer',
      'wb_sunny'
    ];

    textColors = [
      'success',
      'grey',
      'drak grey',
    ];

    updateTags() {
      if (!!this.tagName && !!this.tagIcon
          && !!this.tagColor && !!this.textColor) {
        this.createdTags.push({
          text : this.tagName,
          icon : this.tagIcon,
          color : this.tagColor,
          iconTextColor: this.textColor
        })
          this.tagName= '';
          this.tagIcon= '';
          this.tagColor= '';
          this.textColor = '';
      }
    }

    removeCreatedTags(index: number) {
      this.createdTags.splice(index,1)
    }

    removeCoverImage() {
      this.coverImage = '';
      this.coverImageFile = '';
    }

    createdTags = [] as any;

    items= [
      {
        src: 'https://cdn.vuetifyjs.com/images/cards/cooking.png',
      },
      {
        src: 'https://cdn.vuetifyjs.com/images/carousel/planet.jpg',
      },
      {
        src: 'https://cdn.vuetifyjs.com/images/carousel/bird.jpg',
      },
      {
        src: 'https://cdn.vuetifyjs.com/images/carousel/planet.jpg',
      },
    ];

    dishName = '';

    dishes = [] as any;

    selectedDish = [] as any;

    recommendationDishes = [] as any;

    selectedCardDish = [] as any;

    coverImage = "" as any;

    coverImageFile = '' as any;

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
        const type = image.type.toString().split('/')[1];
        const formdata = new FormData();
        formdata.append('fileData', file);
        formdata.append("fileName", `${imageId}.${type}`);
        formdata.append("bucketName", "assets");
        try {
         await this.$axios.post('/v1/storage', formdata);
         return `https://storage.hipal.life/minio/assets/${imageId}.${type}`;
        } catch (error) {
          console.log(error);
        }
      }
    }

    editDish(item: any) {
      this.selectedDish = [];
      this.selectedDishes = [];
      this.coverImage = '';
      this.coverImageFile = '';
      this.createdTags = [];
      this.selectedDish.push(
        item
      )
      this.description = item.description;
      this.selectedDishImages = item.images;
      for(let i = 0 ; i<item.tags.length; i++) {
        this.createdTags.push(item.tags[i])
        console.log('selected',item.tags[i])
      }
      if(!! item.filters.dishes) {
        this.selectedDishes = item.filters.dishes;
      }
      if(item.images.length != 0) {
        this.coverImage = item.images[0]
      }
      this.dialog=true;
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

    async updateDish(id: string) {
      if(this.coverImageFile.length != 0) {
        this.selectedDishImages.splice(0,1,await this.storeImageFiles(this.coverImageFile))
      }
      this.selectedDish[0].filters.dishes = this.selectedDishes;
      try {
        await this.$axios.put(`/v1/dishes/${id}`,{
          filters: this.selectedDish[0].filters,
          description: this.description,
          tags: this.createdTags,
          images: this.selectedDishImages,
        },{
          withCredentials: true,
        });
        this.dialog = false;
        this.dishesData();
      } catch (error) {
        console.log(error)
      }
    }

    get dish() {
      return this.dishes.filter((search: any) => {
        return this.dishName.toLowerCase().split(' ').every(v => search.name.toLowerCase().includes(v));
      });
    }

    async dishesData() {
      try {
        const {data} =await this.$axios.get(`/v1/dishes?businessId=${this.$route.params.business}`,
        {
            withCredentials: true,
        },
        )
        this.dishes = data
      } catch (error) {
        console.log(error)
      }
    }

    async mounted() {
      this.dishesData();
      try {
        const {data} =await this.$axios.get(`/v1/categories/${this.$route.params.business}/dishes`,
        {
            withCredentials: true,
        },
        )
        this.recommendationDishes = data;
        //this.selectedCardDish = data[0];
      } catch (error) {
        console.log(error)
      }
    }
  }
  </script>

  <style>
  .mobileviewborder{
    border: 8px solid rgba(116 119 117 /50%) !important;
    border-radius: 18px !important;
  }

  .editdishesborder{
    border: 1px solid #023047 !important;
    box-shadow: 0 1px 2px rgba(0 0 0 / 30%), 0 1px 3px 1px rgba(0 0 0 / 15%) !important;
    border-radius: 6px !important;
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