<template>
  <v-item v-slot="{active, toggle}">
    <v-card
      class=" secondary--text  pa-4 mt-4"
      :class="active ? 'active-card':'businesscard'"
      @mousedown="toggle"
      :id="'sec_'+'0'"
    >
    <span :id="'span_'+'0'"></span>
      <v-card-title>Basic</v-card-title>
      <v-card-text
        class="secondary--text"
      >
        <v-row
        >
          <v-col
            cols="12"
            lg="2"
          >
            Category Name
            <span class="error--text">*</span>
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="py-0 my-0"
          >
            <v-text-field
              v-model="name"
              placeholder="Category Name"
              class="py-0 my-1"
              color="orange"
              :rules="[
                v => !!v || 'Category Name is required',
                v => v.length > 2 || 'Category Name must be valid',
                v => !categoryNames.includes(v) || 'This category already exists',
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
            Visibility
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="py-0 my-0"
          >
            <v-switch
              v-model="Visibility"
              color="primary"
              inset
            ></v-switch>
          </v-col>
        </v-row>
        <v-row
        >
          <v-col
            cols="12"
            lg="2"
            class="pt-5"
          >
            Timer
          </v-col>
          <v-col
            cols="12"
            lg="4"
            class="py-0 my-0"
          >
            <v-switch
              v-model="timerOn"
              color="primary"
              inset
            ></v-switch>
          </v-col>
          
          <v-col
            v-if="timerOn"
            cols="12"
            lg="2"
          >
            <v-text-field
              v-model="timerStart"
              placeholder="time"
              type="time"
              value="12:30:pm"
              class=""
              color="orange"
              label="Start Time *"
            ></v-text-field>
          </v-col>
          <v-col
            v-if="timerOn"
            cols="12"
            lg="2"
          >
            <v-text-field
              v-model="timerEnd"
              placeholder="time"
              type="time"
              value="12:30:pm"
              class=""
              color="orange"
              label="End Time *"
            ></v-text-field>
          </v-col>
        </v-row>
        <v-row
          v-if="timerOn"
          class="my-2"
        >
          <v-col
            cols="12"
            lg="2"
            class="mt-1"
          >
            Available On Days *
          </v-col>
          <v-col
            cols="12"
            lg="6"
            class="py-0 my-0"
          >
          <v-chip-group
            v-model="availableDays"
            multiple
            active-class="primary"
            color="primary"
          >
            <v-chip
              v-for="tag in days"
              :key="tag"
              label
              outlined
              class="mr-2"
            >
              {{ tag }}
            </v-chip>
          </v-chip-group>
          </v-col>
        </v-row>
        <v-row
        >
          <v-col
            cols="12"
            lg="2"
          >
            Hierarchy
            <span class="error--text">*</span>
          </v-col>
          <v-col
            cols="12"
            lg="4"
            class="py-0 my-0"
          >
          <v-combobox
            v-model="hierarchy"
            :items="items"
            outlined
            label="Select Hierarchy"
            :rules="[
              v => !!v || 'Hierarchy is required'
            ]"
            validate-on-blur
          >
            <template v-slot:item="data">
              <span class="prog-title">{{data.item}}</span>
            </template>
            <template v-slot:selection="data">
              <span class="prog-title">{{data.item}}</span>
            </template>
          </v-combobox>
          </v-col>
        </v-row>
        <v-row
          v-if="hierarchy==='CHILD'"
        >
          <v-col
            cols="10"
          >
            <v-card
              height="380px"
              outlined
              class="businesscard overflow-auto pa-16 pt-0"
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
                      select ParentCategory
                    </v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-text-field
                      v-model="searchParentCategories"
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
                  </v-app-bar>
                </v-banner>
              <v-chip-group
                v-model="selectedParentCategory"
                column
                active-class="primary close"
                color="primary"
                class="mt-4"
              >
                <span
                  v-for="(item,index) in CategoriesData"
                  :key="index"
                >
                  <v-chip
                    v-if="$store.state.categoryName != item.name && item.hierarchy === 'PARENT'"
                    width="430px"
                    outlined
                    label
                    large
                    filter-icon="close"
                    filter
                    class="d-inline-flex ma-4 businesscard"
                    :value=item.name
                    @click="parentId(item.id)"
                  >
                    <v-card-subtitle> {{item.name}}</v-card-subtitle>
                  </v-chip>
                </span>
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
            Dishes
          </v-col>
          <v-col
            cols="12"
            lg="4"
            class=""
          >
            in {{selectedDishes.length}} dishes
          </v-col>
          <v-col
            cols="12"
            lg="6"
            align="center"
          >
            <v-btn
              outlined
              rounded
              color="primary"
              class="text-capitalize"
              @click="showDishes= !showDishes"
            >add</v-btn>
          </v-col>
        </v-row>
        <v-row>
          <v-col
            cols="10"
            v-if="(selectedDishes.length > 0)"
          >
            <v-card
              outlined
              class="businesscard overflow-auto pa-16 py-0"
            >
              <!-- <v-chip-group
                multiple
                column
                active-class="primary"
                color="primary"
              >
                <span>
                  <v-chip
                    v-for="(item,index) in selectedDishes"
                    :key="index"
                    width="430px"
                    outlined
                    label
                    large
                    class="d-inline-flex ma-4 businesscard"
                  >
                    <v-card-subtitle >{{item.name}}</v-card-subtitle>
                  </v-chip>
                </span>
              </v-chip-group> -->
              <v-chip
                v-for="(item,index) in selectedDishes"
                :key="index"
                width="430px"
                outlined
                label
                large
                close
                close-icon="close"
                color="primary"
                class="d-inline-flex ma-4 businesscard"
                :value="item"
                @click:close="removeSelectedDish(index)"
              >
                <v-card-subtitle >{{item.name}}</v-card-subtitle>
              </v-chip>
            </v-card>
          </v-col>
        </v-row>

        <v-row
          v-if="showDishes"
        >
          <v-col
            cols="10"
          >
            <v-card
              height="380px"
              outlined
              class="businesscard overflow-auto pa-16 pt-0"
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
                    Dishes
                  </v-toolbar-title>
                  <v-spacer></v-spacer>
                  <v-text-field
                    v-model="searchDishes"
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
                </v-app-bar>
              </v-banner>
              <v-chip-group
                v-model="selectedDishes"
                column
                active-class="primary"
                color="primary"
                class="mt-4"
                multiple
              >
                <span
                  v-for="(item,index) in dishesData"
                  :key="index"
                >
                  <v-chip
                    width="430px"
                    outlined
                    label
                    :close="!active"
                    large
                    filter
                    filter-icon="close"
                    class="d-inline-flex ma-4 businesscard"
                    :value="{
                      id:item.id,
                      name:item.name,
                    }"
                  >
                    <v-card-subtitle>{{item.name}} </v-card-subtitle>
                  </v-chip>
                </span>
              </v-chip-group>
            </v-card>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>
  </v-item>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator';
@Component({
  components: {
  },
})
export default class CategoryForm extends Vue {

  @Prop({ default: '' }) readonly deleteButton!: boolean;

  @Prop({ default: '' }) readonly categoryData!: any;

  name= '';

  searchDishes= '';

  text = '';

  items=[
    'PARENT',
    'CHILD'
  ];
    
  Visibility= true;

  timerOn= false;

  timerStart= null;

  timerEnd= null;

  showDishes= false;

  hierarchy= '';

  parentCategory= '';

  days = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun'
  ];

  availableDays = [] as any;

  selectedDishes = [] as any;

  selectedParentCategory = '' as any;

  selectedTags= [] as any;

  toggle_exclusive= undefined;

  selection = 0;

  parentCategories = [] as any;

  parentCategoryId = '';

  dishes = [] as any;

  searchParentCategories = '' as any;

  categoryNames = [] as string[];

  get CategoriesData() {
    return this.parentCategories.filter((search: any) => {
      return this.searchParentCategories.toLowerCase().split(' ').every((v: string) => search.name.toLowerCase().includes(v));
    });
  }

  get dishesData() {
    return this.dishes.filter((search: any) => {
      return this.searchDishes.toLowerCase().split(' ').every(v => search.name.toLowerCase().includes(v));
    });
  }

  removeSelectedDish(index : number) {
    this.selectedDishes.splice(index,1)
  }

  parentId(id:string) {
    this.parentCategoryId = id;
  }

  async mounted() {
    try {
      const {data} =await this.$axios.get(`/v1/categories/${this.$route.params.business}/dishes`,
      {
          withCredentials: true,
      },
      )
      this.dishes = data
    } catch (error) {
      console.log(error)
    }
    
    try {
      const {data} =await this.$axios.get(`/v1/categories?businessId=${this.$route.params.business}`,
        {
          withCredentials: true,
        },
      )
      this.parentCategories = data
    } catch (error) {
      console.log(error)
    }

    const categories = [] as any;
    this.parentCategories.forEach((category: any) => {
      if (this.deleteButton) {
        if (this.name !== category.name) {
          categories.push(category.name);
        }
      } else {
        categories.push(category.name);
      }
    });
    this.categoryNames = categories;
  }

  get categoryInfo() {
    return {
      name: this.name,
      visibility: this.Visibility,
      timerOn: this.timerOn,
      timerStart: this.timerStart,
      timerEnd: this.timerEnd,
      availableDays: this.availableDays,
      hierarchy: this.hierarchy,
      parentCategory: this.selectedParentCategory,
      dishes: this.selectedDishes,
      parentCategoryId: this.parentCategoryId,
    }
  }

  @Watch('categoryInfo') 
  updateCategoryInfo() {
    this.$emit('categoryInformation',this.categoryInfo)
  }
  
  @Watch('categoryData') 
    updateInfo() {
      this.name = this.categoryData.name;
      this.Visibility = this.categoryData.visibility;
      this.timerOn = this.categoryData.timerOn;
      this.timerStart = this.categoryData.timerStart;
      this.timerEnd = this.categoryData.timerEnd;
      this.availableDays = this.categoryData.availableDays;
      this.hierarchy = this.categoryData.hierarchy;
      this.selectedParentCategory = this.categoryData.parentCategory;
      this.selectedDishes = this.categoryData.dishes;
      this.parentCategoryId =  this.categoryData.parentCategoryId;
    }
}
</script>

<style lang='scss' scoped>
</style>