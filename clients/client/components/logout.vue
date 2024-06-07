<template>
  <v-list 
    class="py-0 ml-0 pl-0"
    color="#EFF4F7"
  >
    <v-list-item>
      <v-list-item-avatar>
        <!-- <img
        src="https://cdn.vuetifyjs.com/images/john.jpg"
        alt="John"
        > -->
        <v-avatar
          color=""
          class="text-center align-center"
        >
          <v-icon
            color=""
          >
            person
          </v-icon>
        </v-avatar>
      </v-list-item-avatar>
      <v-list-item-content class="accent--text">
        <v-list-item-title>
          {{ $auth.user.name }}
        </v-list-item-title>
        <!-- <v-list-item-subtitle class="accent--text">
          kotla
        </v-list-item-subtitle> -->
      </v-list-item-content>
      <v-list-item-avatar>
        <v-menu
          bottom
          left
          offset-y
          :close-on-content-click="false"
          transition="scale-transition"
        >
          <template #activator="{ on, attrs }">
            <v-btn
              dark
              icon
              v-bind="attrs"
              v-on="on"
              class="pa-0 ma-0"
              @click="show =!show"
            >
              <v-icon color="accent">
                {{ show ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </v-btn>
          </template>
          <!-- <v-list class="">
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title>
                  {{ $auth.user.name }}
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-content>
                <v-btn
                  color="error"
                  full-width
                  @click="confirm()"
                >
                  Logout
                </v-btn>
              </v-list-item-content>
            </v-list-item>
          </v-list> -->
          <v-card
            class="mx-auto businesscard"
            min-width="200"
          >
            <v-list>
              <v-list-item-group
                active-class="border"
                color="primary"
              >
                <v-list-item
                  v-for="(item, index) in settings"
                  :key="index"
                  :to="item.link"
                  link
                >
                  <!-- <v-list-item-icon>
                    <v-icon ></v-icon>
                  </v-list-item-icon> -->
                  <v-list-item-content>
                    <v-list-item-title >{{ item.name }}</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item
                  @click="confirm"
                >
                  <v-list-item-content>
                    <v-list-item-title >Log out</v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card>
        </v-menu>
      </v-list-item-avatar>
    </v-list-item>
  </v-list>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class ConfirmationDialog extends Vue {
  loading = false;

  show = false;

  settings = [
    {
      name:'Privacy Policy',
      link: ''
    },
    {
      name:'Edit Profile',
      link: '/profile',
    },
  ]

  confirm() {
    this.loading = true;
    this.$emit('confirm', {});
    this.loading = false;
  }
}
</script>

<style lang='scss' scoped>
</style>