<template>
  <v-container fluid  class="pa-0">
    <v-row
      justify="center"
      align="center"
    >
      <v-col cols="12" class="ma-0 pa-0">
        <signUp/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import signUp from '../components/signUp/signupMain.vue'

  @Component({
    components: {
      signUp
    },
    auth : false
  })
  export default class signup extends Vue {
  }
</script>
