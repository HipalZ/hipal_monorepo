<template>
  <v-container fluid class="pa-0">
    <v-row
      class="mx-4 mt-2"
    >
      <v-col
        cols="12"
        lg="12"
        sm="12"
        class=""
      >
        <v-row
          class="text-h5 secondary--text px-6 font-weight-medium mb-1"
        >
          Roles
          <v-spacer></v-spacer>
          <v-btn
            icon
            x-large
            @click="showSearch = !showSearch"
          >
            <v-icon
              :color="showSearch?'primary':'#1C1B1F'"
            >search</v-icon>
          </v-btn>
          <v-btn
            icon
            x-large
            class="mr-2"
          >
            <v-icon
              color="#1C1B1F"
            >
              filter_alt
            </v-icon>
          </v-btn>
          <v-btn
            rounded
            color="error"
            height="49px"
            large
            class="text-capitalize mx-2"
            @click="deleteRole"
          >
            delete
          </v-btn>
          <v-btn
            rounded
            color="primary"
            height="49px"
            large
            class="text-capitalize"
            @click="(dialog = true)"
          >
            Add Roles
          </v-btn>
        </v-row>
        <role
          :roleName="roleName"
          :filteredRole="filteredRole"
          @DeleteId="DeleteId"
        />
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialog"
      fullscreen
      transition="dialog-bottom-transition"
      persistent
    >
        <v-card
          color="#f5f5f5"
        >
          <roleForm
            @close="close"
          />
        </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import role from '@/components/staff/roles/role.vue'
  import roleForm from '@/components/staff/roles/roleForm.vue'

  @Component({
    components: {
      role,
      roleForm,
    },
  })
  export default class Roles extends Vue {

    showSearch = false;

    dialog = false;

    roleName = '';

    selectedDeleteId = '';

    filteredRole = [
      {
        ZoneName: 'gold',
      },
      {
        ZoneName: 'gold',
      },
      {
        ZoneName: 'gold',
      },
      {
        ZoneName: 'gold',
      },
    ]

    close(info : boolean) {
      this.dialog = info;
      this.getRoles();
    }

    DeleteId(info:string) {
      this.selectedDeleteId = info;
    }

    async getRoles() {
      try {
        const { data } = await this.$axios.get(`/v1/businesses/${this.$route.params.business}/roles`, {
          withCredentials: true,
        });
        this.filteredRole = data;
      } catch (error) {
        console.error(error);
      }
    }

    async deleteRole() {
      try {
        await this.$axios.delete(`/v1/businesses/${this.$route.params.business}/role/${this.selectedDeleteId}`, {
          withCredentials: true,
        });
        this.getRoles();
      } catch (error) {
        console.error(error);
      }
    }

    mounted() {
      this.getRoles();
    }
}
</script>
