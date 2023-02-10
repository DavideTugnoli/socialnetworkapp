<template>
  <div class="px-3">
    <button
      v-if="visibleList"
      class="btn btn-primary arrowBtn"
      style="width: 50px"
      @click="goBack"
    >
      <font-awesome-icon class="arrow-icon" icon="fa-solid fa-arrow-left" />
    </button>
    <div class="card shadow mb-5">
      <div class="card-header post-header">
        <button
          class="profile-username-button"
          @click="goToProfile(post.user._id)"
        >
          <h3 class="profile-username-h3">{{ post.username }}</h3>
        </button>
        <span class="date fs-12"
          ><i
            ><font-awesome-icon icon="fa-solid fa-calendar-days" />
            {{ formatDate(post.date).slice(0, -3) }}</i
          ></span
        >
      </div>
      <div class="card-body">
        <p v-if="!visibleList && post.text.length > 500" class="text">
          {{ post.text.slice(0, 500) + "..." }}
        </p>
        <p v-else class="text">{{ post.text }}</p>
      </div>

      <div class="card-footer">
        <div class="likes">
          {{ numLikesCopy }} <font-awesome-icon icon="fa-solid fa-heart" />

          <p
            v-if="
              post &&
              user &&
              !visibleList &&
              likedByMyFollowers.length > 0 &&
              numLikesCopy > 0
            "
          >
            Tra cui:
            <span
              v-for="(like, index) in likedByMyFollowers.slice(0, 2)"
              :key="like._id"
            >
              <router-link
                class="profile-name-link"
                :to="{ name: 'profile', params: { userId: like._id } }"
                >{{ like.name }}</router-link
              >
              <span
                v-if="index === 0 && likedByMyFollowers.slice(0, 2).length > 1"
                >,
              </span>
            </span>
          </p>

          <!-- Mostra il pulsante "Like" o "Unlike" solo se l'utente è autenticato -->

          <div class="d-flex justify-content-end">
            <button
              v-if="user"
              v-on:click="toggleLike"
              v-bind:class="{
                'btn btn-primary': !isLiking,
                'btn btn-danger': isLiking,
              }"
            >
              <!-- Mostra "Like" o "Unlike" in base allo stato di like  dell'utente -->
              {{ isLiking ? "Unlike" : "Like" }}
            </button>

            <button
              v-if="!visibleList"
              class="btn btn-primary ms-2 eyeBtn align-items-center"
              @click="goToSinglePost(post._id, post.user._id)"
            >
              <font-awesome-icon class="eye-icon" icon="fa-solid fa-eye" />
            </button>
          </div>

          <!-- Lista di tutti gli elementi di likedBy -->
          <div v-if="visibleList && numLikesCopy != 0">
            <h4>Piace a:</h4>
            <div class="userList p-0">
              <router-link
                class="px-3 py-2"
                v-for="user in likedByCopy"
                :key="user._id"
                :to="{ name: 'profile', params: { userId: user._id } }"
                >{{ user.name }} {{ user.surname }}</router-link
              >
            </div>
          </div>
        </div>
      </div>
    </div>
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
    return {
      user,
    };
  },
  props: {
    post: {
      type: Object,
      required: true,
    },
    visibleList: {
      type: Boolean,
      default: false,
    },
    userFollows: {
      type: Array,
      required: false,
    },
  },
  data() {
    return {
      isLiking: false,
      likedByCopy: [],
      numLikesCopy: 0,
      likedByMyFollowers: [],
    };
  },
  methods: {
    goToProfile(userId) {
      this.$router.push({ name: "profile", params: { userId } });
    },
    goBack() {
      this.$router.go(-1);
    },
    goToSinglePost(postId, userId) {
      this.$router.push({
        name: "singlePost",
        params: { postId, userId },
      });
    },
    checkLikes() {
      try {
        // Le props non sono mutabili, quindi è necessario creare delle copie
        this.likedByCopy = this.post.likedBy;
        this.numLikesCopy = this.post.numLikes;

        // Filtro gli utenti che hanno messo like e che sono anche follower dell'utente corrente
        if (!this.visibleList && this.user) {
          this.likedByMyFollowers = this.post.likedBy
            .filter((likedBy) => this.userFollows.includes(likedBy._id))
            .map((likedBy) => likedBy);
          //console.log(this.likedByMyFollowers);
        }

        // Se l'utente è autenticato, verifica se sta già likando questo post
        if (!this.user) return;
        // Verifica se l'utente corrente è presente nella lista dei likes
        if (this.likedByCopy) {
          this.isLiking = this.likedByCopy.some(
            (like) => like._id === this.user.id
          );
        }
      } catch (error) {
        console.error(error);
      }
    },
    async toggleLike() {
      try {
        // Se l'utente sta già likando questo post, rimuovi il like
        if (this.isLiking) {
          await axios.delete(
            `http://localhost:3000/api/social/like/${this.post._id}`
          );
          this.isLiking = false;
          this.numLikesCopy--;
          this.likedByCopy = this.likedByCopy
            .slice()
            .filter((e) => e._id !== this.user.id);
        } else {
          // Altrimenti, aggiungi il like
          await axios.post(
            `http://localhost:3000/api/social/like/${this.post._id}`
          );
          this.isLiking = true;
          this.numLikesCopy++;
          this.likedByCopy = this.likedByCopy.slice().concat({
            name: this.user.name,
            surname: this.user.surname,
            _id: this.user.id,
          });
        }
      } catch (error) {
        console.error(error);
      }
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleString();
    },
  },
  mounted() {
    this.checkLikes();
  },
};
</script>

<style scoped>
.post-header {
  position: relative;
}

.post-header > .date {
  position: absolute;
  right: 0;
  top: 0;
  padding: 0.25rem;
}

.profile-name-link {
  color: blue;
  text-decoration: none;
}
.profile-name-link:active {
  color: blue;
}

.userList {
  background-color: var(--light);

  border-radius: var(--bradius);

  list-style-type: none;

  margin-top: 0.25rem;

  box-shadow: var(--shadow);
}

.userList a {
  display: block;
  border-bottom: 1px solid var(--color-light);
  color: var(--dark) !important;
  cursor: pointer;
}

.userList a:hover {
  background-color: var(--primary-h);
  color: var(--light) !important;
}

.userList a:last-child {
  border-bottom: unset;
}

.profile-username-button {
  background-color: transparent;
  border: none;
  cursor: pointer;
  color: inherit;
  font-weight: bold;
}

.profile-username-button:hover {
  text-decoration: underline !important;
}
</style>
