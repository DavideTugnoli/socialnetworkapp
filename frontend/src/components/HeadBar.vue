<template>
  <div class="headbar">
    <!-- div per logo e tasto home e globo -->
    <div class="logo-home-globe-container w-100 d-flex">
      <nav class="d-flex align-items-center justify-content-center">
        <RouterLink to="/" class="logo d-flex">
          <img src="@/assets/logo.png" alt="logo" />
        </RouterLink>

        <RouterLink to="/" class="homeBtn">
          <font-awesome-icon class="home-icon" icon="fa-solid fa-house" />
        </RouterLink>

        <RouterLink v-if="user" to="/all-messages" class="globeBtn">
          <font-awesome-icon class="globe-icon" icon="fa-solid fa-globe" />
        </RouterLink>
      </nav>
    </div>

    <!-- div per la searchbar -->
    <div class="search-container w-100 d-flex">
      <input
        type="search"
        v-model="searchQuery"
        @input="searchUsers"
        placeholder="Cerca utenti"
      />

      <div v-if="searchQuery && searchResults.length > 0" class="userList p-0">
        <router-link
          class="px-3 py-2"
          v-for="user in searchResults"
          :key="user._id"
          :to="{ name: 'profile', params: { userId: user._id } }"
          @click="searchQuery = ''"
          >{{ user.name }} {{ user.surname }}</router-link
        >
      </div>
    </div>

    <!-- div per lo username -->
    <div class="user-info-container w-100 d-flex">
      <template v-if="user">
        <!-- se l'utente è loggato e le informazioni dell'utente sono presenti nello store, mostra il nome dell'utente e il menu a tendina -->
        <div class="user-name" v-if="user" @click="toggleMenu" @mousedown.stop>
          {{ user.name }}
        </div>
        <div
          class="menu"
          v-if="user && showMenu"
          :class="{ visible: showMenu }"
        >
          <router-link
            class="menu-item px-3 py-2"
            :to="{ name: 'profile', params: { userId: user.id } }"
            @click="toggleMenu"
            ><font-awesome-icon icon="fa-solid fa-user" /> Profilo</router-link
          >

          <button class="logout w-100 fs-14 px-3 py-2" @click="logout">
            <font-awesome-icon icon="fa-solid fa-arrow-right-from-bracket" />
            Logout
          </button>
        </div>
      </template>

      <template v-else>
        <!-- se l'utente non è loggato, mostra il pulsante "Login" -->
        <router-link
          class="login d-flex align-items-center justify-content-center"
          to="/login"
          ><font-awesome-icon icon="fa-solid fa-arrow-right-to-bracket" />
          Login</router-link
        >
      </template>
    </div>
  </div>
</template>

<script>
import axios from "../axios"; // importa la tua configurazione di axios
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
  name: "HeadBar",
  data() {
    return {
      searchQuery: "", // parola chiave inserita nella barra di ricerca
      searchResults: [], // risultati della ricerca
      showMenu: false, // indica se il menu a tendina è visibile o meno
      timer: null, // timer per la ricerca
    };
  },
  methods: {
    toggleMenu() {
      this.showMenu = !this.showMenu;
      this.userClicked = true;
    },
    closeMenu(event) {
      if (
        !event.target.closest(".menu") &&
        event.target.className !== "menu" &&
        !this.userClicked
      ) {
        this.showMenu = false;
      }
      this.userClicked = false;
    },

    searchUsers() {
      // cancella il timer se esiste
      if (this.timer) {
        clearTimeout(this.timer);
      }

      // imposta un timer per la ricerca
      this.timer = setTimeout(() => {
        // invia una richiesta HTTP all'API con la parola chiave inserita nella barra di ricerca
        axios
          .get(`http://localhost:3000/api/social/search?q=${this.searchQuery}`)
          .then((response) => {
            this.searchResults = response.data;
            //console.log(response);
          });
      }, 500); // la ricerca viene eseguita dopo 500 millesimi di secondo
    },
    async logout() {
      await this.store.signOut();
      this.user = null; // fa scomparire il nome dell'utente dalla headbar
      this.showMenu = !this.showMenu;
      this.$nextTick(() => {
        this.$router.push("/login");
      });
      //this.$router.push("/login"); // reindirizza l'utente alla pagina di login
    },
    closeSearchbar(event) {
      if (!event.target.closest(".search-container")) {
        this.searchQuery = "";
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.closeMenu);
    document.addEventListener("click", this.closeSearchbar);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.closeMenu);
    document.removeEventListener("click", this.closeSearchbar);
  },
};
</script>

<style scoped>
.headbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: var(--primary);
  box-shadow: var(--shadow);
  color: #fff;
  width: 100%;
  left: 0;
  right: 0;
  height: 50px;
  /*position: fixed;*/
  padding: 0 1.5rem;
}

.headbar .homeBtn,
.headbar .user-name,
.headbar .login {
  color: white;
  padding: 0 1.5rem;

  position: relative;
  cursor: pointer;
}

.headbar .user-name:after {
  content: "";
  height: 10px;
  width: 10px;

  position: absolute;

  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 7.5px solid white;
  filter: drop-shadow(var(--shadow));

  transform: translate(50%, 75%);
}

.menu {
  background-color: var(--light);

  border-radius: var(--bradius);

  position: absolute;

  box-shadow: var(--shadow);
  min-width: 150px;

  top: 1.5rem;
}

.menu .menu-item {
  display: block;
  width: 100%;

  border-bottom: 1px solid var(--color-light);
  cursor: pointer;
  color: var(--black);
}

.menu .menu-item:hover {
  background-color: var(--primary-h);
  color: var(--light);
}

.userList {
  background-color: var(--light);

  border-radius: var(--bradius);

  position: absolute;

  list-style-type: none;
  width: 100%;

  top: 2.7rem;

  box-shadow: var(--shadow);

  max-height: 50vh;
  overflow-y: auto;
}

@media (max-width: 450px) {
  .userList {
    width: 200px;
  }
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

.logout {
  background-color: transparent;
  border: none;
  outline: none;
  cursor: pointer;

  text-align: start;
}

.logout:hover {
  background-color: var(--primary-h);
  color: var(--light);
}

.logo img {
  max-height: 42px;
  width: auto;
}

.logo-home-globe-container {
  justify-content: start;
  align-items: center;
}

.search-container {
  position: relative;
  justify-content: center;
  align-items: center;
}

.user-info-container {
  justify-content: end;
  align-items: center;
}

.search-container input {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
