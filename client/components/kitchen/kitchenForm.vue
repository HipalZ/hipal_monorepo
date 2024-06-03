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
        Add Kitchen
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
              class="active-card secondary--text  pa-8 mt-4"     
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
                    Kitchen name
                  </v-col>
                  <v-col
                    cols="12"
                    lg="6"
                    class="py-0 my-0"
                  >
                    <v-text-field
                      v-model="kitchenName"
                      placeholder="Kitchen name"
                      class="py-0 my-1"
                      color="orange"
                      :rules="[
                        v => !!v || 'Kitchen Name is required',
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
                    lg="3"
                    class="pr-0 mr-0"
                  >
                    Add Staff to kitchen
                  </v-col>
                  <v-col
                    cols="12"
                    lg="4"
                    class="py-0 my-0"
                  >
                  <v-btn
                    outlined
                    color="primary"
                    rounded
                    class="text-capitalize"
                    @click="showStaff = !showStaff"
                  >Add</v-btn>
                  </v-col>
                </v-row>
                <v-row
                  v-show="showStaff"
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
                            Staff
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
                            Add a new role
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
                          :value="item.id"
                          label
                          large
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
  export default class KitchenForm extends Vue {
    @Prop({ default: '' }) readonly editKitchen!: any;

    showSearch = false;

    tab = null;

    kitchenName = '';

    description = '';

    showStaff = false;

    showZones = false;

    selectedStaff :string[] = []

    kitchenId = '';

    staffs = [] as any;

    close() {
      this.$emit('close',false)
    }

    async save() {
      const form = this.$refs.form as HTMLFormElement;
      if (form.validate()) {
        if(this.kitchenId) {
          try {
            await this.$axios.put(`v1/kitchens/${this.kitchenId}`,{
                businessId:this.$route.params.business,
                kitchenName: this.kitchenName,
                description: this.description,
                staff: this.selectedStaff,
            },
              {
                withCredentials: true,
              }
            );
            this.$emit('update',false)
          } catch (error) {
            console.log(error)
          }
        }
        else {
          try {
            await this.$axios.post('/v1/kitchens',{
              businessId:this.$route.params.business,
              kitchenName: this.kitchenName,
              description: this.description,
              staff: this.selectedStaff,
            },
              {
                withCredentials: true,
              }
            );
            this.$emit('update',false)
          } catch (error) {
            console.log(error)
          }
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

    mounted() {
      this.getUsers();  
    }

    @Watch('editKitchen') 
    updateInfo() {
      this.kitchenName = this.editKitchen.kitchenName;
      this.description = this.editKitchen.description;
      this.kitchenId = this.editKitchen.id;
      this.selectedStaff = this.editKitchen.staff;
      console.log(this.kitchenId,'id')
    };
  }
  </script>

<style>
  .dishcard {
    border-width: 0.5px 0.5px 0.5px 0 !important;
    border-style: solid !important;
    border-color: rgba(0 0 0 /60%) !important;
    border-radius: 0 6px 6px 0 !important;
  }
</style>