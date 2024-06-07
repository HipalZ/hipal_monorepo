<template>
  <v-container fluid class="pa-0">
    <v-row class="pa-0 ma-0">
      <v-col 
        cols="12"
        lg="9"
        class="pa-0 ma-0">
        <v-item-group mandatory>
          <v-row
          >
            <v-item v-slot="{active, toggle}">
              <v-col
                cols="12"
                class="mb-10"
              >
                <span class="title secondary--text">Wallpapers</span>
                <v-card
                  class="pa-10 mt-4 "
                  :class="active ? 'active-card':'businesscard'"
                  :id="'sec_'+'0'"
                  @mousedown="toggle"
                >
                  <span :id="'span_'+'0'" v-intersect="handleIntersect"></span>
                    <v-row>
                      <v-col cols="4">
                        <v-card
                          class="pa-2"
                        >
                          <input
                            ref="MainBannerImage"
                            type="file"
                            v-show="false"
                            accept="image/png, image/jpeg"
                            @change="onImageFilesChange"
                          >
                          <v-img
                            v-if="(mainBannerImage.length === 0)"
                            src="/addLogo.svg"
                            class="align-end"
                          >
                            <v-btn 
                              class="text-capitalize secondary--text"
                              text
                              @click="$refs.MainBannerImage.click()"
                            >
                              <v-icon class="mx-2" >file_upload</v-icon>
                              upload image
                            </v-btn>
                          </v-img>
                          <v-img
                            v-else
                            :src="mainBannerImage"
                            class="rounded-lg"
                          >
                            <v-app-bar color="rgba(0,0,0,0)" flat>
                              <v-spacer></v-spacer>
                              <v-btn 
                                icon
                                color="secondary"
                                x-large
                                @click="removeMainBannerImage"
                              >
                                <v-icon>close</v-icon>
                              </v-btn>
                            </v-app-bar>
                          </v-img>
                        </v-card>
                      </v-col>
                    </v-row>
                    <v-row
                      class="secondary--text"
                    >
                      <v-col
                        cols="12"
                        lg="3"
                      >
                        PhoneNumber
                      </v-col>
                      <v-col
                        cols="12"
                        lg="2"
                        class="py-0 my-0"
                      >
                      <v-autocomplete
                        ref="country"
                        v-model="countryCode"
                        item-text="name"
                        item-value="dial_code"
                        :filter="filterNameCode"
                        small-chips
                        :items="countries"
                        placeholder="Country"
                        label="Country Code"
                        required
                        class="py-0"
                      >
                      <template 
                        #item="{ item }"
                      >
                        <country-flag :country='item.code' size='small'/>
                        {{ `+${item.dial_code} ${item.name}`  }}
                      </template>
                      <template #selection="{ item }">
                          <span>
                            <country-flag :country='item.code' size='normal'/>
                            +{{item.dial_code}}
                          </span>
                      </template>
                    </v-autocomplete>
                      </v-col>
                      <v-col
                        cols="12"
                        lg="6"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="phoneNumber"
                          placeholder="PhoneNumber"
                          class="py-0 my-1"
                          color="orange"
                          maxlength="10"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row
                      class="secondary--text"
                    >
                      <v-col
                        cols="12"
                        lg="3"
                      >
                        Location
                      </v-col>
                      <v-col
                        cols="12"
                        lg="8"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="location"
                          placeholder="location"
                          class="py-0 my-1"
                          color="orange"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                    <v-row
                      class="secondary--text"
                    >
                      <v-col
                        cols="12"
                        lg="3"
                      >
                        Time
                      </v-col>
                      <v-col
                        cols="12"
                        lg="3"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="startTime"
                          placeholder="time"
                          type="time"
                          value="12:30:AM"
                          class="py-0 my-1"
                          color="orange"
                        ></v-text-field>
                      </v-col>
                      <v-col
                        cols="12"
                        lg="1"
                        class="text-center"
                      >
                        to
                      </v-col>
                      <v-col
                        cols="12"
                        lg="3"
                        class="py-0 my-0"
                      >
                        <v-text-field
                          v-model="endTime"
                          placeholder="time"
                          type="time"
                          value="12:30:pm"
                          class="py-0 my-1"
                          color="orange"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                </v-card>
              </v-col>
            </v-item>

            <v-item v-slot="{active, toggle}">
              <v-col
                cols="12"
                class="mb-10"
              >
                <v-card 
                  class="pa-10"
                  :class="active ? 'active-card':'businesscard'"
                  @mousedown="toggle"
                  :id="'sec_'+'1'"
                >
                  <span :id="'span_'+'1'" v-intersect="handleIntersect"></span>
                  <v-card-title class="px-0 secondary--text pt-0">
                    Special Offers
                    <v-spacer></v-spacer>
                    <v-btn
                      outlined
                      color="primary"
                      large
                      rounded
                      @click="specialOfferView = true"
                      class="text-h5 text-capitalize"
                    >add</v-btn>
                  </v-card-title>
                  <v-row
                    justify="center"
                  >
                    <v-col
                      v-for="(item, index) in storedSpecialOffers"
                      :key="index"
                      cols="12"
                      lg="5"
                      class="px-6"
                    >
                      <v-card
                        class="pa-2"
                        width="311"
                      >
                        <v-img
                          :src="item.wallpaper"
                          position="top"
                          height="141px"
                          width="296px"
                          class="rounded-lg"
                        >
                          <v-app-bar color="rgba(0,0,0,0)" flat>
                            <v-spacer></v-spacer>
                            <v-btn
                              icon
                              color="white"
                              @click="editStoredOffer(item,index)"
                            >
                              <v-icon>border_color</v-icon>
                            </v-btn>
                            <v-btn
                              color="white"
                              small
                              fab
                              @click="removeStoredSpecialOffers(index)"
                            >
                              <v-icon>close</v-icon>
                            </v-btn>
                          </v-app-bar>
                        </v-img>
    
                        <v-card-title class="subtitle-1 py-1 secondary--text pa-0">
                          {{item.offerName}}
                        </v-card-title>
    
                        <v-card-text class="caption px-0 font-weight-bold">
                          Action-
                          <span class="primary--text">
                            {{item.redirectType}}
                            /
                            {{item.redirectName}}
                          </span>
                        </v-card-text>
                      </v-card>
                    </v-col>
                    <!-- newUpdatedSpecialOffers -->
                    <v-col
                      v-for="(item, index) in specialOffers"
                      :key="index"
                      cols="12"
                      lg="5"
                      class="px-6"
                    >
                      <v-card
                        class="pa-2"
                        width="311"
                      >
                        <v-img
                          :src="item.wallpaper"
                          position="top"
                          height="141px"
                          width="296px"
                          class="rounded-lg"
                        >
                          <v-app-bar color="rgba(0,0,0,0)" flat>
                            <v-spacer></v-spacer>
                            <v-btn
                              icon
                              color="white"
                              @click="editOffer(item,index)"
                            >
                              <v-icon>border_color</v-icon>
                            </v-btn>
                            <v-btn
                              icon
                              color="white"
                              large
                              @click="removeSpecialOffers(index)"
                            >
                              <v-icon>close</v-icon>
                            </v-btn>
                          </v-app-bar>
                        </v-img>
    
                        <v-card-title class="subtitle-1 py-1 secondary--text pa-0">
                          {{item.offerName}}
                        </v-card-title>
    
                        <v-card-text class="caption px-0 font-weight-bold">
                          Action- <span class="primary--text">{{item.redirectName.name}}/{{item.redirectName.type}} </span>
                        </v-card-text>
                      </v-card>
                    </v-col>
                  </v-row>
                  
                  <v-expand-transition>
                    <span v-show="specialOfferView">
                      <v-card-title class="secondary--text px-0 mx-0 my-4">
                        Add Offer
                        <v-spacer></v-spacer>
                        <v-btn
                          outlined
                          color="primary"
                          rounded
                          large
                          @click="updateOffer"
                          class="text-h5 text-capitalize"
                        >
                          update
                        </v-btn>
                        <v-btn
                          icon
                          large
                          @click="clearUpdateOffer()"
                        >
                          <v-icon>close</v-icon>
                        </v-btn>
                      </v-card-title>
                      
                      <v-form
                        ref="form"
                      >
                        <v-row>
                          <v-col
                            cols="12"
                            lg="4"
                          >
                            <v-card
                              class="pa-3"
                            >
                              <input
                                ref="offerImage"
                                type="file"
                                v-show="false"
                                accept="image/png, image/jpeg"
                                @change="onChangeOfferImage"
                              >
                              <v-img
                                v-if="offerWallpaper.length === 0"
                                src="/addLogo.svg"
                                class="rounded-lg"
                                position="center"
                                height="150px"
                              >
                                <v-card-title class="mt-12 px-0 mx-0" >
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    icon
                                    color="black"
                                    large
                                    @click="$refs.offerImage.click()"
                                  >
                                    <v-icon>add</v-icon>
                                  </v-btn>
                                  <v-spacer></v-spacer>
                                </v-card-title>
                              </v-img>
                              <v-img
                                v-else
                                :src="offerWallpaper"
                                class="rounded-lg"
                                height="150px"
                              >
                                <v-app-bar color="rgba(0,0,0,0)" flat>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    icon
                                    color="white"
                                    large
                                    @click="onRemoveSpecialOfferImage()"
                                  >
                                    <v-icon>close</v-icon>
                                  </v-btn>
                                </v-app-bar>
                              </v-img>
                              <v-card-title class="subtitle-1 py-0 my-0"> Add your offer Wallpaper</v-card-title>
                            </v-card>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="8"
                          >
                            <v-card-title class="py-0 my-0 secondary--text">
                              Offer Name
                              <v-spacer></v-spacer>
                              <v-switch
                                v-model="showOfferName"
                                inset
                                color="primary"
                                validate-on-blur
                              ></v-switch>
                            </v-card-title>
                            <v-expand-transition>
                              <v-card-title
                                class="py-0 my-0"
                                v-show="showOfferName"
                              >
                                <v-text-field
                                  v-model="offerName"
                                  placeholder="Offer Name"
                                  dense
                                  color="orange"
                                  validate-on-blur
                                ></v-text-field>
                              </v-card-title>
                            </v-expand-transition>
                            <v-card-title class="py-0 my-0 secondary--text">
                              Redirect the offer
                              <v-spacer></v-spacer>
                              <v-switch
                                v-model="showRedirectName"
                                inset
                                color="primary"
                                validate-on-blur
                              ></v-switch>
                            </v-card-title>
                            <v-expand-transition>
                              <v-card-title
                                v-show="showRedirectName"
                                class="py-0 my-0"
                              >
                                <v-autocomplete
                                  v-model="redirectOfferName"
                                  :items="redirect"
                                  chips
                                  color="primary lighten-2"
                                  label="Name of the Dish/Category"
                                  item-text="dish.name"
                                  item-value="dish"
                                  validate-on-blur
                                >
                                  <template v-slot:selection="data">
                                    <v-chip
                                      v-bind="data.attrs"
                                      :input-value="data.selected"
                                      @click="data.select"
                                    >
                                      {{ data.item.dish.name }}
                                    </v-chip>
                                  </template>
                                  <template v-slot:item="data">
                                    <template >
                                      <v-list-item-content>
                                        <v-list-item-title v-html=" data.item.dish.name "></v-list-item-title>
                                        <v-list-item-subtitle v-html="data.item.dish.type"></v-list-item-subtitle>
                                      </v-list-item-content>
                                    </template>
                                  </template>
                                </v-autocomplete>
                              </v-card-title>
                            </v-expand-transition>
                          </v-col>
                        </v-row>
                      </v-form>
                    </span>
                  </v-expand-transition>
                </v-card>
              </v-col>
            </v-item>

            <v-item v-slot="{active, toggle}">
              <v-col
                cols="12"
                class="mb-10"
              >
                <v-card 
                  class="pa-10"
                  :class="active ? 'active-card':'businesscard'"
                  @mousedown="toggle"
                  :id="'sec_'+'2'"
                >
                  <span :id="'span_'+'2'" v-intersect="handleIntersect"></span>
                  <v-card-title class="px-0 secondary--text py-0">
                    Popular
                    <v-spacer></v-spacer>
                    <v-btn
                      outlined
                      color="primary"
                      large
                      rounded
                      @click="showPopularView = !showPopularView"
                      class="text-h5 text-capitalize"
                    >add</v-btn>
                  </v-card-title>
                  <v-row
                    v-if="(selectedPopularDishes.length != 0)"
                    align="center"
                    justify="center"
                  >
                    <v-col
                      cols="12"
                    >
                      <v-card
                        outlined
                        class="businesscard overflow-auto pa-6 py-0 mt-4"
                      >
                        <v-chip-group
                          v-model="selectedPopularDishes"
                          multiple
                          column
                          active-class="primary"
                          color="primary"
                        >
                          <v-chip
                            v-for="(item,index) in selectedPopularDishes"
                            :key="index"
                            width="430px"
                            outlined
                            placeholder
                            large
                            class="d-inline-flex ma-4 businesscard"
                            :value="item"
                          >
                            <v-card-subtitle >{{item.name}}</v-card-subtitle>
                          </v-chip>
                        </v-chip-group>
                      </v-card>
                    </v-col>
                  </v-row>
    
                  <v-row
                    v-if="showPopularView"
                    align="center"
                    justify="center"
                  >
                    <v-col
                      cols="12"
                    >
                      <v-card
                        height="380px"
                        outlined
                        class="businesscard overflow-auto pa-6 mt-4"
                      >
                      <v-banner
                        sticky
                      >
                        <v-app-bar
                          absolute
                          color="white"
                          elevate-on-scroll
                          scroll-target="#scrolling-techniques-7"
                          fixed
                        >
                          <v-toolbar-title>
                            Dishes
                          </v-toolbar-title>
                          <v-spacer></v-spacer>
                          <v-text-field
                            v-model="searchDishes"
                            label="search"
                            color="primary"
                            class="mt-3"
                          ></v-text-field>
                          <v-btn
                            icon
                            text
                          >
                            <v-icon>
                              search
                            </v-icon>
                          </v-btn>
                        </v-app-bar>
                        </v-banner>
                        <v-chip-group
                          v-model="selectedPopularDishes"
                          multiple
                          max="6"
                          column
                          active-class="primary"
                          color="primary"
                          class="mt-4"
                        >
                          <v-chip
                            v-for="(item,index) in dishesData"
                            :key="index"
                            width="430px"
                            outlined
                            placeholder
                            :close="!active"
                            large
                            filter
                            filter-icon="close"
                            class="d-inline-flex ma-4 businesscard"
                            :value="{
                              id:item.id,
                              name:item.name,
                            }"
                          >
                            <v-card-subtitle> {{item.name}} </v-card-subtitle>
                          </v-chip>
                        </v-chip-group>
                      </v-card>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-item>

            <v-item v-slot="{active, toggle}">
              <v-col
                cols="12"
                class="mb-10"
              >
                <v-card 
                  class="pa-10"
                  :class="active ? 'active-card':'businesscard'"
                  @mousedown="toggle"
                  :id="'sec_'+'3'"
                >
                  <span :id="'span_'+'3'" v-intersect="handleIntersect"></span>
                  <v-card-title class="secondary--text pa-0 ma-0">
                    Highlights
                    <v-spacer></v-spacer>
                    <v-btn
                      outlined
                      rounded
                      large
                      color="primary"
                      :disabled="updatedStory.length+storedStories.length >= 5"
                      @click="highlightsView = true"
                      class="text-h5 text-capitalize"
                    >
                      add
                    </v-btn>
                  </v-card-title>
                  <v-row
                    class="mt-4"
                  >
                    <!-- storedStories -->
                    <v-col
                      v-for="(item, index) in storedStories"
                      :key="index"
                      cols="12"
                      lg="4"
                      class="pa-6"
                    >
                      <v-card
                        v-if=" (fileType.getType(item.stories[0].split('.')[3]).toString().split('/')[0]==='image')"
                        class="pa-2"
                        align="center"
                      >
                        <v-img
                          :src="item.stories[0]"
                          class="rounded-lg"
                          position="top"
                          height="134px"
                        >
                           <v-app-bar color="rgba(0,0,0,0)" flat>
                              <v-spacer></v-spacer>
                              <v-btn
                                icon
                                color="white"
                                @click="editStoredStories(item,index)"
                              >
                                <v-icon>border_color</v-icon>
                              </v-btn>
                              <v-btn
                                color="white"
                                fab
                                x-small
                                @click="removeStoredStories(index)"
                              >
                                <v-icon>close</v-icon>
                              </v-btn>
                            </v-app-bar>
                        </v-img>
                        <v-card-title class="subtitle-1 pb-0 accent--text">
                          {{item.name}}
                        </v-card-title>
                      </v-card>
                      <v-card
                        v-else
                        class="pa-2"
                        align="center"
                      >
                        <v-card-title class="py-0">
                          <v-spacer></v-spacer>
                          <v-btn
                            icon
                            @click="editStoredStories(item,index)"
                          >
                            <v-icon>border_color</v-icon>
                          </v-btn>
                          <v-btn
                           icon
                           @click="removeStoredStories(index)"
                         >
                           <v-icon>close</v-icon>
                          </v-btn>
                        </v-card-title>
                        <video 
                          :src="item.stories[0]"
                          muted
                          autoplay
                          width="150px"
                        >
                        </video> 
                        <v-card-title class="subtitle-1 pb-0 accent--text">
                          {{item.name}}
                        </v-card-title>
                      </v-card>
                    </v-col>
                    <!-- newupdatedStories -->
                    <v-col
                      v-for="(item, index) in updatedStory"
                      :key="index"
                      cols="12"
                      lg="4"
                      class="pa-6"
                    >
                      <v-card
                        class="pa-2"
                        align="center"
                      >
                        <v-img
                          :src="item.stories[0].src"
                          class="rounded-lg"
                          position="top"
                          height="134px"
                        >
                           <v-app-bar color="rgba(0,0,0,0)" flat>
                              <v-spacer></v-spacer>
                              <v-btn
                                color="white"
                                icon
                                @click="editStory(item,index)"
                              >
                                <v-icon>border_color</v-icon>
                              </v-btn>
                              <v-btn
                                color="white"
                                x-small
                                fab
                                @click="removeUpdatedStory(index)"
                              >
                                <v-icon>close</v-icon>
                              </v-btn>
                            </v-app-bar>
                        </v-img>
                        <v-card-title class="subtitle-1 pb-0 accent--text">
                          {{item.name}}
                        </v-card-title>
                      </v-card>
                    </v-col>
                  </v-row>

                  <v-expand-transition
                  >
                    <span
                      v-show="highlightsView"
                    >
                      <v-card-title class="secondary--text px-0 mx-0">
                        Story Details
                        <v-spacer></v-spacer>
                        <v-btn
                          outlined
                          color="primary"
                          rounded
                          large
                          class="text-h5 text-capitalize"
                          @click="updateStoryDetails"
                        >
                          update
                        </v-btn>
                        <v-btn
                          icon
                          large
                          @click="clearHighlightField"
                        >
                          <v-icon>close</v-icon>
                        </v-btn>
                      </v-card-title>
                      
                      <v-row
                        class="px-0 mx-0"
                      >
                        <v-col cols="8" class="pl-4">
                          <v-text-field
                            v-model="storyName"
                            color="primary"
                            dense
                            placeholder="type StoryName"
                            class=""
                          ></v-text-field>
                          <!-- <v-divider class="primary"></v-divider> -->
                        </v-col>
                      </v-row>
        
                      <v-row
                        class="px-0 mx-0"
                      >
                        <input
                          ref="storyImage"
                          type="file"
                          v-show="false"
                          accept="image/png, image/jpeg video/mp4,video/x-m4v,video/*"
                          @change="onChangeStoreImage"
                        >
                        <!-- <v-col
                          v-for="(item , index) in storyImages"
                          :key="index"
                          cols="5"
                        >
                          <v-card
                            v-if="item.src.length === 0"
                            class="pa-2"
                            width="256px"
                          >
                            <v-img
                              src="/addLogo.svg"
                              class="rounded-lg align-center"
                            >
                              <v-card-title class=" px-0 mx-0" >
                                <v-spacer></v-spacer>
                                <v-btn
                                  icon
                                  color="black"
                                  large
                                  @click="$refs.storyImage.click(),selectedStoryImage = item.id"
                                >
                                  <v-icon>add</v-icon>
                                </v-btn>
                                <v-spacer></v-spacer>
                              </v-card-title>
                            </v-img>
                          </v-card>
                          <v-card
                            v-else
                            height="357px"
                            width="212px"
                            class="pa-2"
                          >
                            <v-img
                              :src="item.src"
                              height="340px"
                              position="top"
                            >
                              <v-app-bar color="rgba(0,0,0,0)" flat>
                                <v-spacer></v-spacer>
                                <v-btn
                                  icon
                                  color="white"
                                  large
                                >
                                  <v-icon>close</v-icon>
                                </v-btn>
                              </v-app-bar>
                            </v-img>
                          </v-card>
                          <v-card-subtitle v-if="item.id===1">cover page</v-card-subtitle>
                        </v-col> -->
                        <v-col
                          cols="5"
                          v-if="(stories.length < 5)"
                        >
                          <v-card
                            class="pa-2"
                            width="256px"
                          >
                            <v-img
                              src="/addLogo.svg"
                              class="rounded-lg align-center"
                            >
                              <v-card-title class=" px-0 mx-0" >
                                <v-spacer></v-spacer>
                                <v-btn
                                  icon
                                  color="black"
                                  large
                                  @click="$refs.storyImage.click()"
                                >
                                  <v-icon>add</v-icon>
                                </v-btn>
                                <v-spacer></v-spacer>
                              </v-card-title>
                            </v-img>
                          </v-card>
                          
                          <!-- <v-card-subtitle>cover page</v-card-subtitle> -->
                        </v-col>
                      </v-row>
                      <v-row
                        align="left"
                        justify="left"
                      >
                        <v-col
                          v-for="(item,index) in stories"
                          :key="index"
                          cols="12"
                          xl="4"
                          lg="4"
                        >
                          <v-card
                            height="357px"
                            width="212px"
                            class="pa-2 ma-2"
                            cols="4"
                          >
                            <v-img
                              v-if="item.type === 'image'"
                              :src="item.src"
                              height="340px"
                              position="top"
                            >
                              <v-app-bar color="rgba(0,0,0,0)" flat>
                                <v-spacer></v-spacer>
                                <v-btn
                                  icon
                                  color="white"
                                  large
                                  @click="removeStoryImage(index)"
                                >
                                  <v-icon>close</v-icon>
                                </v-btn>
                              </v-app-bar>
                            </v-img>
                            <!-- <video 
                              v-else
                              :src="item.src"
                              muted
                              autoplay
                              height="340px"
                            >
                            </video>  -->
                            <span v-else>
                              <v-app-bar color="rgba(0,0,0,0)" flat>
                                <v-spacer></v-spacer>
                                <v-btn
                                  icon
                                  large
                                  @click="removeStoryImage(index)"
                                >
                                  <v-icon>close</v-icon>
                                </v-btn>
                              </v-app-bar>
                              <video
                                :src="item.src"
                                muted
                                autoplay
                                height="340px"
                                width="150px"
                              >
                              </video> 
                            </span>
                          </v-card>
                          <v-card-subtitle v-if="index===0">cover page</v-card-subtitle>
                        </v-col>
                      </v-row>
                    </span>
                  </v-expand-transition>
                </v-card>
              </v-col>
            </v-item>
          </v-row>
        </v-item-group>
      </v-col>
      <v-col
        cols="12"
        lg="3"
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
    <v-snackbar
      v-model="snackbar"
      timeout="1000"
      color="error"
      class="white--text"
    >
      {{ text }}
    </v-snackbar>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import CountryFlag from 'vue-country-flag';
  import { countryCodes } from './country_codes';
  const { v4: uuidv4 } = require('uuid');
  const mime = require('mime');

  @Component({
    components: {
      CountryFlag,
    },
  })
  export default class exploreContent extends Vue {
    countries = countryCodes;

    fileType = mime;

    snackbar = false;

    overlay = false;

    text = '';

    navItems = [
      {
        name:'Wallpapers',
        href:'#basic'
      },
      {
        name:'Special Offers',
        href:'#basic'
      },
      {
        name:'Popular',
        href:'#basic'
      },
      {
        name:'Highlights',
        href:'#basic'
      },
    ];

    selection = 0 ;

    phoneNumber = '';

    location = '';

    startTime = '';

    endTime = '';

    selectedItem = 1;

    selectedStoryImage = 0 ;

    specialOffers = [] as any;

    showMainBannerImage = false;

    showOfferName = false;

    showRedirectName = false;

    specialOfferView = false;

    showPopularView = false;

    offerName = '';

    redirectOfferName = '' as any;

    offerWallpaper = "" as any;
    
    mainBannerImage = '' as any;

    mainBannerImageFile = '' as any;

    uploadedImages = [] as any;

    updatedStory = [] as any;

    storyName = '' as any;

    highlightsView = false;

    offerWallpaperFile = '' as any;

    method = '' as string;

    navigationId = '' as string;

    stories = [] as any;

    redirect = [] as any;

    dishes = [] as any;

    selectedPopularDishes = [] as any;

    searchDishes = '';

    storedSpecialOffers = [] as any;

    storedStories = [] as any;

    countryCode = '';

    updateEditIndex = '' as any;

    storedUpdateEditIndex = '' as any;

    specialOfferMethod = 'new';

    editUpdateOfferType ='';

    loading = false;

    updateHighlightsIndex = '' as any;

    highlightsMethod = 'new';

    storedUpdateHighlightsIndex = '' as any;

    editHighlightsTypes = '' as any;

    selectedTheme = [] as any;

    filterNameCode(item: any, queryText: string) {
      const name = item.name.toLowerCase() as string;
      const dialCode = item.dial_code.toLowerCase() as string;
      const searchText = queryText.toLowerCase();

      return name.includes(searchText) ||
        dialCode.includes(searchText);
    }

    removeStoredSpecialOffers(index:Number) {
      this.storedSpecialOffers.splice(index,1);
    }

    removeSpecialOffers(index:Number) {
      this.specialOffers.splice(index,1);
    }

    removeStoredStories(index: number) {
      this.storedStories.splice(index,1)
    }

    removeUpdatedStory(index: number) {
      this.updatedStory.splice(index,1)
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

    get dishesData() {
      return this.dishes.filter((search: any) => {
        return this.searchDishes.toLowerCase().split(' ').every(v => search.name.toLowerCase().includes(v));
      });
    }

    removeMainBannerImage() {
      this.mainBannerImage = '';
      this.mainBannerImageFile = '';
      this.showMainBannerImage = false;
      this.$emit('mainBannerImage',this.mainBannerImage)
    }

    removeStoryImage(index:number) {
      this.stories.splice(index,1);
    }

    onImageFilesChange(event: any) {
      const files = event.target.files;
      for(const file of files) {
        if (file.type.startsWith('image')) {
          this.mainBannerImageFile = file;
          this.mainBannerImage = URL.createObjectURL(file);
          this.showMainBannerImage=true;
          this.$emit('mainBannerImage',this.mainBannerImage)
        }
      }
    }

    onChangeOfferImage(event: any) {
      const files = event.target.files;
      for(const file of files) {
        if (file.type.startsWith('image')) {
          this.offerWallpaper = URL.createObjectURL(file);
          this.offerWallpaperFile = file;
        }
      }
    }

    onRemoveSpecialOfferImage(){
      this.offerWallpaper = '';
      this.offerWallpaperFile = '';
    }
    
    clearUpdateOffer() {
      this.offerWallpaper = '';
      this.offerName = '';
      this.redirectOfferName = '';
      this.offerWallpaperFile= '';
      this.specialOfferView = false;
      this.specialOfferMethod = 'new';
      this.updateEditIndex = '';
      this.storedUpdateEditIndex = '';
      this.editUpdateOfferType=''
    }

    updateOffer() {
      const form = this.$refs.form as HTMLFormElement;
      if(this.specialOfferMethod === 'new'&& this.specialOffers.length+this.storedSpecialOffers.length < 5) {
        if(form.validate() && this.offerWallpaperFile) {
          this.specialOffers.push(
            {
              wallpaper: this.offerWallpaper,
              offerName: this.offerName,
              redirectName: this.redirectOfferName,
              action: '',
              imageFile: this.offerWallpaperFile,
            }
          )
          this.clearUpdateOffer();
        }
      }
      else if(this.specialOfferMethod === 'edit') {
        if(form.validate() && this.offerWallpaper){
          if(this.editUpdateOfferType === 'editOffer' ) {
            if(this.offerWallpaper) {
              this.specialOffers[this.updateEditIndex].offerName =this.offerName;
              this.specialOffers[this.updateEditIndex].redirectName =this.redirectOfferName;
            }
            if(this.offerWallpaperFile && this.offerWallpaper) {
              this.specialOffers[this.updateEditIndex].wallpaper =this.offerWallpaper;
              this.specialOffers[this.updateEditIndex].redirectName =this.redirectOfferName;
              this.specialOffers[this.updateEditIndex].offerName =this.offerName;
              this.specialOffers[this.updateEditIndex].imageFile =this.offerWallpaperFile;
            }
          }
          if(this.editUpdateOfferType === 'editStoredOffer' ){
            //console.log('stored')
            if(this.offerWallpaper) {
              this.storedSpecialOffers[this.storedUpdateEditIndex].offerName =this.offerName;
              this.storedSpecialOffers[this.storedUpdateEditIndex].redirectName =this.redirectOfferName.name;
              this.storedSpecialOffers[this.storedUpdateEditIndex].redirectType =this.redirectOfferName.type;
              this.storedSpecialOffers[this.storedUpdateEditIndex].redirectId =this.redirectOfferName.id;
            }
            if(this.offerWallpaperFile && this.offerWallpaper) {
              this.specialOffers.push(
                {
                  wallpaper: this.offerWallpaper,
                  offerName: this.offerName,
                  redirectName: this.redirectOfferName,
                  action: '',
                  imageFile: this.offerWallpaperFile,
                }
              )
              this.storedSpecialOffers.splice(this.storedUpdateEditIndex,1)
            }
          }
          this.clearUpdateOffer();
        }
      }
      else {
        this.snackbar = true;
        this.text = 'Only five stories can be added'
      }
    }

    editOffer(item: any,index: number) {
      this.offerWallpaper = item.wallpaper;
      this.offerName = item.offerName;
      this.redirectOfferName = item.redirectName;
      this.specialOfferView = true;
      this.updateEditIndex = index;
      this.specialOfferMethod = 'edit'
      this.editUpdateOfferType='editOffer'
    }

    editStoredOffer(item: any,index: number) {
      this.offerWallpaper = item.wallpaper;
      this.offerName = item.offerName;
      this.redirectOfferName = {
        name : item.redirectName,
        id : item.redirectId,
        type : item.redirectType,
      }
      this.specialOfferView = true;
      this.storedUpdateEditIndex = index;
      this.specialOfferMethod = 'edit'
      this.editUpdateOfferType='editStoredOffer'
    }

    async onChangeStoreImage(event:any) {
      const files = event.target.files;
      for(const file of files) {
        if (file.type.startsWith('image')) {
          this.stories.push({
            src:URL.createObjectURL(file),
            file,
            type : 'image',
          })
        }
        else if (file.type.startsWith('video')) {
          const src = await this.getVideoCover(file);
          this.stories.push({
            src:src,
            file,
            type : 'image',
          })
        }
      }
    }
    
    editStory(item: any,index: number) {
      this.clearHighlightField();
      for( let i = 0 ; i< item.stories.length; i++) {
        this.stories.push({
          src : item.stories[i].src,
          file : item.stories[i].file,
          type : 'image',
        })
      }
      this.updateHighlightsIndex = index;
      this.highlightsMethod= 'edit'
      this.storyName = item.name;
      this.highlightsView = true;
      this.editHighlightsTypes = 'editStories';
    }

    editStoredStories(item: any,index: number) {
      this.clearHighlightField();
      for( let i = 0 ; i< item.stories.length; i++) {
        if(item.stories[i].startsWith('http')) {
          this.stories.push({
            src : item.stories[i],
            file : '',
            type : mime.getType(item.stories[i].split('.')[3]).toString().split('/')[0]
          })
        }
        else {
          this.stories.push({
            src : item.stories[i],
            file : '',
            type : 'image'
          })
        }
      }
      this.storyName = item.name;
      this.highlightsView = true;
      this.highlightsMethod= 'edit'
      this.storedUpdateHighlightsIndex = index;
      this.editHighlightsTypes = 'editStoredStories';
      console.log(index)
    }

    getVideoCover(file: File, seekTo = 0.0) {
      // console.log("getting video cover for file: ", file);
      return new Promise((resolve) => {
        // load the file to a video player
        const videoPlayer = document.createElement('video');
        videoPlayer.setAttribute('src', URL.createObjectURL(file));
        videoPlayer.load();
        videoPlayer.addEventListener('error', () => {
        });
        // load metadata of the video to get video duration and dimensions
        videoPlayer.addEventListener('loadedmetadata', () => {
            // seek to user defined timestamp (in seconds) if possible
            console.log(videoPlayer.duration)
            if (videoPlayer.duration === Infinity) {
              this.snackbar = true
              this.text = 'unable to process the video'
              return;
            }
            if (videoPlayer.duration > 30) {
              this.snackbar = true
              this.text = 'video file should be less than 30 sec'
              return;
            }
            if (videoPlayer.duration < seekTo) {
                return;
            }
            // delay seeking or else 'seeked' event won't fire on Safari
            setTimeout(() => {
              videoPlayer.currentTime = seekTo;
            }, 200);
            // extract video thumbnail once seeking is complete
            videoPlayer.addEventListener('seeked', () => {
                // console.log('video is now paused at %ss.', seekTo);
                // define a canvas to have the same dimension as the video
                const canvas = document.createElement("canvas");
                canvas.width = videoPlayer.videoWidth;
                canvas.height = videoPlayer.videoHeight;
                // draw the video frame to canvas
                const ctx = canvas.getContext("2d");
                if (ctx) {
                  ctx.drawImage(videoPlayer, 0, 0, canvas.width, canvas.height);
                  // return the canvas image as a blob
                  resolve(canvas.toDataURL("image/png"));
                }
            });
        });
      });
    }

    clearHighlightField() {
      this.stories=[];
      this.storyName='';
      this.updateHighlightsIndex = '';
      this.highlightsMethod = 'new';
      this.editHighlightsTypes = '';
      this.storedUpdateHighlightsIndex = '';
    }

    updateStoryDetails() {
      if(this.highlightsMethod === 'new' && this.updatedStory.length+this.storedStories.length < 5)
      {
        if(this.stories.length > 0 && this.storyName.length > 0) {
          this.updatedStory.push(
            {
              stories: this.stories,
              name:this.storyName,
            }
          )
          this.$emit('story',this.updatedStory)
          this.clearHighlightField()
        }
      }
      else if(this.highlightsMethod === 'edit') {
        if(this.stories.length > 0 && this.storyName.length > 0) {
          if(this.editHighlightsTypes === 'editStories') {
            this.updatedStory.splice(this.updateHighlightsIndex ,1)
            this.updatedStory.push(
              {
                stories: this.stories,
                name:this.storyName,
              }
            )
            this.clearHighlightField()
          }
          else if(this.editHighlightsTypes === 'editStoredStories') {
            let stories = [] as any;
            for( let i = 0 ; i< this.stories.length; i++) {
              stories.push(this.stories[i].src)
            }
            this.storedStories.splice(this.storedUpdateHighlightsIndex ,1,{
              stories: stories,
              name:this.storyName,
              updatedStory : this.stories,
            })
            this.clearHighlightField()
          }
          this.clearHighlightField()
        }
      }
      else {
        this.snackbar = true;
        this.text = 'Only five stories can be added'
      }
      if(this.updatedStory.length+this.storedStories.length === 5) {
        this.highlightsView = false;
      }
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
      let specialOffers = [] as any ;
      let highlights = [] as any;
      if(this.mainBannerImageFile.length != 0) {
        this.mainBannerImage = await this.storeImageFiles(this.mainBannerImageFile);
      }
      
      for( let i = 0 ; i< this.specialOffers.length; i++) {
        specialOffers.push(
          {
            wallpaper: await this.storeImageFiles(this.specialOffers[i].imageFile),
            offerName: this.specialOffers[i].offerName,
            redirectType: this.specialOffers[i].redirectName.type,
            redirectId: this.specialOffers[i].redirectName.id,
            redirectName: this.specialOffers[i].redirectName.name,
          }
        )
      }

      for( let i = 0 ; i< this.storedSpecialOffers.length; i++) {
        specialOffers.push(
          this.storedSpecialOffers[i]
        )
      }

      for( let i = 0 ; i< this.updatedStory.length; i++) {
        let images = [];
        for( let j = 0 ; j< this.updatedStory[i].stories.length; j++) {
          images.push(
            await this.storeImageFiles(this.updatedStory[i].stories[j].file)
          )
        }
        highlights.push({
          name:this.updatedStory[i].name,
          stories: images,
        })
        images = [];
      }

      for( let i = 0 ; i< this.storedStories.length; i++) {
        let storedImages = [];
        // console.log(!!this.storedStories[i].updatedStory)
        // console.log(!this.storedStories[i].updatedStory)
        if(!!this.storedStories[i].updatedStory) {
          for( let j = 0 ; j< this.storedStories[i].updatedStory.length; j++) {
            if(this.storedStories[i].updatedStory[j].file.length !=0) {
              storedImages.push(
                await this.storeImageFiles(this.storedStories[i].updatedStory[j].file)
              )
            }
            else{
              storedImages.push(
                this.storedStories[i].updatedStory[j].src
              )
            }
          }
          highlights.push({
            name:this.storedStories[i].name,
            stories: storedImages,
          })
        }
        else {
          highlights.push(
            this.storedStories[i]
          )
        }
      }

      if(this.method==='post') {
        try {
          await this.$axios.post('/v1/settings',
            {
              businessId:this.$route.params.business,
              explore: {
                wallpaper: this.mainBannerImage,
                phone:  this.phoneNumber,
                countryCode: this.countryCode,
                location: this.location,
                openFrom: this.startTime,
                openTill: this.endTime,
                specialOffers,
                popular: this.selectedPopularDishes,
                highlights,
              }
            },
            {
              withCredentials: true,
            }
          );
          await this.explore();
          this.specialOffers = [];
          this.updatedStory = [];
          this.clearUpdateOffer();
          this.clearHighlightField();
        } 
        catch (error) {
          console.log(error)
        }
      }
      else {
        try {
          await this.$axios.put(`v1/settings/${this.navigationId}`,{
            businessId:this.$route.params.business,
              explore: {
                wallpaper: this.mainBannerImage,
                phone:  this.phoneNumber,
                countryCode: this.countryCode,
                location: this.location,
                openFrom: this.startTime,
                openTill: this.endTime,
                specialOffers,
                popular: this.selectedPopularDishes,
                highlights,
              }
          },
            {
              withCredentials: true,
            }
          );
          await this.explore();
          this.specialOffers = [];
          this.updatedStory = [];
          this.clearUpdateOffer();
          this.clearHighlightField();
        } catch (error) {
          console.log(error)
        }
      }
      this.highlightsView = false;
      this.loading = false;
    }

    async explore() {
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
          this.navigationId = data[0].id;
        }
        this.mainBannerImage = data[0].explore.wallpaper;
        this.phoneNumber = data[0].explore.phone;
        this.countryCode = data[0].explore.countryCode;
        this.location = data[0].explore.location;
        this.startTime = data[0].explore.openFrom;
        this.endTime = data[0].explore.openTill;
        this.selectedPopularDishes = data[0].explore.popular;
        this.storedSpecialOffers = data[0].explore.specialOffers;
        this.storedStories = data[0].explore.highlights;
        if(this.mainBannerImage.length != 0){
          this.$emit('mainBannerImage',this.mainBannerImage)
        }
        if(!!this.storedStories) {
          this.$emit('storedStories',this.storedStories)
        }
        if(data[0].themes) {
          this.selectedTheme = {
            primary : data[0].themes.primaryColor,
            secondary : data[0].themes.secondaryColor,
            tertiary : data[0].themes.accentColor,
          }
          this.$emit('selectedTheme',this.selectedTheme)
        }

      } catch (error) {
        console.log(error)
      }

      this.redirect = [];
      try {
        const {data} =await this.$axios.get(`/v1/categories/${this.$route.params.business}/dishes`,
          {
              withCredentials: true,
          },
        )
        this.dishes = data;
        this.redirect.push(
          {
            header : 'Dishes'
          }
        )
        for( let i = 0 ; i< data.length; i++) {
          this.redirect.push(
            {
              dish:{
                name:data[i].name,
                id:data[i].id,
                type:'Dish'
              },
            }
          )
        }
        console.log(data.length)
      } catch (error) {
        console.log(error)
      }

      try {
        const {data} =await this.$axios.get(`/v1/dishes/${this.$route.params.business}/categories`,
          {
            withCredentials: true,
          },
        )
        this.redirect.push(
          {
            header : 'Categories'
          }
        )
        for( let i = 0 ; i< data.length; i++) {
          this.redirect.push(
            {
              dish:{
                name:data[i].name,
                id:data[i].id,
                type:'Category'
              },
            }
          )
        }
        console.log(data.length)
      } catch (error) {
        console.log(error)
      }
    }

    async mounted() {
      await this.explore();
    }
  }
  </script>

<style>
  .buttonscard {
    box-sizing: border-box !important;
    border: 1px solid #79747E !important;
    border-radius: 12px !important;
  }

  .userflow {
    border: 2px solid #E96108;
    border-radius: 20px !important;
  }
</style>
