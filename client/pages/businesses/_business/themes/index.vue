<template>
  <v-container fluid class="pa-0">
    <v-row
    >
      <v-col cols="12" class="ma-0 pa-0">
        <themes/>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import themes from '../../../../components/themes/themesView/themes.vue'

  @Component({
    components: {
      themes
    },
  })
  export default class Themes extends Vue {
  }
</script>