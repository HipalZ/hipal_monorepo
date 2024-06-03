<template>
  <v-container fluid class="px-0">
    <v-row class="pt-0">
      <v-col class="pt-0">
        <v-card
          flat
          class="rounded-b-0"
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
      color="#f5f5f5"
    >
      <v-card-title>
        Add Staff
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          rounded
          large
          class="text-capitalize mr-2"
          @click="save()"
        >save</v-btn>
        <v-btn
          icon
          @click="close()"
        >
          <v-icon>
            close
          </v-icon>
        </v-btn>
      </v-card-title>
      <v-form
        ref="form"
      >
        <v-row
          align="center"
          justify="center"
        >
          <v-col
            cols="12"
            lg="8"
          >
            <v-card
              class="cardborder secondary--text businesscard pa-8 mt-4"
            >
              <v-card-text
                class="secondary--text"
              >
                <v-row
                >
                  <v-col
                    cols="12"
                    lg="2"
                  >
                    Staff Name
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="staffName"
                      placeholder="Staff Name"
                      class="py-0 my-1"
                      color="orange"
                      :rules="[
                        v => !!v || 'Staff Name is required',
                      ]"
                      validate-on-blur
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row
                >
                  <v-col
                    cols="12"
                    lg="2"
                  >
                    Phone Number
                  </v-col>
                  <v-col
                    cols="12"
                    lg="4"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="phoneNumber"
                      placeholder="Phone Number"
                      color="primary"
                      class="rounded-lg py-0 my-1"
                      :rules="[
                        v => !!v || 'Phone is required',
                        v => /^[0-9]{10,12}$/.test(v) || 'Phone is invalid',
                      ]"
                      validate-on-blur
                      maxlength="10"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row
                >
                  <v-col
                    cols="12"
                    lg="2"
                  >
                    Email
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="email"
                      placeholder="Email"
                      class="py-0 my-1"
                      color="orange"
                      :rules="[
                        v => !!v || 'Email is required',
                        v => /.+@.+\..+/.test(v) || 'Email must be valid'
                      ]"
                      validate-on-blur
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row
                >
                  <v-col
                    cols="12"
                    lg="2"
                  >
                    Description
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="description"
                      placeholder="Description"
                      class="py-0 my-1"
                      color="orange"
                    ></v-text-field>
                  </v-col>
                </v-row>
                <v-row
                >
                  <v-col
                    cols="12"
                    lg="2"
                    class="pr-0 mr-0"
                  >
                    Add staff to role
                  </v-col>
                  <v-col
                    cols="12"
                    lg="4"
                  >
                  <v-btn
                    outlined
                    color="primary"
                    rounded
                    class="text-capitalize"
                    @click="(showRoles = !showRoles)"
                  >Add</v-btn>
                  </v-col>
                </v-row>
                <span class="error--text">
                  {{ Errormsg }}
                </span>
                <v-row
                  v-if="showRoles"
                >
                  <v-col
                    cols="10"
                  >
                    <v-card
                      outlined
                      class="businesscard overflow-auto pa-8 py-0"
                      height="300px"
                    >
                      <v-banner
                        sticky
                      >
                        <v-app-bar
                          absolute
                          color="white"
                          elevate-on-scroll
                          scroll-target="#scrolling-techniques-7"
                          fixed
                        >
                          <v-toolbar-title>
                            Roles
                          </v-toolbar-title>
                          <v-spacer></v-spacer>
                          <v-btn
                            icon
                            text
                          >
                            <v-icon>
                              search
                            </v-icon>
                          </v-btn>
                          <v-btn
                            outlined
                            color="primary"
                            rounded
                            class="text-capitalize"
                            :to="`/businesses/${$route.params.business}/staff/roles`"
                          >
                            add Roles
                          </v-btn>
                        </v-app-bar>
                      </v-banner>
                      <v-chip-group
                        v-model="selectedRole"
                        column
                        active-class="primary"
                        color="primary"
                        class="mt-4"
                      >
                        <v-chip
                          v-for="(item,index) in roles"
                          :key="index"
                          outlined
                          label
                          large
                          :value="item.id"
                          class="ma-4 businesscard"
                        >
                          <v-card-subtitle class="mr-6" >{{ item.name }}</v-card-subtitle>
                        </v-chip>
                      </v-chip-group>
                    </v-card>
                  </v-col>
                </v-row>
                <!-- <v-row
                >
                  <v-col
                    cols="12"
                    lg="2"
                  >
                    Add Staff to zones
                  </v-col>
                  <v-col
                    cols="12"
                    lg="4"
                    class=""
                  >
                    <v-btn
                      outlined
                      color="primary"
                      rounded
                      class="text-capitalize"
                      @click="(showZones=!showZones)"
                    >Add</v-btn>
                  </v-col>
                </v-row>
                <v-row
                  v-if="showZones"
                >
                  <v-col
                    cols="10"
                  >
                    <v-card
                      outlined
                      class="businesscard overflow-auto pa-8 py-0"
                      height="300px"
                    >
                      <v-banner
                        sticky
                      >
                        <v-app-bar
                          absolute
                          color="white"
                          elevate-on-scroll
                          scroll-target="#scrolling-techniques-7"
                          fixed
                        >
                          <v-toolbar-title>
                            Zones
                          </v-toolbar-title>
                          <v-spacer></v-spacer>
                          <v-btn
                            icon
                            text
                          >
                            <v-icon>
                              search
                            </v-icon>
                          </v-btn>
                          <v-btn
                            outlined
                            color="primary"
                            rounded
                            class="text-capitalize"
                          >
                            add Zone
                          </v-btn>
                        </v-app-bar>
                      </v-banner>
                      <v-chip-group
                        v-model="selectedZone"
                        column
                        multiple
                        active-class="primary"
                        color="primary"
                        class="mt-4"
                      >
                        <v-chip
                          v-for="(item,index) in zones"
                          :key="index"
                          width="430px"
                          outlined
                          label
                          large
                          :value="item.id"
                          class="d-inline-flex ma-4 businesscard"
                        >
                          <v-card-subtitle >{{ item.zoneName }}</v-card-subtitle>
                        </v-chip>
                      </v-chip-group>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row
                >
                  <v-col
                    cols="12"
                    lg="2"
                  >
                    Add Staff to tables
                  </v-col>
                  <v-col
                    cols="12"
                    lg="4"
                    class=""
                  >
                    <v-btn
                      outlined
                      color="primary"
                      rounded
                      class="text-capitalize"
                      @click="(showTables=!showTables)"
                    >Add</v-btn>
                  </v-col>
                </v-row>
                <v-row
                  v-if="showTables"
                >
                  <v-col
                    cols="10"
                  >
                    <v-card
                      outlined
                      class="businesscard overflow-auto pa-8 py-0"
                      height="300px"
                    >
                      <v-banner
                        sticky
                      >
                        <v-app-bar
                          absolute
                          color="white"
                          elevate-on-scroll
                          scroll-target="#scrolling-techniques-7"
                          fixed
                        >
                          <v-toolbar-title>
                            Tables
                          </v-toolbar-title>
                          <v-spacer></v-spacer>
                          <v-text-field
                            label="search"
                            color="primary"
                            class="mt-3"
                          ></v-text-field>
                          <v-btn
                            icon
                            text
                          >
                            <v-icon>
                              search
                            </v-icon>
                          </v-btn>
                          <v-btn
                            outlined
                            color="primary"
                            rounded
                            class="text-capitalize"
                          >
                            add Tables
                          </v-btn>
                        </v-app-bar>
                      </v-banner>
                      <v-chip-group
                        v-model="selectedTable"
                        column
                        multiple
                        active-class="primary"
                        color="primary"
                        class="mt-4"
                      >
                        <v-chip
                          v-for="(item, index) in tablesByZoneId"
                          :key="index"
                          width="430px"
                          outlined
                          label
                          large
                          :value="item.id"
                          class="d-inline-flex ma-4 businesscard"
                        >
                          <v-card-subtitle >{{ item.name  }} </v-card-subtitle>
                        </v-chip>
                      </v-chip-group>
                    </v-card>
                  </v-col>
                </v-row> -->
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-form>
    </v-card>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class StaffForm extends Vue {

    showSearch = false;

    tab = null;

    Errormsg = ''

    showZones = false;

    showTables = false;

    showRoles = false;

    staffName = '';

    phoneNumber = '';

    email = '';
    password= Math.floor(Math.random() * 9000) + 1000;

    description = '';

    selectedZone = [] as any;

    selectedRole = [] as any;

    selectedTable = [] as any;

    zones = [] as any;

    roles = [] as any;

    tables = [] as any;

    close() {
      this.clearFields();
      this.$emit('close',false)
    };

    clearFields() {
      this.staffName = '';
      this.email = '';
      this.phoneNumber = '';
      this.selectedZone = [];
      this.selectedRole = [];
      this.selectedTable = [];
    };

    get creatorRole() {
      if (!this.$auth.user) {
        return;
      }
      if(this.$auth.user.role === 'RESTAURANT_OWNER') {
        return 'RESTAURANT_MANAGER'
      }
      else if(this.$auth.user.role === 'RESTAURANT_MANAGER') {
        return 'RESTAURANT_FLOOR_MANAGER'
      }
      else {
        return 'RESTAURANT_FLOOR_MANAGER'
      }
    }

    async save() {
      const form = this.$refs.form as HTMLFormElement;
      const zones = [];
      if (form.validate()) {
        if(this.selectedRole.length !== 0) {
          try {
            let filterPermission= this.roles.filter((ele:any) => ele.id == this.selectedRole)
        
           const {data} = await this.$axios.post('/v1/users?action=signup&clientRole=user', {
              name: this.staffName,
              email: this.email,
              phone: this.phoneNumber,
              password:this.password,
              role: this.creatorRole,
              customRole: {
                businessId: this.$route.params.business,
                customRoleId: this.selectedRole,
                permissions:filterPermission?.[0]?.permissions,
                roleName:filterPermission?.[0]?.name

              },
            });
          
            this.selectedZone.forEach((zoneId: any)=>{
              zones.push({
                zoneId,
                userId:data.id,
              })
            })
            this.clearFields();
            this.$emit('close',false)
          } catch (error : any) {
            console.log(error);
          }
        }
        else {
          this.Errormsg = 'Pls select Role'
        }
      }
    }

    async getZones() {
      try {
        const {data} =await this.$axios.get(`/v1/zones?businessId=${this.$route.params.business}`,
          {
            withCredentials: true,
          },
        )
        this.zones = data;
      } catch (error) {
        console.log(error)
      }
    }

    async getRoles() {
      try {
        const { data } = await this.$axios.get(`/v1/businesses/${this.$route.params.business}/roles`, {
          withCredentials: true,
        });
        this.roles = data;
      } catch (error) {
        console.error(error);
      }
    }

    get tablesByZoneId() {
      const tables = [] as any;
      this.selectedZone.forEach((id: any)=>{
        const table = this.tables.filter((obj: any) => obj.zoneId === id);
        tables.push(
          ...table,
        )
      })
      // return this.tables.filter(obj => obj.zoneId === this.selectedZone);
      return tables;
    }


    async getTables() {
      try {
        const { data } =await this.$axios.get(`/v1/zones/all/tables?businessId=${this.$route.params.business}`,
          {
            withCredentials: true,
          },
        )
        this.tables = data; 
      } catch (error) {
        console.log(error)
      }
    }

    mounted() {
      this.getZones();
      this.getRoles();
      this.getTables();
    }
  }
</script>
