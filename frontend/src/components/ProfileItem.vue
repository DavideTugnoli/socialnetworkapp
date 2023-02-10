<template>
  <div class="profile-item">
    <template v-if="visitedUser">
      <h3>{{ visitedUser.name }} {{ visitedUser.surname }}</h3>
      <p>
        <span class="attribute-name">Username: </span>
        <span class="attribute-value">{{ visitedUser.username }}</span>
      </p>
      <p>
        <span class="attribute-name" style="white-space: nowrap">Bio: </span>
        <span
          class="attribute-value"
          style="
            max-width: calc(100% - 80px);
            overflow: hidden;
            text-overflow: ellipsis;
          "
          >{{ visitedUser.bio }}</span
        >
      </p>
      <!-- Mostra il numero di follower dell'utente -->
      <p>
        <span class="attribute-name">Followers: </span>
        <span class="attribute-value">{{ this.followers }}</span>
      </p>
      <!-- Mostra il pulsante "Follow" o "Unfollow" solo se l'utente è autenticato e non sta visitando il proprio profilo -->
      <button
        v-if="user && user.id !== this.$route.params.userId"
        v-on:click="toggleFollow"
        class="btn btn-primary"
      >
        <!-- Mostra "Follow" o "Unfollow" in base allo stato di follow dell'utente -->
        {{ isFollowing ? "Unfollow" : "Follow" }}
      </button>
    </template>
  </div>
</template>

<script>
import axios from "../axios";
import { useUserStore } from "../store/user";
import { storeToRefs } from "pinia";

export default {
  setup() {
    const store = useUserStore();
    const { user } = storeToRefs(store);
    const userStore = useUserStore();
    return {
      user,
      userStore,
    };
  },
  name: "ProfileItem",
  data() {
    return {
      visitedUser: {},
      // Indica se l'utente sta già seguendo questo profilo
      isFollowing: false,
      followers: 0,
    };
  },
  methods: {
    async loadUserData() {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/social/users/${this.$route.params.userId}`
        );
        this.visitedUser = response.data;
        this.followers = response.data.followersCount;
        if (this.user) {
          this.isFollowing = response.data.followers.find(
            (follower) => follower.followerId === this.user.id
          )
            ? true
            : false;
        }
      } catch (error) {
        if (error.response && error.response.status === 400) {
          console.error("Invalid user ID");
          this.$router.push({ name: "home" });
        } else {
          console.error(error);
        }
      }
    },
    async toggleFollow() {
      try {
        // Se l'utente sta già seguendo questo profilo, rimuovi il follow
        if (this.isFollowing) {
          await axios.delete(
            `http://localhost:3000/api/social/followers/${this.$route.params.userId}`
          );
          this.isFollowing = false;
          // Aggiorna il numero di followers
          this.followers--;
        } else {
          // Altrimenti, aggiungi il follow
          await axios.post(
            `http://localhost:3000/api/social/followers/${this.$route.params.userId}`
          );
          this.isFollowing = true;
          // Aggiorna il numero di followers
          this.followers++;
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  watch: {
    "$route.params.userId": function () {
      this.loadUserData();
    },
  },
  mounted() {
    this.loadUserData();
    //console.log(this.isFollowing);
  },
  created() {
    if (!this.$route.params.userId) {
      this.$router.push({ name: "home" });
      return;
    }
  },
};
</script>

<style>
.attribute-name {
  color: #333;
}
.attribute-value {
  color: #666;
}
</style>
