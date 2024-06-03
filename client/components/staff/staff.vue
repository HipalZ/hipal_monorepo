<template>
  <v-data-iterator
    :items="filteredStaff"
    :search="staffName"
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:default="props">
      <v-row>
        <v-col
          v-for="(item, index) in props.items"
          :key="index"
          cols="12"
          xl="2"
          lg="2"
          md="3"
          sm="6"
          xs="5"
          align="left"
          justify="left"
          class="ma-4"
        >
          <v-card
            class="secondary--text zonescard"
            rounded-lg
          >
            <v-card-title class="subtitle-1">
              <v-icon class="mr-2" color="secondary">account_circle</v-icon> {{ item.name }}
            </v-card-title>
            <v-card-title
              v-for="(role,index) in item.customRole"
              :key="index" 
              class="subtitle-1 mt-4">
              {{ roleName(role.customRoleId)?.name }}
            </v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-data-iterator>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class staff extends Vue {
  @Prop({ default: '' }) readonly filteredStaff!: string;
  @Prop({ default: '' }) readonly staffName!: string;
  loading = false;

  roles = [] as any;

  editDish() {
    this.loading = true;
    this.$emit('openEditForm', {});
    this.loading = false;
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
    return this.roles.find((role: any)=>role.id === id);
  }

  async mounted() {
    await this.getRoles();
  }
}
</script>

<style lang='scss' scoped>
</style>