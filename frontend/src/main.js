import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

import "./assets/main.css";

const app = createApp(App);

const pinia = createPinia();

pinia.use((context) => {
  const storeId = context.store.$id;

  const serializer = {
    serialize: JSON.stringify,
    deserialize: JSON.parse,
  };
  // sync store from local storage
  const fromStorage = serializer.deserialize(
    window.localStorage.getItem(storeId)
  );
  if (fromStorage) {
    context.store.$patch(fromStorage);
  }
  // listen for changes and update the store
  context.store.$subscribe((mutation, state) => {
    window.localStorage.setItem(storeId, serializer.serialize(state));
  });
});

app.use(pinia);
app.use(router);

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faArrowRightToBracket,
  faArrowRightFromBracket,
  faUser,
  faHouse,
  faGlobe,
  faArrowLeft,
  faEye,
  faCalendarDays,
  faHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add(
  faArrowRightToBracket,
  faArrowRightFromBracket,
  faUser,
  faHouse,
  faGlobe,
  faArrowLeft,
  faEye,
  faCalendarDays,
  faHeart
);

app.component("font-awesome-icon", FontAwesomeIcon).mount("#app");
