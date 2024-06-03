<template>
  <v-dialog
    v-model="dialog"
    persistent
    fullscreen
  >
    <template v-slot:activator="{ on, attrs }">
      <v-btn
        rounded
        color="error"
        text
        height="49px"
        class="text-capitalize text-h6 mb-4"
        :loading="loading"
        v-bind="attrs"
        v-on="on"
      >
        {{ buttonText }}
      </v-btn>
    </template>
    <v-card
      color="secondary d-flex"
    >
      <v-row
        align="center"
        justify="center"
      >
        <v-col
          cols="12"
          lg="3"
        >
          <v-card
            class="deletecard align-self-center"
          >
            <v-card-text class="text-h6 accent--text">
              {{ title }}
            </v-card-text>
            <v-card-text>
              {{ text }}
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="success darken-1"
                text
                @click="dialog = false"
              >
                No
              </v-btn>
              <v-btn
                color="error darken-1"
                text
                @click="confirm"
              >
                Yes
              </v-btn>
              <v-spacer></v-spacer>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-card>
  </v-dialog>
</template>

<script lang='ts'>
import { Vue, Component, Prop } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class ConfirmationDialog extends Vue {
  @Prop({ default: '' }) readonly buttonText!: string;
  @Prop({ default: '' }) readonly title!: string;
  @Prop({ default: '' }) readonly text!: string;
  dialog = false;
  loading = false;
  confirm() {
    this.loading = true;
    this.$emit('confirm', {});
    this.loading = false;
    this.dialog = false;
  }
}
</script>

<style lang='scss' scoped>
.deletecard {
  background: linear-gradient(0deg, rgba(233, 97, 8, 0.06), rgba(233, 97, 8, 0.06)), #FFFBFE;
  border-radius: 28px;
}
</style>