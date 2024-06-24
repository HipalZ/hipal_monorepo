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
        Add Roles
        <v-spacer></v-spacer>
        <v-btn
          color="primary"
          rounded
          large
          class="text-capitalize mr-2"
          @click="save"
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
            lg="10"
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
                    Role Name
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="roleName"
                      placeholder="Role Name"
                      class="py-0 my-1"
                      color="orange"
                      :rules="[
                        v => !!v || 'Role Name is required',
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
                    class="pt-5"
                  >
                    Description
                  </v-col>
                  <v-col
                    cols="12"
                    lg="4"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="description"
                      placeholder="Description"
                      color="primary"
                      class="rounded-lg py-0 my-1"
                      :rules="[
                        v => !!v || 'Description is required',
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
                <v-row
                  v-if="showRoles"
                >
                  <v-col
                    cols="5"
                  >
                    <v-row>
                      <v-col
                        cols="12"
                      >
                        <v-card
                          class="editdishesborder pa-4"
                        >
                          <v-checkbox
                            v-model="dashboard"
                            class="checkbox"
                            value="resource/get/dashboard"
                            @change="addPermissions('resource/get/dashboard')"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                Dashboard
                              </div>
                            </template>
                          </v-checkbox>
                          <v-divider></v-divider>
                          <v-checkbox 
                            v-model="dashboard"
                            class="checkbox"
                            value="resource/get/dashboard"
                            @change="addPermissions('resource/get/dashboard')"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                Links
                              </div>
                            </template>
                          </v-checkbox>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="12"
                      >
                        <v-card
                          class="editdishesborder pa-4"
                        >
                          <v-checkbox 
                            v-model="pos"
                            value="resource/get/pos"
                            class="checkbox"
                            @change="addPermissions('resource/get/pos')"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                Pos
                              </div>
                            </template>
                          </v-checkbox>
                          <v-divider></v-divider>
                          <v-checkbox
                            v-model="pos"
                            value="resource/get/pos"
                            class="checkbox"
                            @change="addPermissions('resource/get/pos')"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                Add Discount
                              </div>
                            </template>
                          </v-checkbox>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="12"
                      >
                        <v-card
                          class="editdishesborder pa-4"
                        >
                          <v-checkbox
                            class="checkbox"
                            @click="selectAll(themes)"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                Themes
                              </div>
                            </template>
                          </v-checkbox>
                          <v-divider></v-divider>
                          <v-checkbox
                            v-for="(theme, index) in themes"
                            :key="index"
                            v-model="theme.action"
                            :value="theme.value"
                            class="checkbox"
                            @change="addPermissions(theme.value)"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                {{ theme.label }}
                              </div>
                            </template>
                          </v-checkbox>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-col>
                  <v-col cols="12" lg="1"></v-col>
                  <v-col
                    cols="12"
                    lg="5"
                  >
                    <v-row>
                      <v-col
                        cols="12"
                      >
                        <v-card
                          class="editdishesborder pa-4"
                        >
                          <v-checkbox
                            class="checkbox"
                            @click="selectAll(items)"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                Items
                              </div>
                            </template>
                          </v-checkbox>
                          <v-divider></v-divider>
                          <v-checkbox 
                            v-for="(item, index) in items"
                            :key="index"
                            v-model="item.action"
                            :value="item.value"
                            class="checkbox"
                            color="primary"
                            @change="addPermissions(item.value)"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                {{ item.label }}
                              </div>
                            </template>
                          </v-checkbox>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="12"
                      >
                        <v-card
                          class="editdishesborder pa-4"
                        >
                          <v-checkbox
                            class="checkbox"
                            @click="selectAll(zones)"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                Zones and tables
                              </div>
                            </template>
                          </v-checkbox>
                          <v-divider></v-divider>
                          <v-checkbox
                            v-for="(zone,index) in zones"
                            :key="index"
                            v-model="zone.action"
                            :value="zone.value"
                            class="checkbox"
                            @change="addPermissions(zone.value)"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                {{ zone.label }}
                              </div>
                            </template>
                          </v-checkbox>
                        </v-card>
                      </v-col>
                      <v-col
                        cols="12"
                      >
                        <v-card
                          class="editdishesborder pa-4"
                        >
                          <v-checkbox
                            class="checkbox"
                            @click="selectAll(staffMembers)"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                Staff members
                              </div>
                            </template>
                          </v-checkbox>
                          <v-divider></v-divider>
                          <v-checkbox
                            v-for="(staff, index) in staffMembers"
                            :key="index"
                            v-model="staff.action"
                            :value="staff.value"
                            class="checkbox"
                            @change="addPermissions(staff.value)"
                          >
                            <template v-slot:label>
                              <div class="secondary--text">
                                {{ staff.label }}
                              </div>
                            </template>
                          </v-checkbox>
                        </v-card>
                      </v-col>
                    </v-row>
                  </v-col>
                </v-row>
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
  export default class RoleForm extends Vue {

    showSearch = false;

    tab = null;

    showRoles = false;

    roleName = '';

    addDiscount = '';

    description = '';

    dashboard = '';

    links = '';

    pos = '';

    permissions :string[] = [];

    themes = [
      {
        label: 'Themes',
        action: '',
        value: "resource/get/themes"
      },
      {
        label: 'Explore page',
        action: '',
        value: "resource/get/explorePage"
      },
      {
        label: 'Navigation',
        action: '',
        value: "resource/get/navigation"
      },
      {
        label: 'Themes for Categories',
        action: '',
        value: "resource/get/themesForCategories"
      },
      {
        label: 'Themes for Dish page',
        action: '',
        value: "resource/get/dishPage"
      }
    ];

    items = [
      {
        label: 'Edit categories',
        action: '',
        value: "resource/get/editCategories"
      },
      {
        label: 'Edit dishes',
        action: '',
        value: "resource/get/editDishes"
      },
      {
        label: 'Availability',
        action: '',
        value: "property/get/Availability"
      },
      {
        label: 'Edit visibility',
        action: '',
        value: "property/get/visibility"
      },
    ]

    zones = [
      {
        label: 'Edit zones',
        action: '',
        value: "resource/get/editZones"
      },
      {
        label: 'View zones',
        action: '',
        value: "resource/get/viewZones"
      },
      {
        label: 'Add tables',
        action: '',
        value: "resource/get/addTables"
      },
      {
        label: 'Delete tables',
        action: '',
        value: "resource/get/deleteTables"
      }
    ];

    staffMembers = [
      {
        label: 'Edit staff',
        action: '',
        value: "resource/get/editStaff'"
      },
      {
        label: 'Add staff',
        action: '',
        value: "resource/get/addStaff"
      },
      {
        label: 'Add staff to zones',
        action: '',
        value: "resource/get/addStaffToZones"
      }
    ];

    clearField() {
      this.roleName = '';
      this.description = '';
      this.permissions = [];
    }

    addPermissions(value:string) {
      if(!this.permissions.includes(value)) {
        this.permissions.push(
          value,
        )
      }
      else {
        this.permissions.splice(this.permissions.indexOf(value),1)
      }
    }

    selectAll(item:any) {
      for(let i=0; i<item.length; i++) {
        item[i].action = item[i].value ;
        if(!this.permissions.includes(item[i].action)) {
          this.permissions.push(
            item[i].action,
          )
        }
        else {
          this.permissions.splice(this.permissions.indexOf(item[i].action),1)
          item[i].action = ''
        }
      }
    }


    async save() {
      const form = this.$refs.form as HTMLFormElement;
      if (form.validate()) {
        try {
          await this.$axios.post(`/v1/businesses/${this.$route.params.business}/roles`,{
            name: this.roleName,
            description:this.description,
            permissions: this.permissions,
          },
            {
              withCredentials: true,
            }
          );
          this.$emit("update",'');
          this.$emit('close',false)
          this.clearField();
        } catch (error) {
          console.log(error)
        }
      }
    }

    close() {
      this.$emit('close',false)
      this.clearField();
    }
  }
  </script>

<style>

  /* stylelint-disable */
  .checkbox .theme--light.v-icon{
    color: orange !important;
  }
  /* stylelint-enable */

</style>