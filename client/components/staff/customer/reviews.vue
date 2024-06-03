<template>
  <div
  >
    <!-- <v-card-text class="mb-0 pb-0 dashboardtest">
      Reviews
    </v-card-text>
    <v-card-text
      v-if="!reviews.length"
    >
      No reviews yet!
    </v-card-text> -->
    <v-card
      v-for="(review, index) in reviews.slice(0,1)"
      :key="index"
      flat
      class="ma-4 mb-6 pa-2 businesscard"
      outlined
    >
      <v-card-title class="py-0 my-1">
        <v-spacer></v-spacer>
        <v-btn
          rounded
          color="primary"
          class="text-capitalize text-h6"
          elevation="1"
        >
          view all the Reviews
        </v-btn>
      </v-card-title>
      <v-card-title primary-title class="py-0 my-0">
        <v-avatar
          color="transparent"
          size="64"
          class="mr-4"
        >
          <v-icon
            :color="satisfactionMap[review.satisfactionRating].color"
            size="48"
          >
            {{ satisfactionMap[review.satisfactionRating].icon }}
          </v-icon>
        </v-avatar>
        {{ review.reviewerName }}
        <v-spacer></v-spacer>
          <span class="subtitle-2">
            <v-rating
              v-model="rating"
              color="yellow darken-3"
              background-color="grey darken-1"
              empty-icon="$ratingFull"
              half-increments
              hover
              readonly
              large
            ></v-rating>
          </span>
      </v-card-title>
      <v-card-text class="px-8 secondary--text pt-0 mt-0">
        <span
          v-if="expandedReviews.includes(review.id)"
        >
        {{ review.description }}
        </span>
        <span
          v-else
        >
            {{ review.description.substring(0, 100) }} ...
        </span>
        <v-btn
          text
          class="text-lowercase"
          color="primary"
          @click="toggleExpand(review.id)"
        >
          Read {{ expandedReviews.includes(review.id) ? 'less' : 'more' }}
        </v-btn>
      </v-card-text>
      <!-- <v-card-actions>
        <v-spacer></v-spacer>
        Most Liked:
        <v-chip
          v-for="(attr, i) in review.mostLiked"
          :key="i"
          class="ml-2"
          outlined
          color="primary"
        >
          {{ attr }}
        </v-chip>
      </v-card-actions> -->
    </v-card>
  </div>
</template>

<script lang='ts'>
import { Vue, Component } from 'vue-property-decorator';

@Component({
  components: {
  },
})
export default class CustomerReviews extends Vue {

  rating = 4;
  reviews = [
    {
      businessId: '',
      reviewerName: 'Sonia',
      description: `One of the best places in North Hyderabad, and honestly the best place for Andhra Cuisine in Kompally Area. This place absolutely has so many food varieties in Andhra Cuisine. This place is quite peaceful which is very good for Family Gatherings. I would surely recommend this place for Lunch and Dinner. The Starters are really Must Try ones.I have tried some of their specialties, and they were Ulvacharu chicken kebab, Kamju pitta /quail bird, Malnadu chicken roast, Golichina chicken, Karimnagar fried wings, Kara kara kodi, Natu kodi, Chapa Fry. They are all lil spicy yet super delicious in taste.Talking about the service, it's pretty fast and the staffs are very nice. If you visit this place, I'll surely recommend you to try Chapa Fry, Kara Kara Kodi, Malnadu Chicken Roast, and Pottelu Mamsam.`,
      satisfactionRating: 'Pretty Satisfied',
      mostLiked: ['Ambience', 'Service'],
      time: new Date(),
    },
    {
      businessId: '',
      reviewerName: 'Sonia',
      description: `One of the best places in North Hyderabad, and honestly the best place for Andhra Cuisine in Kompally Area. This place absolutely has so many food varieties in Andhra Cuisine. This place is quite peaceful which is very good for Family Gatherings. I would surely recommend this place for Lunch and Dinner. The Starters are really Must Try ones.I have tried some of their specialties, and they were Ulvacharu chicken kebab, Kamju pitta /quail bird, Malnadu chicken roast, Golichina chicken, Karimnagar fried wings, Kara kara kodi, Natu kodi, Chapa Fry. They are all lil spicy yet super delicious in taste.Talking about the service, it's pretty fast and the staffs are very nice. If you visit this place, I'll surely recommend you to try Chapa Fry, Kara Kara Kodi, Malnadu Chicken Roast, and Pottelu Mamsam.`,
      satisfactionRating: 'Pretty Satisfied',
      mostLiked: ['Ambience', 'Service'],
      time: new Date(),
    },
    {
      businessId: '',
      reviewerName: 'Sonia',
      description: `One of the best places in North Hyderabad, and honestly the best place for Andhra Cuisine in Kompally Area. This place absolutely has so many food varieties in Andhra Cuisine. This place is quite peaceful which is very good for Family Gatherings. I would surely recommend this place for Lunch and Dinner. The Starters are really Must Try ones.I have tried some of their specialties, and they were Ulvacharu chicken kebab, Kamju pitta /quail bird, Malnadu chicken roast, Golichina chicken, Karimnagar fried wings, Kara kara kodi, Natu kodi, Chapa Fry. They are all lil spicy yet super delicious in taste.Talking about the service, it's pretty fast and the staffs are very nice. If you visit this place, I'll surely recommend you to try Chapa Fry, Kara Kara Kodi, Malnadu Chicken Roast, and Pottelu Mamsam.`,
      satisfactionRating: 'Pretty Satisfied',
      mostLiked: ['Ambience', 'Service'],
      time: new Date(),
    },
    {
      businessId: '',
      reviewerName: 'Sonia',
      description: `One of the best places in North Hyderabad, and honestly the best place for Andhra Cuisine in Kompally Area. This place absolutely has so many food varieties in Andhra Cuisine. This place is quite peaceful which is very good for Family Gatherings. I would surely recommend this place for Lunch and Dinner. The Starters are really Must Try ones.I have tried some of their specialties, and they were Ulvacharu chicken kebab, Kamju pitta /quail bird, Malnadu chicken roast, Golichina chicken, Karimnagar fried wings, Kara kara kodi, Natu kodi, Chapa Fry. They are all lil spicy yet super delicious in taste.Talking about the service, it's pretty fast and the staffs are very nice. If you visit this place, I'll surely recommend you to try Chapa Fry, Kara Kara Kodi, Malnadu Chicken Roast, and Pottelu Mamsam.`,
      satisfactionRating: 'Pretty Satisfied',
      mostLiked: ['Ambience', 'Service'],
      time: new Date(),
    },
  ] as any;

  satisfactionMap = {
    'Pretty Satisfied': {
      icon: 'sentiment_very_satisfied',
      color: 'success',
    },
    'Satisfied': {
      icon: 'sentiment_satisfied',
      color: 'warning',
    },
    'Not Satisfied': {
      icon: 'mood_bad',
      color: 'error',
    },
  } as any;

  expandedReviews = [] as string[];

  async mounted() {
    // this.reviews = await this.getReviews();
  }

  toggleExpand(reviewID: string) {
    if (this.expandedReviews.includes(reviewID)) {
      this.collapseReview(reviewID);
    } else {
      this.expandReview(reviewID);
    }
  }

  expandReview(reviewID: string) {
    this.expandedReviews.push(reviewID);
  }

  collapseReview(reviewID: string) {
    this.expandedReviews.splice(
      this.expandedReviews.indexOf(reviewID),
      1
    );
  }

  async getReviews() {
    try {
      const { data } = await this.$axios.get(`/v1/reviews?businessId=${this.$route.params.business}`, {
        withCredentials: true,
      });
      return data;
    } catch (error) {
      console.error(error);
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
