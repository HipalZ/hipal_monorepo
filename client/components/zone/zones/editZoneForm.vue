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
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          lg="10"
        >
          <v-card-title class="text-capitalize">
            {{ zoneName }}
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
            <v-card
              class="secondary--text"
              flat
              color="#f5f5f5"
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
                  </v-col>
                  <v-col
                    cols="12"
                    lg="4"
                    class="py-0 my-0"
                  >
                    <v-select
                      v-model="zoneType"
                      :items="zonesTypes"
                      placeholder="Type of Zone"
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
                  class="pt-3"
                >
                  <v-card-title
                    class="my-0 py-0"
                  >
                    Users
                  </v-card-title>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    rounded
                    outlined
                    class="text-capitalize mr-2 text-h6"
                    @click="addUserDialog=true"
                  >add user</v-btn>
                </v-row>
                <v-row>
                  <v-col
                    v-for="(user,index) in staffIds"
                    :key="index"
                    cols="12"
                    xl="2"
                    lg="2"
                    md="3"
                    sm="5"
                    xs="5"
                    align="left"
                    justify="left"
                    class="ma-4"
                  >
                    <v-card
                      class="secondary--text zonescard"
                      rounded-lg
                    >
                      <v-card-title class="secondary--text subtitle-1">
                        <v-icon color="secondary">account_circle</v-icon>
                        &nbsp;
                        {{ findNameById(user) }}
                      </v-card-title>
                      <v-card-title class="subtitle-1">
                        {{ roleName(user) }}
                      </v-card-title>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row
                  class="pt-3"
                >
                  <v-card-title
                    class="my-0 py-0"
                  >
                    Tables
                  </v-card-title>
                  <v-spacer></v-spacer>
                  <v-btn
                    color="primary"
                    rounded
                    outlined
                    class="text-capitalize mr-2 text-h6"
                  >add tables</v-btn>
                </v-row>
                <v-row>
                  <v-col
                    v-for="(item,index) in tablesInfo"
                    :key="index"
                    cols="12"
                    xl="2"
                    lg="2"
                    md="3"
                    sm="5"
                    xs="5"
                    align="left"
                    justify="left"
                    class="ma-4"
                  >
                    <v-card
                      class="secondary--text zonescard"
                      rounded-lg
                    >
                      <v-card-title class="secondary--text subtitle-1">
                        {{item.name}}
                        <v-spacer></v-spacer>
                        <v-btn
                          icon
                          @click="removeTable(index)"
                        >
                          <v-icon>close</v-icon>
                        </v-btn>
                      </v-card-title>
                      <v-card-title class="subtitle-1 px-2">
                        <v-icon
                          class=""
                          color="secondary"
                        >boy</v-icon> {{item.capacity}}/9
                      </v-card-title>
                    </v-card>
                  </v-col>
                </v-row>
              </v-card-text>
            </v-card>
          </v-form>
        </v-col>
      </v-row>
      <v-dialog
        v-model="addUserDialog"
        persistent
        width="500px"
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
                rounded
                icon
                class="text-capitalize"
                @click="addUserDialog=false"
              >
                <v-icon>close</v-icon>
              </v-btn>
            </v-app-bar>
          </v-banner>
          <v-chip-group
            v-model="staffIds"
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
      </v-dialog>
    </v-card>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component, Prop, Watch } from 'vue-property-decorator';

  @Component({
    components: {
    },
  })
  export default class EditZoneForm extends Vue {
    @Prop({ default: '' }) readonly zoneUpdateInfo!: any;

    showSearch = false;

    showKitchens = false;

    showUsers = false;

    searchKitchens = '';

    zonesTypes = [
      "Dine In",
      "Take Away"
    ];

    addUserDialog = false;

    searchUsers = '';

    tab = null;

    zoneName = '';

    zoneType = '';

    startTime = '';

    endTime = '';
    
    tables = [] as any;

    zoneId = '';

    staffs = [] as any;

    staffIds = [];

    tablesInfo = [] as any;

    roles = [] as any;

    close() {
      this.$emit("close",'');
    }

    removeTable(id:number) {
      this.tablesInfo.splice(id,1);
    }

    get tableIds() {
      const ids = [] as any;
      for(let i =0; i<this.tablesInfo.length; i++) {
        ids.push(this.tablesInfo[i].id)
      }
      return ids;
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
          await this.$axios.put(`/v1/zones/${this.zoneId}`,{
            businessId:this.$route.params.business,
            zoneName: this.zoneName,
            zoneType: this.zoneType,
            startTime: this.startTime,
            endTime: this.endTime,
            tables: this.tableIds,
            staff: this.staffIds,
          },
            {
              withCredentials: true,
            }
          );
          this.clear();
          this.$emit("update",'');
          this.$emit("close",'');
        } catch (error) {
          console.log(error)
        }
      }
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

    async getRoles() {
      try {
        const { data } = await this.$axios.get(`/v1/businesses/${this.$route.params.business}/roles`, {
          withCredentials: true,
        });
        this.roles= data;
      } catch (error) {
        console.error(error);
      }
    }

    roleName(id:string) {
      const obj = this.staffs.find((item: any) => item.id === id);
      const role = this.roles.find((role: any)=>role.id === obj?.customRole[0].customRoleId);
      console.log(obj,role)
      return role ? role.name : null;
    }

    findNameById(id:any) {
      const obj = this.staffs.find((item: any) => item.id === id);
      return obj ? obj.name : null;
    }

    async mounted() {
      this.zoneName = this.zoneUpdateInfo.zoneName;
      this.startTime = this.zoneUpdateInfo.startTime;
      this.endTime = this.zoneUpdateInfo.endTime;
      this.zoneType = this.zoneUpdateInfo.zoneType;
      this.tables = this.zoneUpdateInfo.tables;
      this.zoneId = this.zoneUpdateInfo.id;
      this.staffIds = this.zoneUpdateInfo?.staff;
      this.tablesInfo = this.$store.getters['zone/tableNames'](this.zoneId)
      await this.getUsers();
      await this.getRoles();
    }

    @Watch('zoneUpdateInfo') 
      updateInfo() {
        this.zoneName = this.zoneUpdateInfo.zoneName;
        this.startTime = this.zoneUpdateInfo.startTime;
        this.endTime = this.zoneUpdateInfo.endTime;
        this.zoneType = this.zoneUpdateInfo.zoneType;
        this.tables = this.zoneUpdateInfo.tables;
        this.zoneId = this.zoneUpdateInfo.id;
        this.staffIds = this.zoneUpdateInfo?.staff;
        this.tablesInfo = this.$store.getters['zone/tableNames'](this.zoneId)
      };
  }
</script>
