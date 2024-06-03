<template>
  <v-row>
      <v-col
        v-for="(zoneDishes,index) in $store.state.zone.items"
        :key="index"
        cols="12"
        xl="3"
        lg="4"
        md="4"
        sm="12"
      >
        <v-card class="secondary--text itemscard ma-2" flat>
          <v-card-title class="secondary--text">
            {{ zoneDishes.dish.name }} x{{ zoneDishes.dish.qty }}
            <v-spacer></v-spacer>
            ({{ findNameById(zoneDishes.kitchenId) }})
          </v-card-title>
          <v-card-title class="secondary--text">
            {{ $store.getters['zone/tableNameById']( zoneDishes.tableId) }}
            <v-spacer></v-spacer>
            <v-chip outlined color="secondary" class="mt-2">
              <span v-if="zoneDishes.cookedAt===-1">Cooking</span>
              <span v-else> Served</span>
            </v-chip>
          </v-card-title>
        </v-card>
      </v-col>
  </v-row>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class items extends Vue {

    showSearch = false;

    Kitchens = [] as any;

    async getKitchens() {
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
    }

    findNameById(id:any) {
      const obj = this.Kitchens.find((item: any) => item.id === id);
      return obj ? obj.kitchenName : null;
    }

    async mounted() {
      await this.getKitchens();
    }
  }
  </script>

<style scoped>
  .itemscard {
    border: 1px solid #023047 !important;
    border-radius: 6px !important;
  }

  .categoriescardtext {
    font-style: normal !important;
    font-weight: 400 !important;
    font-size: 18px !important;
    line-height: 22px !important;
  }
  </style>