<template>
  <v-container fluid class="pa-0">
    <v-row
      justify="center"
      align="center"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <logIn/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import logIn from '../components/login/loginMain.vue'

  @Component({
    components: {
      logIn
    },
  })
  export default class login extends Vue {
  }
</script>