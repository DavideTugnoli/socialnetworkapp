<template>
  <div class="w-100 h-100 d-flex justify-content-center align-items-center">
    <div class="card">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="mb-2">
            <label for="username">Username:</label>
            <input
              v-model="username"
              :minlength="3"
              :maxlength="16"
              type="text"
              id="username"
              required
            />
          </div>
          <div class="mb-2">
            <label for="password">Password:</label>
            <input
              v-model="password"
              :minlength="6"
              type="password"
              id="password"
              required
            />
          </div>
          <div class="mb-2">
            <label for="verifyPassword">Ripeti Password:</label>
            <input
              v-model="verifyPassword"
              type="password"
              id="verifyPassword"
              :minlength="1"
              required
            />
          </div>
          <div class="mb-2">
            <label for="name">Nome:</label>
            <input
              v-model="name"
              :minlength="1"
              :maxlength="16"
              type="text"
              id="name"
              required
            />
          </div>
          <div class="mb-2">
            <label for="surname">Cognome:</label>
            <input
              v-model="surname"
              :minlength="1"
              :maxlength="16"
              type="text"
              id="surname"
              required
            />
          </div>
          <div class="mb-2">
            <label for="bio">Bio:</label>
            <textarea
              class="font-16"
              rows="3"
              maxlength="200"
              type="text"
              v-model="bio"
              id="bio"
              required
            />
          </div>

          <div class="mt-3">
            <button class="btn btn-primary" type="submit">Registrati</button>
          </div>
        </form>

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
      verifyPassword: "",
      name: "",
      surname: "",
      bio: "",
      error: "",
      validationErrors: [],
    };
  },
  methods: {
    async handleSubmit() {
      if (
        !this.username.trim() ||
        !this.password.trim() ||
        !this.verifyPassword.trim() ||
        !this.name.trim() ||
        !this.surname.trim() ||
        !this.bio.trim()
      ) {
        this.error = "Tutti i campi sono obbligatori";
        return;
      }
      if (this.password !== this.verifyPassword) {
        this.error = "Le password non corrispondono";
        return;
      }
      try {
        await this.store.signUp(
          this.username,
          this.password,
          this.verifyPassword,
          this.name,
          this.surname,
          this.bio
        );
        if (this.user) {
          this.$router.push("/");
          return;
        }
        if (this.errors.signup) {
          this.error =
            this.errors.signup.response.message ||
            this.errors.signup.response.errors ||
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
          console.log(error);
          this.error = "An unknown error occurred";
        }
      }
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

textarea:focus {
  border-color: var(--primary-h);
  box-shadow: var(--focus-shadow) rgb(121 82 179 / 25%);
}
</style>
