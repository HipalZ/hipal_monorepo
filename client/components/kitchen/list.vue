<template>
  <v-container fluid class="px-0 ">
      <v-row class="px-0">
        <v-col
          cols="12"
          lg="1"
          class="align-self-center pl-6 pr-0"
        >
          <v-btn
            fab
            dark
            small
            color="grey"
            @click="formerPage"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
        </v-col>
        <v-col
          cols="12"
          lg="10"
          class="px-0 "
        >
        <v-data-iterator
          :items="tableid"
          :items-per-page.sync="itemsPerPage"
          :page.sync="page"
          hide-default-footer
        >
          <template #default="props">
            <v-row
            >
  
              <v-col
                v-for="(item,index) in props.items"
                :key="index"
                cols="4"
                class="pa-6 "
              >
                <v-card
                  :class="index%2===0?'orderfinsh':'active-card'"
                >
                  <v-card-title class="subtitle-2 pb-1">
                    table-{{ item }}
                    <v-spacer></v-spacer>
                    token number - 11011
                  </v-card-title>
                  <v-card-title class="subtitle-2 pt-0">
                    Sainath
                    <v-spacer></v-spacer>
                    DineIn
                  </v-card-title>
                  <v-divider class="grey mx-4"></v-divider>
                  <span
                    class="caption d-flex"
                  >
                    <v-card-text 
                      v-for="(dishes, index) in info[item]"
                      :key="index"
                    >
                     {{ dishes.dish.name }}
                    </v-card-text>
                  </span>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-data-iterator>

        </v-col>
        <v-col
          cols="12"
          lg="1"
          class="align-self-center pl-6 pr-0"
        >
          <v-btn
            fab
            dark
            small
            color="grey"
            @click="nextPage"
          >
            <v-icon>mdi-chevron-right</v-icon>
          </v-btn>
        </v-col>
      </v-row>
      
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component,Prop } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class List extends Vue {
    @Prop({ default: '' }) readonly kitchenInfo!: any;

    showSearch = false;

    tab = null;

    model = null;

    comment = 'some thing '

    page= 1;

    itemsPerPage = 9;

    get color() {
      return `#${Math.floor(Math.random()*16777215).toString(16)}`;
    }

    get numberOfPages () {
      return Math.ceil(this.dineIn.length / this.itemsPerPage)
    }

    close() {
      this.$emit('close',false)
    }

    nextPage () {
      if (this.page + 1 <= this.numberOfPages) this.page += 1
    }

    formerPage () {
      if (this.page - 1 >= 1) this.page -= 1
    }

    tabs = [
      'Cooking','History','Take Away','List'
    ]
    

    info = '' as any;

    tablesIds = [];

    get tableid() {
      return [...new Set(this.tablesIds)]
    }
    
    get dineIn() {
      const items = [] ;
      for(let i=0; i<60; i++){
        items.push({
          table: i,
        })
      }
      return items
    }

    mounted() {
      const results = this.kitchenInfo.reduce(function(results: any, org: any) {
          (results[org.tableId] = results[org.tableId] || []).push(org);
          return results;
      }, {})
      this.info = results;
      this.tablesIds = this.kitchenInfo.map((s: any)=>s.tableId);
    }
  }
  </script>

<style>
  .zonescard {
    box-shadow: 0 1px 2px rgba(0 0 0 /30%), 0 1px 3px 1px rgba(0 0 0 /15%) !important;
    border-radius: 6px !important;
  }

  .categoriescardtext {
    font-style: normal !important;
    font-weight: 400 !important;
    font-size: 18px !important;
    line-height: 22px !important;
  }

  .orderfinsh {
    border-top: 1px solid rgb(0 0 0 / 30%) !important;
    border-right: 1px solid rgb(0 0 0 / 30%) !important;
    border-bottom: 1px solid rgb(0 0 0 / 30%) !important;
    box-shadow: 0 4px 6px rgba(0 0 0 / 5%) !important;
    border-radius: 6px !important;
    border-left: 8px solid  !important;
    border-left-color: green !important;
  }

  </style>