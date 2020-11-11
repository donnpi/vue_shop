import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入树形结构插件
import TreeTable from 'vue-table-with-tree-grid'

//导入axios
import axios from 'axios'
// 设置根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
// 设置拦截器,config 请求对象
axios.interceptors.request.use(config => {
    // config.headers请求头对象,手动加上Authorization属性发送给服务器
    config.headers.Authorization = window.sessionStorage.getItem('token');
    // 最后必须return config
    return config;
});
// 把axios挂载到vue原型上，那么每一个vue实例（组件）都可以通过this访问到axios
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 将树形组件注册为全局可用的组件
Vue.component('tree-table', TreeTable)

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')