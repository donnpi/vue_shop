import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue';
import Welcome from '../components/Welcome.vue'
import Users from '../components/user/Users.vue'
import Rights from '../components/power/Rights.vue'
import Roles from '../components/power/Roles.vue'
import Cate from '../components/goods/Cate.vue'
import Params from '../components/goods/Params.vue'

Vue.use(VueRouter)

const routes = [{
        path: '/',
        redirect: '/login'
    }, {
        path: '/login',
        component: Login
    }, {
        path: '/home',
        component: Home,
        // 默认重定向到子路由(实现基础,vue-router不会重加载整个页面)
        redirect: '/welcome',
        children: [{
            path: '/welcome',
            component: Welcome
        }, {
            path: '/users',
            component: Users
        }, {
            path: '/rights',
            component: Rights
        }, {
            path: '/roles',
            component: Roles
        }, {
            path: '/categories',
            component: Cate
        }, {
            path: '/params',
            component: Params
        }]
    }

]

const router = new VueRouter({
    routes
})

//设置路由导航守卫控制页面访问权限
// to 将要访问的路径
// from 从哪个路径跳转而来
// next() 直接放行 next(地址)强制跳转
router.beforeEach((to, from, next) => {
    if (to.path == '/login') return next()
    if (!window.sessionStorage.getItem('token')) return next('/login');
    next();
})

export default router