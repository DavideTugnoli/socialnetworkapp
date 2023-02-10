<template>
  <main>
    <AllMessages />
  </main>
</template>

<script>
import { useUserStore } from "../store/user";
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
  components: { AllMessages },
};
</script>
