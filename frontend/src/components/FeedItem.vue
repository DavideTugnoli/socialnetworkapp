<template>
  <div class="all-messages-box">
    <div class="postForm px-3 mb-5">
      <div class="card">
        <div class="card-body">
          <textarea class="font-16" rows="5" type="text" v-model="message" />
          <button class="btn btn-primary" @click="sendMessage">Invia</button>
        </div>
      </div>
    </div>
    <PostList :posts="feed" :userFollows="userFollows" />
  </div>
</template>

<script>
import axios from "../axios.js"; // importa l'istanza di Axios configurata
import PostList from "./PostList.vue";
import { useUserStore } from "../store/user";
import { storeToRefs } from "pinia";

export default {
  setup() {
    const store = useUserStore();
    const { user } = storeToRefs(store);
    return {
      user,
      store,
    };
  },
  components: {
    PostList,
  },
  data() {
    return {
      feed: [],
      message: "",
      userFollows: [],
    };
  },
  methods: {
    async sendMessage() {
      // Il messaggio non può essere vuoto
      if (!this.message || !this.message.trim().length) return;

      try {
        const response = await axios.post(
          "http://localhost:3000/api/social/messages",
          {
            userId: this.user.id,
            text: this.message,
          }
        );
        this.message = "";
        response.data.numLikes = 0;
        response.data.likedBy = Array.from({ length: 0 });
        response.data.username = this.user.username;
        response.data.userId = this.user.id;
        this.feed = [response.data, ...this.feed];
      } catch (error) {
        console.error(error);
      }
    },
  },
  async created() {
    try {
      // Ottieni il feed
      const feedRes = await axios.get("http://localhost:3000/api/social/feed");
      // Ottieni i follows dell'utente
      const followsRes = await axios.get(
        `http://localhost:3000/api/social/my-follows`
      );
      this.feed = feedRes.data;
      for (const post of this.feed) {
        // eslint-disable-next-line no-self-assign
        post.user._id = post.user._id;
        post.username = post.user.username;
        post.numLikes = post.likesCount;
        // eslint-disable-next-line no-self-assign
        post.likedBy = post.likedBy;
      }
      this.userFollows = followsRes.data.map(
        (follower) => follower.followedUser
      );
    } catch (error) {
      console.error(error);
    }
  },
};
</script>

<style scoped>
.postForm {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.postForm > .card {
  box-shadow: var(--shadow);

  border: 1px solid var(--primary-h);
}
</style>
