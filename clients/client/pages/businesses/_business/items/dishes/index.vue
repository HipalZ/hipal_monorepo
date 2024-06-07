<template>
  <v-container fluid class="pa-0">
    <v-row
      class="mx-4 mt-2"
    >
      <v-col
        cols="12"
        lg="12"
        class=""
      >
        <v-row
          class="text-h5 secondary--text px-6 font-weight-medium mb-1"
        >
          Manage Dishes 
          <span>({{dishes.length}} dishes)</span>
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
            large
            @click="showSearch = !showSearch"
          >
            <v-icon
              :color="showSearch?'primary':'#1C1B1F'"
            >search</v-icon>
          </v-btn>
          <v-menu offset-y rounded-xl min-width="300px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                icon
                large
                v-bind="attrs"
                v-on="on"
                class="mr-2"
              >
                <v-icon
                  color="#1C1B1F"
                >
                  filter_alt
                </v-icon>
              </v-btn>
            </template>
            <v-list
              class="businesscard"
            >
            <v-list-item-group v-model="sortBy">
              <v-list-item
                v-for="(item, index) in filters"
                :key="index"
                link
                :value="item"
                color="primary"
              >
                <v-list-item-title>{{ item }}</v-list-item-title>
              </v-list-item>
            </v-list-item-group>
            </v-list>
          </v-menu>
          <input
            ref="excelFile"
            type="file"
            v-show="false"
            accept=".csv"
            @change="onChangeFile"
          >
          <v-btn 
            rounded
            color="primary"
            outlined
            class="text-capitalize mr-2 text-h6"
            height="49px"
            style="background-color: white;"
            href="/dishes.csv"
          >
            Download excel sample
          </v-btn>
          <v-btn 
            rounded
            color="primary"
            outlined
            class="text-capitalize mr-2 text-h6"
            height="49px"
            style="background-color: white;"
            :loading="loading"
            @click="$refs.excelFile.click()"
          >
            add from excel
          </v-btn>
          <v-btn
            rounded
            color="primary"
            height="49px"
            width="97px"
            class="text-capitalize text-h6"
            to="dishes/null"
          >
            Add
          </v-btn>
        </v-row>
        <Dish
          :filteredDishes="filteredDishes"
          :dishName="dishName"
        />
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
      <template v-slot:action="{ attrs }">
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
  const Papa = require('papaparse');
  import Dish from'@/components/items/dishes/dish.vue';

  @Component({
    components: {
      Dish,
    },
  })
  export default class Dishes extends Vue {

    content = 'Medium with really  long name mushroom Burger chicken';

    dishes = [] as any;

    showSearch = false;

    excelData = [] as any;

    sortBy = 'name';

    loading = false;

    dishName = '';

    snackbar = false;

    snackbarText = '';

    kitchens = [];

    filters = [
      'Clear Filters',
      'Visibility ON',
      'Visibility Off',
      'With NO Categories',
      'Price - Low to high',
      'Price - High to low',
      'Tags',
      // 'Types',
      'Dishes with no media',
    ];

    dishNames = [] as any;

    get filteredDishes() {
      switch (this.sortBy) {
        case 'Clear Filters':
          return this.dishes.sort((a:any, b:any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        case 'Visibility ON':
          return this.dishes.filter((dish: any) => dish.visibility);
        case 'Visibility Off':
          return this.dishes.filter((dish: any) => !dish.visibility);
        case 'With NO Categories':
          return this.dishes.filter((dish: any) => dish.categories.length === 0);
        case 'Price - Low to high':
          return this.dishes.sort((dish1: any, dish2: any) => dish1.price - dish2.price);
        case 'Price - High to low':
          return this.dishes.sort((dish1: any, dish2: any) => dish2.price - dish1.price);
        case 'Tags':
          return this.dishes.filter((dish: any) => dish.tags.length !== 0);
        // case 'Types':
        //   return this.dishes.filter();
        case 'Dishes with no media':
          return this.dishes.filter((dish: any) => dish.images.length === 0);
        default:
          break;
      }
      return this.dishes.sort((a:any, b:any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    async getDishes() {
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
      await this.getDishes();
      const dishTypes = ['VEG', 'NON_VEG'];
      this.dishes.forEach((dish: any) => {
        if (!dishTypes.includes(dish.dishType)) {
          dishTypes.push(dish.dishType);
        }
        this.dishNames.push(dish.name)
      });
      this.$store.commit('updateDishTypes', dishTypes);
      try {
        const {data} =await this.$axios.get(`/v1/kitchens?businessId=${this.$route.params.business}`,
        {
            withCredentials: true,
        },
        )
        this.kitchens = data;
      } catch (error) {
        console.log(error)
      }
    }

    onChangeFile(event:any) {
      this.loading = true;
      const file = event.target.files;
      console.log(file)
      Papa.parse(file[0], {
        header: true,
        complete: (results:any)=> {
          console.log("Finished:", results.data);
          this.excelData=results.data;
          this.saveExcelData();
        }
      });
    }


    async saveExcelData() {
      this.loading=true;
      for( let i = 0 ; i< this.excelData.length; i++) {
        if (!this.excelData[i].name) {
          continue;
        }
        if(!this.dishNames.includes(this.excelData[i].name)) {
          const kitchenId = this.kitchens.find((kitchen: any)=>kitchen.kitchenName===this.excelData[i].kitchenName) as any;
          if (!kitchenId || !kitchenId.id) {
            continue;
          }
          try {
            await this.$axios.post('/v1/dishes',
            {
              businessId: this.$route.params.business,
              name: this.excelData[i].name,
              price: this.excelData[i].price,
              avgTime: this.excelData[i].avgTime,
              dishType: this.excelData[i].dishType,
              kitchenId: kitchenId.id,
              description: this.excelData[i].description,
            },
              {
                withCredentials: true,
              }
            );
            this.getDishes();
          } catch (error) {
            console.log(error)
          }
        }
        else{
          this.snackbarText = `Dish name: ${this.excelData[i].name} already exits`
          this.snackbar = true;
        }
      }
      this.loading=false;
    }
    
  }
  </script>
