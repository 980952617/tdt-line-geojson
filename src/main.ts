import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'

import VueTianditu from "vue-tianditu";

const app = createApp(App)


app.use(VueTianditu, {
  v: "4.0",
  tk: "a76b9ea6e49fb0eecdb1ed34d1e75930"
});

app.use(createPinia())
// app.use(router)

app.mount('#app')
