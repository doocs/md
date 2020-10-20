import Vue from "vue";
import App from "./App.vue";
import store from "./store";
import ElementUI from "element-ui";
import "element-ui/lib/theme-chalk/index.css";
import "./plugins/element";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/ambiance.css";
import "codemirror/theme/xq-light.css";
import "codemirror/mode/css/css";
import "codemirror/mode/markdown/markdown";
import "codemirror/addon/edit/matchbrackets";
import "codemirror/addon/selection/active-line";
import "codemirror/addon/hint/show-hint.js";
import "codemirror/addon/hint/css-hint.js";
import "./assets/less/theme.less";
// 对codemirror预处理
import "./assets/scripts/format";
import "./assets/scripts/closebrackets";
Vue.use(ElementUI);

Vue.config.productionTip = false;

new Vue({
    store,
    render: (h) => h(App),
}).$mount("#app");
