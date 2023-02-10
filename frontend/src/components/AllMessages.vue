<template>
  <div class="all-messages-box" v-on:scroll="handleScroll">
    <PostList
      v-if="!showPostList || AllMessages.length !== 0"
      :posts="AllMessages"
      :userFollows="userFollows"
    />
    <div class="no-messages d-flex fs-20" v-else>
      <p>Tutto tace</p>
    </div>
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
      AllMessages: [],
      showPostList: false,
      userFollows: [],
      offset: 0,
    };
  },
  async created() {
    let followsRes = {};
    if (this.user) {
      // Ottieni i follows dell'utente
      followsRes = await axios.get(
        `http://localhost:3000/api/social/my-follows`
      );
      this.userFollows = followsRes.data.map(
        (follower) => follower.followedUser
      );
    }
    await this.fetchMore();
  },
  methods: {
    handleScroll() {
      const element = this.$el;
      if (element.scrollTop + element.clientHeight >= element.scrollHeight) {
        this.fetchMore();
      }
    },
    async fetchMore() {
      try {
        const messagesRes = await axios.get(
          "http://localhost:3000/api/social/global-feed/" + this.offset
        );

        this.AllMessages = this.AllMessages.concat(messagesRes.data);

        // Per ogni messaggio, assegna il nome dell'utente, il numero di likes e gli utenti che hanno messo like
        for (const post of this.AllMessages) {
          // eslint-disable-next-line no-self-assign
          post.user._id = post.user._id;
          post.username = post.user.username;
          post.numLikes = post.likesCount;
          if (!this.user) {
            post.likedBy = Array.from({ length: 0 });
          } else {
            // eslint-disable-next-line no-self-assign
            post.likedBy = post.likedBy;
          }
        }
        this.offset += 10;
        setTimeout(() => {
          this.showPostList = true;
        }, 3000);
      } catch (error) {
        console.error(error);
      }
    },
  },
};
</script>

<style>
.no-messages {
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
}
</style>
