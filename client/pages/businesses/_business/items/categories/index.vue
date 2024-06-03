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
          Manage Categories
          <v-spacer></v-spacer>
          <v-text-field
            v-if="showSearch"
            v-model="categoryName"
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
          <v-menu offset-y rounded-xl min-width="300px" >
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
          <v-btn
            rounded
            color="primary"
            height="49px"
            width="97px"
            class="text-capitalize text-h6"
            to="categories/null"
          >
            Add
          </v-btn>
        </v-row>
        <Category
          :filteredCategories="filteredCategories"
          :categoryName="categoryName"
        />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import Category from'@/components/items/categories/category.vue';

  @Component({
    components: {
      Category
    },
  })
  export default class Categories extends Vue {

    showSearch = false;

    categories= [];

    categoryName = '';

    filters = [
      'Clear Filters',
      'Visibility ON',
      'Visibility Off',
      'With NO Dishes',
      'Parent Categories',
      'Sub Categories',
      // 'Types',
      'Categories with no media',
    ];

    sortBy = '';

    get filteredCategories() {
      switch (this.sortBy) {
        case 'Clear Filters':
          return this.categories.sort((a:any, b:any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
        case 'Visibility ON':
          return this.categories.filter((category: any) => category.visibility);
        case 'Visibility Off':
          return this.categories.filter((category: any) => !category.visibility);
        case 'With NO Dishes':
          return this.categories.filter((category: any) => category.dishes.length === 0);
        case 'Parent Categories':
          return this.categories.filter((category: any) => category.hierarchy === 'PARENT');
          case 'Sub Categories':
          return this.categories.filter((category: any) => category.hierarchy !== 'PARENT');
        // case 'Types':
        //   return this.dishes.filter();
        case 'Categories with no media':
          return this.categories.filter((category: any) => !category.coverImage);
        default:
          break;
      }
      return this.categories.sort((a:any, b:any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));
    }

    async mounted() {
      try {
        const {data} =await this.$axios.get(`/v1/categories?businessId=${this.$route.params.business}`)
        this.categories = data
      } catch (error) {
        console.log(error)
      }
    }

    edit(category: any){
      this.$store.commit('updateCategoryName', category.name);
      this.$router.push(`categories/${category.id}`)
    }
  }
  </script>

<style>
  .categoriescardtext {
    font-style: normal !important;
    font-weight: 400 !important;
    font-size: 18px !important;
    line-height: 22px !important;
  }

  
  </style>