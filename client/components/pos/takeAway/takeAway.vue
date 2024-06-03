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
      <v-card-title>
        TakeAway
        <v-spacer></v-spacer>
        <v-btn
          icon
          large
          @click="closeTakeAway"
        >
          <v-icon>close</v-icon>
        </v-btn>
      </v-card-title>
      <!-- <v-divider class="mx-8"></v-divider> -->

      <v-card
        class="align-self-center mt-16 pt-16"
        flat
      >
        <v-row
          align="center"
          justify="center"
          class="py-0 my-0"
        >
          <v-col
            cols="12"
            lg="2"
            align="center"
          >
            <span>Name of customer</span>
          </v-col>
          <v-col
            cols="12"
            lg="4"
          >
            <v-text-field
              v-model="customerName"
              color="primary"
              label="Name of customer"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row
          align="center"
          justify="center"
          class="py-0 my-0"
        >
          <v-col
            cols="12"
            lg="2"
            align="center"
          >
            <span>PhoneNumber</span>
          </v-col>
          <v-col
            cols="12"
            lg="4"
          >
            <v-text-field
              v-model="phoneNumber"
              color="primary"
              label="PhoneNumber"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-card-title>
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            large
            rounded
            class="text-capitalize px-16"
            @click="dialog = true"
          >
            Take Away
          </v-btn>
          <v-spacer></v-spacer>
        </v-card-title>
      </v-card>
    </v-card>


  
    <v-dialog
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
      persistent
    >
        <v-card
          color="#f5f5f5"
        >
          <kds
            @close="close"
            :tableId="tableId"
            :zoneId="zoneId"
            :TakeAwaycustomerName="customerName"
            :PhoneNumber="phoneNumber"
          />
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component, Prop } from 'vue-property-decorator';
  import kds from '@/components/pos/kds/kds.vue'
  const { v4: uuidv4 } = require('uuid');

  @Component({
    components: {
      kds
    },
  })

  export default class TakeAwayZone extends Vue {

    @Prop({ default: '' }) readonly zoneId!: any;

    dialog = false;

    tableId = uuidv4();

    customerName = '';

    phoneNumber = '';
    
    close() {
      this.dialog = false;
      if (process.client) {
        location.reload();
      }
    }

    closeTakeAway() {
      this.$emit('close','')
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

  </style>