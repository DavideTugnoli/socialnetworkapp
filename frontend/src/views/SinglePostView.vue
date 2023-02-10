<template>
  <main>
    <div class="single-post d-flex">
      <PostItem :key="singlePost._id" :post="singlePost" :visibleList="true" />
    </div>
  </main>
</template>

<script>
import axios from "../axios.js";
import { useUserStore } from "../store/user";
import { storeToRefs } from "pinia";

import PostItem from "../components/PostItem.vue";
export default {
  setup() {
    const store = useUserStore();
    const { user } = storeToRefs(store);
    return {
      user,
    };
  },
  components: {
    PostItem,
  },
  data() {
    return {
      singlePost: {},
    };
  },
  async created() {
    const { postId, userId } = this.$route.params;
    try {
      const postRes = await axios.get(
        `http://localhost:3000/api/social/messages/${userId}/${postId}`
      );
      let followsRes;
      if (this.user) {
        // Ottieni i follows dell'utente
        followsRes = await axios.get(
          `http://localhost:3000/api/social/my-follows`
        );
      }
      this.singlePost = postRes.data;
      this.singlePost.user._id = postRes.data.user._id;
      this.singlePost.username = postRes.data.user.username;
      this.singlePost.numLikes = postRes.data.likesCount;
      this.singlePost.likedBy = postRes.data.likedBy;
      // Riordino likedByCopy in modo che in testa abbia gli user che hanno un id presente anche in this.userFollows
      if (this.singlePost.likedBy && this.user) {
        this.userFollows = followsRes.data.map(
          (follower) => follower.followedUser
        );
        this.singlePost.likedBy = this.singlePost.likedBy.sort((a, b) => {
          if (this.userFollows.includes(a._id)) {
            return -1;
          } else if (this.userFollows.includes(b._id)) {
            return 1;
          } else {
            return 0;
          }
        });
      }
    } catch (error) {
      console.error(error);
      this.$router.push({ name: "home" });
    }
  },
};
</script>
<style>
.single-post {
  flex-direction: column;
  justify-content: center;
  max-width: 800px;
  margin: auto;
}

main {
  overflow-y: auto;
}
</style>
