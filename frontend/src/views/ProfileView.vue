<template>
  <main>
    <div class="profile-view mb-5 px-3">
      <div class="card">
        <div class="card-body">
          <ProfileItem />
        </div>
      </div>
    </div>
    <UserMessageList />
  </main>
</template>

<script>
import ProfileItem from "../components/ProfileItem.vue";
import UserMessageList from "../components/UserMessageList.vue";

export default {
  name: "ProfileView",
  components: {
    ProfileItem,
    UserMessageList,
  },
};
</script>

<style scoped>
.profile-view {
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.profile-view .card {
  box-shadow: var(--shadow);
}

main {
  overflow-y: auto;
}
</style>
