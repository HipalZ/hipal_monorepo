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
        <v-row
          class="text-h5 secondary--text px-6 font-weight-medium mb-1"
        >
          Quick menu
          <v-spacer></v-spacer>
          <v-text-field
            v-model="dishName"
            label="search"
            color="primary"
            class="pt-0"
            append-icon="search"
          ></v-text-field>
          <Delay
            :dishes="dishes"
          />
        </v-row>
      </v-col>
    </v-row>
    <v-item-group mandatory>
      <Menu
        :menu = "menu"
        :dishName = "dishName"
        @updateVisibility = "updateVisibility"
        @updateAvailability="updateAvailability"
      />
    </v-item-group>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import Menu from'@/components/items/quickMenu/menu.vue';
  import Delay from '@/components/items/quickMenu/dishDelay.vue'

  @Component({
    components: {
      Menu,
      Delay,
    },
  })
  export default class QuickMenu extends Vue {

    showSearch = false;

    showAddDuplicate = false;

    dishName ='';

    sortBy = 'name';

    categories = [] as any;

    dishes = [] as any;

    menu = [];

    createMenu(){
      const menu = [] as any;
      let mappedDishes = [] as any;
      this.categories.forEach((category: any) => {
        for( let i=0; i<category.dishes.length; i++){
          // console.log(this.dishes.find(obj => obj.id === category.dishes[i].id))
          mappedDishes.push(this.dishes.find((obj: any) => obj.id === category.dishes[i].id))
        }
        menu.push(
          {
            categoryName : category.name,
            id : category.id,
            visibility : category.visibility,
            availability: category.availability,
            hierarchy : category.hierarchy,
            parentCategoryName : category.parentCategory,
            childCategoryVisibility : category.visibility,
            childCategoryAvailability: category.availability,
            dishes : mappedDishes,
          }
        );
        mappedDishes = []
      });
      this.menu = menu
    }

    async updateVisibility(info: any) {
      if(info.type === 'PARENT_CATEGORY') {
        try {
          const { data } =await this.$axios.put(`v1/categories/${info.id}`,
            {
              visibility: info.visibility,
            },
            {
                withCredentials: true,
            },
          )
        } catch (error) {
          console.log(error)
        }
      }
      else if(info.type === 'DISH'){
        try {
          const {data} =await this.$axios.put(`v1/dishes/${info.id}`,
            {
              visibility: info.visibility,
            },
            {
                withCredentials: true,
            },
          )
        } catch (error) {
          console.log(error)
        }
      }
    }

    async updateAvailability(info: any) {
      if(info.type === 'PARENT_CATEGORY') {
        try {
          const { data } =await this.$axios.put(`v1/categories/${info.id}`,
            {
              availability: info.availability,
            },
            {
                withCredentials: true,
            },
          )
        } catch (error) {
          console.log(error)
        }
      }
      else if(info.type === 'DISH'){
        try {
          const {data} =await this.$axios.put(`v1/dishes/${info.id}`,
            {
              availability: info.availability,
            },
            {
                withCredentials: true,
            },
          )
        } catch (error) {
          console.log(error)
        }
      }
    }

    async mounted() {
      try {
        const {data} =await this.$axios.get(`/v1/categories?businessId=${this.$route.params.business}`)
        this.categories = data
      } catch (error) {
        console.log(error)
      }

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
      this.createMenu();
    }
  }
</script>
