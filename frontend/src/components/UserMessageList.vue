<template>
  <PostList :posts="messageList" :userFollows="userFollows" />
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
  name: "UserMessageList",
  components: {
    PostList,
  },
  data() {
    return {
      messageList: [],
      userFollows: [],
    };
  },
  methods: {
    async loadUserMessages() {
      try {
        const feedRes = await axios.get(
          `http://localhost:3000/api/social/messages/${this.$route.params.userId}`
        );
        this.messageList = feedRes.data.map((post) => {
          return {
            ...post,
            userId: post.user._id,
            username: post.user.username,
            numLikes: post.likesCount,
            likedBy: post.likedBy,
          };
        });
      } catch (error) {
        console.error(error);
      }
    },
  },
  watch: {
    "$route.params.userId": function () {
      this.loadUserMessages();
    },
  },
  async created() {
    if (!this.$route.params.userId) {
      this.$router.push({ name: "home" });
      return;
    }
    // Ottieni i follows dell'utente
    if (this.user) {
      try {
        const followsRes = await axios.get(
          `http://localhost:3000/api/social/my-follows`
        );
        this.userFollows = followsRes.data.map(
          (follower) => follower.followedUser
        );
      } catch (error) {
        console.error(error);
      }
    }
  },
  mounted() {
    this.loadUserMessages();
  },
};
</script>
