<template>
  <v-container fluid class="pa-0 ma-0">
    <v-row
      class="mx-6 mt-2"
    >
      <v-col
        cols="12"
        lg="12"
        class=""
      >
        <v-row>
          <v-col
            cols="12"
            lg="10"
          >
            <v-form
              ref="form"
            >
              <v-item-group mandatory>
                <!-- basic -->
                <v-row
                  id="basic"
                >
                  <v-col
                  >
                    <span class="title">Category</span>
                    <category-form
                      :deleteButton="deleteButton"
                      :categoryData="categoryInfo"
                      @categoryInformation="categoryInformation"
                    />
                  </v-col>
                </v-row>
                <!-- display -->
                <v-row
                  id="display"
                  class="mt-6"
                >
                  <v-col
                  >
                    <span class="title">Display</span>
                    <v-item v-slot="{active, toggle}">
                      <v-card
                        class="secondary--text mt-6 pa-4"
                        :class="active ? 'active-card':'businesscard'"
                        @mousedown="toggle"
                        :id="'sec_'+'1'"
                      >
                      <span :id="'span_'+'1'" v-intersect="handleIntersect"></span>
                        <v-card-title>Display</v-card-title>
                        <v-card-text
                          class="secondary--text"
                        >
                          <v-row>
                            <v-col
                              cols="12"
                              lg="2"
                              class=""
                            >
                              <span class="caption">Cover</span>
                              <v-card
                                v-if="coverImage.length === 0"
                                class="pa-2"
                                @click="$refs.Image.click()"
                              >
                                <input
                                  ref="Image"
                                  type="file"
                                  v-show="false"
                                  accept="image/png, image/jpeg"
                                  @change="onImageFilesChange"
                                >
                                <v-img
                                  src="/addLogo.svg"
                                  height="145px"
                                  width="200px"
                                >
                                  <v-card-title class="mt-12 px-0 mx-0" >
                                    <v-spacer></v-spacer>
                                    <v-icon
                                      color="secondary"
                                    >add</v-icon>
                                    <v-spacer></v-spacer>
                                  </v-card-title>
                                </v-img>
                              </v-card>
                              <v-card
                                v-else
                                class="pa-2"
                                width="180px"
                              >
                                <v-img
                                  :src="coverImage"
                                  height="150px"
                                  width="180px"
                                  contain
                                >
                                  <v-app-bar color="rgba(0,0,0,0)" flat>
                                    <v-spacer></v-spacer>
                                    <v-btn
                                      icon
                                      color="white"
                                      large
                                      @click="removeCoverImage"
                                    >
                                      <v-icon>close</v-icon>
                                    </v-btn>
                                  </v-app-bar>
                                </v-img>
                              </v-card>
                            </v-col>
                          </v-row>
                        </v-card-text>
                      </v-card>
                    </v-item>
                  </v-col>
                </v-row>
                <!-- links -->
                <v-row
                  id="links"
                  class="mt-6"
                >
                  <v-col
                  >
                    <span class="title">Links</span>
                    <v-item v-slot="{active, toggle}">
                      <v-card
                        class="secondary--text  my-6 px-8 pb-4"
                        :class="active ? 'active-card':'businesscard'"
                        @mousedown="toggle"
                        :id="'sec_'+'2'"
                      >
                      <span :id="'span_'+'2'" v-intersect="handleIntersect"></span>
                        <v-card-title class="px-10">
                            Links
                          <v-spacer></v-spacer>
                          <span class=" mr-4"> 0 </span>
                          <v-btn
                            color="primary"
                            outlined
                            rounded
                            class="text-capitalize"
                            @click="(showLinks = !showLinks)"
                          > add </v-btn>
                        </v-card-title>
                        <v-divider class="mx-4"></v-divider>
                        <v-row
                          align="center"
                          justify="center"
                          v-for="(item, index) in links"
                          :key="index"
                          class="mt-2 pa-0"
                        >
                          <v-col
                            cols="12"
                            lg="1"
                            class=""
                            align="center"
                          >
                            {{index}}
                          </v-col>
                          <v-col
                            cols="12"
                            lg="6"
                            class="pr-6"
                          >
                            <span class="secondary--text">{{item}}</span>
                            <v-divider class="primary mt-1"></v-divider>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="1"
                          >
                              <v-btn
                                text
                                icon
                                class="text-capitalize"
                                @click="copyToClipBoard(item)"
                              >
                                <v-list-item-content>
                                  <v-list-item-title><v-icon>content_copy</v-icon></v-list-item-title>
                                  <v-list-item-subtitle class="secondary--text">copy</v-list-item-subtitle>
                                </v-list-item-content>
                              </v-btn>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="1"
                          >
                            <v-btn
                              text
                              icon
                              class="text-capitalize"
                              @click="generateQrLinkImage(item)"
                            >
                              <v-list-item-content>
                                <v-list-item-title><v-icon>qr_code_2</v-icon></v-list-item-title>
                                <v-list-item-subtitle class="secondary--text">Download  Qr</v-list-item-subtitle>
                              </v-list-item-content>
                            </v-btn>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="1"
                          >
                            <v-btn
                              icon
                              @click="removeLink(index)"
                            >
                              <v-icon>close</v-icon>
                            </v-btn>
                          </v-col>
                        </v-row>
                        <!-- <v-row
                          align="center"
                          justify="center"
                        >
                          <v-col
                            cols="12"
                            lg="10"
                          >
                          <v-divider class=""></v-divider>
                          </v-col>
                        </v-row> -->
                        <v-row
                          v-if="showLinks"
                          align="center"
                          justify="center"
                          class="mb-8"
                        >
                          <v-col
                            cols="12"
                            lg="10"
      
                          >
                            <v-card-title>
                              Add Link
                              <v-spacer></v-spacer>
                              <v-btn
                                outlined
                                color="primary"
                                rounded
                                class="text-capitalize"
                                @click="updateLinks"
                              >
                                update
                              </v-btn>
                            </v-card-title>
                          </v-col>
                          <v-col
                            cols="12"
                            lg="10"
                            class="pt-0"
                          >
                            <v-list-item>
                              <v-list-item-icon>
                                1
                              </v-list-item-icon>
                              <v-list-item-content class="py-0 my-0">
                                <v-list-item-title class="py-0 my-0">
                                  <v-text-field
                                    v-model="linkUrl"
                                    label="Link"
                                    class=""
                                    color="orange"
                                    :rules="[
                                      (value) => isURL(value) || !value || 'URL is not valid',
                                    ]"
                                    validate-on-blur
                                  ></v-text-field>
                                </v-list-item-title>
                              </v-list-item-content>
                            </v-list-item>
                          </v-col>
                        </v-row>
                      </v-card>
                    </v-item>
                  </v-col>
                </v-row>
              </v-item-group>
            </v-form>
          </v-col>
          <!-- sideNav -->
          <v-col
            cols="12"
            lg="2"
            align="center"
            class="px-0"
          >
            <v-banner sticky class="pa-0 ma-0" app>
              <v-row
                align="end"
                justify="end"
              >
                <v-btn
                  icon
                  large
                  class="pr-4"
                  @click="close"
                >
                  <v-icon>close</v-icon>
                </v-btn>
              </v-row>
              <v-row
                class="text-h5 secondary--text px-2 font-weight-medium mb-6 mt-2"
                align="center"
                justify="center"
              >
                <v-col
                  cols="12"
                  class="align-center justify-center d-flex"
                >
                  <Confirmation-Dialog
                    v-if="deleteButton"
                    buttonText='delete'
                    title="Are you sure what to delete this Category?"
                    @confirm="deleteCategory()"
                  />
                  <v-btn
                    rounded
                    color="success"
                    height="49px"
                    width="97px"
                    class="text-capitalize mb-4 text-h6"
                    @click="save()"
                  >
                    {{buttonText}}
                  </v-btn>
                </v-col>
              </v-row>
              
              <v-row>
                <v-chip-group
                  v-model="selection"
                  column
                  mandatory
                  active-class="primary"
                  color="primary"
                >
                  <v-col
                    cols="12"
                    align="center"
                    justify="center"
                    class="mt-16 p-16"
                  >
                    <span class="text-h6 accent--text">Add Category</span> <br>
                    <span class="caption accent--text">on this page</span>
                  </v-col>
                  <v-col
                    v-for="(item, index) in categoriesContent"
                    :key="index"
                    align="center"
                    cols="12"
                    class="py-2"
                  >
                    <v-chip
                      outlined
                      @click="$vuetify.goTo('#sec_'+index)"
                      class="sidenav"
                    >
                      {{item.name}}
                    </v-chip>
                  </v-col>
                </v-chip-group>
              </v-row>
            </v-banner>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <v-snackbar
      v-model="snackbar"
      timeout="1000"
    >
      {{ text }}
    </v-snackbar>
  </v-container>
</template>

<script lang='ts'>
  import { Vue, Component } from 'vue-property-decorator';
  import ConfirmationDialog from '@/components/confirmationDialog.vue'
  import CategoryForm from '@/components/items/categories/categoryForm.vue';
  const { v4: uuidv4 } = require('uuid');
  const QRCode = require('qrcode');

  @Component({
    components: {
      ConfirmationDialog,
      CategoryForm,
    },
  })
  export default class addCategory extends Vue {

    showLinks = false;

    snackbar = false;

    text = '';

    buttonText = 'save';

    coverImage= '' as any;

    links= [] as any;

    deleteButton = false;

    selectedTags= [] as any;

    toggle_exclusive= undefined;

    selection = 0;

    linkUrl = '' as any;

    coverImageFile = '' as any;

    qrSrc = '' as any;

    categoryInfo: any = {};

    categoryInformation(info: any) {
      this.categoryInfo = info;
    }

    isURL(str: string) {
      let url;

      try {
        url = new URL(str);
      } catch (_) {
        return false;
      }

      return url.protocol === "http:" || url.protocol === "https:";
    };

    generateQrLinkImage(link: any){
      QRCode.toDataURL(link)
        .then((url: string) => {
          this.qrSrc = url;
          console.log(url)
          this.downloadURI(this.qrSrc ,'linkQr')
        })
        .catch((err: any) => {
          console.error(err)
        })
    }

    downloadURI(uri: string, name: string) {
      var link = document.createElement("a");
      link.download = name;
      link.href = uri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    scrollbarTheme() {
      return this.$vuetify.theme.dark ? 'dark' : 'light';
    }

    categoriesContent = [
      {
        name:'Basic',
        href:'#basic'
      },
      {
        name:'Display',
        href:'#display'
      },
      {
        name:'Links',
        href:'#links'
      },
    ];

    tab_selected= 0 as any;


    async copyToClipBoard(text: string) {
      try {
        await navigator.clipboard.writeText(text);  
        this.text = 'Copied link to clipboard';
      } catch (error) {
        this.text = 'Failed to copy to clipboard';
      } finally {
        this.snackbar = true;
      }
    }

    removeCoverImage() {
      this.coverImage = '';
      this.coverImageFile='';
    }
      
    handleIntersect(entries: any, observer:any){
      let intersecting_element = entries[0]
      if(intersecting_element.isIntersecting){
        let id = intersecting_element.target.id
        let index = Number(id.split("_")[1])
        this.tab_selected = index
        this.selection = index
      }
    }

    onImageFilesChange(event: any) {
      const files = event.target.files;
      for(const file of files) {
        if (file.type.startsWith('image')) {
          this.coverImage = URL.createObjectURL(file);
          this.coverImageFile = file;
        }
      }
    }

    async storeImageFiles(image : File) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      const imageId = uuidv4()
      await new Promise((resolve, reject) => {
        reader.onload = () => {
          resolve(reader.result);
        };
      });
      if (reader.result) {

        const blobBin = atob(reader.result.toString().split(',')[1]);
        const array = [];
        for (let i = 0; i < blobBin.length; i++) {
          array.push(blobBin.charCodeAt(i));
        }
        const file = new Blob([new Uint8Array(array)], {
          type: image.type,
        });
        const formdata = new FormData();
        formdata.append('fileData', file);
        formdata.append("fileName", `${imageId}`);
        formdata.append("bucketName", "assets");
        try {
         await this.$axios.post('/v1/storage', formdata);
         return `https://storage.hipal.life/minio/assets/${imageId}`;
        } catch (error) {
          console.log(error);
        }
      }
    }

    updateLinks() {
      if (!!this.linkUrl && this.isURL(this.linkUrl)) {
        this.links.push(
          this.linkUrl
        )
        this.linkUrl = '';
      }
    }

    removeLink(index : number) {
      this.links.splice(index,1);
    }

    async save() {
      const form = this.$refs.form as HTMLFormElement;
      if (form.validate()) {
        if(this.buttonText === 'save') {
          if(this.coverImageFile.length!==0) {
            this.coverImage= await this.storeImageFiles(this.coverImageFile);
          }
          try {
            await this.$axios.post('/v1/categories',{
                businessId:this.$route.params.business,
                ...this.categoryInfo,
                coverImage:this.coverImage,
                links:this.links,
            },
              {
                withCredentials: true,
              }
            );
            this.$router.replace(".");
            this.$store.commit('updateCategoryName', '');
          } catch (error) {
            console.log(error)
          }
        }
        else {
          if(this.coverImageFile.length!==0) {
            this.coverImage = await this.storeImageFiles(this.coverImageFile);
           }
          try {
            await this.$axios.put(`v1/categories/${this.$route.params.category}`,{
                businessId:this.$route.params.business,
                ...this.categoryInfo,
                coverImage:this.coverImage,
                links:this.links,
            },
              {
                withCredentials: true,
              }
            );
            this.$router.replace(".");
            this.$store.commit('updateCategoryName', '');
          } catch (error) {
            console.log(error)
          }
        }
      }
    }

    async deleteCategory() {
      try {
         const { data } = await this.$axios.delete(`v1/categories/${this.$route.params.category}`,
           {
               withCredentials: true,
           },
         );
         this.$router.replace(".");
         this.$store.commit('updateCategoryName', '');
       } catch (error: any) {
        const errorMessage = error.response.data.errors[0].message;
        console.log(errorMessage)
      }
    }

    close(){
    this.$store.commit('updateCategoryName', '');
    this.$router.replace('.');
  }

    async mounted() {
      if(this.$route.params.category === 'null'){
        this.deleteButton = false;
        this.buttonText = 'save';
      }
      else {
        try {
          const { data } = await this.$axios.get(`v1/categories/${this.$route.params.category}`,
            {
              withCredentials: true,
            },
          );
          this.links=data.links;
          this.coverImage = data.coverImage;
          this.deleteButton = true;
          this.buttonText = 'update'
          this.categoryInfo = data;
        } catch (error: any) {
          const errorMessage = error.response.data.errors[0].message;
          console.log(errorMessage)
        }
      }
    }


  }
</script>

  