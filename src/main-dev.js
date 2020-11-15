import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入树形结构插件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入进度条的js和css
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'

//导入axios
import axios from 'axios'
// 设置根路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/';
// 设置拦截器,config 请求对象
axios.interceptors.request.use(config => {
    // 在request拦截器中，展示进度条
    NProgress.start()

    // config.headers请求头对象,手动加上Authorization属性发送给服务器
    config.headers.Authorization = window.sessionStorage.getItem('token');
    // 最后必须return config
    return config;
});

axios.interceptors.response.use(config => {
    // 在request拦截器中，隐藏进度条
    NProgress.done()
    return config;
})

// 把axios挂载到vue原型上，那么每一个vue实例（组件）都可以通过this访问到axios
Vue.prototype.$http = axios

Vue.config.productionTip = false

// 将树形组件注册为全局可用的组件
Vue.component('tree-table', TreeTable)

// 将富文本编辑器注册为全局可用的组件
Vue.use(VueQuillEditor)

// 注册全局过滤器，处理全局的时间格式
Vue.filter('dateFormat', function(originVal) {
    const dt = new Date(originVal)
    const y = dt.getFullYear()
        // 转换为字符串，月份从0开始，不足两位的,前面填充一个0
    const m = (dt.getMonth() + 1 + '').padStart(2, 0)
    const d = (dt.getDate() + '').padStart(2, 0)
    const hh = (dt.getHours() + '').padStart(2, 0)
    const mm = (dt.getMinutes() + '').padStart(2, 0)
    const ss = (dt.getSeconds() + '').padStart(2, 0)
    return `${y}-${m}-${d} ${hh}:${mm}:${ss}`

})

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')