<template>
  <main>
    <!-- Music Header -->

    <section class="w-full mb-8 py-14 text-center text-white relative">
      <div
        class="absolute inset-0 w-full h-full box-border bg-contain music-bg"
        style="background-image: url(/assets/img/song-header.png)"
      />
      <div class="container mx-auto flex items-center">
        <!-- Play/Pause Button -->
        <button
          type="button"
          class="
          z-50
          h-24
          w-24
          text-3xl
          bg-white
          text-black
          rounded-full
          focus:outline-none
        "
          @click.prevent="newSong(song)"
        >
          <i class="fas fa-play" />
        </button>
        <div class="z-50 text-left ml-8">
          <!-- Song Info -->
          <div class="text-3xl font-bold">
            {{ song.modified_name }}
          </div>
          <div>{{ song.genre }}</div>
          <div>{{ $n(1,'currency','ja') }}</div>
        </div>
      </div>
    </section>
    <!-- Form -->
    <section class="container mx-auto mt-6">
      <div class="bg-white rounded border border-gray-200 relative flex flex-col">
        <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
          <!-- Comment Count -->
          <span class="card-title">
            {{ $tc('song.comment_count', song.comments_count, {
              Count:song.comments_count
            }) }}
          </span>
          <i class="fa fa-comments float-right text-green-400 text-2xl" />
        </div>
        <div class="p-6">
          <div
            class="text-white text-center font-bold p-5 mb-4"
            v-if="comment_show_alert"
            :class="comment_alert_variant"
          >
            {{ comment_alert_message }}
          </div>
          <vee-form
            v-if="userLoggedIn"
            :validation-schema="schema"
            @submit="addComment"
          >
            <vee-field
              as="textarea"
              name="comment"
              class="
              block
              w-full
              py-1.5
              px-3
              text-gray-800
              border border-gray-300
              transition
              duration-500
              focus:outline-none focus:border-black
              rounded
              mb-4
            "
              placeholder="Your comment here..."
            />
            <ErrorMessage
              class="text-red-600"
              name="comment"
            />
            <button
              type="submit"
              class="py-1.5 px-3 rounded text-white bg-green-600 block"
              :disabled="comment_in_submission"
            >
              Submit
            </button>
          </vee-form>
          <!-- Sort Comments -->
          <select
            class="
            block
            mt-4
            py-1.5
            px-3
            text-gray-800
            border border-gray-300
            transition
            duration-500
            focus:outline-none focus:border-black
            rounded
          "
            v-model="sort"
          >
            <option value="1">
              Latest
            </option>
            <option value="2">
              Oldest
            </option>
          </select>
        </div>
      </div>
    </section>
    <!-- Comments -->
    <section
      class="container mx-auto mt-6"
      id="comments"
    >
      <ul class="container mx-auto">
        <li
          v-for="comment in sortedComments"
          :key="comment.docID"
          class="p-6 bg-gray-50 border border-gray-200"
        >
          <!-- Comment Author -->
          <div class="mb-5">
            <div class="font-bold">
              {{ comment.name }}
            </div>
            <time>{{ comment.datePosted }}</time>
          </div>

          <p>
            {{ comment.content }}
          </p>
        </li>
      </ul>
    </section>
  </main>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import {
  songsCollection,
  auth,
  commentsCollection,
} from '../includes/firebase';

export default {
  name: 'Song',
  data() {
    return {
      song: {},
      comments: [],
      sort: '1',

      schema: {
        comment: 'required|min:3',
      },
      comment_in_submission: false,
      comment_show_alert: false,
      comment_alert_variant: 'bg-blue-500',
      comment_alert_message: 'Please wait! adding your comment',
    };
  },
  computed: {
    // ...mapState(['userLoggedIn']),
    ...mapState({
      userLoggedIn:(state)=> state.auth.userLoggedIn
    }),
    sortedComments() {
      return this.comments.slice().sort((a, b) => {
        if (this.sort === '1') {
          return new Date(b.datePosted) - new Date(a.datePosted);
        }
        return new Date(a.datePosted) - new Date(b.datePosted);
      });
    },
  },
  methods: {
    ...mapActions(['newSong']),
    async addComment(values, { resetForm }) {
      this.comment_in_submission = true;
      this.comment_show_alert = true;
      (this.comment_alert_variant = 'bg-blue-500'),
      (this.comment_alert_message = 'Please wait! adding your comment');

      const comment = {
        content: values.comment,
        datePosted: new Date().toString(),
        sid: this.$route.params.id,
        name: auth.currentUser.displayName,
        uid: auth.currentUser.uid,
      };

      await commentsCollection.add(comment);

      this.song.comments_count += 1;
      await songsCollection.doc(this.$route.params.id).update({
        comments_count: this.song.comments_count,
      });

      this.comment_in_submission = false;
      (this.comment_alert_variant = 'bg-green-500'),
      (this.comment_alert_message = 'Success!');

      this.getComments();

      resetForm();
    },
    async getComments() {
      const snapshot = await commentsCollection
        .where('sid', '==', this.$route.params.id)
        .get();

      this.comments = [];

      snapshot.forEach((doc) => {
        this.comments.push({
          docID: doc.id,
          ...doc.data(),
        });
      });
    },
  },
  async created() {
    const docSnapshot = await songsCollection.doc(this.$route.params.id).get();

    if (!docSnapshot.exists) {
      this.$router.push({
        name: 'home',
      });
      return;
    }

    this.song = docSnapshot.data();

    this.getComments();

    const { sort } = this.$route.query;

    this.sort = sort === '1' || sort === '2' ? sort : '1';
  },
  watch: {
    sort(newVal) {
      if (newVal === this.$route.query.sort) {
        return;
      }
      this.$router.push({
        query: {
          sort: newVal,
        },
      });
    },
  },
};
</script>
