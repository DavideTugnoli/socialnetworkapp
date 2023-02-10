<template>
  <div class="w-100 h-100 d-flex justify-content-center align-items-center">
    <div class="card">
      <div class="card-body">
        <form @submit.prevent="login">
          <div class="mb-2">
            <label for="username">Username:</label>
            <input id="username" v-model="username" type="text" required />
          </div>

          <div class="mb-2">
            <label for="password">Password:</label>
            <input id="password" v-model="password" type="password" required />
          </div>

          <div class="mt-3">
            <button class="btn btn-primary" type="submit">Accedi</button>
            <div v-if="Array.isArray(error)" class="error">
              <p v-for="err in error" :key="err">{{ err.msg }}</p>
            </div>
            <div v-else class="error">
              <p>{{ error }}</p>
            </div>
            <div v-if="validationErrors" class="error">
              <ul>
                <li v-for="error in validationErrors" :key="error.param">
                  {{ error.msg }}
                </li>
              </ul>
            </div>
            <p class="w-100 text-center">oppure</p>
          </div>
        </form>
        <button class="btn btn-primary" @click="navigateToRegistration">
          Registrati
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { useUserStore } from "../store/user";
import { storeToRefs } from "pinia";
export default {
  setup() {
    const store = useUserStore();
    const { user, errors } = storeToRefs(store);
    return {
      user,
      errors,
      store,
    };
  },
  data() {
    return {
      username: "",
      password: "",
      error: "",
      validationErrors: [],
    };
  },
  methods: {
    async login() {
      if (!this.username.trim() || !this.password.trim()) {
        this.error = "Tutti i campi sono obbligatori";
        return;
      }
      try {
        await this.store.signIn(this.username, this.password);
        // Dopo aver eseguito con successo il login, reindirizza l'utente alla pagina home
        if (this.user) {
          this.$router.push("/");
          return;
        }
        if (this.errors.signin) {
          this.error =
            this.errors.signin.response.message ||
            this.errors.signin.response.errors ||
            "An unknown error occurred";
          setTimeout(() => {
            this.error = "";
          }, 3000);
        }
      } catch (error) {
        if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          this.validationErrors = error.response.data.errors;
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.message
        ) {
          this.error = error.response.data.message;
        } else {
          this.error = "An unknown error occurred";
        }
      }
    },
    navigateToRegistration() {
      this.$router.push("/register");
    },
  },
  created() {
    if (this.user) {
      this.$router.push("/");
    }
  },
};
</script>

<style scoped>
.card {
  width: 300px;
}
.card-body,
.card {
  border-radius: var(--bradius);
}

.btn:focus {
  animation: bump;
  animation-duration: 0.1s;
  animation-iteration-count: 1;
}
</style>
