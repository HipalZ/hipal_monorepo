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
            <v-card
              v-if="themes" 
              class="mobileviewborder"
              width="299px"
              height="620px"
              :color = "themesColors.primary"
            >
                <v-card class="" height="200px" >
                  <v-img
                    :src="miniBannerImage"
                    class="rounded-lg"
                    position="top end"
                    aspect-ratio="1"
                    height="200px"
                  >
                  </v-img>
                </v-card>
                <v-card
                  class="mt-n16 rounded-lg rounded-b-0 mb-4"
                  flat
                  :color = "themesColors.primary"
                >
                  <span v-if="selectedItem === 1">
                    <v-card-title
                      class=""
                    >
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
                          v-for="i in 4"
                          :key="i"
                          cols="6"
                          class="pb-0"
                          align="start"
                        >
                          <v-card
                            flat
                            class="rounded-lg"
                            :color = "themesColors.primary"
                          >
                            <v-img 
                              src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
                              height="90px"
                              width="144px"
                              class="rounded-lg"
                            >
                            </v-img>
                            <v-card-title class="pa-0 ma-0 subtitle-1 secondary--text align-center justify-center">
                              food
                            </v-card-title>
                          </v-card>
                        </v-col>
                    </v-row>
                  </span>

                    <span  v-if="selectedItem === 2">
                      <v-row
                        class="px-6 mx-0 pt-0"
                      >
                      <v-col
                        v-for="i in 3"
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
                            height="90px"
                            width="144px"
                            class="rounded-lg"
                          >
                          </v-img>
                          <v-card-title class="pa-0 ma-0 secondary--text align-center subtitle-1 justify-center">
                            food
                          </v-card-title>
                        </v-card>
                      </v-col>
                      </v-row>
                      <v-row
                        align="center"
                        justify="center"
                      >
                        <v-col
                          cols="11"
                        >
                          <v-img
                            :src="specialBannerImage"
                            height="132px"
                            position="top"
                            class="rounded-lg"
                          >
                          </v-img>
                        </v-col>
                      </v-row>
                    </span>
  
                    <v-row
                      align="center"
                      justify="center"
                      v-if="selectedItem === 3"
                    >
                      <v-col
                        cols="12"
                      >
                        <v-img
                          :src="endBannerImage"
                          height="232px"
                          width="394px"
                          position="top"
                        >
                        </v-img>
                      </v-col>
                    </v-row>
  
                    <v-card-text
                      align="start"
                      v-if="selectedItem === 3"
                    >
                      In publishing and graphic design,Lorem ipsum is a placeholder edasgk oegjp
                      <v-img
                        src="/groupIcons.svg"
                        width="100px"
                        class="mt-2"
                      ></v-img>
                    </v-card-text>
                    <v-footer
                      color="#EFC54D"
                      v-if="selectedItem === 3"
                    >
                      <v-card-text class="py-2 accent--text text-center">
                      Copyright by Paltribe
                    </v-card-text>
                    </v-footer>
                    <v-card-actions :class="selectedItem===1? 'mt-10':'my-0 py-2'">
                      <v-btn
                        color="error"
                        block
                        large
                        rounded
                        position="fixed"
                      >
                        menu
                      </v-btn>
                    </v-card-actions>
                </v-card>
            </v-card>
            
            <v-card
              v-else
              class="mobileviewborder"
              width="299px"
              height="601px"
              :color = "themesColors.primary"
            >
              <v-img
                :src="mainImage"
                class="rounded-lg rounded-b-0"
                height="300px"
                position="top"
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
                :color = "themesColors.primary"
              >
                <v-row
                  class="pa-0 ma-0 pt-2"
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
                      <v-card-title class="mobiletext py-0 my-0 px-0 pb-1 #F14638--text"><span class="#F14638--text" >
                        Fine-dine|Desserts|continental
                      </span></v-card-title>
                      <v-card-text class="px-0 caption #F14638--text">In publishing and graphic design,  Lorem ipsum dolor sit amet consectetur</v-card-text>
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
                <v-card-actions class="pt-14">
                  <v-btn
                    :color="themesColors.secondary ? themesColors.secondary:'#F14638'"
                    block
                    large
                    :rounded="roundedButton"
                    :outlined="outlinedButton"
                    :tile="tileButton"
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
        <themesContent
          @miniBanner="miniBanner"
          @specialBanner="specialBanner"
          @endBanner="endBanner"
          @changeMobileView="changeMobileView"
          @changedTheme="changedTheme"
          @changedButtonType="changedButtonType"
          @pageNo="pageNo"
          @socialLinks="socialLinks"
          @footerDescription="footerDescription"
          @wallpaper="wallpaper"
        />
        
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import themesContent from './content.vue'
  const { v4: uuidv4 } = require('uuid');

  @Component({
    components: {
      themesContent,
    },
  })
  export default class themes extends Vue {
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
      {
        name:'Links',
        href:'#basic'
      },
      {
        name:'Footer',
        href:'#basic'
      },
    ];

    miniBannerImage = "https://cdn.vuetifyjs.com/images/cards/cooking.png" as any;

    specialBannerImage= "https://cdn.vuetifyjs.com/images/cards/cooking.png" as any;

    endBannerImage= "https://cdn.vuetifyjs.com/images/cards/cooking.png" as any;

    selectedItem = 1 as any;

    themes = false;

    selection = 0;

    theme="error" as any;

    outlinedButton = false;

    tileButton = false;

    roundedButton = true;

    themesColors = [] as any;

    buttonType = '';

    miniBannerImageFile = '' as any;

    specialBannerImageFile = '' as any;

    endBannerImageFile = '' as any;

    mainImage = "https://cdn.vuetifyjs.com/images/cards/cooking.png" as any;

    youtubeLink = '';

    facebookLink = '';

    instagramLink = '';

    linkedInLink = '';

    footerText = '';

    business = {} as any;

    wallpaper(info:any){
      this.mainImage = info;
    }

    footerDescription(info : string) {
      this.footerText = info;
    }

    pageNo(info: any) {
      this.selection = info;
    }

    miniBanner(info: any) {
      this.miniBannerImage = info.miniBannerImage;
      this.miniBannerImageFile = info.file
    }

    specialBanner(info: any) {
      this.specialBannerImage = info.specialBannerImage;
      this.specialBannerImageFile=info.file;
      this.selectedItem = 2;
    }

    endBanner(info:any) {
      this.endBannerImage = info.endBannerImage;
      this.endBannerImageFile = info.file;
      this.selectedItem = 3;
    }

    changeMobileView(info: any) {
      this.themes = info;
    }

    changedTheme(info: any) {
      this.themesColors = info;
    }

    socialLinks(info:any) {
      if(info.platformName ===  'Youtube') {
        this.youtubeLink = info.link;
      }
      else if(info.platformName ===  'Facebook') {
        this.facebookLink = info.link;
      }
      else if(info.platformName ===  'Instagram') {
        this.instagramLink = info.link;
      }
      else if(info.platformName ===  'LinkedIn') {
        this.linkedInLink = info.link;
      }
    }

    changedButtonType(info: any) {
      if(info === 'outlined') {
        this.outlinedButton = true;
      }
      else if(info === 'tile') {
        this.tileButton = true;
        this.outlinedButton = false;
      }
      else {
        this.roundedButton=true;
        this.tileButton = false;
      }
      this.buttonType=info;
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
  /* stylelint-disable */
  .v-banner__wrapper {
    border-bottom: none !important;
  }

  .sidenav  {
    border: none !important;
  }
  /* stylelint-enable */

  </style>