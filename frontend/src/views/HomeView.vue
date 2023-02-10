<template>
  <main>
    <FeedItem v-if="user" />
    <AllMessages v-else />
  </main>
</template>

<script>
import { useUserStore } from "../store/user";
import FeedItem from "../components/FeedItem.vue";
import AllMessages from "../components/AllMessages.vue";

export default {
  setup() {
    const { user, fetchUser } = useUserStore();
    if (!user) {
      return;
    }
    fetchUser();
    //console.log(user);
    return {
      user,
    };
  },
  components: { AllMessages, FeedItem },
};
</script>
