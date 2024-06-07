<!-- eslint-disable camelcase -->
<template>
  <v-container fluid>
    <v-row
      class="mx-8 mt-2"
    >
      <v-col
        cols="12"
        lg="12"
        class=""
      >
        <v-row>
          <v-col
            cols="12"
            xl="10"
            lg="10"
          >
            <v-form
              ref="form"
            >
              <v-item-group mandatory>
  
                <!-- basic -->
                <v-row
                  id="basic"
                >
                  <v-col
                  >
                    <v-row class="text-h5 secondary--text px-3 mb-6 font-weight-medium ">
                      <span>Add Dishes</span>
                    </v-row>
                    <span class="title">Basic</span>
                    <v-item v-slot="{active, toggle}">
                      <v-card
                        :id="'sec_'+'0'"
                        class=" secondary--text  mt-4 pa-4"
                        :class="active ? 'active-card':'businesscard'"
                        @mousedown ="toggle"
                      >
                        <span :id="'span_'+'0'" v-intersect="handleIntersect"></span>
                        <v-card-text
                          class="secondary--text"
                        >
                          <v-row
                          >
                            <v-col
                              cols="12"
                              lg="2"
                            >
                             Dish Name
                             <span class="error--text">*</span>
                            </v-col>
                            <v-col
                              cols="12"
                              lg="9"
                              class="py-0 my-0"
                            >
                              <v-text-field
                                v-model="name"
                                placeholder="Dish Name"
                                class="py-0 my-1"
                                color="orange"
                                validate-on-blur
                                :rules="[
                                  v => !!v || 'Dish Name is required',
                                  v => v.length > 2 || 'Dish Name must be valid',
                                  v => !dishNames.includes(v) || 'This dish already exists',
                                ]"
                              ></v-text-field>
                            </v-col>
                          </v-row>
                          <v-row
                          >
                            <v-col
                              cols="12"
                              lg="2"
                              class="pt-5"
                            >
                              Price <span class="error--text">*</span>
                            </v-col>
                            <v-col
                              cols="12"
                              lg="4"
                              class="py-0 my-0"
                            >
                            <v-text-field
                                v-model="price"
                                placeholder="Price"
                                class="py-0 my-1"
                                color="orange"
                                :rules="[
                                  v => !!v || 'Price is required',
                                ]"
                                validate-on-blur
                              ></v-text-field>
                            </v-col>
                            <v-col
                              cols="12"
                              lg="1"
                              class="pt-5"
                            >
                            </v-col>
                            <v-col
                              cols="12"
                              lg="1"
                              class="pt-5 pl-0"
                            >
                              Swiggy
                            </v-col>
                            <v-col
                              cols="12"
                              lg="2"
                              class="py-0 my-0 pl-0"
                            >
                            <v-text-field
                                v-model="swiggy"
                                placeholder="swiggy"
                                class="py-0 my-1"
                                color="orange"
                              ></v-text-field>
                            </v-col>
                            
                            <v-col
                              cols="12"
                              lg="2"
                              class="pr-16"
                            >
                            <v-select
                              outlined
                              placeholder="%"
                              :items="addDiscount"
                              class="rounded-lg mt-n5"
                            ></v-select>
                            </v-col>
                          </v-row>
                          <v-row
                          >
                            <v-col
                              cols="12"
                              lg="2"
                              class=""
                            >
                              Add Discount
                            </v-col>
                            <v-col
                              cols="12"
                              lg="3"
                              class="py-0 my-0 "
                            >
                              <v-text-field
                                v-model="discount"
                                placeholder="Discount"
                                class="py-0 my-1"
                                color="orange"
                              ></v-text-field>
                            </v-col>
                            <v-col
                              cols="12"
                              lg="1"
                            >
                            <v-select
                              outlined
                              placeholder="%"
                              :items="addDiscount"
                              class="rounded-lg mt-n5"
                            ></v-select>
                            </v-col>
                            <v-col cols="12" lg="1"></v-col>
                            <v-col
                              cols="12"
                              lg="1"
                              class="pt-5 pl-0"
                            >
                              Average Time
                            </v-col>
                            <v-col
                              cols="12"
                              lg="3"
                              class="py-0 my-0 pl-0"
                            >
                            <v-text-field
                              v-model="avgTime"
                              placeholder="Avg time"
                              class="py-0 my-1"
                              color="orange"
                            ></v-text-field>
                            </v-col>
                          </v-row>
                          <v-row
                          >
                            <v-col
                              cols="12"
                              lg="2"
                            >
                              Dish Type
                              <span class="error--text">*</span>
                            </v-col>
                            <v-col
                              cols="12"
                              lg="4"
                              class="py-0 my-0"
                            >
                            <!-- <v-combobox
                              v-model="dishType"
                              :items="items"
                              outlined
                                :rules="[
                                  v => !!v || 'Dish Type is required',
                                ]"
                              placeholder="Dish Type"
                              class="rounded-lg"
                            >
                              <template v-slot:item="data">
                                  <span class="prog-title">{{data.item}}</span>
                              </template>
                              <template v-slot:selection="data">
                                <span class="prog-title">{{data.item}}</span>
                              </template>
                            </v-combobox> -->
                            <v-combobox
                              v-model="dishType"
                              :items="$store.state.dishTypes"
                              hide-selected
                              placeholder="Dish Type"
                              outlined
                              :search-input.sync="search"
                            >
                              <template #no-data>
                                <v-list-item>
                                  <v-list-item-content>
                                    <v-list-item-title>
                                      No results matching "<strong>{{ search }}</strong>". Press <kbd>enter</kbd> to create a new one
                                    </v-list-item-title>
                                  </v-list-item-content>
                                </v-list-item>
                              </template>
                              <template #selection="{ attrs, item, parent, selected }">
                                  <span class="pr-2 prog-title">
                                    {{ item}}
                                  </span>
                              </template>
                              <template #item="data">
                                  <span class="prog-title">{{data.item}}</span>
                              </template>
                            </v-combobox>
                            </v-col>
                            <!-- <v-col
                              cols="12"
                              lg="4"
                              class=""
                            >
                              <v-btn
                                outlined
                                rounded
                                color="primary"
                                class="text-capitalize"
                              >
                                add
                              </v-btn>
                            </v-col> -->
                          </v-row>
                          <v-row
                          >
                            <v-col
                              cols="12"
                              lg="2"
                              class="pt-5"
                            >
                            Visibility
                            </v-col>
                            <v-col
                              cols="12"
                              lg="6"
                              class="py-0 my-0"
                            >
                              <v-switch
                              v-model="visibility"
                              color="primary"
                              inset
                              ></v-switch>
                            </v-col>
                          </v-row>
                          <v-row
                          >
                            <v-col
                              cols="12"
                              lg="2"
                            >
                              Category
                            </v-col>
                            <v-col
                              cols="12"
                              lg="4"
                              class=""
                            >
                              in {{categories.length}} Categories
                            </v-col>
                            <v-col
                              cols="12"
                              lg="6"
                              align="end"
                            >
                              <v-btn
                                outlined
                                rounded
                                color="primary"
                                class="text-capitalize"
                                @click="showDishes=!showDishes"
                              >add</v-btn>
                            </v-col>
                          </v-row>
                          <v-row
                            v-if="(categories.length != 0)"
                          >
                            <v-col
                              v-if="showDishes"
                              cols="10"
                            >
                              <v-card
                                outlined
                                class="businesscard overflow-auto pa-16 py-0"
                              >
                                <!-- <v-chip-group
                                  v-model="categories"
                                  multiple
                                  column
                                  active-class="primary"
                                  color="primary"
                                >
                                  <v-chip
                                    v-for="(item,index) in categories"
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
                                </v-chip-group> -->
                                <v-chip
                                  v-for="(item,index) in categories"
                                  :key="index"
                                  width="430px"
                                  outlined
                                  close
                                  close-icon="close"
                                  color="primary"
                                  large
                                  class="d-inline-flex ma-4 businesscard"
                                  :value="item"
                                  @click:close="removeSelectedCategory(index)"
                                >
                                  <v-card-subtitle >{{item.name}}</v-card-subtitle>
                                </v-chip>
                              </v-card>
                            </v-col>
                          </v-row>
      
                          <v-row
                            v-if="showDishes"
                          >
                            <v-col
                              cols="10"
                            >
                              <v-card
                                height="380px"
                                outlined
                                class="businesscard overflow-auto pa-16 pt-0"
                                :class="scrollbarTheme"
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
                                    Category`s
                                  </v-toolbar-title>
                                  <v-spacer></v-spacer>
                                  <v-text-field
                                    v-model="searchCategory"
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
                                  v-model="categories"
                                  multiple
                                  column
                                  active-class="primary"
                                  color="primary"
                                  class="mt-4"
                                >
                                  <v-chip
                                    v-for="(item,index) in category"
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
                                    <!-- <v-card-subtitle v-else>Telangana Special manchuriya  </v-card-subtitle> -->
                                  </v-chip>
                                </v-chip-group>
      
                              </v-card>
                            </v-col>
                          </v-row>

                          <v-row
                          >
                            <v-col
                              cols="12"
                              lg="2"
                            >
                              Kitchen
                              <span class="error--text">*</span>
                            </v-col>
                            <v-col
                              cols="12"
                              lg="4"
                              class="py-0 my-0"
                            >
                            <v-combobox
                              v-model="selectedKitchen"
                              :items="Kitchens"
                              outlined
                              :rules="[
                                v => !!v || 'Kitchen is required',
                              ]"
                              placeholder="Dish Type"
                              class="rounded-lg"
                              validate-on-blur
                            >
                              <template #item="data">
                                  <span class="prog-title">{{data.item.kitchenName}}</span>
                              </template>
                              <template #selection="data">
                                <span class="prog-title">{{data.item.kitchenName}}</span>
                              </template>
                            </v-combobox>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-item>
                  </v-col>
                </v-row>
      
                <!-- portion -->
      
                <v-row
                  id="portion"
                  class="mt-6"
                >
                  <v-col
                  >
                    <span class="title">Portion</span>
                    <v-item v-slot="{active, toggle}">
                      <v-card
                        :id="'sec_'+'1'"
                        class="secondary--text  mt-8 pa-4"
                        :class="active ? 'active-card':'businesscard'"
                        @mousedown ="toggle"
                      >
                        <v-card-title class="subtitle-1">
                          Portion
                          <v-spacer></v-spacer>
                          <span class="mx-4 subtitle-1">{{ portions.length }}</span>
                          <v-btn
                            outlined
                            color="primary"
                            rounded
                            class="text-capitalize"
                            @click="addPortion"
                          >
                            add
                          </v-btn>
                        </v-card-title>
                        <v-divider class="mx-6"></v-divider>
                        <span :id="'span_'+'1'" v-intersect="handleIntersect"></span>
                        <v-row
                          class="py-0 my-0"
                        >
                          <v-col
                            v-for="(portion, index) in portions"
                            :key="index"
                            cols="12"
                            class="ml-6"
                          >
        
                            <v-row
                            >
                              <v-col
                                cols="12"
                                lg="10"
                              >
                                <v-card-title class="pa-0">
                                  <v-checkbox
                                    v-model="portion.default"
                                    label="Default"
                                  ></v-checkbox>
                                  <v-spacer></v-spacer>
                                  <v-btn
                                    icon
                                    @click="removePortion(index)"
                                  >
                                    <v-icon>close</v-icon>
                                  </v-btn>
                                </v-card-title>
                              </v-col>
                            </v-row>
                            <v-row
                            >
                              <v-col
                                cols="12"
                                lg="2"
                              >
                                Portion Name
                              </v-col>
                              <v-col
                                cols="12"
                                lg="8"
                                class="py-0 my-0"
                              >
                                <v-text-field
                                  v-model="portion.name"
                                  class="py-0 my-1"
                                  color="orange"
                                  placeholder="Portion Name"
                                  validate-on-blur
                                  :rules="[
                                    v => !duplicatePortions || 'Duplicate portion name found'
                                  ]"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                            <v-row
                            >
                              <v-col
                                cols="12"
                                lg="2"
                              >
                                Price
                              </v-col>
                              <v-col
                                cols="12"
                                lg="4"
                                class="py-0"
                              >
                                <v-text-field
                                  v-model="portion.price"
                                  class="py-0 my-1"
                                  color="orange"
                                  placeholder="price"
                                ></v-text-field>
                              </v-col>
                            </v-row>
                            <v-row>
                              <v-col
                                  cols="12"
                                  lg="2"
                                  class=""
                                >
                                  Add Discount
                                </v-col>
                                <v-col
                                  cols="12"
                                  lg="3"
                                  class="py-0 my-0 "
                                >
                                <v-text-field
                                    v-model="portion.discount"
                                    placeholder="Discount"
                                    class="py-0 my-1"
                                    color="orange"
                                  ></v-text-field>
                                </v-col>
                                <v-col
                                  cols="12"
                                  lg="1"
                                >
                                <v-combobox
                                  outlined
                                  placeholder="%"
                                  class="rounded-lg mt-n5"
                                ></v-combobox>
                                </v-col>
                            </v-row>
                            <v-row>
                              <v-col
                                cols="11"
                              >
                                <v-divider class="px-10"></v-divider>
                              </v-col>
                            </v-row>
                          </v-col>
                        </v-row>
                        <v-card-title class="subtitle-1">
                          Extra
                          <v-spacer></v-spacer>
                          <v-btn
                            outlined
                            color="primary"
                            rounded
                            class="text-capitalize"
                            @click="addExtras"
                          >
                            add
                          </v-btn>
                        </v-card-title>
                        <!-- addextra -->
                        <v-expand-transition>
                          <div>
                            <v-divider class="mx-6"></v-divider>
                            <v-row
                              v-for="(item,index) in extras"
                              :key="index" class="pt-4 pl-5"
                            >
                              <v-col
                                cols="12"
                                lg="12"
                              >
                                <v-row>
                                  <v-col
                                    cols="12"
                                    lg="2"
                                  >
                                    Extra Name
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    lg="8"
                                    class="py-0 my-0 "
                                  >
                                    <v-text-field
                                      v-model="item.name"
                                      placeholder="Extra Name"
                                      class="py-0 my-1"
                                      color="orange"
                                    ></v-text-field>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col
                                    cols="12"
                                    lg="2"
                                    class="pt-5"
                                  >
                                    No of Options
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    lg="2"
                                    class="d-flex"
                                  >
                                    <v-btn
                                      outlined
                                      class="rounded-lg text--center"
                                      height="52px"
                                      width="30px"
                                      large
                                      @click="addExtra(index)"
                                    >+</v-btn>
                                    <v-list-item>
                                      <v-list-item-content>
                                      <v-list-item-title class="text-center" >
                                        {{ item.items.length }}
                                      </v-list-item-title>
                                      <v-list-item-subtitle>
                                        <v-divider class="primary"></v-divider>
                                      </v-list-item-subtitle>
                                    </v-list-item-content>
                                    </v-list-item>
                                    <v-btn
                                      outlined
                                      class="rounded-lg pa-0 ma-0"
                                      height="52px"
                                      width="30px"
                                      large
                                      @click="removeExtra(index,item.items.length - 1)"
                                    >-</v-btn>
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    lg="2"
                                    align="center"
                                    class="pt-5 ml-5"
                                  >
                                    No of Selections
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    lg="2"
                                    class="d-flex"
                                  >
                                    <v-btn
                                      outlined
                                      class="rounded-lg pa-0 ma-0"
                                      height="52px"
                                      width="30px"
                                      large
                                      @click="increaseNumSelections(index)"
                                    >+</v-btn>
                                    <v-list-item>
                                      <v-list-item-content>
                                      <v-list-item-title class="text-center" >
                                        {{ item.numSelections }}
                                      </v-list-item-title>
                                      <v-list-item-subtitle>
                                        <v-divider class="primary"></v-divider>
                                      </v-list-item-subtitle>
                                    </v-list-item-content>
                                    </v-list-item>
                                    <v-btn
                                      outlined
                                      class="rounded-lg pa-0 ma-0"
                                      height="52px"
                                      width="30px"
                                      large
                                      @click="decreaseNumSelections(index)"
                                    >-</v-btn>
                                  </v-col>
                                </v-row>
                                <v-row>
                                  <v-col
                                    cols="12"
                                    lg="2"
                                    class="pt-5"
                                  >
                                    Compulsory
                                  </v-col>
                                  <v-col
                                    cols="12"
                                    lg="2"
                                    class="d-flex"
                                  >
                                    <v-btn
                                      outlined
                                      class="rounded-lg pa-0 ma-0"
                                      height="52px"
                                      width="30px"
                                      large
                                      @click="increaseCompulsory(index)"
                                    >+</v-btn>
                                    <v-list-item>
                                      <v-list-item-content>
                                      <v-list-item-title class="text-center" >
                                        {{ item.compulsory }}
                                      </v-list-item-title>
                                      <v-list-item-subtitle>
                                        <v-divider class="primary"></v-divider>
                                      </v-list-item-subtitle>
                                    </v-list-item-content>
                                    </v-list-item>
                                    <v-btn
                                      outlined
                                      class="rounded-lg pa-0 ma-0"
                                      height="52px"
                                      width="30px"
                                      large
                                      @click="decreaseCompulsory(index)"
                                    >-</v-btn>
                                  </v-col>
                                </v-row>
                              </v-col>
                              <v-col
                                cols="10"
                              >
                                <v-card
                                  class="businesscard mb-10"
                                >
                                  <v-card-title class="text-h6 secondary--text pb-0">
                                    <v-row
                                      class="pb-0 mb-0"
                                    >
                                      <v-col
                                        cols="12"
                                        lg="1"
                                      >
                                        No
                                      </v-col>
                                      <v-col
                                        cols="12"
                                        lg="5"
                                        class="pl-10"
                                      >
                                        Extra Name
                                      </v-col>
                                      <v-col
                                        cols="12"
                                        lg="5"
                                        class="pl-10"
                                      >
                                        Price
                                      </v-col>
                                    </v-row>
                                  </v-card-title>
                                  <v-card-title class="pt-0">
                                    <v-divider ></v-divider>
                                  </v-card-title>
                                  <v-row
                                    class="pb-6"
                                  >
                                    <v-col
                                      v-for="(extraFields, index1) in item.items"
                                      :key="index1"
                                      cols="12"
                                      lg="12"
                                      class="pb-0"
                                    >
                                      <v-card-title class="subtitle-2 secondary--text py-0">
                                        {{ index1 + 1 }}
                                      <v-spacer></v-spacer>
                                      <v-text-field
                                        v-model="extraFields.name"
                                        label="Extra Name"
                                        color="primary"
                                      >
                                      </v-text-field>
                                      <v-spacer></v-spacer>
                                      <v-text-field
                                        v-model="extraFields.price"
                                        label="Price"
                                        color="primary"
                                      ></v-text-field>
                                      <v-spacer></v-spacer>
                                      <v-btn
                                        icon
                                        @click="removeExtra(index,index1)"
                                      >
                                        <v-icon class="">
                                          close
                                        </v-icon>
                                      </v-btn>
                                      </v-card-title>
                                    </v-col>
                                  </v-row>
                                </v-card>
                              </v-col>
                            </v-row>
        
                          </div>
                        </v-expand-transition>
                      </v-card>
                    </v-item>
                  </v-col>
                </v-row>
      
                <!-- smart seller -->
      
                <v-row
                  id="smartSeller"
                  class="mt-6"
                >
                  <v-col
                  >
                    <span class="title">Smart Seller</span>
                    <v-item v-slot="{active, toggle}">
                      <v-card
                        :id="'sec_'+'2'"
                        class="secondary--text  mt-8 pa-4"
                        :class="active ? 'active-card':'businesscard'"
                        @mousedown ="toggle"
                      >
                        <span :id="'span_'+'2'" v-intersect="handleIntersect"></span>
                        <v-card-title class="subtitle-1">
                            Dishes
                          <v-spacer></v-spacer>
                          <span class="mx-4 subtitle-1"> {{ selectedSmartSellerDishes.length }}</span>
                          <v-btn
                            outlined
                            color="primary"
                            rounded
                            class="text-capitalize"
                            @click="(showSmartSellerDishes=!showSmartSellerDishes)"
                          >
                            add
                          </v-btn>
                        </v-card-title>
  
                        <v-row
                            v-if="(selectedSmartSellerDishes.length != 0)"
                            align="center"
                            justify="center"
                          >
                            <v-col
                              cols="10"
                            >
                              <v-card
                                outlined
                                class="businesscard overflow-auto pa-16 py-0"
                              >
                                <v-chip-group
                                  v-model="selectedSmartSellerDishes"
                                  multiple
                                  column
                                  active-class="primary"
                                  color="primary"
                                >
                                  <v-chip
                                    v-for="(item,index) in selectedSmartSellerDishes"
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
                            v-if="showSmartSellerDishes"
                            align="center"
                            justify="center"
                          >
                            <v-col
                              cols="10"
                            >
                              <v-card
                                height="380px"
                                outlined
                                class="businesscard overflow-auto pa-16 pt-0"
                                :class="scrollbarTheme"
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
                                  v-model="selectedSmartSellerDishes"
                                  multiple
                                  column
                                  max="6"
                                  active-class="primary"
                                  color="primary"
                                  class="mt-4"
                                >
                                  <span
                                    v-for="(item,index) in dishes"
                                    :key="index"
                                  >
                                    <v-chip
                                      v-if="name != item.name"
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
                                  </span>
                                </v-chip-group>
      
                              </v-card>
                            </v-col>
                          </v-row>
                        <v-divider class="mx-6"></v-divider>
                        <v-card-title class="subtitle-1">
                          Filters
                        </v-card-title>
        
                        <v-row
                          class="mt-2"
                        >
                          <v-col
                            v-for="(item, index) in filterItems"
                            :key="index"
                            cols="12"
                            lg="5"
                            class="px-16"
                          >
                            <v-combobox
                              v-model="item.selectedFilter"
                              :items="item.items"
                              outlined
                              :placeholder="item.title"
                              class="rounded-lg"
                            >
                              <template #selection="data">
                                <span class="prog-title">{{data.item}}</span>
                              </template>
                            </v-combobox>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-item>
                  </v-col>
                </v-row>
      
                <!-- display -->
      
                <v-row
                  id="display"
                  class="mt-6"
                >
                  <v-col
                  >
                    <span class="title">Display</span>
                    <v-item v-slot="{active, toggle}">
                      <v-card
                        :id="'sec_'+'3'"
                        class="secondary--text mt-8 pa-4"
                        :class="active ? 'active-card':'businesscard'"
                        @mousedown ="toggle"
                      >
                        <span :id="'span_'+'3'" v-intersect="handleIntersect"></span>
                        <v-card-title>Display</v-card-title>
                        <v-card-text
                          class="secondary--text"
                        >
                          <v-row
                            class="pt-4"
                          >
                            <v-col
                              cols="12"
                              lg="2"
                            >
                              Images
                            </v-col>
                            <input
                              v-show="false"
                              ref="file"
                              type="file"
                              accept="image/png, image/jpeg video/mp4,video/x-m4v,video/*"
                              @change="onChangeImage"
                            >
                            <v-col
                              cols="12"
                              :lg="(totalImages<5?'2':'0')"
                              class="py-0 my-0"
                            >
                              <v-card
                                v-if="totalImages < 5"
                                class="pa-2"
                                width="180px"
                                @click="$refs.file.click()"
                              >
                                <v-img
                                  src="/addLogo.svg"
                                  contain
                                  class="align-center"
                                >
                                  <v-card-title>
                                    <v-spacer></v-spacer>
                                    <v-icon>add</v-icon>
                                    <v-spacer></v-spacer>
                                  </v-card-title>
                                </v-img>
                              </v-card>
                            </v-col>
                            <input
                              v-show="false"
                              ref="storedEdit"
                              type="file"
                              accept="image/png, image/jpeg*"
                              @change="oneditStoredImage"
                            >
                            <!-- <video :src="images[1]"></video> -->
                            <v-col
                              v-for="(item, index) in storedImages"
                              :key="index" 
                              cols="12"
                              lg="2"
                              class="py-0 my-0"
                            >
                              <v-card
                                class="pa-2"
                                width="180px"
                              >
                                <v-img
                                  v-if="item.type === 'image'"
                                  :src="item.src"
                                  contain
                                  aspect-ratio="1.4"
                                >
                                  <v-app-bar color="rgba(0,0,0,0)" flat>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      v-if="(index===0)"
                                      fab
                                      color="grey lighten-1"
                                      x-small
                                      @click="$refs.storedEdit.click()"
                                    >
                                    <v-icon color="secondary">border_color</v-icon>
                                    </v-btn>
                                    <v-btn
                                      v-else
                                      fab
                                      color="grey lighten-1"
                                      x-small
                                      @click="deleteStoredImage(index)"
                                    >
                                      <v-icon>close</v-icon>
                                    </v-btn>
                                  </v-app-bar>
                                </v-img>
                                <span v-else >
                                  <v-card-title class="pa-0 ma-0">
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      fab
                                      color="grey lighten-1"
                                      x-small
                                      @click="deleteStoredImage(index)"
                                    >
                                      <v-icon>close</v-icon>
                                  </v-btn>
                                  </v-card-title>
                                  <video 
                                    :src="item.src" 
                                    muted
                                    autoplay
                                    width="130px"
                                  >
                                </video> 
                                </span>
                              </v-card>
                              <span v-if="index === 0" class="caption">Cover Image</span>
                            </v-col>
                            <!-- on upload new file -->
                            <input
                              v-show="false"
                              ref="edit"
                              type="file"
                              accept="image/png, image/jpeg*"
                              @change="oneditImage"
                            >
                            <v-col
                              v-for="(item, index) in images"
                              :key="index" 
                              cols="12"
                              lg="2"
                              class="py-0 my-0"
                            >
                              <v-card
                                class="pa-2"
                                width="180px"
                              >
                                <v-img
                                  v-if="item.type === 'image'"
                                  :src="item.src"
                                  contain
                                  aspect-ratio="1.4"
                                >
                                  <v-app-bar
                                    v-if="storedImages.length === 0 "
                                    color="rgba(0,0,0,0)"
                                    flat
                                  >
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      v-if="(index===0)"
                                      fab
                                      color="grey lighten-1"
                                      x-small
                                      @click="$refs.edit.click()"
                                    >
                                    <v-icon>border_color</v-icon>
                                    </v-btn>
                                    <v-btn
                                      v-else
                                      fab
                                      color="grey lighten-1"
                                      x-small
                                      @click="deleteImage(index)"
                                    >
                                      <v-icon>close</v-icon>
                                    </v-btn>
                                  </v-app-bar>
                                  <v-app-bar
                                    v-else
                                    color="rgba(0,0,0,0)"
                                    flat
                                  >
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      fab
                                      color="grey lighten-1"
                                      x-small
                                      @click="deleteImage(index)"
                                    >
                                      <v-icon>close</v-icon>
                                    </v-btn>
                                  </v-app-bar>
                                </v-img>
                                <span v-else >
                                  <v-card-title class="pa-0 ma-0">
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      icon
                                      color="secondary"
                                      @click="deleteImage(index)"
                                    >
                                      <v-icon>close</v-icon>
                                  </v-btn>
                                  </v-card-title>
                                  <video 
                                    :src="item.src" 
                                    muted
                                    autoplay
                                    width="130px"
                                  >
                                </video> 
                                </span>
                              </v-card>
                              <span v-if="storedImages.length === 0" class="caption">
                                <span v-if="index===0">
                                  Cover Image
                                </span>
                              </span>
                            </v-col>
                          </v-row>
        
                          <v-row
                            class="mt-8"
                          >
                            <v-col
                              cols="2"
                            >
                            Description
                            </v-col>
                            <v-col
                              cols="6"
                              class="py-0 my-0"
                            >
                              <v-textarea
                                v-model="description"
                                class="py-0 my-1"
                                placeholder="description of the dish"
                                color="orange"
                                auto-grow
                                rows="1"
                                row-height="15"
                              ></v-textarea>
                            </v-col>
                          </v-row>
  
                        </v-card-text>
                      </v-card>
                    </v-item>
                  </v-col>
                </v-row>
      
                <!-- tags -->
      
                <v-row
                  id="tags"
                  class="mt-6"
                >
                  <v-col
                  >
                    <span class="title">Tags</span>
                    <v-item v-slot="{active, toggle}">
                      <v-card
                        :id="'sec_'+'4'"
                        class="secondary--text  mt-8 pa-4"
                        :class="active ? 'active-card':'businesscard'"
                        @mousedown="toggle"
                      >
                        <span :id="'span_'+'4'" v-intersect="handleIntersect"></span>
                        <v-card-subtitle>Tags</v-card-subtitle>
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
                              class="d-inline-flex ma-4 businesscard"
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
                    </v-item>
                  </v-col>
                </v-row>
      
                <!-- links -->
      
                <v-row
                  id="links"
                  class="mt-6"
                >
                  <v-col
                    class="mb-4"
                  >
                    <span class="title">Links</span>
                    <v-item v-slot="{active, toggle}">
                      <v-card
                        :id="'sec_'+'5'"
                        class="secondary--text mt-8 pl-4"
                        :class="active ? 'active-card':'businesscard'"
                        @mousedown="toggle"
                      >
                        <span :id="'span_'+'5'" v-intersect="handleIntersect"></span>
                        <v-card-title class="subtitle-1 my-2">
                          Links
                          <v-spacer></v-spacer>
                          <span class="mx-4 subtitle-1">{{links.length}}</span>
                          <v-btn
                            outlined
                            color="primary"
                            rounded
                            class="text-capitalize"
                          >
                            add
                          </v-btn>
                        </v-card-title>
                        <v-divider class="mx-4"></v-divider>
                        <v-row
                          v-for="(item, index) in links"
                          :key="index"
                          align="center"
                          justify="center"
                          class="mt-2 pa-0"
                        >
                          <v-col
                            cols="12"
                            lg="1"
                            class=""
                            align="center"
                          >
                            {{index}}
                          </v-col>
                          <v-col
                            cols="12"
                            lg="6"
                            class="pr-6"
                          >
                            <span class="secondary--text">{{item}}</span>
                            <v-divider class="primary mt-1"></v-divider>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="1"
                          >
                            <v-btn
                              text
                              icon
                              class="text-capitalize"
                              @click="copyToClipBoard(item)"
                            >
                              <v-list-item-content>
                                <v-list-item-title><v-icon>content_copy</v-icon></v-list-item-title>
                                <v-list-item-subtitle class="secondary--text">copy</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-btn>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="1"
                          >
                            <v-btn
                              text
                              icon
                              class="text-capitalize"
                              @click="generateQrLinkImage(item)"
                            >
                              <v-list-item-content>
                                <v-list-item-title><v-icon>qr_code_2</v-icon></v-list-item-title>
                                <v-list-item-subtitle class="secondary--text">Download  Qr</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-btn>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="1"
                          >
                            <v-btn
                              icon
                              @click="removeLink(index)"
                            >
                              <v-icon>close</v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>
                        <v-row
                          align="center"
                          justify="center"
                        >
                          <v-col
                            cols="12"
                            lg="10"
                          >
                          <v-divider class=""></v-divider>
                          </v-col>
                        </v-row>
                        <v-row
                          align="center"
                          justify="center"
                          class="mb-8"
                        >
                          <v-col
                            cols="12"
                            lg="10"
      
                          >
                            <v-card-title>
                              Add Link
                              <v-spacer></v-spacer>
                              <v-btn
                                outlined
                                color="primary"
                                rounded
                                class="text-capitalize"
                                @click="updateLinks"
                              >
                                update
                              </v-btn>
                            </v-card-title>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="10"
                            class="pt-0"
                          >
                            <v-list-item>
                              <v-list-item-icon>
                                1
                              </v-list-item-icon>
                              <v-list-item-content class="py-0 my-0">
                                <v-list-item-title class="py-0 my-0">
                                  <v-text-field
                                    v-model="linkUrl"
                                    label="Link"
                                    class=""
                                    color="orange"
                                    :rules="[
                                      (value) => isURL(value) || !value || 'URL is not valid',
                                    ]"
                                    validate-on-blur
                                  ></v-text-field>
                                </v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-item>
                  </v-col>
                </v-row>
              </v-item-group>
            </v-form>
          </v-col>

            <!-- sideNav -->
          <v-col
            cols="12"
            lg="2"
            align="center"
            class="px-0 mx-0"
          >
          <v-banner sticky class="pa-0 ma-0" app>
            <v-row
              align="end"
              justify="end"
            >
              <v-btn
                icon
                large
                class="pr-4"
                @click="$router.replace('.')"
              >
                <v-icon>close</v-icon>
              </v-btn>
            </v-row>
            <v-row
              class="text-h5 secondary--text px-4 font-weight-medium mb-6 mt-2"
              align="center"
              justify="center"
            >
              <v-col
                cols="12"
                class="align-center justify-center d-flex"
              >
                <Confirmation-Dialog
                  v-if="deleteButton"
                  button-text='delete'
                  title="Are you sure what to delete this Dish?"
                  @confirm="deleteDish"
                />
                <v-btn
                  rounded
                  color="success"
                  height="49px"
                  width="97px"
                  class="text-capitalize mb-4 text-h6"
                  :loading="loading"
                  @click="save()"
                >
                  {{buttonText}}
                </v-btn>
              </v-col>
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
      </v-col>
    </v-row>
    <v-snackbar
      v-model="snackbar"
      :multi-line="true"
      shaped
      :timeout="2000"
      color="error"
    >
      {{snackbarText}}
      <template #action="{ attrs }">
        <v-btn
          color="white"
          icon
          v-bind="attrs"
          @click="snackbar = false"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import ConfirmationDialog from '@/components/confirmationDialog.vue'
  import kitchens from '~/components/kitchen/kitchens.vue';
  const { v4: uuidv4 } = require('uuid');
  const mime = require('mime');
  const QRCode = require('qrcode');

  @Component({
    components: {
      ConfirmationDialog
    },
  })
  export default class addDishes extends Vue {
    visibility = true;

    loading = false;

    snackbar = false;

    search = null;

    showSmartSellerDishes = false;

    snackbarText = '';

    items= [
      'VEG',
      'NON_VEG',
    ];

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

    searchCategory = '';

    filterItems = [
      {
        title:'Best Time to Consume this dish',
        items: [
          'Breakfast',
          'Lunch',
          'Snacks',
          'Dinner',
        ],
        selectedFilter:''
      },
      {
        title:'Portion is best suited for',
        items: [
          'Light',
          'Medium',
          'Heavy',
          'Dinner',
        ],
        selectedFilter:''
      },
      {
        title:'Level of Spice',
        items: [
          'Sweetish',
          'flavoured',
          'mild',
          'medium',
          'hot',
          'very_hot',
        ],
        selectedFilter:''
      },
      {
        title:'Best Occasion to Enjoy',
        items: [
          'Meets',
        ],
        selectedFilter:''
      },
      {
        title:'Texture',
        items: [
          'Dry',
          'Wet',
          'Crushed',
          'Jelly',
        ],
        selectedFilter:''
      },
      {
        title:'Based on time',
        items: [
          'Very_fast',
          'Normal',
          'Needs_time',
        ],
        selectedFilter:''
      },
      {
        title:'Best weather',
        items: [
          'Warm',
          'Cold',
          'Rainy',
        ],
        selectedFilter:''
      }
    ];

    addDiscount=[
      '%',
      '₹',
    ]

    timer= false;

    linkUrl = '';

    textColor = '';

    startTime= null;

    showDishes =false;

    endTime= null;

    startDataMenu= false;

    modal2= false;

    endTimeMenu = false;

    selection = 0;

    tagColor = '';

    tagIcon = '';

    tagName = '';

    coverImage = '';

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

    createdTags = [] as any;

    days = [
      'Mon',
      'Tue',
      'Wen',
      'Thu',
      'Fri',
      'Sat',
      'Sun'
    ];

    navItems = [
      {
        name:'Basic',
        href:'#basic'
      },
      {
        name:'Portion',
        href:'#basic'
      },
      {
        name:'SmartSeller',
        href:'#basic'
      },
      {
        name:'Display',
        href:'#basic'
      },
      {
        name:'Tags',
        href:'#basic'
      },
      {
        name:'Links',
        href:'#basic'
      },
    ]
  
    selectedTags= [] as any;

    showExtra = false;

    showTags = false;

    tab_selected = 0 as any;

    name = '';

    price = '';

    swiggy = '';

    discount = '';

    avgTime = '';

    dishType = '';

    categories = [];

    portions = [] as any;

    extras = [] as any;

    images = [] as any;

    imagesFiles = [] as any;

    description = '';

    tags = '';

    links = [] as any;

    buttonText = 'save';

    deleteButton = false;

    categoriesData = [] as any;

    dishes = [] as any;

    selectedSmartSellerDishes = [] as any;

    qrSrc = '' as any;

    storedImages = [] as any;

    editedImageFile = '' as any;

    dishNames = [] as string[];

    selectedKitchen = [] as any;

    Kitchens = [] as {}[];

    get totalImages() {
      return this.images.length + this.storedImages.length
    }

    get filters() {
      return {
        timeToConsume: this.filterItems[0].selectedFilter.toUpperCase(),
        portionBestSuited: this.filterItems[1].selectedFilter.toUpperCase(),
        levelOfSpice: this.filterItems[2].selectedFilter.toUpperCase(),
        bestOccasion: this.filterItems[3].selectedFilter.toUpperCase(),
        texture: this.filterItems[4].selectedFilter.toUpperCase(),
        time: this.filterItems[5].selectedFilter.toUpperCase(),
        bestWeather: this.filterItems[6].selectedFilter.toUpperCase(),
        dishes : this.selectedSmartSellerDishes,
      }
    }

    removeSelectedCategory(index : number){
      this.categories.splice(index,1)
    }

    generateQrLinkImage(link: any){
      QRCode.toDataURL(link)
        .then((url: string) => {
          this.qrSrc = url;
          console.log(url)
          this.downloadURI(this.qrSrc ,'linkQr')
        })
        .catch((err: any) => {
          console.error(err)
        })
    }

    downloadURI(uri: string, name: string) {
      const link = document.createElement("a");
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    CategoryNames = [] as any;

    get category() {
      return this.categoriesData.filter((search: any) => {
        return this.searchCategory.toLowerCase().split(' ').every(v => search.name.toLowerCase().includes(v));
      });
    }

    async copyToClipBoard(text: string) {
      try {
        await navigator.clipboard.writeText(text);  
        this.snackbarText = 'Copied link to clipboard';
      } catch (error) {
        this.snackbarText = 'Failed to copy to clipboard';
      } finally {
        this.snackbar = true;
      }
    }

    isURL(str: string) {
      let url;

      try {
        url = new URL(str);
      } catch (_) {
        return false;
      }

      return url.protocol === "http:" || url.protocol === "https:";
    };

    updateLinks() {
      if (!!this.linkUrl && this.isURL(this.linkUrl)) {
        this.links.push(
          this.linkUrl
        )
        this.linkUrl = '';
      }
    }

    removeLink(index : number) {
      this.links.splice(index,1);
    }

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
      this.createdTags.splice(index , 1)
    }

    async storeImageFiles(image : File) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      const imageId = uuidv4()
      await new Promise((resolve) => {
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

    get dish() {
      return {
        businessId: this.$route.params.business,
        name: this.name,
        price: this.price,
        swiggy: this.swiggy,
        discount: this.discount,
        avgTime: this.avgTime,
        dishType: this.dishType,
        categories: this.categories,
        portions: this.portions,
        extras: this.extras,
        filters: this.filters,
        images: this.images,
        description: this.description,
        tags: this.createdTags,
        links: this.links,
        visibility: this.visibility,
        kitchenId: this.selectedKitchen.id,
      }
    }

    get portionNames() {
      const portionNames = [] as string[];
      this.portions.forEach((portion: any) => {
        portionNames.push(portion.name);
      });
      return portionNames;
    }

    get duplicatePortions() {
      return this.portionNames.length !== new Set(this.portionNames).size;
    }

    deleteImage(index: number) {
      this.images.splice(index, 1);
      this.imagesFiles.splice(index,1);
    }

    async save() {
      const form = this.$refs.form as HTMLFormElement;
      this.loading = true;
      if (form.validate()) {
        if(this.buttonText === 'save') {
          const images = [] as any;
          if(this.editedImageFile.length !== 0 ) {
            images.push(
              await this.storeImageFiles(this.editedImageFile)
            )
          }
          for( let i = 0 ; i< this.imagesFiles.length; i++) {
            const image = await this.storeImageFiles(this.imagesFiles[i]);
            images.push(
              image
            )
          };
          this.images = images;
          try {
            await this.$axios.post('/v1/dishes',this.dish,
              {
                withCredentials: true,
              }
            );
            this.$router.replace(".");
          } catch (error) {
            console.log(error)
          }
        }
        else {
          const images = [] as any;
          console.log(this.buttonText)
          if(this.editedImageFile.length !== 0 ) {
            images.push(
              await this.storeImageFiles(this.editedImageFile)
            )
            this.storedImages.splice(0,1)
          }
          for( let i = 0 ; i< this.storedImages.length; i++) {
            // if(this.storedImages[i].src.startsWith('blob')) {
            //   // images.push(
            //   //   await this.storeImageFiles(this.editedImageFile)
            //   // )
            //   this.storedImages.splice(i,1)
            // }
            // else {
            //   images.push(
            //     this.storedImages[i].src,
            //   )
            // }
            images.push(
                this.storedImages[i].src,
              )
          }
  
          for( let i = 0 ; i< this.imagesFiles.length; i++) {
            const image = await this.storeImageFiles(this.imagesFiles[i]);
            images.push(
              image
            )
          };
  
  
          // for(const image of images) {
          //   this.images.push(
          //     image,
          //   )
          // }
  
          this.images=images;
          try {
            await this.$axios.put(`v1/dishes/${this.$route.params.dish}`,this.dish,
              {
                withCredentials: true,
              }
            );
            this.$router.replace(".");
          } catch (error) {
            console.log(error)
          }
        }
      }
      this.loading=false;
    }

    addPortion() {
      this.portions.push({
        name: '',
        price: '',
        discount: '',
        default: '',
      });
    }

    addExtras() {
      this.extras.push({
        name:'',
        numOptions: 0,
        numSelections: 0,
        compulsory: 0,
        items: [],
      });
    }

    get portionName() {
      const portionNames = [] as string[];
      this.portions.forEach((portion: any) => {
        if(portion.name.length !== 0) {
          portionNames.push(portion.name)
        }
      });
      return portionNames
    }

    removePortion(index: number) {
      this.portions.splice(index, 1);
    }

    addExtra(index: number) {
      this.extras[index].numOptions += 1;
      this.extras[index].items.push({
        name: '',
        price: '',
      });
    }

    removeExtra(index: number,index1:number) {
      this.extras[index].numOptions -= 1;
      this.extras[index].items.splice(index1, 1);
      if (this.extras[index].numSelections > this.extras[index].numOptions) {
        this.extras[index].numSelections = this.extras[index].numOptions;
      }
    }

    decreaseNumSelections(index: number) {
      if (this.extras[index].numSelections) {
        this.extras[index].numSelections -= 1;
      }
      if (this.extras[index].compulsory > this.extras[index].numSelections) {
        this.extras[index].compulsory = this.extras[index].numSelections;
      }
    }

    increaseNumSelections(index: number) {
      this.extras[index].numSelections = Math.min(
        this.extras[index].numOptions,
        this.extras[index].numSelections + 1,
      );
    }
    
    decreaseCompulsory(index: number) {
      if (this.extras[index].compulsory) {
        this.extras[index].compulsory -= 1;
      }
    }

    increaseCompulsory(index: number) {
      this.extras[index].compulsory = Math.min(
        this.extras[index].numSelections,
        this.extras[index].compulsory + 1,
      );
    }

    scrollbarTheme() {
      return this.$vuetify.theme.dark ? 'dark' : 'light';
    }

    handleIntersect(entries: any){
      const intersectingElement = entries[0]
      if(intersectingElement.isIntersecting){
        const id = intersectingElement.target.id
        const index = Number(id.split("_")[1])
        this.tab_selected = index
        this.selection = index
      }
    }

    async onChangeImage(event:any) {
      const files = event.target.files;
      console.log(files)
      if(this.totalImages === 0){
        for(const file of files) {
          if (file.type.startsWith('image')) {
            this.images.push(
              {
                src:URL.createObjectURL(file),
                type:'image'
              }
            )
            this.editedImageFile=file;
            // console.log(file.type.toString().split('/')[1])
          }
          else if (file.type.startsWith('video')) {
            this.snackbar = !this.snackbar;
            this.snackbarText = 'first one should be always image'
          }
        }
      }
      else {
        for(const file of files) {
          if (file.type.startsWith('image')) {
            this.images.push(
              {
                src:URL.createObjectURL(file),
                type:'image'
              }
            )
            this.imagesFiles.push(
              file,
            )
          }
          else if (file.type.startsWith('video')) {
            const src = await this.getVideoCover(file);
            this.images.push(
              {
                src,
                type:'image'
              }
            )
            this.imagesFiles.push(
              file,
            )
            console.log(file);
          }
        }
        // this.images = images;
      }
    }

    oneditImage(event:any) {
      const files = event.target.files;
      console.log(files)
      for(const file of files) {
        if (file.type.startsWith('image')) {
          this.images.splice(0,1,{
            src:URL.createObjectURL(file),
            type:'image'
          })
          this.editedImageFile = file;
          console.log(this.images[0])
        }
      }
    }

    oneditStoredImage(event:any) {
      const files = event.target.files;
      console.log(files)
      for(const file of files) {
        if (file.type.startsWith('image')) {
          this.storedImages.splice(0,1,{
            src:URL.createObjectURL(file),
            type:'image'
          })
          this.editedImageFile = file;
          console.log(this.images[0])
        }
      }
    }

    deleteStoredImage(index:number) {
      this.storedImages.splice(index,1)
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

    async deleteDish() {
      try {
         await this.$axios.delete(`v1/dishes/${this.$route.params.dish}`,
           {
               withCredentials: true,
           },
         );
         this.$router.replace(".");
       } catch (error: any) {
        const errorMessage = error.response.data.errors[0].message;
        console.log(errorMessage)
      }
    }

    async mounted() {
      try {
        const {data} =await this.$axios.get(`/v1/kitchens?businessId=${this.$route.params.business}`,
        {
            withCredentials: true,
        },
        )
        this.Kitchens = data
      } catch (error) {
        console.log(error)
      }

      if(this.$route.params.dish === 'null'){
        this.deleteButton = false;
        this.buttonText = 'save';
      }
      else {
        try {
          const { data } = await this.$axios.get(`v1/dishes/${this.$route.params.dish}`,
            {
                withCredentials: true,
            },
          );
          console.log(data)
          this.name = data.name;
          this.price = data.price;
          this.swiggy = data.swiggy;
          this.discount = data.discount;
          this.avgTime = data.avgTime;
          this.dishType = data.dishType;
          this.categories = data.categories;
          this.portions = data.portions;
          this.extras = data.extras;
          // this.images = data.images;
          this.description = data.description;
          this.createdTags = data.tags;
          this.selectedKitchen = this.Kitchens.find((kitchen: any)=>kitchen.id === data.kitchenId)
          this.links = data.links;
          this.visibility = data.visibility;
          this.buttonText='update'
          this.deleteButton=true;
          // console.log(mime.getType(this.images[1].split('.')[3]))
          // filters data
          for(const [index,  [, value]] of Object.entries(Object.entries(data.filters))) {
            if(index === '7') {
              this.selectedSmartSellerDishes=value;
            }
            else {
              const i = Number(index);
              const v= value as string;
              this.filterItems[i].selectedFilter = v;
            }
          }
          // images data
          const images = data.images;
          for( let i = 0 ; i< images.length; i++) {
            const type = mime.getType(images[i].split('.')[3])
            
            if(type.toString().split('/')[0]==='video') {
              this.storedImages.push(
                {
                  src:images[i],
                  type:'video'   
                }
              )
            }
            else {
              this.storedImages.push(
                {
                  src:images[i],
                  type:'image'   
                }
              )
            }
          }
        } catch (error: any) {
          // const errorMessage = error.response.data.errors[0].message;
          console.log(error)
        }
      }

      try {
        const {data} =await this.$axios.get(`/v1/dishes/${this.$route.params.business}/categories`,
          {
            withCredentials: true,
          },
        )
        this.categoriesData = data;
        // console.log(data.length)
      } catch (error) {
        console.log(error)
      }
      
      try {
        const {data} =await this.$axios.get(`/v1/categories/${this.$route.params.business}/dishes`,
        {
            withCredentials: true,
        },
        )
        this.dishes = data
      } catch (error) {
        console.log(error)
      }

      const dishNames = [] as any;
      this.dishes.forEach((dish: any) => {
        if (this.deleteButton) {
          if (this.name !== dish.name) {
            dishNames.push(dish.name);
          }
        } else {
          dishNames.push(dish.name);
        }
      });
      this.dishNames = dishNames;
    }
    
  }
</script>
