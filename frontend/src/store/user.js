import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null,
    errors: {
      whoami: null,
      signup: null,
      signin: null,
      signout: null,
    },
  }),

  actions: {
    async fetchUser() {
      this.errors.whoami = null;
      const res = await fetch("http://localhost:3000/api/social/whoami", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const response = await res.json();
      if (!res.ok && res.status >= 400 && res.status < 500) {
        this.errors.whoami = {
          ok: res.ok,
          status: res.status,
          response,
        };
        return;
      }
      this.user = response.user;
      //console.log(this.user);
    },
    async signUp(username, password, verifyPassword, name, surname, bio) {
      this.errors.signup = null;
      const res = await fetch("http://localhost:3000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
          verifyPassword,
          name,
          surname,
          bio,
        }),
        credentials: "include", // basta questo per includere il token JWT
      });
      const response = await res.json();
      //console.log("pre res err", res.ok, res.status);
      if (!res.ok && res.status >= 400 && res.status < 500) {
        console.log("res err", res.ok, res.status);
        this.errors.signup = {
          ok: res.ok,
          status: res.status,
          response,
        };
        return;
      }
      this.user = response.createdUser;
    },
    async signIn(username, password) {
      this.errors.signin = null;
      const res = await fetch("http://localhost:3000/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
        credentials: "include", // basta questo per includere il token JWT
      });
      const response = await res.json();
      if (!res.ok && res.status >= 400 && res.status < 500) {
        this.errors.signin = {
          ok: res.ok,
          status: res.status,
          response,
        };
      }
      this.user = response.user;
    },
    async signOut() {
      this.errors.signout = null;
      const res = await fetch("http://localhost:3000/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      const response = await res.json();
      if (!res.ok && res.status >= 400 && res.status < 500) {
        this.errors.signout = {
          ok: res.ok,
          status: res.status,
          response,
        };
      }
      //console.log(response);
      this.user = null;
    },
  },
});
