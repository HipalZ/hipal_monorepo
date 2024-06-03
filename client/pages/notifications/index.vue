<template>
  <v-container fluid class="pa-0">
    <v-row
    >
      <v-col cols="12" class="ma-0 pa-0">
        <notifications />
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import notifications from '../../components/notifications/notifications.vue'

  @Component({
    components: {
      notifications
    },
  })
  export default class Notifications extends Vue {
  }
</script>