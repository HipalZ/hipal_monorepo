<template>
  <v-container fluid class="pa-0">
    <v-row class="pa-0 ma-0">
      <v-col
        class="pa-0 ma-0"
        cols="12"
        xl="9"
        lg="9"
        md="9"
      >
        <span class="text-h4 secondary--text">Themes</span>
        <v-row
          class="mt-2"
        >
        <v-item-group mandatory >

          <v-item v-slot="{active, toggle}" @change="selectedCard">
            <v-col
              cols="12"
              class="mb-10"
            >
              <v-card
                class="pa-6"
                :class="active ? 'active-card':'businesscard'"
                @mousedown="toggle"
                :id="'sec_'+'0'"
              >
                <span :id="'span_'+'0'" v-intersect="handleIntersect"></span>
                <v-card-title class="secondary--text">
                  Pre Built Themes
                </v-card-title>
                <v-item-group 
                  v-model="selectedTheme"
                >
                  <v-row
                    class="pa-0 ma-0"
                  >
                    <v-col
                      v-for="(item,index) in preBuiltThemes"
                      :key="index"
                      cols="12"
                      xl="4"
                      lg="4"
                      md="5"
                      class="pa-6"
                    >
                    <v-item
                      v-slot="{active, toggle}"
                      :value="item"
                      @change="selectedThem(item)"
                    >
                      <v-card
                        class="pa-2 categories"
                        height="196px"
                        width="202px"
                        :class="active ? 'userflow':''"
                        @mousedown="toggle"
                      >
                        <v-card :color="item.primary"   flat class="py-6 rounded-0"></v-card>
                        <v-card :color="item.secondary" flat class="py-6 rounded-0"></v-card>
                        <v-card :color="item.tertiary"  flat class="py-6 rounded-0"></v-card>
                        <v-card-title class="pa-0 ma-0 subtitle-1 ma-2">Dark coffee</v-card-title>
                      </v-card>
                    </v-item>
                    </v-col>
                    <v-col
                      cols="12"
                      xl="4"
                      lg="4"
                      md="5"
                      class="pa-6"
                    >
                    <v-item 
                      v-slot="{active, toggle}"
                    >
                      <v-card 
                        class="pa-2 categories"
                        height="196px"
                        width="202px"
                        :class="active ? 'userflow':''"
                        @mousedown="toggle"
                        @click="addYourTheme=!addYourTheme"
                      >
                        <v-img
                          v-if="!addedtheme"
                          src="/addLogo.svg"
                          height="150px"
                        >
                          <v-card-title class="mt-12 px-0 mx-0" @click="addYourTheme=!addYourTheme">
                            <v-spacer></v-spacer>
                            <v-btn
                              icon
                              color="black"
                              large
                              @click="addYourTheme=!addYourTheme"
                            >
                              <v-icon>add</v-icon>
                            </v-btn>
                            <v-spacer></v-spacer>
                          </v-card-title>
                        </v-img>
                        <span
                          v-else
                        >
                          <v-card :color="primary" flat height="50px"></v-card>
                          <v-card :color="secondary" flat height="50px"></v-card>
                          <v-card :color="tertiary" flat height="50px"></v-card>
                        </span>
                        <v-card-title
                          class="pa-0 ma-0 subtitle-1 ma-2"
                        >
                          Add your theme
                        </v-card-title>
                      </v-card>
                    </v-item>
                    </v-col>
                  </v-row>
                </v-item-group>
                <v-row
                  v-if="addYourTheme"
                >
                  <v-col
                    cols="12"
                  >
                    <v-card-title>
                      Add your theme
                      <v-spacer></v-spacer>
                      <v-btn
                        rounded
                        color="primary"
                        large
                        class="text-capitalize"
                        @click="updateTheme"
                      >
                        update
                      </v-btn>
                      <v-btn
                        icon
                        large
                        class="mx-2"
                        @click="addYourTheme=!addYourTheme"
                      >
                        <v-icon>close</v-icon>
                      </v-btn>
                    </v-card-title>
                  </v-col>
                  <v-col
                    class="secondary--text "
                    align="center"
                    cols="12"
                  >
                    <v-card-title class="py-0 my-0">
                      primary color
                      <v-spacer></v-spacer>
                      <v-color-picker
                      v-model="primary"
                      dot-size="45"
                      hide-canvas
                      mode="hexa"
                      hide-mode-switch
                    ></v-color-picker>
                    <v-spacer></v-spacer>
                    </v-card-title>
                  </v-col>
                  <v-col
                    class="secondary--text"
                    align="center"
                    cols="12"
                  >
                    <v-card-title class="py-0 my-0 ">
                      secondary color
                      <v-spacer></v-spacer>
                      <v-color-picker
                        v-model="secondary"
                        dot-size="45"
                        hide-canvas
                        mode="hexa"
                        hide-mode-switch
                        class="ml-n6"
                      ></v-color-picker>
                      <v-spacer></v-spacer>
                    </v-card-title>
                  </v-col>
                  <v-col
                    class="secondary--text"
                    align="center"
                    cols="12"
                  >
                    <v-card-title class="py-0 my-0">
                      Tertiary  color
                      <v-spacer></v-spacer>
                      <v-color-picker
                        v-model="tertiary"
                        dot-size="45"
                        hide-canvas
                        hide-mode-switch
                        mode="hexa"
                      ></v-color-picker>
                      <v-spacer></v-spacer>
                    </v-card-title>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </v-item>

          <v-item v-slot="{active, toggle}" @change="selectedCard">
            <v-col
              cols=12
              class="mb-10"
            >
              <v-card
                class="pa-6"
                :class="active ? 'active-card':'businesscard'"
                @mousedown="toggle"
                :id="'sec_'+'1'"
              >
                <span :id="'span_'+'1'" v-intersect="handleIntersect"></span>
                <v-card-title class="secondary--text">
                  Text
                </v-card-title>              
                <v-item-group
                  v-model="selectedFont"
                >
                  <v-row
                    class="pa-0 ma-0"
                  >
                    <v-col
                      v-for="(font, index) in availableFonts"
                      :key="index"
                      cols="12"
                      xl="6"
                      lg="6"
                      class="pa-8"
                    >
                      <v-item 
                        v-slot="{active, toggle}" 
                        :value="font"
                      >
                        <!-- :class="$vuetify.breakpoint.xlAndup ?'px-10 md-16':'md-4'" -->
                        <v-card
                          class="buttonscard"
                          :class="active ? 'userflow':''"
                          @mousedown="toggle"
                        >
                          <v-card flat>
                            <v-card-title
                              :style="`font-family: ${font.fontFamily}`"
                            >
                              {{ font.fontFamily.split(',')[0] }}
                            </v-card-title>
                          </v-card>
                        </v-card>
                    </v-item>
                    </v-col>
                  </v-row>
                </v-item-group>
              </v-card>
            </v-col>
          </v-item>

          <v-item v-slot="{active, toggle}" @change="selectedCard">
            <v-col
              cols="12"
              class="mb-10"
            >
              <v-card
                class="pa-6"
                :class="active ? 'active-card':'businesscard'"
                @mousedown="toggle"
                :id="'sec_'+'2'"
              >
                <span :id="'span_'+'2'" v-intersect="handleIntersect"></span>
                <v-card-title class="secondary--text">
                  Buttons
                </v-card-title>
                <v-item-group
                  v-model="selectedButton"
                >
                  <v-row
                    class="pa-0 ma-0"
                  >
                    <v-col
                      v-for="(item, index) in buttonStyles"
                      :key="index"
                      cols="12"
                      xl="6"
                      lg="6"
                      class="pa-8"
                    >
                      <v-item 
                        v-slot="{active, toggle}" 
                        :value="item.buttonType"
                        @change="selectedButtonType(item.buttonType)"
                      >
                        <!-- :class="$vuetify.breakpoint.xlAndup ?'px-10 md-16':'md-4'" -->
                        <v-card
                          class="buttonscard"
                          :class="active ? 'userflow':''"
                          @mousedown="toggle"
                        >
                          <v-card flat color="#E2E8F0">
                            <v-card-title class="pt-0 mt-0" color="#E2E8F0" >
                            <v-img
                              src="./buttonsBack.svg"
                              class="align-end"
                              contain
                            >
                              <v-card-title>
                                <v-btn
                                rounded
                                block
                                class="px-10"
                                large
                                color="secondary"
                              >
                                button
                              </v-btn>
                              </v-card-title>
                            </v-img>
                          </v-card-title>
                          </v-card>
                          <v-card-title>{{item.buttonName}}</v-card-title>
                        </v-card>
                    </v-item>
                    </v-col>
                  </v-row>
                </v-item-group>
              </v-card>
            </v-col>
          </v-item>

          <v-item v-slot="{active, toggle}" @change="selectedCard('4')">
            <v-col
              cols="12"
              class="mb-10"
            >
              <v-card>
                <v-card
                  class="pa-4"
                  :class="active ? 'active-card':'businesscard'"
                  @mousedown="toggle"
                  :id="'sec_'+'3'"
              >
                <span :id="'span_'+'3'" v-intersect="handleIntersect"></span>
                <v-card-title class="secondary--text">
                  Images
                </v-card-title>
                <v-row class="pa-0 ma-0">
                  <v-col
                    cols="12"
                    xl="4"
                    md="4"
                    :class="$vuetify.breakpoint.xl ?'pr-16':''"
                  >
                    <v-card
                      class="pa-2"
                    >
                    <input
                      ref="file"
                      type="file"
                      v-show="false"
                      accept="image/png, image/jpeg"
                      @change="onImageFilesChange"
                    >
                    <v-img
                      v-if="miniBannerImage.length===0"
                      src="/addLogo.svg"
                      class="align-end"
                    >
                      <v-btn 
                        class="text-capitalize secondary--text"
                        text
                        @click="$refs.file.click(),selectedImage=1"
                      >
                        <v-icon class="mx-2" >file_upload</v-icon>
                        upload image
                      </v-btn>
                    </v-img>
                    <v-img
                      v-else
                      :src="miniBannerImage"
                      class="rounded-lg"
                    >
                     <v-app-bar color="rgba(0,0,0,0)" flat>
                      <v-spacer></v-spacer>
                      <v-btn
                        fab
                        color="grey lighten-1"
                        x-small
                        @click="onremoveImage(1)"
                      >
                        <v-icon>close</v-icon>
                      </v-btn>
                     </v-app-bar>
                    </v-img>
  
                    </v-card>
                    <v-card-subtitle class="title py-2 secondary--text">Mini Banner</v-card-subtitle>
                  </v-col>
  
                  <v-col
                    cols="12"
                    xl="4"
                    md="4"
                    :class="$vuetify.breakpoint.xl ?'pr-16':''"
                  >
                    <v-card
                      class="pa-2"
                    >
                      <input
                        ref="file1"
                        type="file"
                        v-show="false"
                        accept="image/png, image/jpeg"
                        @change="onImageFilesChange"
                      >
                      <v-img
                        v-if="specialBannerImage.length===0"
                        src="/specialBanner.svg"
                        class="align-end"
                      >
                        <v-btn 
                          class="text-capitalize secondary--text"
                          text
                          @click="$refs.file1.click(),selectedImage=2"
                        >
                          <v-icon class="mx-2" >file_upload</v-icon>
                          upload image
                        </v-btn>
                      </v-img>
                      <v-img
                        v-else
                        :src="specialBannerImage"
                        class="rounded-lg"
                      >
                        <v-app-bar color="rgba(0,0,0,0)" flat>
                          <v-spacer></v-spacer>
                          <v-btn
                            fab
                            color="grey lighten-1"
                            x-small
                            @click="onremoveImage(2)"
                          >
                            <v-icon>close</v-icon>
                          </v-btn>
                        </v-app-bar>
                      </v-img>
                    </v-card>
                    <v-card-subtitle class="title py-2 secondary--text">Special Banner</v-card-subtitle>
                  </v-col>
  
                  <v-col
                    cols="12"
                    xl="4"
                    md="4"
                    :class="$vuetify.breakpoint.xl ?'pr-16':''"
                  >
                    <v-card
                      class="pa-2"
                    >
                      <input
                        ref="file2"
                        type="file"
                        v-show="false"
                        accept="image/png, image/jpeg"
                        @change="onImageFilesChange"
                      >
                      <v-img
                        v-if="endBannerImage.length===0"
                        src="/addLogo.svg"
                        class="align-end"
                      >
                        <v-btn 
                          class="text-capitalize secondary--text"
                          text
                          @click="$refs.file2.click(),selectedImage=3"
                        >
                          <v-icon class="mx-2" >file_upload</v-icon>
                          upload image
                        </v-btn>
                      </v-img>
                      <v-img
                        v-else
                        :src="endBannerImage"
                        class="rounded-lg"
                      >
                        <v-app-bar color="rgba(0,0,0,0)" flat>
                          <v-spacer></v-spacer>
                          <v-btn
                            fab
                            color="grey lighten-1"
                            x-small
                            @click="onremoveImage(3)"
                          >
                            <v-icon>close</v-icon>
                          </v-btn>
                        </v-app-bar>
                      </v-img>
                    </v-card>
                    <v-card-subtitle class="title py-2 secondary--text">End Banner</v-card-subtitle>
                  </v-col>
                </v-row>
              </v-card>
              </v-card>
            </v-col>
          </v-item>

          <v-item v-slot="{active, toggle}" @change="selectedCard">
            <v-col
              cols="12"
              class="secondary--text mb-10"
            >
              <v-card 
                class="pa-4"
                :class="active ? 'active-card':'businesscard'"
                @mousedown="toggle"
                :id="'sec_'+'4'"
              >
                <span :id="'span_'+'4'" v-intersect="handleIntersect"></span>
                <v-card-title>Social Media</v-card-title>
                  <v-card-text
                    class="secondary--text"
                  >
                    <v-row
                      v-for="(item, index) in socialLinks"
                      :key="index"
                    >
                      <v-col
                        cols="12"
                        xl="3"
                        lg="4"
                      >
                        <v-list-item
                        >
                          <v-list-item-avatar tile size="30">
                            <v-img
                              :src="item.icon"
                              contain
                            >
                            </v-img>
                          </v-list-item-avatar>
                          <v-list-item-content class="secondary--text">
                            <v-list-item-title>{{item.platformName}}</v-list-item-title>
                          </v-list-item-content>
                        </v-list-item>
                      </v-col>
                      <v-col
                        cols="12"
                        lg="6"
                        class=""
                      >
                        <v-text-field
                          v-model="item.link"
                          placeholder="Link"
                          class="py-0 my-1"
                          color="orange"
                          @change="onSocialLinksChange({
                            link:item.link,
                            platformName:item.platformName
                          })"
                          :rules="[
                            (value) => isURL(value) || !value || 'URL is not valid',
                          ]"
                          validate-on-blur
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    </v-card-text>
              </v-card>
            </v-col>
          </v-item>

          <v-item v-slot="{active, toggle}" @change="selectedCard">
            <v-col
              cols="12"
              class="secondary--text mb-10"
            >
              <v-card
                class="pa-4"
                :class="active ? 'active-card':'businesscard'"
                @mousedown="toggle"
                :id="'sec_'+'5'"
              >
                <span :id="'span_'+'5'" v-intersect="handleIntersect"></span>
                <v-card-title  class="secondary--text">Footer</v-card-title>
                  <v-card-text
                    class="secondary--text"
                  >
                    <v-row
                    >
                      <v-col
                        cols="12"
                        lg="10"
                        class=""
                      >
                        <v-text-field
                          v-model="footerDescription"
                          class="py-0 my-1"
                          color="orange"
                          @change="onfooterChange"
                        >
                          <template v-slot:label>
                            <span class="secondary--text">
                              write few words for customers
                            </span>
                          </template>
                        </v-text-field>
                      </v-col>
                    </v-row>
                    </v-card-text>
              </v-card>
            </v-col>
          </v-item>

        </v-item-group>
        </v-row>
      </v-col>
      <v-col
        cols="12"
        xl="3"
        lg="3"
        md="3"
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
            :loading="loading"
            @click="save()"
          >
            Save
          </v-btn>
        </v-row>
        
        <v-row
          align="center"
          justify="center"
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
              <span class="text-h6 accent--text">Themes</span> <br>
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
                @click="$vuetify.goTo('#sec_'+index)"
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
const { v4: uuidv4 } = require('uuid');

  @Component({
    components: {
    },
  })
  export default class themesContent extends Vue {

    loading = false;
    
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

    socialLinks = [
      {
        platformName : 'Youtube',
        icon : './socialMediaIcons/youtube.svg',
        link : '',
      },
      {
        platformName : 'Facebook',
        icon : './socialMediaIcons/facebook.svg',
        link : '',
      },
      {
        platformName : 'Instagram',
        icon : './socialMediaIcons/instagram.svg',
        link : '',
      },
      {
        platformName : 'LinkedIn',
        icon : './socialMediaIcons/linkedIn.svg',
        link : '',
      },
    ];

    addedtheme = false;

    footerDescription = ''

    buttonStyles = [
      {
        buttonName : 'Rounded ',
        buttonType : 'rounded',
        text : 'rounded'
      },
      {
        buttonName : 'Square Buttons',
        buttonType : 'outlined',
        text : 'outlined'
      },
      {
        buttonName : 'Square Buttons',
        buttonType : 'tile',
        text : 'label'
      },
      {
        buttonName : 'Square Buttons',
        buttonType : 'block',
        text : 'block'
      },

    ];

    images = [
      {
        imageName:'Mini Banner',
        src:'/addLogo.svg'
      },
      {
        imageName: 'Special Banner',
        src: '/specialBanner.svg'
      },
      {
        imageName:'End Banner',
        src:'/addLogo.svg'
      },
    ];

    preBuiltThemes = [
      {
        primary: '#FFCDD2',
        secondary: '#E91E63',
        tertiary:'#9C27B0',
      },
      {
        primary: '#F8BBD0',
        secondary: '#3F51B5',
        tertiary:'#2196F3',
      },
      {
        primary: '#E1BEE7',
        secondary: '#00BCD4',
        tertiary:'#009688',
      },
      {
        primary: '#000000',
        secondary: '#4FC3F7',
        tertiary:'#CDDC39',
      },
      {
        primary: '#E8EAF6',
        secondary: '#795548',
        tertiary:'#607D8B',
      },
    ];

    availableFonts = [
      {
        fontFamily: "'Roboto', sans-serif;",
        fontURL: 'https://fonts.googleapis.com/css2?family=Roboto&display=swap',
      },
      {
        fontFamily: "'Inter', sans-serif;",
        fontURL: 'https://fonts.googleapis.com/css2?family=Inter&display=swap',
      },
      {
        fontFamily: "'Lato', sans-serif;",
        fontURL: 'https://fonts.googleapis.com/css2?family=Lato&display=swap',
      },
      {
        fontFamily: "'Poppins', sans-serif;",
        fontURL: 'https://fonts.googleapis.com/css2?family=Poppins&display=swap',
      },
      {
        fontFamily: "'Nunito', sans-serif;",
        fontURL: 'https://fonts.googleapis.com/css2?family=Nunito&display=swap',
      },
    ];

    selectedFont = {
      fontFamily: "'Inter', sans-serif;",
      fontURL: 'https://fonts.googleapis.com/css2?family=Inter&display=swap',
    };

    selectedTheme = '' as any;

    selectedButton = '' as string;

    selectedImage = '' as any;

    miniBannerImage = '' as any;

    specialBannerImage = '' as any;

    endBannerImage = '' as any;

    miniBannerImageFile = '' as any;

    specialBannerImageFile = '' as any;

    endBannerImageFile = '' as any;

    primary= '#FF00FF' as any;

    secondary= '#FF00FF' as any;

    tertiary='#FF00FF' as any;

    addYourTheme = false;

    selection = '' as any;

    youtubeLink = '';

    facebookLink = '';

    instagramLink = '';

    linkedInLink = '';

    navigationId = '';

    method = '';

    isURL(str: string) {
      let url;

      try {
        url = new URL(str);
      } catch (_) {
        return false;
      }

      return url.protocol === "http:" || url.protocol === "https:";
    };

    get selectedColors() {
      if(this.selectedTheme === 5) {
        return {
          primary : this.primary,
          secondary : this.secondary,
          tertiary : this.tertiary,
        }
      } else if(!this.selectedTheme) {
        return {
          primary : '',
          secondary : '',
          tertiary : '',
        }
      } else {
        return this.selectedTheme
      }
    }

    onImageFilesChange(event: any) {
      const files = event.target.files;
      for(const file of files) {
        if (file.type.startsWith('image')) {
          if(this.selectedImage=== 1) {
            this.miniBannerImage = URL.createObjectURL(file);
            this.miniBannerImageFile = file;
            this.$emit('miniBanner',{
              miniBannerImage:this.miniBannerImage,
              file,
            })
          }
          if(this.selectedImage=== 2) {
            this.specialBannerImage = URL.createObjectURL(file);
            this.specialBannerImageFile = file;
            this.$emit('specialBanner',{
             specialBannerImage:this.specialBannerImage,
             file,
            })
          }
          if(this.selectedImage=== 3) {
            this.endBannerImage = URL.createObjectURL(file);
            this.endBannerImageFile = file;
            this.$emit('endBanner',{
             endBannerImage:this.endBannerImage,
             file,
            })
          }
        }
      }
    }

    onremoveImage(index : number) {
      if(index=== 1) {
        this.miniBannerImage = '';
        this.miniBannerImageFile = '';
        this.$emit('miniBanner',{
          miniBannerImage:this.miniBannerImage,
          file:this.miniBannerImageFile,
        })
      }
      if(index=== 2) {
        this.specialBannerImage = '';
        this.specialBannerImageFile = '';
        this.$emit('specialBanner',{
         specialBannerImage:this.specialBannerImage,
         file:this.specialBannerImageFile
        })
      }
      if(index=== 3) {
        this.endBannerImage = '';
        this.endBannerImageFile = '';
        this.$emit('endBanner',{
         endBannerImage:this.endBannerImage,
         file:this.endBannerImageFile
        })
      }
    }

    selectedCard(info : any) {
      if(info==="4") {
        this.$emit('changeMobileView', true)
      }
      else {
        this.$emit('changeMobileView', false)
      }
    }

    selectedThem(info : any) {
      this.$emit('changedTheme',info)
    }

    updateTheme() {
      const themesColors = 
        {
          primary:this.primary,
          secondary: this.secondary,
          tertiary:this.tertiary,
        };
      this.addedtheme = true;
      this.$emit('changedTheme',themesColors)
    }

    selectedButtonType(info: any) {
      this.$emit('changedButtonType',info)
    }

    handleIntersect(entries: any, observer:any){
      let intersecting_element = entries[0]
      if(intersecting_element.isIntersecting){
        let id = intersecting_element.target.id
        let index = Number(id.split("_")[1])
        this.selection = index;
        this.$emit('pageNo',this.selection);
      }
    }

    onSocialLinksChange(info:any) {
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
    
    onfooterChange() {
      this.$emit('footerDescription',this.footerDescription)
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

    async save() {
      this.loading = true;
      if(this.miniBannerImageFile.length != 0){
        this.miniBannerImage = await this.storeImageFiles(this.miniBannerImageFile);
      }
      if(this.specialBannerImageFile.length != 0) {
        this.specialBannerImage = await this.storeImageFiles(this.specialBannerImageFile);
      }
      if(this.endBannerImageFile.length != 0) {
        this.endBannerImage = await this.storeImageFiles(this.endBannerImageFile);
      }
      if(this.method === 'post') {
        try {
          await this.$axios.post('/v1/settings',{
            businessId:this.$route.params.business,
            themes: {
              primaryColor: this.selectedColors.primary,
              secondaryColor: this.selectedColors.secondary,
              accentColor: this.selectedColors.tertiary,
              fontFamily: this.selectedFont.fontFamily,
              fontURL: this.selectedFont.fontURL,
              buttonStyle: this.selectedButton,
              miniBanner: this.miniBannerImage,
              specialBanner: this.specialBannerImage,
              endBanner: this.endBannerImage,
              instagramLink: this.instagramLink,
              facebookLink: this.facebookLink,
              youtubeLink: this.youtubeLink,
              linkedinLink: this.linkedInLink,
              footerText: this.footerDescription,
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
            themes: {
              primaryColor: this.selectedColors.primary,
              secondaryColor: this.selectedColors.secondary,
              accentColor: this.selectedColors.tertiary,
              fontFamily: this.selectedFont.fontFamily,
              fontURL: this.selectedFont.fontURL,
              buttonStyle: this.selectedButton,
              miniBanner: this.miniBannerImage,
              specialBanner: this.specialBannerImage,
              endBanner: this.endBannerImage,
              instagramLink: this.instagramLink,
              facebookLink: this.facebookLink,
              youtubeLink: this.youtubeLink,
              linkedinLink: this.linkedInLink,
              footerText: this.footerDescription,
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
      this.loading = false;
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
        if(data[0].themes) {
          this.socialLinks[0].link = data[0].themes.youtubeLink;
          this.socialLinks[1].link = data[0].themes.facebookLink;
          this.socialLinks[2].link = data[0].themes.instagramLink;
          this.socialLinks[3].link = data[0].themes.linkedinLink;
          this.selectedFont = {
            fontFamily: data[0].themes.fontFamily,
            fontURL: data[0].themes.fontURL,
          };
          this.facebookLink = data[0].themes.facebookLink;
          this.instagramLink = data[0].themes.instagramLink;
          this.youtubeLink = data[0].themes.youtubeLink;
          this.linkedInLink = data[0].themes.linkedinLink;
          this.miniBannerImage = data[0].themes.miniBanner;
          this.selectedButton = data[0].themes.buttonStyle; 
          this.specialBannerImage = data[0].themes.specialBanner;
          this.endBannerImage = data[0].themes.endBanner
          this.footerDescription = data[0].themes.footerText;
          this.selectedTheme = {
            primary : data[0].themes.primaryColor,
            secondary : data[0].themes.secondaryColor,
            tertiary : data[0].themes.accentColor,
          }
          this.$emit('changedTheme',this.selectedTheme )
          this.$emit('changedButtonType',this.selectedButton)
          // console.log(data[0].themes)
        }
        if(data[0].explore){
          this.$emit('wallpaper',data[0].explore.wallpaper)
        }
      } catch (error) {
        console.log(error)
      }
    }
  }
  </script>

<style>
@import 'https://fonts.googleapis.com/css2?family=Roboto&display=swap';
@import 'https://fonts.googleapis.com/css2?family=Inter&display=swap';
@import 'https://fonts.googleapis.com/css2?family=Lato&display=swap';
@import 'https://fonts.googleapis.com/css2?family=Poppins&display=swap';
@import 'https://fonts.googleapis.com/css2?family=Nunito&display=swap';

.buttonscard {
  box-sizing: border-box !important;
  border: 1px solid #79747E !important;
  border-radius: 12px !important;
}

.userflow {
  border: 2px solid #E96108 !important;
  border-radius: 20px !important;
}

.cardsubtext {
  font-style: normal;
  font-weight: 500 !important;
  font-size: 14px !important;
  line-height: 140% !important;
}
</style>
