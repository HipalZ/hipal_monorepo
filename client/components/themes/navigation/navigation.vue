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
        v-if="theme"
      >
        <v-banner sticky class="pa-0 ma-0" >

          <v-card
            color="#f1f1f1"
            class="py-12"
            sticky
            height="790px"
          >
            <v-card  
              class="mobileviewborder"
              width="299px"
              height=""
              :color="selectedTheme.primary"
            >
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
                  :color="selectedTheme.primary"
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
                      v-if="menuToCategory"
                      class="px-6 mx-0 pt-0"
                    >
                      <v-col
                        v-for="i in 5"
                        :key="i"
                        cols="6"
                        class="pb-0"
                        align="start"
                      >
                        <v-card
                          flat
                          class="rounded-lg"
                        >
                          <v-img 
                            src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
                            height="120px"
                            width="144px"
                            class="rounded-lg"
                          >
                          </v-img>
                          <v-card-title class="pa-0 ma-0 secondary--text align-center justify-center">
                            food
                          </v-card-title>
                        </v-card>
                      </v-col>
                  </v-row>
                  <v-row
                    v-else
                  >
                    <v-col
                      v-for="i in 3"
                      :key="i"
                      cols="12"
                      align="center"
                      justify="center"
                      class="py-0"
                    >
                      <div class="d-flex flex-no-wrap justify-space-between">
                        <div>
                          <v-card-title
                            class="py-0 my-0 font-weight-bold"
                          >mimosa</v-card-title>

                          <v-card-title class="text--left subtitle-2 my-0 py-1">₹ 100</v-card-title>
                          <v-card-text class="caption py-1 my-0 text-left accent--text">
                            In publishing and graphic design, Lorem ipsum....
                          </v-card-text>
                        </div>
                        <div class="my-3 mr-3">
                          <v-avatar
                            size="80"
                            tile
                          >
                            <v-img
                              src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
                              class="rounded-lg"
                            ></v-img>
                          </v-avatar>
                          <v-btn
                            outlined
                            rounded
                            :color="selectedTheme.secondary ? selectedTheme.secondary:'#F14638'"
                            class="mt-n4"
                            style="background-color: white;"
                            small
                          >
                            add
                          </v-btn>
                        </div>
                      </div>
                      <v-divider
                        v-if="i < 3"
                        class="mx-4"
                      >
                      </v-divider>
                    </v-col>
                    <v-col
                      cols="12"
                      class="pa-0 ma-0"
                    >
                      <v-card-actions class="px-4 my-0 mt-2">
                        <v-btn
                          rounded
                          class="text-capitalize white--text"
                          :color="selectedTheme.secondary ? selectedTheme.secondary:'#F14638'"
                          block
                          x-large
                        >
                          <v-icon class="mx-2" color="white">local_dining</v-icon>
                          Final Cart
                        </v-btn>
                      </v-card-actions>
                    </v-col>
                  </v-row>
                </v-card>
            </v-card>
          </v-card>
        </v-banner>
      </v-col>

      <v-col
        v-else
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
              :color="selectedTheme.primary"
            >
              <v-img
                :src="wallpaper"
                class="rounded-lg"
                height="300px"
              >
                <v-app-bar
                  flat
                  color="rgba(0, 0, 0, 0)"
                  class=""
                >
                  <v-chip
                    outlined
                    x-small
                    class="white--text"
                  >
                    <v-icon x-small class="pr-2">schedule</v-icon>
                    10:00 am to 10:00 pm
                  </v-chip>
  
                  <v-spacer></v-spacer>
  
                    <v-icon x-small color="white" class="mx-2">location_on</v-icon>
  
                    <v-icon x-small color="white">call</v-icon>
                </v-app-bar>
              </v-img>
              <v-card
                class="mt-n4 rounded-lg rounded-b-0"
                flat
                :color="selectedTheme.primary"
              >
                <v-row
                  class="pa-0 ma-0"
                  align="center"
                >
                  <v-col
                    cols="4"
                    class=" mr-0"
                  >
                    <v-img
                      alt="user"
                      :src="business.logo"
                      class=""
                      contain
                    >
                    </v-img>
                  </v-col>
                  <v-col
                    cols="8"
                    class="pr-0 mr-0 px-0"
                    align="start"
                    justify="start"
                  >
                      <v-card-title class="mobiletext py-0 my-0 px-0 pb-1">Fine-dine|Desserts|continental</v-card-title>
                      <v-card-text class="px-0 caption">In publishing and graphic design,  Lorem ipsum dolor sit amet consectetur</v-card-text>
                  </v-col>
                </v-row>
                <v-row
                    class="px-0 mx-0 pt-0"
                    align="center"
                    justify="center"
                  >
                    <v-col
                      v-for="i in 5"
                      :key="i"
                      cols="2"
                      class="ma-0 pa-0 mx-1"
                    >
                      <v-card
                        flat
                        class="rounded-lg"
                      >
                        <v-img 
                          src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
                          height="60px" 
                          width="85px"
                          class="align-end"
                        >
                        <span class="caption white--text align-end pl-2">food</span>
                        </v-img>
                      </v-card>
                    </v-col>
                </v-row>
                <v-card-actions class="pt-16">
                  <v-btn
                   :color="selectedTheme.secondary ? selectedTheme.secondary:'#F14638'"
                    block
                    large
                    rounded
                    class="white--text"
                  >
                    menu
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-card>
          </v-card>
        </v-banner>
      </v-col>
      <!-- User Flow -->
      <v-col
        cols="12"
        xl="6"
        lg="6"
        md="4"
        class=""
      >
        <v-row>
          <v-col
            class="pa-4"
            cols="12"
          >
            <v-card-title class="text-h5 px-0 secondary--text">User Flow</v-card-title>
            <v-item-group
              v-model="selectedUserFlow"
            >
              <v-row>
                <v-col
                  v-for=" (item,index) in userflow"
                  :key="index"
                  cols="12"
                  lg="5"
                  class="my-4 mr-10"
                >
                  <v-item 
                    v-slot="{ active, toggle }" 
                    @change="changeView(item.title)"
                    :value="item.title"
                  >
                    <v-card
                      class=""
                      flat
                      @click="toggle"
                    >
                      <v-img
                        :src="item.src"
                        :class="active ? 'userflow':''"
                      ></v-img>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-item-group>

            <v-item-group
              v-show="showSubCategories"
              v-model="selectedUserFlow"
            >
              <v-row>
                <v-col
                  v-for=" (item,index) in subMenuCategory"
                  :key="index"
                  cols="12"
                  lg="5"
                  class="my-4 mr-10"
                >
                  <v-item
                    v-slot="{ active, toggle }"
                    @change="changeView(item.title)"
                    :value="item.title"
                  >
                    <v-card
                      class=""
                      flat
                      @click="toggle"
                    >
                      <v-img
                        :src="item.src"
                        :class="active ? 'userflow':''"
                      ></v-img>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-item-group>
          </v-col>

          <v-col
            cols="12"
            class="pa-4"
          >
            <v-card-title class="text-h5 px-0 secondary--text">Card Designs </v-card-title>
            <v-card-title class="px-0 subtitle-1 secondary--text">Category Card Designs </v-card-title>
            <v-item-group
              v-model="categoryCardDesign"
            >
              <v-row>
                <v-col
                  v-for="(item,index) in cardDesigns"
                  :key="index"
                  cols="12"
                  lg="5"
                  class="my-4 mr-10"
                >
                  <v-item 
                    v-slot="{ active, toggle }"
                    :value="item.title"
                  >
                    <v-card
                      class="rounded-lg"
                      flat
                      :class="active?'userflow':''"
                      @click="toggle"
                    >
                      <v-img
                        :src="item.src"
                      ></v-img>
                    </v-card>
                  </v-item>
                </v-col>
              </v-row>
            </v-item-group>
          </v-col>

          <!-- <v-col
            cols="12"
            class="pa-4"
          >
            <v-card-title class="subtitle-1 px-0 secondary--text">Dish card design</v-card-title>
            <v-item-group
              v-model="dishcardDesign"
            >
              <v-row>
                <v-col
                  v-for="(item,index) in cardDesigns"
                  :key="index"
                  cols="12"
                  lg="5"
                  class="my-4 mr-10"
                >
                  <v-item 
                    v-slot="{ active, toggle }"
                    :value="item.title"
                  >
                  <v-card
                    class="rounded-lg"
                    flat
                    :class="active?'userflow':''"
                    @click="toggle"
                  >
                    <v-img
                      :src="item.src"
                    ></v-img>
                  </v-card>
                </v-item>
                </v-col>
              </v-row>
            </v-item-group>
          </v-col> -->
        </v-row>
        
      </v-col>

      <!-- sideNav -->
      <v-col
        cols="12"
        xl="2"
        lg="2"
        md="4"
        class=""
      >
      <v-banner sticky class="pa-0 ma-0" app>
        <v-row
          class="text-h5 secondary--text mt-2 mb-10 px-6  font-weight-medium"
          align="center"
          justify="center"
        >
          <v-btn
            rounded
            color="primary"
            height="49px"
            width="97px"
            class="text-capitalize text-h5"
            @click="save()"
          >
            Save
          </v-btn>
        </v-row>
        
        <v-row
        >
          <v-chip-group
            v-model="selection"
            column
            mandatory
            active-class="primary"
            color="primary"
            transition="scroll-y-transition"
          >
            <v-col
              cols="12"
              align="center"
              class="mt-4"
            >
              <span class="text-h6 accent--text">Themes User Flow</span> <br>
              <span class="caption accent--text">on this page</span>
            </v-col>
            <v-col
              v-for="(item, index) in navItems"
              :key="index"
              align="center"
              cols="12"
              class="py-2"
            >
              <v-chip
                outlined
                class="sidenav"
              >
                {{item.name}}
              </v-chip>
            </v-col>
          </v-chip-group>
        </v-row>
      </v-banner>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class Navigation extends Vue {

    theme= false;

    categoryCardDesign = '';

    dishCardDesign = '';

    selectedUserFlow = '';

    selection = '';

    wallpaper = '';

    business = '' as any;

    navItems = [
      {
        name:'UserFlow',
        href:'#basic'
      },
      {
        name:'CardDesigns',
        href:'#basic'
      },
      // {
      //   name:'DishCardDesigns',
      //   href:'#basic'
      // },
    ];

    userflow = [
      {
        src:  '/userflow/menu1.svg',
        title:  'menuToCategories'
      },
      {
        src: '/userflow/menu2.svg',
        title: 'menuToDish'
      },
    ];

    showSubCategories = false;

    buttonText = 'save';

    subMenuCategory = [
      {
        src: '/userflow/menu3.svg',
        title: 'menuToParentCategories'
      },
      {
        src: '/userflow/menu4.svg',
        title: 'menuToChildCategory'
      }
    ]

    cardDesigns = [
      {
        src:  '/cardDesigns/spread.svg',
        title:  'spread'
      },
      {
        src:  '/cardDesigns/focused.svg',
        title:  'focused'
      }
    ];

    items= [
      {
        src: 'https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg',
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

    menuToCategory = true;

    selectedTheme = [] as any;

    method = '';

    navigationId = '';

    changeView(title:string) {
      this.theme=true;
      if(title === 'menuToDish') {
        this.menuToCategory = false;
        this.showSubCategories = false;
      }
      else {
        this.menuToCategory = true;
        this.showSubCategories = true;
        this.selectedUserFlow = "menuToParentCategories";
      }
    }

    async save() {
      if(this.method === 'post') {
        try {
          await this.$axios.post('/v1/settings',{
            businessId:this.$route.params.business,
            navigation: {
              from: 'menu',
              to: this.selectedUserFlow,
              categoryCard: this.categoryCardDesign,
              dishCard: this.dishCardDesign,
            }
          },
            {
              withCredentials: true,
            }
          );
        } catch (error) {
          console.log(error)
        }
      }
      else {
        try {
        await this.$axios.put(`v1/settings/${this.navigationId}`,{
          businessId:this.$route.params.business,
          navigation: {
            from: 'menu',
            to: this.selectedUserFlow,
            categoryCard: this.categoryCardDesign,
            dishCard: this.dishCardDesign,
          }
        },
          {
            withCredentials: true,
          }
        );
      } catch (error) {
        console.log(error)
      }
      }
    }

    async mounted() {
      try {
        const {data} =await this.$axios.get(`/v1/settings?businessId=${this.$route.params.business}`,
          {
              withCredentials: true,
          },
        )
        if(data.length===0) {
          this.method = 'post'
        }
        else {
          this.method = 'put'
          this.navigationId = data[0].id
        }
        if(data[0].navigation) {
          this.selectedUserFlow = data[0].navigation.to;
          if (data[0].navigation.to !== 'menuToDish') {
            this.showSubCategories = true;
          }
          this.categoryCardDesign = data[0].navigation.categoryCard;
          this.dishCardDesign = data[0].navigation.dishCard;
        }
        if(data[0].explore){
          this.wallpaper= data[0].explore.wallpaper;
        }
        if(data[0].themes) {
          this.selectedTheme = {
            primary : data[0].themes.primaryColor,
            secondary : data[0].themes.secondaryColor,
            tertiary : data[0].themes.accentColor,
          }
        }
      } catch (error) {
        console.log(error)
      }

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