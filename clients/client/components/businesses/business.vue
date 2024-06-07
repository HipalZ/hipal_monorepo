<template>
  <v-card
    class="businesscard"
    :disabled="!business.status"
    @click="$router.push(
      {
        name: 'businesses-business-dashboard',
        params: {
          business: business.id
        }
      }
    )"
  >
    <v-card-actions class="px-0 mx-0" >
      <v-list-item class="grow pr-0">
        <v-list-item-avatar tile>
          <v-img
            class="elevation-6"
            alt=""
            :src="business.logo"
            contain
          ></v-img>
        </v-list-item-avatar>

        <v-list-item-content class="">
          <v-card-text class="pa-0 ma-0 subtitle-1 text-left">
            {{
              20 > business.businessName.length ? business.businessName :business.businessName.substr(0, 20) + '...'
            }}
          </v-card-text>
        </v-list-item-content>

        <v-list-item-action class="mt-n6">
          <v-badge
            overlap
            dot
            :color="business.status ? 'success':'error'"
          ></v-badge>
        </v-list-item-action>
      </v-list-item>
    </v-card-actions>
    <v-card-actions
      class="mt-14 mb-4"
    >
      <v-spacer></v-spacer>
        <business-info
          :link="business.link"
          :business-name="business.businessName"
          :registered-name="business.registeredName"
          :custom-link="business.customLink"
        />
      <v-spacer></v-spacer>
    </v-card-actions>
  </v-card>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
import BusinessInfo from './businessInfo.vue';

@Component({
  components: {
    BusinessInfo,
  },
})
export default class Business extends Vue {
  @Prop({ default: () => {}}) readonly business!: any;
}
</script>

<style lang='scss' scoped>
</style>
