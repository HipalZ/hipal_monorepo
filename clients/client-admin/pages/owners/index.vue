<template>
   <v-container fluid>
    <v-row
      class="mx-6"
    >
      <v-col
        cols="12"
        lg="12"
        md="4"
        sm="12"
        class=""
      >
        <v-row
          class="ml-4"
        >
          <v-col
            cols="12"
          >
            <v-data-table
              :headers="headers"
              :items="desserts"
              class="elevation-1 cardborder px-6"
            >
              <!-- <template v-slot:header.name="{ header }" >
                {{ header.text.toUpperCase() }}
              </template>
              <template  v-slot:item.calories="{ item }">
                  <span
                    :class="item.calories==='Successful'?'success--text':'error--text'"
                  >{{item.calories}}</span>
              </template> -->
              <template  v-slot:item.actions="{ item }"
              >
                <v-btn 
                  text
                  small
                  class="text-capitalize pa-0 ma-0"
                  color="#219EBC"
                > 
                  view
                  <!-- <font-awesome-icon
                    icon="download"
                    size="1x"
                    color="#E96108"
                    class="ml-2"
                  >
                  </font-awesome-icon> -->
                </v-btn>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
export default {
  name: 'owners',
  data() {
    return {
      headers: [
        {
          text: 'Owner Id',
          align: 'start',
          value: 'name',
        },
        { text: 'Name of Owner', value: 'calories' },
        { text: 'Number of business', value: 'fat' },
        { text: 'Phone Number', value: 'carbs' },
        { text: 'Join date', value: 'protein' },
        { text: 'Amount spent', value: 'amount' },
        { text: 'Action', value: 'actions' },
      ],
      desserts: [
        {
          name: '1111111',
          calories: 'Owner Name',
          fat: '2',
          carbs: '1234567891',
          amount: '1000',
          protein: '11-10-2023',
        },
        {
          name: '1111111',
          calories: 'Owner Name',
          fat: '2',
          carbs: '1234567891',
          amount: '1000',
          protein: '11-10-2023',
        },
        {
          name: '1111111',
          calories: 'Owner Name',
          fat: '2',
          carbs: '1234567891',
          amount: '1000',
          protein: '11-10-2023',
        },
        {
          name: '1111111',
          calories: 'Owner Name',
          fat: '2',
          carbs: '1234567891',
          amount: '1000',
          protein: '11-10-2023',
        },
      ],
    }
  },
}
</script>

<style>
.cardborder {
  border-left: 8px solid #E96108 !important;
}

.td {
  border-bottom: none !important;
}
</style>
