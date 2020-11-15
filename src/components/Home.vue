<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div class="logo-box">
        <img src="../assets/logo.png" alt="" />
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '60px' : '200px'">
        <!-- 折叠展开条 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>

        <!-- 侧边栏菜单区 -->
        <!-- router开启路由模式，以激活项的index值为地址 -->
        <el-menu background-color="#365A7D" text-color="#fff" active-text-color="#ffd04b" unique-opened :collapse="isCollapse" :collapse-transition="false" router :default-active="activePath">
          <!-- 一级菜单 -->
          <!--1,index需是动态的,不然展开收起时所有一级菜单都是一致的 2,index只接收字符串  -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <!-- 一级菜单模板区 -->
            <template slot="title">
              <!-- 图标 -->
              <i :class="iconsList[item.id]"></i>
              <!-- 文本 -->
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item :index="'/' + subit.path" v-for="subit in item.children" :key="subit.id" @click="saveNameState('/' + subit.path)">
              <template slot="title">
                <!-- 图标 -->
                <i class="el-icon-menu"></i>
                <!-- 文本 -->
                <span>{{ subit.authName }}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧主体 -->
      <el-main>
        <!-- 子路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  // 页面加载时就要立即获取左侧菜单
  // created 实例初始化后就调用
  created() {
    this.getMenueList(),
      // 获得菜单项激活链接
      (this.activePath = window.sessionStorage.getItem('activePath'))
  },
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconsList: {
        // 根据菜单项id匹配icon,(用数组不好找对应关系,不能保证每次渲染顺序相同)
        125: 'el-icon-s-custom',
        103: 'el-icon-s-check',
        101: 'el-icon-s-goods',
        102: 'el-icon-s-order',
        145: 'el-icon-s-marketing',
      },
      // 菜单展开收起
      isCollapse: false,
      // 被激活的菜单项链接
      activePath: '',
    }
  },
  methods: {
    // 退出功能
    logout() {
      // 清清空token
      window.sessionStorage.clear()
      // 跳转登录页
      this.$router.push('/login')
    },
    // 获取所有的菜单
    async getMenueList() {
      const { data: res } = await this.$http('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.message)
      this.menulist = res.data
    },
    // 切换菜单栏的显示与折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    //保存子路由路径，设置对应菜单栏激活状态
    saveNameState(activePath) {
      window.sessionStorage.setItem('activePath', activePath), (this.activePath = activePath)
    },
    getActivePath() {
      this.activePath = window.sessionStorage.getItem('activePath')
    },
  },
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  padding-left: 10px;
  background-color: #364B5D;
  justify-content: space-between;
  align-items: center;
  color: #eee;
  font-size: 22px;
  > div {
    display: flex;
    align-items: center;
    img {
      padding-right: 10px;
      width: 40px;
      height: 40px;
    }
  }
}

.el-aside {
  background-color: #365A7D;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #F4F4F5;
}
.toggle-button {
  color: #eee;
  text-align: center;
  font-size: 12px;
  line-height: 24px;
  background-color: #909399;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>