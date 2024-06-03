<template>
  <v-container fluid>
    <!-- <v-row
          class="text-h5 secondary--text px-6 font-weight-medium my-4"
        >
          Themes
          <v-spacer></v-spacer>
        </v-row> -->
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
        <v-banner sticky class="pa-0 ma-0" app>

          <v-card
            color="#f1f1f1"
            class="py-12 "
            sticky
          >
            <v-card  
              class="mobileviewborder" 
              width="299px"
              height="601px"
              :color="selectedColors.primary"
            >
              <v-img
                :src="mainBannerImage"
                class="rounded-lg rounded-b-0"
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
                    3:00am to 5:50 pm
                  </v-chip>
  
                  <v-spacer></v-spacer>
  
                    <v-icon x-small color="white" class="mx-2">location_on</v-icon>
  
                    <v-icon x-small color="white">call</v-icon>
                </v-app-bar>
              </v-img>
              <v-card
                class=" rounded-lg mt-n4 rounded-b-0"
                flat
                :color="selectedColors.primary"
              >
                <v-row
                  class="pa-0 ma-0"
                  align="center"
                >
                  <v-col
                    cols="4"
                    class="mr-0"
                  >
                    <v-img
                      alt="user"
                      :src="business.logo"
                      class=""
                    >
                    </v-img>
                  </v-col>
                  <v-col
                    cols="8"
                    class="pr-0 mr-0"
                    align="start"
                    justify="start"
                  >
                      <v-card-title class="mobiletext py-0 my-0 px-0 pb-1">Fine-dine|Desserts|continental</v-card-title>
                      <v-card-text class="px-0 caption">In publishing and graphic design,  Lorem ipsum dolor sit amet consectetur</v-card-text>
                  </v-col>
                </v-row>
                <v-row
                  class=" px-2 mx-0 pt-0"
                  align=""
                  justify=""
                >
                  <v-col
                    v-for="(item,index) in storedStoriesImage"
                    :key="index"
                    cols="2"
                    class="ma-0 pa-0 mx-1"
                  >
                    <v-card
                      flat
                      class="rounded-lg"
                    >
                      <v-img 
                        :src="item.stories[0]"
                        class="align-end"
                      >
                      <!-- <span class="caption white--text align-end pl-2">
                        {{
                          5 > item.name.length ? item.name : item.name.substr(0, 5) + '.'
                        }}
                      </span> -->
                      </v-img>
                    </v-card>
                  </v-col>
                  <v-col
                    v-for="(item,index) in stories"
                    :key="index"
                    cols="2"
                    class="ma-0 pa-0 mx-1"
                  >
                    <v-card
                      flat
                      class="rounded-lg"
                    >
                      <v-img 
                        :src="item.stories[0].src"
                        class="align-end"
                      >
                      <span class="caption white--text align-end pl-2">food</span>
                      </v-img>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row
                  v-if="stories.length!=0 && storedStoriesImage.length!=0 "
                  align="center"
                  justify="center"
                >
                  <span class="caption">Added stories will appear here</span>
                </v-row>
                <!-- <v-card
                  flat
                >
                  <v-img
                      alt="user"
                      src="https://cdn.pixabay.com/photo/2020/06/24/19/12/cabbage-5337431_1280.jpg"
                      height="150px"
                      width="240px"
                      class="align-end rounded-lg"
                    >
                      <v-list-item
                        class="text--left white--text px-2 mx-0"
                      >
                        <v-list-item-icon class="text--left white--text">
                          <v-list-item-title > dish Name</v-list-item-title>
                        </v-list-item-icon>
                        <v-spacer></v-spacer>
                        <v-list-item-icon
                        >
                          <v-chip
                            small
                            color="#F14638"
                            class="white--text"
                          >
                            <v-icon small class="pr-2">explore</v-icon>
                            explore</v-chip>
                        </v-list-item-icon>
                      </v-list-item>
                    </v-img>
                </v-card> -->
                <v-card-actions class="mt-8 pt-8">
                  <v-btn
                    :color="selectedColors.secondary ? selectedColors.secondary:'#F14638'"
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

      <v-col
        cols="12"
        xl="8"
        lg="8"
        md="4"
        class=""
      >
        <exploreContent
          @mainBannerImage="BannerImage"
          @story="story"
          @storedStories="storedStories"
          @selectedTheme="selectedTheme"
        />
      </v-col>

      <!-- <v-col
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
            class="text-capitalize"
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
              <span class="text-h6 accent--text">Explore</span> <br>
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
                class=""
              >
                {{item.name}}
              </v-chip>
            </v-col>
          </v-chip-group>
        </v-row>
      </v-banner>
      </v-col> -->
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import exploreContent from './content.vue';
  @Component({
    components: {
      exploreContent,
    },
  })
  export default class explore extends Vue {
    navItems = [
      {
        name:'Pre Built Themes',
        href:'#basic'
      },
      {
        name:'Text',
        href:'#basic'
      },
      {
        name:'Buttons',
        href:'#basic'
      },
      {
        name:'Images',
        href:'#basic'
      },
    ];

    items= [
      {
        src: 'https://cdn.vuetifyjs.com/images/carousel/squirrel.jpg',
      },
      {
        src: 'https://cdn.vuetifyjs.com/images/carousel/sky.jpg',
      },
      {
        src: 'https://cdn.vuetifyjs.com/images/carousel/bird.jpg',
      },
      {
        src: 'https://cdn.vuetifyjs.com/images/carousel/planet.jpg',
      },
    ];

    stories = [] as any;

    storedStoriesImage = [] as any;

    business = [] as any;

    mainBannerImage = "https://cdn.vuetifyjs.com/images/cards/cooking.png" as any;

    selectedColors = [] as any;

    selectedTheme(info:any) {
      this.selectedColors = info;
    }
    BannerImage(info: any) {
      this.mainBannerImage = info;
    }

    storedStories(info:any) {
      this.storedStoriesImage = info;
    }

    story(info:any) {
      this.stories = info;
    }

    async mounted() {
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
  .mobiletext {
    font-style: normal !important;
    font-weight: 700 !important;
    font-size: 10.2222px !important;
    line-height: 140% !important;
    color: #1A202C !important;
  }

  /* .mobilesubtext {
    font-style: normal !important;
    font-weight: 400 !important;
    font-size: 15px !important;
    line-height: 18px !important;
  } */

  </style>