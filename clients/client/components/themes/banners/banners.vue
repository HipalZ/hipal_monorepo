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
        <v-banner sticky class="pa-0 ma-0" >

          <v-card
            color="#f1f1f1"
            class="py-12"
            sticky
            height="790px"
          >
            <v-card  class="mobileviewborder" width="299px" >
                <!-- <v-img
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
                  </v-card-title> -->
                  <!-- <v-row
                      class="px-6 mx-0 pt-0"
                    >
                      <v-col
                        v-for="i in 2"
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
                  </v-row> -->
                  <v-row
                    align="center"
                    justify="center"
                  >
                    <v-col
                      cols="8"
                      class="mt-4"
                    >
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
                        height="132px"
                        width="394px"
                      >
                      </v-img>
                    </v-col>
                  </v-row>

                  <v-row
                    align="center"
                    justify="center"
                  >
                    <v-col
                      cols="12"
                    >
                      <v-img
                        src="https://cdn.vuetifyjs.com/images/parallax/material.jpg"
                        height="232px"
                        width="394px"
                      >
                      </v-img>
                    </v-col>
                  </v-row>

                  <v-card-text
                    align="start"
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
                    
                  >
                    <v-card-text class="py-2 accent--text text-center">
                    Copyright by Paltribe
                  </v-card-text>
                  </v-footer>
            </v-card>
          </v-card>
          
        </v-banner>
      </v-col>

      <!-- <v-col
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
            <v-card  class="mobileviewborder" width="347px" >
              <v-img
                src="https://cdn.vuetifyjs.com/images/cards/cooking.png"
                class="rounded-lg"
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
                class="mt-n4 rounded-lg rounded-b-0"
                flat
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
                      src="https://cdn.pixabay.com/photo/2020/06/24/19/12/cabbage-5337431_1280.jpg"
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
                      <v-card-text class="px-0">In publishing and graphic design,  Lorem ipsum dolor sit amet consectetur</v-card-text>
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
                <v-card-actions class="pt-16 pb-16">
                  <v-btn
                    color="error"
                    block
                    large
                    rounded
                  >
                    menu
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-card>
          </v-card>
        </v-banner>
      </v-col> -->
      
      <v-col
        cols="12"
        xl="8"
        lg="6"
        md="4"
        class="mb-10"
      >
        <v-row class="px-0 mx-0">
          <span class="title secondary--text">Banners</span>
          <v-spacer></v-spacer>
          <v-btn
            rounded
            color="primary"
            x-large
            class="text-capitalize"
          >
            save
          </v-btn>
        </v-row>
        <v-row>
          <v-col
            cols="8"
          >
            <v-card
              class="cardborder businesscard pa-4"
            >
              <v-card-title class="secondary--text">
                Images
              </v-card-title>
              <v-row class="pa-0 ma-0">
                <v-col
                  v-for="(item, index) in images"
                  :key="index"
                  cols="12"
                  xl="5"
                  lg="6"
                  class="pr-16"
                >
                  <v-card
                    class="pa-2"
                  >
                  <input
                    ref="file"
                    type="file"
                    v-show="false"
                    accept="image/png, image/jpeg video/mp4,video/x-m4v,video/*"
                  >
                  <v-img
                    :src="item.src"
                    class="align-end"
                  >
                    <v-btn 
                      class="text-capitalize secondary--text"
                      text
                      @click="$refs.file.click()"
                    >
                      <v-icon class="mx-2" >file_upload</v-icon>
                      upload image
                    </v-btn>
                  </v-img>
                  </v-card>
                  <v-card-subtitle class="title py-2 secondary--text">{{item.imageName}}</v-card-subtitle>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
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
              <span class="text-h6 accent--text">Add Dishes</span> <br>
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
    <!-- <v-row>
      <v-col cols="8" class="embed-responsive embed-responsive-16by9 z-depth-1">
        <iframe class="embed-responsive-item full-height" src="https://www.hipal.life/r/pal-66cb0a37-Te/explore"
        allowfullscreen height="1000px" width="417px"></iframe>
      </v-col>
    </v-row> -->
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class banners extends Vue {
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

    images = [
      {
        imageName: 'Special Banner',
        src: '/specialBanner.svg'
      },
      {
        imageName:'End Banner',
        src:'/addLogo.svg'
      },
    ]


    
  }
  </script>

  <style>
  .mobileviewborder1{
    border: 8px solid rgba(116 119 117 /50%) !important;
    border-radius: 18px !important;
    border-end-end-radius: 0 0 !important;
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