<template>
  <v-container fluid class="px-0">
    <v-row class="pt-0">
      <v-col class="pt-0">
        <v-card
        flat
        class="rounded-0"
        height="50px"
        color="secondary"
        >
        </v-card>
      </v-col>
    </v-row>
    <v-card
      rounded-xl
      class="rounded-xl rounded-b-0 mt-n8"
      flat
    >
      <v-row
        v-if="$vuetify.breakpoint.mdAndUp"
        class=""
      >
        <v-col
          cols="12"
          class="pb-0 mb-0"
        >
          <v-row
            class="pa-0 ma-0"
            align="center"
            justify="center"
          >
            <v-col
              v-if="zoneType === 'DINE_IN'"  
              cols="12"
              xl="2"
              lg="2"
            >
              <v-combobox
                v-model="selectedTable"
                outlined
                class="rounded-lg"
                append-icon="expand_more"
                :items="tables"
                @change="updateTable"
              >
                <template #label>
                  <span class="accent--text">Table</span>
                </template>
                <template #item="data">
                    <span >{{data.item.name}}</span>
                </template>
                <template #selection="data">
                  <span >{{data.item.name}}</span>
                </template>
              </v-combobox>
            </v-col>
            
            <v-col
              cols="12"
              xl="8"
              lg="8"
              align="center"
            >
              <v-tabs
                v-model="tab"
                fixed-tabs
                icons-and-text
                class="text-capitalize"
              >

                <v-tab href="#tab-1" class="text-capitalize">
                  <v-badge
                    :content="addedToCart.length"
                    color="primary"
                    overlap
                  >
                    <v-icon>restaurant_menu</v-icon> <br>
                    cart
                  </v-badge>
                </v-tab>

                <!-- <v-tab href="#tab-2" class="text-capitalize">
                  status
                  <v-icon>restaurant_menu</v-icon> 
                </v-tab> -->

                <v-tab v-if="zoneType === 'DINE_IN'"  href="#tab-2" class="text-capitalize">
                  kot
                  <v-icon>receipt_long</v-icon> 
                </v-tab>
                <v-tab href="#tab-3" :disabled="tab==='tab-3'?false:true" class="text-capitalize">
                  settle
                  <v-icon>credit_score</v-icon>
                </v-tab>
              </v-tabs>
            </v-col>
            
            <v-col
              align="end"
            >
              <v-btn
                icon
                x-large
                class="mr-2"
                @click="close"
              >
                <v-icon
                  color="#1C1B1F"
                >
                  close
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
        </v-col>
      </v-row>

      <v-divider class="mx-8"></v-divider>

      <v-row class="pt-0 mt-0">
        <v-col
          v-if="$vuetify.breakpoint.mdAndUp"
          cols="12"
          lg="3"
        >
          <v-card >
            <v-card-title v-if="zoneType === 'DINE_IN'"  class="secondary--text">
              <span class="text-h6">Table {{ $store.getters['zone/tableNameById'](tableId)  }}</span>
              <span class="mx-2">({{ $store.getters['zone/zoneNameById'](tableId)  }})</span>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                text
                class="text-capitalize text-h6"
              >
                items
              </v-btn>
            </v-card-title>
            <v-card-title
              class="secondary--text subtitle-1 pt-0 mt-0"
            >
              category
            </v-card-title>
            <v-card 
              class="ma-4 status"
              flat
              @click="dishesBasedOnCategories('All')"
            >
              <V-card-title
                class="secondary--text"
              >
                Most ordered
              </V-card-title>
            </v-card>
            <v-card
              class="overflow-auto"
              flat
              min-height="80vh"
            >
              <v-list 
              >
                <v-list-item-group
                >
                  <span
                    v-for="(item, index) in categories"
                    :key="index"
                  >
                    <v-list-item
                      @click="dishesBasedOnCategories(item.id)"
                    >
                      <v-list-item-icon>
                        <v-icon
                          :color="`#${Math.floor(Math.random()*16777215).toString(16)}`"
                        >
                          mdi-star
                        </v-icon>
                      </v-list-item-icon>
      
                      <v-list-item-content>
                        <v-list-item-title >{{ item.name }}</v-list-item-title>
                      </v-list-item-content>
      
                      <v-list-item-action>
                        12
                      </v-list-item-action>
                    </v-list-item>
                    <v-divider class="mx-4"></v-divider>
                  </span>
                </v-list-item-group>
              </v-list>
            </v-card>
          </v-card>
        </v-col>
        <v-col
          v-if="$vuetify.breakpoint.mdAndUp"
          cols="12"
          lg="6"
        >
          <v-card
            flat
          >
            <v-card-title class="subtitle-1 py-0 my-0">
              Dishes
            </v-card-title>
            <v-card-title class="py-0 my-0">
              <v-text-field
                v-model="searchDishes"
                label="search"
                append-icon="search"
              ></v-text-field>
              <v-btn
                icon
                color="accent"
                class="ml-4"
              >
                <v-icon
                >
                  filter_alt
                </v-icon>
              </v-btn>
            </v-card-title>
            <v-card
              flat
              class="overflow-auto"
              max-height="80vh"
            >
              <v-row
                class="ma-2"
              >
                <v-col
                  v-for="(item,index) in dishesData"
                  :key="index"
                  cols="12"
                  lg="4"
                  md="4"
                  sm="6"
                >
                  <v-card
                    class="ma-2 dishcard"
                    flat
                  >
                    <v-alert
                      border="left"
                      colored-border
                      :color="dishTypeBasedColor(item.dishType)"
                      elevation=""
                      class="mb-0 pb-0 secondary--text"
                      min-height="100px"
                      @click="openDish(item)"
                    >
                      {{ item.name }}
                    </v-alert>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
          </v-card>
        </v-col>
        <v-col
          cols="12"
          lg="3"
          class="px-0 mx-0"
        >
          <v-card-title class="pa-0">
            <v-spacer></v-spacer>
              <v-text-field
                v-model="customerName"
                color="primary"
                label="CustomerName"
              ></v-text-field>
            <v-spacer></v-spacer>
              <v-btn
                v-if="$vuetify.breakpoint.smAndDown"
                icon
                small
                class="mx-4"
                @click="close"
              >
                <v-icon
                  color="#1C1B1F"
                >
                  close
                </v-icon>
              </v-btn>
          </v-card-title>
          <v-card-title v-if="$vuetify.breakpoint.smAndDown" class="py-0 my-0 mt-1">
            <v-row class="pa-0 ma-0">
              <v-col cols="8" class="pa-0 ma-0">
                <v-combobox
                  v-model="selectedTable"
                  outlined
                  class="rounded-lg"
                  append-icon="expand_more"
                  :items="tables"
                  @change="updateTable"
                >
                  <template #label>
                    <span class="accent--text">Table</span>
                  </template>
                  <template #item="data">
                      <span >{{data.item.name}}</span>
                  </template>
                  <template #selection="data">
                    <span >{{data.item.name}}</span>
                  </template>
                </v-combobox>
              </v-col>
              <v-col class="pa-0 ma-0">
                <span class="mx-2">({{ $store.getters['zone/zoneNameById'](tableId)  }})</span>
              </v-col>
            </v-row>
          </v-card-title>
          <!-- <v-card-title class="pa-0"><v-spacer></v-spacer><v-divider class="secondary"></v-divider> <v-spacer></v-spacer></v-card-title> -->
          <v-tabs-items v-model="tab">
            <v-tab-item
              :value="'tab-' + 4"
            >
              <v-card
                flat
                class="px-4"
              >
              <v-card-title class="subtitle-1 py-0 my-0">
                Dishes
              </v-card-title>
              <v-card-title class="py-0 my-0">
                <v-text-field
                  v-model="searchDishes"
                  label="search"
                  append-icon="search"
                ></v-text-field>
                <v-btn
                  icon
                  color="accent"
                  class="ml-4"
                >
                  <v-icon
                  >
                    filter_alt
                  </v-icon>
                </v-btn>
              </v-card-title>
              <v-card
                flat
                class="overflow-auto"
                max-height="43vh"
              >
                <v-row
                  class="ma-2"
                >
                  <v-col
                    v-for="(item,index) in dishesData"
                    :key="index"
                    cols="12"
                    lg="4"
                    md="4"
                    sm="6"
                  >
                    <v-card
                      class="ma-2 dishcard"
                      flat
                    >
                      <v-alert
                        border="left"
                        colored-border
                        :color="dishTypeBasedColor(item.dishType)"
                        elevation=""
                        class="mb-0 pb-0 secondary--text"
                        min-height="100px"
                        @click="openDish(item)"
                      >
                        {{ item.name }}
                      </v-alert>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card>
              <div class="text-center">
                <v-menu
                  top
                  offset-y
                >
                  <template #activator="{ on, attrs }">
                    <v-btn
                      class="status text-capitalize elevation-0 black--text px-16 rounded-lg"
                      plain
                      x-large
                      v-bind="attrs"
                      v-on="on"
                    >
                      categories
                    </v-btn>
                  </template>
  
                  <v-card
                    class="overflow-auto"
                    flat
                    min-height="20vh"
                  >
                    <v-list 
                    >
                      <v-list-item-group
                      >
                        <span
                          v-for="(item, index) in categories"
                          :key="index"
                        >
                          <v-list-item
                            @click="dishesBasedOnCategories(item.id)"
                          >
                            <v-list-item-icon>
                              <v-icon
                                :color="`#${Math.floor(Math.random()*16777215).toString(16)}`"
                              >
                                mdi-star
                              </v-icon>
                            </v-list-item-icon>
            
                            <v-list-item-content>
                              <v-list-item-title >{{ item.name }}</v-list-item-title>
                            </v-list-item-content>
            
                            <v-list-item-action>
                              12
                            </v-list-item-action>
                          </v-list-item>
                          <v-divider class="mx-4"></v-divider>
                        </span>
                      </v-list-item-group>
                    </v-list>
                  </v-card>
                </v-menu>
                <v-spacer></v-spacer>
              </div>
            </v-card>
            </v-tab-item>
            <v-tab-item
              :value="'tab-' + 1"
            >
              <cart
                :added-to-cart="addedToCart"
                :discount="discount"
                :tax="tax"
                @conform="conformToCook"
                @openEditDialog="openEditDialog"
              />
            </v-tab-item>
            <v-tab-item
              :value="'tab-' + 2"
            >
              <v-card-title class="secondary--text py-0">
                Cart
              </v-card-title>
              <kot
                :table-id="tableId"
                @conformToSettle="conformToSettle"
              />
            </v-tab-item>
            <v-tab-item
              :value="'tab-' + 3"
            >
              <v-card-title class="secondary--text py-0">
                Cart
              </v-card-title>
              <settle
                :table-id="tableId"
                :zone-type="zoneType"
                :zone-id="zoneId"
                :dishes-added-to-cart="addedToCart"
                @close="clearCart"
              />
            </v-tab-item>
          </v-tabs-items>
        </v-col>
      </v-row>
    </v-card>

    <v-bottom-navigation
      v-if="$vuetify.breakpoint.smAndDown"
      fixed 
      app
      grow
    >
      <v-tabs
        v-model="tab"
        hide-slider
        icons-and-text
        show-arrows
        class="text-capitalize px-0 mx-0"
      >
        <v-tab href="#tab-4" class="text-capitalize pb-2">
          items
          <v-icon>restaurant_menu</v-icon>
        </v-tab>
        <v-tab href="#tab-1" class="text-capitalize pb-2 my-0">
          status
          <v-icon>restaurant_menu</v-icon> 
        </v-tab>
        <v-tab href="#tab-2" class="text-capitalize pb-2">
          kot
          <v-icon>receipt_long</v-icon> 
        </v-tab>
        <v-tab href="#tab-3" class="text-capitalize pb-2">
          settle
          <v-icon>credit_score</v-icon>
        </v-tab>
      </v-tabs>
    </v-bottom-navigation>
    <v-dialog
      v-model="dialog"
      persistent
      max-width="700px"
    >
      <v-card
        class="cardborder"
        flat
      >
        <v-card-title class="secondary--text">
          {{ selectedDish.name }}
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="dialog = false"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
          <v-card-actions class="my-0">
            <v-spacer></v-spacer>
            <v-chip
              color="primary"
              rounded
              outlined
            >
              <v-btn
                icon
                small
                color="primary"
                @click="decreaseDishQty"
              >
                <v-icon small>remove</v-icon>
              </v-btn>
              {{ dishQty }}
              <v-btn 
                icon
                color="primary"
                @click="increaseDishQty"
              >
                <v-icon small>add</v-icon>
              </v-btn>
            </v-chip>
            <v-spacer></v-spacer>
          </v-card-actions>
        <v-row>
          <v-col class="mx-6">
            <v-text-field
              v-model="selectedDish.instructions"
              label="Instructions"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="12"
            class="my-0 py-0"
          >
            <v-card-title class="secondary--text font-weight-bold">Choose a portion </v-card-title>
            <v-card style="border: 1px solid orange;" class="mx-16" flat>
              <v-card-subtitle class="font-weight-bold secondary--text" >
                Portion
              </v-card-subtitle>
              <v-radio-group
                v-model="selectedPortion"
                column
                class="pt-0 mt-0"
              >
                <v-card-title
                  v-for="(portion,index) in selectedDish.portions"
                  :key="index"
                  class="subtitle-2 py-1 grey--text"
                >
                  {{portion.name}}
                  <v-spacer></v-spacer>
                  ₹{{portion.price}} &nbsp;
                  <v-radio
                    
                    :value="portion" />
                </v-card-title>
              </v-radio-group>
            </v-card>
          </v-col>
          <v-col
            cols="12"
          >
            <v-card-title class="mx-16 secondary--text font-weight-bold">Extras</v-card-title>
            <v-card-text class="mx-16">
              <v-chip-group
                v-model="selectedExtras"
                mandatory
                column
                active-class="primary--text"
                @change = "extra"
              >
                <v-chip
                  v-for="(extra,index) in selectedDish.extras"
                  :key="index"
                  :value="extra"
                >
                  {{ extra.name }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
            <v-card style="border: 1px solid orange;" class="mx-16" flat>
              <!-- <v-card-subtitle class="font-weight-bold secondary--text" >
                Extras
              </v-card-subtitle> -->
              <v-card-title
                v-for="(extra, index) in extras"
                :key="index"
                class="subtitle-2 py-0 grey--text"
              >
                {{ extra.name }}
                <v-spacer></v-spacer>
                ₹{{ extra.price }}
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  small
                  color="primary"
                  @click="removeExtraQty(index)"
                >
                  <v-icon small>remove</v-icon>
                </v-btn>
                 {{ extra.qty }}
                <v-btn 
                  icon 
                  color="primary"
                  @click="addExtraQty(index)"
                >
                  <v-icon small>add</v-icon>
                </v-btn>
              </v-card-title>
            </v-card>
          </v-col>
          <v-card-actions class="my-6">
            <v-spacer></v-spacer>
              <v-btn
                color="primary"
                rounded
                class="px-4"
                @click="add"
              >
                add
              </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-row>
        <v-card-title class="red--text caption pt-0 mt-0">
          <v-spacer></v-spacer>
          <span>{{errorText}}</span>
          <v-spacer></v-spacer>
        </v-card-title>
      </v-card>
    </v-dialog>
    <!-- editDialog -->
    <v-dialog
      v-model="editDialog"
      persistent
      max-width="700px"
    >
      <v-card
        class="cardborder"
        flat
      >
        <v-card-title class="secondary--text">
          {{ addedDishesToCart[editIndex]?.name }}
          <v-spacer></v-spacer>
          <v-btn
            icon
            @click="editDialog = false"
          >
            <v-icon>close</v-icon>
          </v-btn>
        </v-card-title>
          <v-card-actions class="my-0">
            <v-spacer></v-spacer>
            <v-chip
              color="primary"
              rounded
              outlined
            >
              <v-btn
                icon
                small
                color="primary"
                :disabled="addedToCart[editIndex]?.dish.qty===1 ? true:false"
                @click="decreaseEditDishQty"
              >
                <v-icon small>remove</v-icon>
              </v-btn>
              {{ addedToCart[editIndex]?.dish.qty  }}
              <v-btn 
                icon
                color="primary"
                @click="increaseEditDishQty"
              >
                <v-icon small>add</v-icon>
              </v-btn>
            </v-chip>
            <v-spacer></v-spacer>
          </v-card-actions>
          <v-card-title>
            <v-spacer></v-spacer>
            <v-btn
              rounded
              color="primary"
              class="text-capitalize"
              @click="removeDishAddedToCart"
            >
              remove Dish
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-title>
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="12"
            class="my-0 py-0"
          >
            <v-card-title class="secondary--text font-weight-bold">Choose a portion </v-card-title>
            <v-card style="border: 1px solid orange;" class="mx-16" flat>
              <v-card-subtitle class="font-weight-bold secondary--text" >
                Portion
              </v-card-subtitle>
              <v-radio-group
                v-model="selectedPortion"
                column
                class="pt-0 mt-0"
              >
                <v-card-title
                  v-for="(portion,index) in addedDishesToCart[editIndex]?.portions"
                  :key="index"
                  class="subtitle-2 py-1 grey--text"
                >
                  {{portion.name }}
                  <v-spacer></v-spacer>
                  ₹{{portion.price}} &nbsp;
                  <v-radio
                    
                    :value="portion" />
                </v-card-title>
              </v-radio-group>
            </v-card>
          </v-col>
          <v-col
            cols="12"
          >
            <v-card-title class="mx-16 secondary--text font-weight-bold">Extras</v-card-title>
            <v-card-text class="mx-16">
              <v-chip-group
                v-model="selectedExtras"
                mandatory
                column
                active-class="primary--text"
                @change = "extra"
              >
                <v-chip
                  v-for="(extra,index) in addedDishesToCart[editIndex]?.extras"
                  :key="index"
                  :value="extra"
                >
                  {{ extra.name }}
                </v-chip>
              </v-chip-group>
            </v-card-text>
            <v-card style="border: 1px solid orange;" class="mx-16" flat>
              <!-- <v-card-subtitle class="font-weight-bold secondary--text" >
                Extras
              </v-card-subtitle> -->
              <v-card-title
                v-for="(extra, index) in extras"
                :key="index"
                class="subtitle-2 py-0 grey--text"
              >
                {{ extra.name }}
                <v-spacer></v-spacer>
                ₹{{ extra.price }}
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  small
                  color="primary"
                  @click="removeExtraQty(index)"
                >
                  <v-icon small>remove</v-icon>
                </v-btn>
                 {{ extra.qty }}
                <v-btn 
                  icon 
                  color="primary"
                  @click="addExtraQty(index)"
                >
                  <v-icon small>add</v-icon>
                </v-btn>
              </v-card-title>
            </v-card>
          </v-col>
          <v-card-actions class="my-6">
            <v-spacer></v-spacer>
              <v-btn
                color="primary"
                rounded
                class="px-4"
                @click="add"
              >
                add
              </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-row>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import cart from './cart.vue';
  import kot from './kot.vue';
  import settle from './settle.vue'; 

  @Component({
    components: {
      cart,
      kot,
      settle,
    },
  })
  export default class Menu extends Vue {
    @Prop({ default: '' }) readonly tableId!: any;
    @Prop({ default: '' }) readonly zoneType!: any;
    @Prop({ default: '' }) readonly zoneId!: any;
    @Prop({ default: '' }) readonly tables!: any;
    @Prop({ default: '' }) readonly TakeAwaycustomerName!: any;
    @Prop({ default: '' }) readonly TakeAwayphoneNumber!: any;

    showSearch = false;

    selectedPortion = null;

    editDialog = false;

    editIndex = "" as any;

    fab = false;

    errorText = ''

    selectedExtras = {} as any;

    selectedTable = [] as any;

    tab = null as any;

    dialog = false;

    dishes = [] as any;

    categories = [] as any;

    selectedDish = {} as any;

    addedToCart = [] as any;

    extras = [] as any;

    extrasAddedToCart = [] as any;

    discount = 0;

    tax = 0;

    dishQty = 1;

    customerName = '';

    searchDishes = '';

    addedDishesToCart = [] as any;

    removeDishAddedToCart() {
      // this.editIndex = '';
      this.editDialog = false;
      this.extras = [];
      this.selectedPortion = null;
      this.addedToCart.splice(this.editIndex, 1);
      this.addedDishesToCart.splice(this.editIndex, 1);
    }
    
    dishesBasedOnCategories(id:any) {
      if(id==='All') {
        this.dishes = this.$store.state.zone.dishes;
      } else {
        this.dishes =this.$store.getters['zone/dishes'](id);
      }
    }

    dishTypeBasedColor(type: string) {
      if(type === 'VEG') {
        return 'success'
      } else if(type === 'NON_VEG') {
        return 'error'
      } else {
        return 'warning'
      }
    }

    updateTable() {
      this.$emit('changeTable',this.selectedTable.id)
    }

    openEditDialog(index: any) {
      this.extras = [];
      this.selectedPortion = null;
      this.editIndex = index;
      this.editDialog = true;
      this.extras = this.addedToCart[index].dish?.extras;
      this.selectedPortion = this.addedToCart[index].dish?.portions;
    }

    get dishesData() {
      return this.dishes.filter((search: any) => {
        return this.searchDishes.toLowerCase().split(' ').every(v => search.name.toLowerCase().includes(v));
      });
    }

    get dish() {
      const dish = {
        dishId: this.selectedDish.id,
        name: this.selectedDish.name,
        price: this.selectedDish.price,
        qty: this.dishQty,
        comments: 'spicy',
        extras: this.extrasAddedToCart.filter((extra: any) => extra.qty !== 0),
        portions: this.selectedPortion,
      }
      return dish
    }

    add() {
      if(this.customerName.length !== 0) {
        if(this.zoneType==='DINE_IN'){
          this.addedToCart.push({
            businessId: this.$route.params.business,
            kitchenId: this.selectedDish.kitchenId,
            zoneId: this.$route.params.zone,
            tableId: this.tableId,
            staffId: '5',
            dish: this.dish,
            customerName: this.customerName,
            customerPhone: '123',
            instructions: this.selectedDish.instructions,
          })
          if(this.selectedDish.discount > 0) {
            this.discount += (this.selectedDish.price*this.dishQty*this.selectedDish.discount)/100;
          }
          const a = this.selectedDish.price*this.dishQty;
          const b = (this.selectedDish.price*this.dishQty*this.selectedDish.discount)/100;
          if(this.selectedDish.tax > 0) {
            this.tax += ((a-b)*(this.selectedDish.tax/100)*0.5) ;
          };
          this.addedDishesToCart.push(this.selectedDish);
        }
        else {
          this.addedToCart.push({
            businessId: this.$route.params.business,
            kitchenId: this.selectedDish.kitchenId,
            zoneId: this.zoneId,
            tableId: this.tableId,
            staffId: '5',
            dish: this.dish,
            customerName: this.customerName,
            customerPhone: '123',
            instructions: this.selectedDish.instructions,
          })
          if(this.selectedDish.discount > 0) {
            this.discount += (this.selectedDish.price*this.dishQty*this.selectedDish.discount)/100;
          }
          const a = this.selectedDish.price*this.dishQty;
          const b = (this.selectedDish.price*this.dishQty*this.selectedDish.discount)/100;
          if(this.selectedDish.tax > 0) {
            this.tax += ((a-b)*(this.selectedDish.tax/100)*0.5) ;
          };
          this.addedDishesToCart.push(this.selectedDish);
        }
        this.extrasAddedToCart = [];
        this.extras = [];
        this.dialog = false;
        this.dishQty = 1;
        this.tab = 'tab-1'
        this.errorText = ''
      }
      else {
        this.errorText = '* Please Enter Customer Name'
      }
    }

    addExtraQty(index:any) {
      const existingItem = this.extrasAddedToCart.find((item: any) => {
        return this.extras[index].name === item.name;
      });
      if(existingItem) {
        existingItem.qty++;
      } else {
        this.extras[index].qty++;
        this.extrasAddedToCart.push(this.extras[index]);
      }
    }

    async conformToCook(){
      if(this.zoneType==='DINE_IN') {
        try {
          await this.$axios.post(`/v1/kitchens/kitchenId/kots`,{
            kots:this.addedToCart,
          },
            {
              withCredentials: true,
            }
          );
          if(this.zoneType === 'DINE_IN'){
            await this.$store.dispatch('zone/getZoneOrders',this.$route.params.zone)
          }
          else{
            await this.$store.dispatch('zone/getZoneOrders',this.zoneId)
          }
          this.tab = 'tab-2';
          this.addedToCart = [];
        } catch (error) {
          console.log(error)
        }
      } else {
        this.tab = 'tab-3';
      }
    }

    conformToCookTakeAway() {
      this.tab = 'tab-3';
    }

    removeExtraQty(index:any) {
      if (this.extras[index].qty) {
        this.extras[index].qty -= 1;
      }
    }

    extra() {
      this.extras = [];
        for(let i=0; i<this.selectedExtras.items.length; i++) {
          const existingItem = this.extrasAddedToCart.find((item:any) => {
            return this.selectedExtras.items[i].name === item.name;
          });
          if(existingItem) {
            this.extras.push(existingItem)
          } else {
            this.extras.push(
            {
              name: this.selectedExtras.items[i].name,
              price: this.selectedExtras.items[i].price,
              qty: 0
            }
          )
          }
        }
    }
    
    increaseDishQty(){
      this.dishQty++;
    }

    decreaseDishQty() {
      if(this.dishQty != 1){
        this.dishQty-=1;
      }
    }

    openDish(dish:any) {
      this.selectedDish = dish;
      this.selectedDish.instructions = '';
      this.selectedExtras = [];
      this.extras = [];
      this.dialog = true;
    }

    get color() {
      const hex = `#${Math.floor(Math.random()*16777215).toString(16)}`;
      return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }

    async openKitchen(id:string) {
      try {
        const {data} =await this.$axios.get(`/v1/kitchens/${this.tableId}/kots?tableId=${this.tableId}`,
          {
            withCredentials: true,
          },
        )
        console.log(data)
      } catch (error) {
        console.log(error)
      }
      this.dialog = true;
    }

    async mounted() {
      this.dishes = this.$store.state.zone.dishes;
      this.categories = this.$store.state.zone.categories;
      await this.$store.dispatch('zone/getZoneOrders',this.$route.params.zone)
      this.customerName = this.$store.getters['zone/customerName'](this.tableId)
      if(this.zoneType !='DINE_IN') {
        this.customerName = this.TakeAwaycustomerName;
      }
    }

    clearCart() {
      this.addedToCart = [];
      this.$emit('close','');
    }

    close() {
      this.$emit('close','');
    }

    async conformToSettle() {
      await this.$store.dispatch('zone/getZoneOrders',this.$route.params.zone);
      this.tab= 'tab-3';
    }

    increaseEditDishQty() {
      this.addedToCart[this.editIndex].dish.qty++;
    }

    decreaseEditDishQty() {
      this.addedToCart[this.editIndex].dish.qty--;
    }
  }
</script>

<style>
  .dishcard {
    border-width: 0.5px 0.5px 0.5px 0 !important;
    border-style: solid !important;
    border-color: rgba(0 0 0 /60%) !important;
    border-radius: 0 6px 6px 0 !important;
  }

  .billborder {
    border-top-style: dashed;
    border-bottom-style: dashed;
    border-color: #023047;
    margin: auto;
  }
  /* stylelint-disable */
  #create .v-speed-dial {
    position: absolute;
  }

  #create .v-btn--floating {
    position: relative;
  }

  </style>