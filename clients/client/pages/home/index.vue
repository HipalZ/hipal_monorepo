<template>
  <v-container fluid class="pa-0">
    <v-row
    >
      <v-col cols="12" class="ma-0 pa-0">
        <home/>
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
  export default class HomePage extends Vue {
  }
</script>