<template>
  <div class="post-list">
    <PostItem
      v-for="post in posts"
      :key="post._id"
      :post="post"
      :visibleList="false"
      :userFollows="userFollows"
    />
  </div>
</template>

<script>
import PostItem from "./PostItem.vue";

export default {
  components: {
    PostItem,
  },
  props: {
    posts: {
      type: Array,
      required: true,
    },
    userFollows: {
      type: Array,
    },
  },
};
</script>

<style>
.post-list {
  display: flex;
  flex-direction: column;
  justify-content: center;

  max-width: 800px;

  margin: auto;
}
</style>
