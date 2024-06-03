<template>
  <v-app class="app" >
    <span v-if="$vuetify.breakpoint.mdAndUp">

      <v-navigation-drawer
        v-if="$auth.loggedIn"
        app
        :mini-variant.sync="mini"
        permanent
        width="105"
      >
          <v-list-item
            class=" py-0 my-0"
            @click="$router.push('/')"
          >
            <v-list-item-avatar  tile size="85" class="pa-0 ma-0 ml-n6">
              <v-img
                src="/hipalLogo.svg"
                contain
              ></v-img>
            </v-list-item-avatar>
          </v-list-item>
  
        <v-tabs
          v-model="tab"
          vertical
          color="primary"
          centered
          :slider-size="5"
          :icons-and-text="true"
          class="navside"
        >
          <v-tab
            v-for="item in items"
            :key="item.title"
            link
            :to="item.to"
            class="pa-0 ma-0 text-capitalize"
            @click="$router.push(
              {
                name: item.to,
              }
            )"
          >
          <v-list-item-content class="px-0">
            <v-list-item-title class="px-0 mx-0">
              <v-icon >{{item.icon}}</v-icon>
            </v-list-item-title>
            <v-list-item-subtitle class="">{{ item.title }}</v-list-item-subtitle>
          </v-list-item-content>
          </v-tab>
        </v-tabs>
      </v-navigation-drawer>
  
      <v-app-bar
        v-if="$auth.loggedIn"
        app
        color="white"
        clipped-left
        flat
        hide-on-scroll
      >
        <v-spacer></v-spacer>


        <v-list 
          class="py-0 ml-0 pl-0"
          color="#EFF4F7"
        >
          <v-list-item>
            <v-list-item-avatar>
            <img
              src="/hipalLogo.svg"
              alt="John"
              >
            </v-list-item-avatar>
            <v-list-item-content class="accent--text">
              <v-list-item-title>
                {{ $auth.user.name }}
              </v-list-item-title>
            </v-list-item-content>
            <v-list-item-avatar>
              <v-menu
                bottom
                right
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
                >
                  <v-icon color="accent">
                    mdi-chevron-down
                  </v-icon>
                </v-btn>
                </template>
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
                        <v-list-item-content>
                          <v-list-item-title >{{ item.name }}</v-list-item-title>
                        </v-list-item-content>
                      </v-list-item>
                      <v-list-item
                        @click="logout"
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
      </v-app-bar>
    </span>

    <!-- <span v-else>
      <v-app-bar
        v-if="$store.state.login"
        color="white"
        flat
        app
      >
        <v-app-bar-nav-icon @click="drawer = true"></v-app-bar-nav-icon>
        <v-list-item-avatar  tile size="80" class="pa-0 ma-0 ml-n6">
          <v-img
            src="hipalLogo.svg"
            contain
          ></v-img>
        </v-list-item-avatar>
        <v-spacer></v-spacer>
        <v-spacer></v-spacer>
        <v-avatar>
          <img
            src="https://cdn.vuetifyjs.com/images/john.jpg"
            alt="John"
          >
        </v-avatar>
      </v-app-bar>
      <v-navigation-drawer
        v-model="drawer"
        absolute
        temporary
      >
        <v-list
          nav
          dense
        >
          <v-list-item-group
            v-model="group"
            active-class="deep-purple--text text--accent-4"
          >
            <v-list-item
              v-for="item in items"
              :key="item.title"
              link
              :to="item.to"
            >
              <v-list-item-icon>
                <v-icon>{{item.icon}}</v-icon>
              </v-list-item-icon>
              <v-list-item-title>{{item.title}}</v-list-item-title>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-navigation-drawer>
    </span> -->

    <v-main>
      <v-container fluid>
        <Nuxt
        />
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import { computed } from 'vue'
export default {
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      mini: false,
      tab:'/home',
      items: [
        {
          icon: 'home',
          title: 'Home',
          to: 'dashboard',
        },
        {
          icon: 'storefront',
          title: 'Business',
          to: 'businesses',
        },
        {
          icon: 'person',
          title: 'Owners',
          to: 'owners',
        },
        {
          icon: 'receipt_long',
          title: 'Bills',
          to: 'bills',
        },
      ],
      miniVariant: false,
      right: true,
      rightDrawer: false,
      title: 'Vuetify.js',
      // tabs: [
      // {
      //     icon: 'user',
      //     title: 'invoices',
      //     to: '/payments/invoices',
      //   },
      //   {
      //     icon: 'user',
      //     title: 'Payments',
      //     to: '/payments',
      //   },
      //   {
      //     icon: 'user',
      //     title: 'View plans',
      //     to: '/payments/plans',
      //   },
      // ]
      settings : [
        {
          name:'Privacy Policy',
          link: ''
        },
        // {
        //   name:'Edit Profile',
        //   link: '/home/profile'
        // },
      ]
    }
  },

  methods: {
    getCookie(name) {
      const cookie = {};
      document.cookie.split(';').forEach(function(el) {
        const [k,v] = el.split('=');
        cookie[k.trim()] = v;
      })
      return cookie[name];
    },
    async logout() {
      try {
        await this.$axios.put('/v1/users?action=logout', {
          withCredentials: true,
        });
        await this.$auth.logout();
      } catch (error) {
        console.error(error);
      }
    },
  },

  async mounted() {
    try {
      const { data } = await this.$axios.get('/v1/users?clientRole=admin', {
        withCredentials: true,
      });
      if (data.currentUser) {
        this.$auth.setUser(data.currentUser);
        this.$store.commit('auth/SET', {
          key: 'loggedIn',
          value: true,
        });
      }
      this.$router.push(decodeURIComponent(this.getCookie('auth.redirect')));
    } catch (error) {
      console.error(error);
    }
  }
}
</script>

<style>
  .app {
    background-color: #F5F5F5 !important;
  }

  /* .v-tabs--vertical {
    align-items: end;
    flex-direction: column;
  } */
  .navside .v-tabs-slider-wrapper {
    left: auto !important;
    right: 0;
  }

  .cardborder {
    border-left: 8px solid #E96108 !important;
  }

  .active-card {
    border-top: 1px solid rgb(0 0 0 / 30%) !important;
    border-right: 1px solid rgb(0 0 0 / 30%) !important;
    border-bottom: 1px solid rgb(0 0 0 / 30%) !important;
    box-shadow: 0 4px 6px rgba(0 0 0 / 5%) !important;
    border-radius: 6px !important;
    border-left: 8px solid  !important;
    border-left-color: #E96108 !important;
  }

  .sidenav  {
    border: none !important;
  }

  .active-tab-style .v-chip {
    color: var(--primary-color) !important;
    background-color: var(--primary-color) !important;
    border-color: var(--primary-color) !important;
  }

  .businesscard {
    border: 1px solid rgb(0 0 0 / 30%) !important;
    box-shadow: 0 4px 6px rgba(0 0 0 / 5%) !important;
    border-radius: 6px !important;
  }

  .categories {
    border: 1px solid #F1F1F1 !important;
    box-shadow: 0 1px 1px rgba(0 0 0 / 10%) !important;
    border-radius: 8px !important;
  }

  .mobiletext {
    font-style: normal !important;
    font-weight: 700 !important;
    font-size: 10.2222px !important;
    line-height: 140% !important;
    color: #1A202C !important;
  }

  .zonescard {
    box-shadow: 0 1px 2px rgba(0 0 0 /30%), 0 1px 3px 1px rgba(0 0 0 /15%) !important;
    border-radius: 6px !important;
  }

  .categoriescardtext {
    font-style: normal !important;
    font-weight: 400 !important;
    font-size: 18px !important;
    line-height: 22px !important;
  }

::-webkit-scrollbar {
  width: 4px;
  height: 2px;
}

/* Track */
::-webkit-scrollbar-track {
  background: #f1f1f1;
}

/* Handle */
::-webkit-scrollbar-thumb {
  background:#023047;
}

/* Handle on hover */
/* ::-webkit-scrollbar-thumb:hover {
  background: #82B1FF;
}

.light::-webkit-scrollbar {
  width: 10px;
}

.light::-webkit-scrollbar-track {
  background: #e6e6e6;
  border-left: 1px solid #dadada;
}

.light::-webkit-scrollbar-thumb {
  background: #b0b0b0;
  border: solid 3px #e6e6e6;
  border-radius: 7px;
}

.light::-webkit-scrollbar-thumb:hover {
  background: black;
}

.dark::-webkit-scrollbar {
  width: 15px;
}

.dark::-webkit-scrollbar-track {
  background: #202020;
  border-left: 1px solid #2c2c2c;
}

.dark::-webkit-scrollbar-thumb {
  background: #3e3e3e;
  border: solid 3px #202020;
  border-radius: 7px;
}

.dark::-webkit-scrollbar-thumb:hover {
  background: white;
}

.prog-title {
    text-transform: lowercase;
}

.prog-title::first-letter {
    text-transform: uppercase;
} */

</style>