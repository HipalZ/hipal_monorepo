<template>
  <v-data-iterator
    :items="filteredRole"
    :search="roleName"
    :items-per-page="-1"
    hide-default-footer
  >
    <template v-slot:default="props">
      <v-row>
        <v-col
          v-for="(item, index) in props.items"
          :key="index"
          cols="12"
          xl="3"
          lg="3"
          md="3"
          sm="6"
          xs="5"
          class="pa-8"
        >
          <v-item-group
            v-model="selectedRole"
          >
            <v-item 
              v-slot="{ active, toggle }"
              :value="item.id"
            >
              <v-card
                class="secondary--text "
                rounded-lg
                :class="active?'userflow':'editdishesborder'"
                @click="toggle"
              >
                <v-card-title
                >
                  {{ item.name }}
                  <v-spacer></v-spacer>
                  <v-tooltip
                    bottom
                    max-width="300px"
                    color="white"
                  >
                  <template v-slot:activator="{ on, attrs }">
                    <v-icon
                      color="secondary"
                      dark
                      v-bind="attrs"
                      v-on="on"
                    >
                    info_outline
                    </v-icon>
                  </template>
                  <span
                    v-for="permission in  item.permissions" 
                    class="secondary--text"
                    :key="permission"  
                  >
                    {{ permission.split('/')[2] }},
                  </span>
                </v-tooltip>
                </v-card-title>
              </v-card>
            </v-item>
          </v-item-group>
        </v-col>
      </v-row>
    </template>
  </v-data-iterator>
</template>

<script lang='ts'>
import { Vue, Component, Prop,Watch } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class role extends Vue {
  @Prop({ default: '' }) readonly filteredRole!: string;
  @Prop({ default: '' }) readonly roleName!: string;
  loading = false;

  selectedRole = '';

  // deleteId() {
  //   this.loading = true;
  //   this.$emit('DeleteId', this.selectedRole);
  //   this.loading = false;
  // }

  @Watch('selectedRole')
  deleteId() {
    this.loading = true;
    this.$emit('DeleteId', this.selectedRole);
    this.loading = false;
  }
}
</script>

<style lang='scss' scoped>
</style>