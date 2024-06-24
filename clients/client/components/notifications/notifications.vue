<template>
  <v-container fluid>
    <v-row
      class="mx-8 mt-2"
    >
      <v-col
        cols="12"
        lg="12"
        md="4"
        class=""
      >
        <v-row
          class="pl-3 mb-2"
        >
          <v-btn
            color="primary"
            class="white--text text-capitalize"
          >admin</v-btn>
          <v-btn
            color="primary"
            outlined
            class="text-capitalize ml-2"
          >from business</v-btn>
        </v-row>
        <v-card
          tile
          min-height="80vh"
        >
          <v-row>
            <v-col
              v-for="i in 3"
              :key="i"
              cols="12"
            >
              <v-card-actions class="body-1 accent--text mx-4">
                Your Password has been reset Reference site
                about Lorem Ipsum, giving information on
                its origins,as well as a random Lipsum generator.
                <v-spacer></v-spacer> 14 Jan 2022
              </v-card-actions>
              <v-divider
                v-if="i<=2"
                class="mx-8"
              ></v-divider>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class notifications extends Vue {
  }
  </script>