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
            @click="$router.push({ name: 'businesses' })"
          >
            <v-list-item-avatar  tile size="85" class="pa-0 ma-0 ml-n6">
              <v-img
                src="hipalLogo.svg"
                contain
              ></v-img>
            </v-list-item-avatar>
          </v-list-item>
  
        <!-- <v-list
          v-model="tab"
        >
          <v-list-item
            v-for="item in items"
            :key="item.title"
            link
            :to="item.to"
            color="orange"
          >
            <v-list-item-content>
              <v-list-item-title>
                <font-awesome-icon
                  :icon="item.icon"
                  class="ml-2"
                >
                </font-awesome-icon>
              </v-list-item-title>
              <v-list-item-subtitle class="caption">{{ item.title }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list> -->
  
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
            :key="item.to"
            :value="item.to"
            link
            class="pa-0 ma-0 text-capitalize"
            @click="$router.push({ name: item.to })"
          >
          <v-list-item-content class="px-0">
            <v-list-item-title class="px-0 mx-0">
              <!-- <font-awesome-icon
                :icon="item.icon"
              >
              </font-awesome-icon> -->
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-title>
            <v-list-item-subtitle class="caption">{{ item.title }}</v-list-item-subtitle>
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
        <v-app-bar-nav-icon></v-app-bar-nav-icon>
        <v-toolbar-title v-if="$route.path === '/businesses'" class="secondary--text ml-16">Welcome {{ $auth.user.name }}!</v-toolbar-title>
        <v-spacer></v-spacer> 
        <v-card
          flat
        >
          <v-tabs
            v-model="horizontalTab"
            light
            centered
            class=""
            hide-slider
            active-class="active-tab-style"
          >
            <v-tab
              v-for="(item, index) in tabs.tab"
              :key="index"
              class="text-capitalize"
              @click="$router.push({ name: item.to })"
            >
                <v-chip
                  outlined
                >
                  <span>{{item.title}}</span>
                </v-chip>
            </v-tab>
          </v-tabs>
         </v-card>
        <v-spacer></v-spacer>
        <v-btn
          icon
          to="/notifications"
        >
          <v-icon
            color="#1C1B1F"
          >
            notifications
          </v-icon>
        </v-btn>
        <v-btn icon>
          <v-icon
            color="#1C1B1F"
          >
            settings
          </v-icon>
        </v-btn>
        <v-btn
          v-if="showBusinessSettings"
          icon
          class="mx-2"
          :to='`/businesses/${this.$route.params.business}/businessSettings`'
        >
          <v-avatar tile>
            <img
              :src="this.$store.state.businessLogo"
              alt="businesslogo"
            >
          </v-avatar>
        </v-btn>
        <!-- <v-list
          color="#EFF4F7"
          class="black--text pa-0 ma-0"
        >
          <v-list-group
          class="black--text pa-0 ma-0"
          >
          <template #prependIcon>
            <v-avatar>
              <img
                src="https://cdn.vuetifyjs.com/images/john.jpg"
                alt="John"
              >
            </v-avatar>
          </template>
          <template v-slot:activator>
            <v-list-item-content class="black--text px-0 mx-0">
              <v-list-item-title class="px-0 mx-0">sainath</v-list-item-title>
            </v-list-item-content>
          </template>
        </v-list-group>
      </v-list> -->
        <!-- <v-list 
          class="py-0 ml-0 pl-0"
          color="#EFF4F7"
        >
          <v-list-item>
            <v-list-item-avatar>
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
                >
                  <v-icon color="accent">
                    mdi-chevron-down
                  </v-icon>
                </v-btn>
                </template>
                <v-list class="">
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
                        @click="logout()"
                      >
                        Logout
                      </v-btn>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
              </v-menu>
            </v-list-item-avatar>
          </v-list-item>
        </v-list> -->
        <Logout
          @confirm="logout"
        />
      </v-app-bar>
    </span>

    <span v-else>
      <v-app-bar
        v-if="$auth.loggedIn"
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
        <!-- <v-card
          v-if="this.tab !== '/home'"
          class="rounded-xl"
          width="600px"
        >
          <v-tabs
          color="white"
          centered
          background-color="secondary"
          dark
          hide-slider
        >
          <v-tab
            v-for="item in tabs.tab"
            :key="item.title"
            :to="item.to"
            class="text-capitalize"
          >
              <font-awesome-icon
                :icon="item.icon"
                size="1x"
                class="mr-2"
              >
              </font-awesome-icon>
            <span>{{item.title}}</span>
          </v-tab>
        </v-tabs>
         </v-card> -->
        <v-spacer></v-spacer>
        <!-- <Logout
          @confirm="logout"
        /> -->
        <v-avatar
          color="secondary"
          size="40"
        > <span class="white--text ">CJ</span></v-avatar>
      </v-app-bar>
      <!-- <v-navigation-drawer
        v-model="drawer"
        absolute
        temporary
      >
        <v-list
          nav
          dense
        >
          <v-list-item-group
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
      </v-navigation-drawer> -->
      <v-navigation-drawer
        v-if="$auth.loggedIn"
        v-model="drawer"
        app
        absolute
        temporary
      >
  
      <v-list
        nav
        dense
      >
        <v-list-item-group
          v-model="tab"
          active-class="primary--text "
          active-color="primary"
        >
          <v-list-item
            v-for="item in items"
            :key="item.to"
            :value="item.to"
            link
            class="pa-0 ma-0 text-capitalize"
            @click="$router.push({ name: item.to })"
          >
            <v-list-item-icon>
              <v-icon>{{item.icon}}</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list-item-group>
      </v-list>
  
        <!-- <v-tabs
          v-model="tab"
          vertical
          color="primary"
          :slider-size="5"
          hide-slider
        >
          <v-tab
            v-for="item in items"
            :key="item.to"
            :value="item.to"
            link
            class="pa-0 ma-0 text-capitalize"
            @click="$router.push({ name: item.to })"
          >
              <v-icon>{{item.icon}}</v-icon>{{ item.title }}
          </v-tab>
        </v-tabs> -->
      </v-navigation-drawer>
    </span>

    <v-main>
      <v-container fluid>
        <Nuxt
        />
        <v-snackbar
          v-model="snackbar"
          color="success"
          timeout="2000"
          shaped
        >
          Successfully done 👍
          <template v-slot:action="{ attrs }">
            <v-btn
              color="white"
              icon
              v-bind="attrs"
              @click="snackbar = false"
            >
              <v-icon>close</v-icon>
            </v-btn>
          </template>
        </v-snackbar>
        <v-bottom-sheet
          v-model="sheet"
          width="640"
          inset
        >
          <v-sheet
            class="text-center rounded"
            height="200px"
          >
            <v-card
              flat
              color="error"
            >
              <v-card-title class="white--text">
                Sorry, that didn't go as expected
                <v-spacer></v-spacer>
                <v-btn
                  icon
                  color="white"
                  @click="sheet = !sheet"
                >
                  <v-icon>close</v-icon>
                </v-btn>
              </v-card-title>
            </v-card>
            <div class="my-3">
              <ul class="text-left secondary--text">
                <li
                  v-for="(error, index) in errorText"
                  :key="index"
                >
                  {{ error.message }}, please check {{ error.field }}
                </li>
              </ul>
            </div>
          </v-sheet>
        </v-bottom-sheet>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import Logout from '@/components/logout.vue'
export default {
  components: {
    Logout,
  },
  name: 'DefaultLayout',
  data() {
    return {
      clipped: false,
      drawer: false,
      fixed: false,
      mini: false,
      tab: 0,
      horizontalTab: 0,
      miniVariant: false,
      right: true,
      rightDrawer: false,
      snackbar: false,
      sheet: false,
      errorText: '',
      title: 'Vuetify.js',
      showBusinessSettings: false,
      businesses: [],
    }
  },
  computed: {
    currentPageName() {
      return this.$route.name;
    },
    route() {
      return this.$route;
    },
    cssProps () {
        return {
            '--primary-color': this.$vuetify.theme.primary,
        }
    },
    items() {
      const pathChunks = this.$route.name.split('-');
      const businessId = pathChunks[1];
      if (pathChunks[0] === 'businesses' && businessId !== undefined) {
        this.showBusinessSettings = true;
        return [
          {
            icon: 'home',
            title: 'Home',
            to: `businesses-${businessId}-dashboard`,
          },
          {
            icon: 'category',
            title: 'Items',
            to: `businesses-${businessId}-items-categories`,
          },
          {
            icon: 'palette',
            title: 'Themes',
            to: `businesses-${businessId}-themes-theme`,
          },
          {
            icon: 'important_devices',
            title: 'POS',
            to: `businesses-${businessId}-pos-dineIn`,
          },
          {
            icon: 'devices',
            title: 'Kitchen',
            to: `businesses-${businessId}-kitchen`,
          },
          {
            icon: 'people',
            title: 'Staff',
            to: `businesses-${businessId}-staff`,
          },
          {
            icon: 'format_shapes',
            title: 'Zone',
            to: `businesses-${businessId}-zone-zones`,
          },
          {
            icon: 'notifications',
            title: 'Bills',
            to: `businesses-${businessId}-bills`,
          },
          // {
          //   icon: 'people',
          //   title: 'Marketing',
          //   to: `businesses-${businessId}-marketing`,
          // },
        ];
      }
      else{
        this.showBusinessSettings = false;
        return [
          {
            icon: 'home',
            title: 'Home',
            to: 'businesses',
          },
          {
            icon: 'currency_rupee',
            title: 'Payments',
            to: 'payments-invoices',
          },
        ];
      }
    },
    tabs() {
      const pathChunks = this.$route.name.split('-');
      const businessId = pathChunks[1];
      if (pathChunks[0] === 'businesses' && businessId !== undefined) {
        switch(this.tab) {
          case 1:
            return {
              tab: [
                {
                    icon: 'file-invoice',
                    title: 'Categories',
                    to: `businesses-${businessId}-items-categories`,
                },
                {
                  icon: 'rupee-sign',
                  title: 'Dishes',
                  to: `businesses-${businessId}-items-dishes`,
                },
                {
                  icon: 'file-invoice',
                  title: 'Quick Menu',
                  to: `businesses-${businessId}-items-quickmenu`,
                },
              ]
            };
          case 0:
            return {
              title: '',
              tab:[]
            };
          case 2:
            return {
              tab: [
                {
                    icon: 'file-invoice',
                    title: 'Themes',
                    to: `businesses-${businessId}-themes-theme`,
                },
                {
                  icon: 'file-invoice',
                  title: 'Explore',
                  to: `businesses-${businessId}-themes-explore`,
                },
                {
                  icon: 'file-invoice',
                  title: 'Navigation',
                  to: `businesses-${businessId}-themes-navigation`,
                },
                {
                  icon: 'file-invoice',
                  title: 'Categories',
                  to: `businesses-${businessId}-themes-categories`,
                },
                {
                  icon: 'file-invoice',
                  title: 'Dishes',
                  to: `businesses-${businessId}-themes-dishes`,
                }
              ]
            };
            case 3:
              return {
                tab: [
                  {
                    icon: 'file-invoice',
                    title: 'DineIn',
                    to: `businesses-${businessId}-pos-dineIn`,
                  },
                  {
                    icon: 'file-invoice',
                    title: 'takeAway',
                    to: `businesses-${businessId}-pos-takeAway`,
                  },
                ]
              };
            case 4:
              return {
                title: '',
                tab:[]
              };
          case 5:
            return {
              tab: [
                {
                  icon: 'file-invoice',
                  title: 'Staff',
                  to: `businesses-${businessId}-staff`,
                },
                {
                  icon: 'rupee-sign',
                  title: 'Roles',
                  to: `businesses-${businessId}-staff-roles`,
                },
                {
                  icon: 'rupee-sign',
                  title: 'Customer',
                  to: `businesses-${businessId}-staff-customers`,
                },
              ]
            };
          case 6:
          return {
            tab: [
              {
                icon: 'file-invoice',
                title: 'Zones',
                to: `businesses-${businessId}-zone-zones`,
              },
              {
                icon: 'rupee-sign',
                title: 'Tables',
                to: `businesses-${businessId}-zone-tables`,
              },
            ]
          };
          case 7:
            return {
              title: '',
              tab:[]
            };
          default:
            return {
              title: '',
              tab:[]
            };
        }
      } else {
        switch(this.tab) {
          case 1:
            return {
              tab: [
                {
                    icon: 'file-invoice',
                    title: 'invoices',
                    to: 'payments-invoices',
                },
                {
                  icon: 'rupee-sign',
                  title: 'Payments',
                  to: 'payments-pay',
                },
                {
                  icon: 'file-invoice',
                  title: 'View plans',
                  to: 'payments-plans',
                },
              ]
            };
          case 0:
            return {
              title: '',
              tab:[]
            };
          case '/themes':
            return {
              tab: [
                {
                    icon: 'file-invoice',
                    title: 'Themes',
                    to: '/themes/theme',
                },
                {
                  icon: 'file-invoice',
                  title: 'Explore',
                  to: '/themes/explore',
                },
                {
                  icon: 'file-invoice',
                  title: 'Navigation',
                  to: '/themes/navigation',
                },
                {
                  icon: 'file-invoice',
                  title: 'Categories',
                  to: '/themes/categories',
                },
                {
                  icon: 'file-invoice',
                  title: 'Dishes',
                  to: '/themes/dishes',
                }
              ]
            };
          default:
            return {
              title: '',
              tab:[]
            };
        }
      }
    },
    path() {
      return this.$route.path
    }
  },
  watch: {
    currentPageName() {
      switch (this.$route.name) {
        case 'businesses':
          this.tab = 0;
          this.horizontalTab = 0;
          break;
        case 'notifications':
          this.tab = 0;
          this.horizontalTab = 0;
          break;
        case 'profile':
          this.tab = 0;
          this.horizontalTab = 0;
        break;
        case 'payments':
          this.tab = 1;
          this.horizontalTab = 0;
          break;
        case 'payments-invoices':
          this.tab = 1;
          this.horizontalTab = 0;
          break;
        case 'payments-pay':
          this.tab = 1;
          this.horizontalTab = 1;
          break;
        case 'payments-plans':
          this.tab = 1;
          this.horizontalTab = 2;
          break;
        case 'businesses-business-dashboard':
          this.tab = 0;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-businessSettings':
          this.tab = 0;
          this.horizontalTab = 0;
        break;
        case 'businesses-business-themes':
          this.tab = 2;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-items-categories':
          this.tab = 1;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-items-dishes':
          this.tab = 1;
          this.horizontalTab = 1;
          break;
          case 'businesses-business-items-quickmenu':
          this.tab = 1;
          this.horizontalTab = 2;
          break;
        case 'businesses-business-themes-categories':
          this.tab = 2;
          this.horizontalTab = 3;
          break;
        case 'businesses-business-themes-dishes':
          this.tab = 2;
          this.horizontalTab = 4;
          break;
        case 'businesses-business-themes-explore':
          this.tab = 2;
          this.horizontalTab = 1;
          break;
        case 'businesses-business-themes-navigation':
          this.tab = 2;
          this.horizontalTab = 2;
          break;
        case 'businesses-business-themes-theme':
          this.tab = 2;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-items-categories-category':
          this.tab = 1;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-items-dishes-dish':
          this.tab = 1;
          this.horizontalTab = 1;
          break;
        case 'businesses-business-staff':
          this.tab = 5;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-staff-roles':
          this.tab = 5;
          this.horizontalTab = 1;
          break;
        case 'businesses-business-staff-customers':
          this.tab = 5;
          this.horizontalTab = 2;
          break;
        case 'businesses-business-zone-zones':
          this.tab = 6;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-zone-tables':
          this.tab = 6;
          this.horizontalTab = 1;
          break;
        case 'businesses-business-kitchen':
          this.tab = 4;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-pos-dineIn':
          this.tab = 3;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-pos-dineIn-zone':
          this.tab = 3;
          this.horizontalTab = 0;
          break;
        case 'businesses-business-bills':
          this.tab = 7;
          this.horizontalTab = 0;
          break;
        default:
          break;
      }
    }
  },
  async mounted() {
    this.$axios.onRequest(config => {
      config.withCredentials = true
      return config;
    });
    this.$axios.onError((error) => {
      if (error.config.url === '/v1/users?clientRole=user' && error.config.method.toUpperCase() === 'GET') {
        return;
      }
      this.errorText = error.response.data.errors;
      this.sheet = true;
      // console.log(error.request);
      
      // const code = parseInt(error.response && error.response.status)
      // if (code === 400) {
      //   redirect('/400')
      // }
    });
    this.$axios.onResponse(response => {
      if (response.config.method !== 'get') {
        this.snackbar = true;
      }
    });
    try {
      const { data } = await this.$axios.get('/v1/users?clientRole=user', {
        withCredentials: true,
      });
      if (data.currentUser) {
        this.$auth.setUser(data.currentUser);
        this.$store.commit('auth/SET', {
          key: 'loggedIn',
          value: true,
        });
        if(this.$auth.user.customRole.length===0) {
          try {
            const { data } = await this.$axios.get(`/v1/businesses`, {
              withCredentials: true,
            });
            this.businesses = data;
          } catch (error) {
            console.error(error);
          }
        }
        else {
          for(let i=0; i<=this.$auth.user.customRole.length; i++) {
            try {
              const { data } = await this.$axios.get(`/v1/businesses/${this.$auth.user.customRole[i].businessId}`, {
                withCredentials: true,
              });
              this.businesses.push(data);
              await this.$store.dispatch('getRolePermissions',this.$auth.user.customRole[i].customRoleId)
            } catch (error) {
              console.error(error);
            }
          }
        }
      }
      const elements = decodeURIComponent(this.getCookie('auth.redirect')).split('/');
      const ownedBusinesses = [];
      this.businesses.forEach((business) => {
        ownedBusinesses.push(business.id);
      });
      if (elements.length > 2) {
        if (ownedBusinesses.includes(elements[2])) {
          this.$router.push(decodeURIComponent(this.getCookie('auth.redirect')));
        }
        else {
          this.$router.push('/why-do-you-want-to-access-other-properties');
        }
      } else {
        this.$router.push(decodeURIComponent(this.getCookie('auth.redirect')));
      }
    } catch (error) {
      console.error(error);
    }
  },
  methods: {
    navigate(path) {
      const currentPath = this.$route;
      const { business } = currentPath.params;
      return `/businesses/${business}/${path}`;
    },
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
::-webkit-scrollbar-thumb:hover {
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
}

</style>