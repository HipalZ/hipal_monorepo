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

<script>
import signUp from '../components/signup/signupMain.vue'

export default {
  name: 'IndexPage',
  components: {
    signUp, 
    auth : false,
  }
}
</script>
 