<template>
  <v-dialog
    v-model="dialog"
    persistent
    max-width="800px"
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        rounded
        color="primary"
        large
        outlined
        class="text-capitalize text-h6 mx-3"
        v-bind="attrs"
        v-on="on"
      >
        add a delay
      </v-btn>
    </template>
    <v-card
      class="businesscard secondary--text px-8 py-1"
    >
      <v-card-title>
        Add Delay
        <v-spacer></v-spacer>
        <v-btn
          icon
          @click="dialog = false"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <v-card
        height="380px"
        outlined
        class="businesscard overflow-auto pa-16 pt-0"
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
            <v-toolbar-title class="secondary--text">
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
          column
          active-class="primary"
          color="primary"
          class="mt-4"
        >
          <v-chip
            v-for="(dish, index) in allDishes"
            :key="index"
            width="430px"
            outlined
            label
            large
            class="d-inline-flex ma-4 businesscard"
            :value="dish"
            @click="selectedDish(dish.id)"
          >
            <v-card-subtitle>{{dish.name}} </v-card-subtitle>
          </v-chip>
        </v-chip-group>
      </v-card>
      <v-card-title>
        Delay
      </v-card-title>
      <v-card-title>
        <v-row
          class="pa-0 ma-0"
        >
          <v-col
            cols="12"
            lg="2"
            class="pa-0 ma-0"
          >
            Time
            <span class="error--text">*</span>
          </v-col>
          <v-col
            cols="12"
            lg="4"
            class="py-0 my-0"
          >
            <v-text-field
              v-model="time"
              placeholder="Time"
              class="py-0 my-1"
              color="orange"
              type="number"
              validate-on-blur
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-title>
      <v-card-actions>
        <v-spacer></v-spacer>
          <v-btn
            rounded
            color="primary"
            large
            class="text-capitalize text-h6"
            @click="updateDelay"
          >
            <span class="px-6">save</span>
          </v-btn>
        <v-spacer></v-spacer>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  @Component({
    components: {
    },
  })
  export default class DishDelay extends Vue {

    dialog = false;

    searchDishes = ''

    selectedDishId= '';

    time = '';

    dishes = [] as any;

    get allDishes() {
      return this.dishes.filter((search: any) => {
        return this.searchDishes.toLowerCase().split(' ').every(v => search.name.toLowerCase().includes(v));
      });
    }

    selectedDish(id:string) {
      const selectedDish = this.dishes.find((obj: any) => obj.id === id)
      console.log(selectedDish)
      this.time = selectedDish.delayTime;
      this.selectedDishId = selectedDish.id;
    }

    async updateDelay() {
      try {
        await this.$axios.put(`v1/dishes/${this.selectedDishId}`,
          {
            delayTime: this.time,
          },
          {
              withCredentials: true,
          },
        )
        await this.dishesData();
      } catch (error) {
        console.log(error)
      }
    }

    async dishesData() {
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

    mounted() {
      this.dishesData();
    }
  }
</script>
