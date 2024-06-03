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
        Add Zone
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
          @click="close"
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
              class=" secondary--text active-card pa-8 mt-4"     
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
                    Add Zone name
                    <span class="error--text">*</span>
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="zoneName"
                      placeholder="Zone Name"
                      class="py-0 my-1"
                      color="orange"
                      :rules="[
                        v => !!v || 'Zone Name is required',
                        v => v.length > 2 || 'Zone Name must be valid',
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
                    Zone type
                    <span class="error--text">*</span>
                  </v-col>
                  <v-col
                    cols="12"
                    lg="4"
                    class="py-0 my-0"
                  >
                    <v-select
                      v-model="zoneType"
                      placeholder="Type of Zone"
                      :items="zonesTypes"
                      color="primary"
                      outlined
                      class="rounded-lg"
                      :rules="[
                        v => !!v || 'zoneType is required'
                      ]"
                      validate-on-blur
                    ></v-select>
                  </v-col>
                </v-row>
                <v-row
                  class="secondary--text"
                >
                  <v-col
                    cols="12"
                    lg="2"
                  >
                    Time
                  </v-col>
                  <v-col
                    cols="12"
                    lg="2"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="startTime"
                      placeholder="time"
                      type="time"
                      value="12:30:AM"
                      class="py-0 my-1"
                      color="orange"
                    ></v-text-field>
                  </v-col>
                  <v-col
                    cols="12"
                    lg="1"
                    class="text-center"
                  >
                    to
                  </v-col>
                  <v-col
                    cols="12"
                    lg="2"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="endTime"
                      placeholder="time"
                      type="time"
                      value="12:30:pm"
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
                  >
                    Add User to zone
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
                      @click="showUsers = !showUsers"
                    >Add</v-btn>
                  </v-col>
                </v-row>
                <v-row
                  v-show="showUsers"
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
                          <v-text-field
                            v-model="searchUsers"
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
                            :to="`/businesses/${$route.params.business}/staff`"
                          >
                            add user
                          </v-btn>
                        </v-app-bar>
                      </v-banner>
                      <v-chip-group
                        v-model="selectedStaff"
                        multiple
                        column
                        active-class="primary"
                        color="primary"
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
  import { Vue, Component, Prop } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class ZoneForm extends Vue {
    @Prop({ default: '' }) readonly kitchens!: [];

    showSearch = false;

    showKitchens = false;

    showUsers = false;

    selectedStaff = [] as any;

    searchKitchens = '';

    zonesTypes = [
      "Dine In",
      "Take Away"
    ]

    searchUsers = '';

    tab = null;

    zoneName = '';

    zoneType = '';

    startTime = '';

    endTime = '';

    staffs = [] as any;

    close() {
      this.$emit("close",'');
    }

    get kitchensData() {
      return this.kitchens.filter((search: any) => {
        return this.searchKitchens.toLowerCase().split(' ').every((v: string) => search.kitchenName.toLowerCase().includes(v));
      });
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

    clear() {
      this.zoneName= '';
      this.startTime= '';
      this.endTime= '';
      this.zoneType= '';
    }

    async save() {
      const form = this.$refs.form as HTMLFormElement;
      if (form.validate()) {
        try {
          await this.$axios.post('/v1/zones',{
            businessId:this.$route.params.business,
            zoneName: this.zoneName,
            zoneType: this.zoneType,
            startTime: this.startTime,
            endTime: this.endTime,
            staff: this.selectedStaff,
          },
            {
              withCredentials: true,
            }
          );
          this.$emit("update",'');
          this.clear();
        } catch (error) {
          console.log(error)
        }
      }
    }

    mounted() {
      this.getUsers();
    }

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