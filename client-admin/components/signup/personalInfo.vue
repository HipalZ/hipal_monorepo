<template>
  <v-row  class="">
		<v-col
      cols="12"
      lg="8"
      md="7"
      sm="12"
      class="pr-0 mr-0"
    >
			<v-img
				src="/login.png"
				:height="$vuetify.breakpoint.mdAndUp ? '100vh':''"
			>
			</v-img>
		</v-col>
		<v-col 
      cols="12"
      lg="4"
      md="5"
      sm="12"
      :class="$vuetify.breakpoint.mdAndUp?'px-0 mx-0 ml-n6':'mt-n14'"
    >
      <v-card
        :class="$vuetify.breakpoint.mdAndUp? '':'rounded-t-xl mr-6'"
        :flat="$vuetify.breakpoint.mdAndUp?'': true"
      >
        <v-form
          ref="form"
        >
          <v-row
            class=""
            align="center"
            justify="center"
          >
            <v-col
              class="ml-n10 mx-0"
            >
              <v-list-item
                class="px-0 mx-0"
                flat
              >
                <v-list-item-icon class="px-0 mx-0">
                  <v-img
                      src="/hipalLogo.svg"
                      contain
                    >
                  </v-img>
                </v-list-item-icon>
              </v-list-item>
            </v-col>
            <v-col
              cols="12"
              align="center"
              :class="$vuetify.breakpoint.xl? 'mt-16':''"
            >
              <span 
                :class="$vuetify.breakpoint.mdAndUp? 'text-h4 font-weight-bold':'text-h6 font-weight-bold'"
                style="color: #2C5282;"
              >
                Admin log In
              </span>
              <!-- <v-list-item-subtitle class="caption grey--text">
                Take less than 10 minutes to fill out all the information needed to register your business 
              </v-list-item-subtitle> -->
            </v-col>
          </v-row>
          <v-row
            class="align-self-center"
            align="center"
            justify="center"
          >
            <v-col
              cols="8"
              align="center"
              :class="$vuetify.breakpoint.xl? 'mt-10':''"
            >
              <v-row
              align="center"
              justify="center"
              >
                <v-col
                  cols="12"
                  class="mt-4"
                >
                  <v-text-field
                    v-model="fullName"
                    type="name"
                    :rules="[
                      v => !!v || 'Name is required',
                      v => v.length > 2 || 'Name must be valid'
                    ]"
                    label="Full Name"
                    validate-on-blur
                    color="orange"
                    required
                  >
                  </v-text-field>
                </v-col>
                <v-col
                  cols="12"
                >
                  <v-text-field
                    v-model="phoneNumber"
                    :rules="[
                      v => !!v || 'Phone is required',
                      v => /^[0-9]{10,12}$/.test(v) || 'Phone is invalid',
                    ]"
                    label="Phone Number"
                    validate-on-blur
                    color="orange"
                    maxlength="10"
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field
                    v-model="password"
                    type="password"
                    label="Password"
                    validate-on-blur
                    color="orange"
                    required
                  >
                  </v-text-field>
                </v-col>
                <v-col cols="12" class="pt-16">
                  <v-btn
                    color="#E96108"
                    width="238px"
                    height="43px"
                    class="white--text text-capitalize text-h6"
                    rounded
                    @click="nextPage"
                  >
                    <span >Sign Up</span>
                    <!-- <font-awesome-icon
                    class="mx-4"
                    icon="chevron-right"
                    >
                    </font-awesome-icon> -->
                  </v-btn>
                </v-col>
              </v-row>
            </v-col>
          </v-row>
        </v-form>
      </v-card>
    </v-col>
	</v-row>
</template>

<script>
export default {
 name: 'personalInfo',
 data() {
   return {
    showText: false,

    email: '',

    fullName: '',

    phoneNumber: '',

    businessRole : '',

    password : '',

    items : [
      'RESTAURANT_OWNER',
      'RESTAURANT_MANAGER',
      'RESTAURANT_FLOOR_MANAGER',
    ],
   }
 },

  methods: {
    async nextPage() {
      const form = this.$refs.form;
      if (form.validate()) {
        try {
          await this.$axios.post('/v1/users/otp?clientRole=admin', {
            phone: this.phoneNumber,
          });
          this.$emit('phoneNumber', this.phoneNumber)
          this.$emit('next', 'tab-2');
        } catch (error) {
          console.log(error);
        }
      }
    }
  }
}
</script>

<style>
.cardborder {
 border-left: 8px solid #E96108 !important;
}

.td {
 border-bottom: none !important;
}
</style>
