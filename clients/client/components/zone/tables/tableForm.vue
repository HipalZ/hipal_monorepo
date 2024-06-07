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
        Add table
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
                    Add Table
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="tableName"
                      placeholder="Table Name"
                      class="py-0 my-1"
                      color="orange"
                      :rules="[
                        v => !!v || 'Table Name is required',
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
                    capacity
                  </v-col>
                  <v-col
                    cols="12"
                    lg="4"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="capacity"
                      placeholder="capacity"
                      color="primary"
                      type="number"
                      class="rounded-lg py-0 my-1"
                      :rules="[
                        v => !!v || 'capacity is required',
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
                    Add table to zone
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
                    @click="(showZones = !showZones)"
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
                          <v-text-field
                            v-model="searchZones"
                            label="search"
                            class="mt-2"
                          ></v-text-field>
                          <v-btn
                            icon
                            text
                          >
                            <v-icon>
                              search
                            </v-icon>
                          </v-btn>
                          <!-- <v-btn
                            outlined
                            color="primary"
                            rounded
                            class="text-capitalize"
                          >
                            add user
                          </v-btn> -->
                        </v-app-bar>
                      </v-banner>
                      <v-chip-group
                        v-model="selectedZone"
                        column
                        active-class="primary"
                        color="primary"
                        class="mt-4"
                      >
                        <v-chip
                          v-for="(item, index) in zonesData"
                          :key="index"
                          outlined
                          label
                          large
                          :value="item.id"
                          class="ma-4 businesscard"
                        >
                          <v-card-subtitle class="mr-6" >{{ item.zoneName }} </v-card-subtitle>
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
                    Add User to table
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
                            Users
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
                            add user
                          </v-btn>
                        </v-app-bar>
                      </v-banner>
                      <v-chip-group
                        v-model="selectedStaff"
                        column
                        active-class="primary"
                        color="primary"
                        multiple
                        class="mt-4"
                      >
                        <v-chip
                          v-for="(item, index) in staffs"
                          :key="index"
                          width="430px"
                          outlined
                          label
                          large
                          :value="item.id"
                          class="d-inline-flex ma-4 businesscard"
                        >
                          <v-card-subtitle >{{ item.name }}</v-card-subtitle>
                        </v-chip>
                      </v-chip-group>
                    </v-card>
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
  import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class addTables extends Vue {
    @Prop({ default: '' }) readonly zones!: [];
    @Prop({ default: '' }) readonly updateTableInfo!: any;

    showSearch = false;

    tab = null;

    showZones = false;

    showTables = false;

    tableName = '';

    capacity = '';

    selectedZone = '';

    searchZones = '';

    staffs = [] as any;

    selectedStaff = [] as any;

    close() {
      this.$emit('close',false)
    }

    async getUsers() {
      try {
        const { data } = await this.$axios.get(`/v1/users/${this.$route.params.business}`, {
          withCredentials: true,
        });
        this.staffs = data;
      } catch (error) {
        console.error(error);
      }
    }

    get zonesData() {
      // eslint-disable-next-line array-callback-return
      return this.zones.filter((search: any) => {
        if(search.zoneType === 'Dine In') {
          return this.searchZones.toLowerCase().split(' ').every((v: string) => search.zoneName.toLowerCase().includes(v)) ;
        }
      });
    }

    async save() {
      const form = this.$refs.form as HTMLFormElement;
      if (form.validate()) {
        if(this.updateTableInfo.id) {
          try {
            await this.$axios.put(`/v1/zones/${this.selectedZone}/tables/${this.updateTableInfo.id}`,{
              businessId:this.$route.params.business,
              zoneId: this.selectedZone,
              name: this.tableName,
              capacity: this.capacity,
              staff: this.selectedStaff,
            },
              {
                withCredentials: true,
              }
            );
            this.$emit("update",'');
          } catch (error) {
            console.log(error)
          }
        }
        else {
          try {
            await this.$axios.post(`/v1/zones/${this.selectedZone}/tables`,{
              businessId:this.$route.params.business,
              zoneId: this.selectedZone,
              name: this.tableName,
              capacity: this.capacity,
              staff: this.selectedStaff,
            },
              {
                withCredentials: true,
              }
            );
            this.$emit("update",'');
          } catch (error) {
            console.log(error)
          }
        }
      }
    }

    mounted() {
      this.tableName = this.updateTableInfo.name;
      this.capacity = this.updateTableInfo.capacity;
      this.selectedZone = this.updateTableInfo.zoneId;
      this.selectedStaff = this.updateTableInfo.staff;
      this.getUsers()
    }

    @Watch('updateTableInfo') 
      updateInfo() {
        this.tableName = this.updateTableInfo.name;
        this.capacity = this.updateTableInfo.capacity;
        this.selectedZone = this.updateTableInfo.zoneId;
        this.selectedStaff = this.updateTableInfo.staff;
      };
  }
  </script>

<style>
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

  .dishcard {
    border-width: 0.5px 0.5px 0.5px 0 !important;
    border-style: solid !important;
    border-color: rgba(0 0 0 /60%) !important;
    border-radius: 0 6px 6px 0 !important;
  }

  </style>