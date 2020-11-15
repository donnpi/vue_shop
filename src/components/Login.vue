<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像 -->
      <div class="avatar_box">
        <img src="../assets/avatar.jpg" alt="avatar" />
      </div>
      <!-- 登录表单区域，，每一个表单域由一个 Form-Item 组件 -->
      <el-form label-width="0" class="login_form" :model="loginForm" :rules="loginFormRules" ref="loginFormRef">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user-solid" placeholder="请输入用户名" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" placeholder="请输入密码" v-model="loginForm.password" show-password></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 登录表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456',
      },
      // 表单的验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 2,
            max: 10,
            message: '长度在 2 到 10 个字符',
            trigger: 'blur',
          },
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          {
            min: 6,
            max: 15,
            message: '长度在 6 到 15 个字符',
            trigger: 'blur',
          },
        ],
      },
    }
  },
  methods: {
    // 重置表单
    reset() {
      // this指向该login组件
      this.$refs.loginFormRef.resetFields()
    },
    // 登录功能
    login() {
      // 1,预校验
      // validate，任一表单项被验证时触发，接收一个函数为参数，该函数的第一个形参是验证结果的布尔值
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return

        // 2,发送到服务器验证
        // 把data从响应结果中抽取出来，重命名为res
        const { data: res } = await this.$http.post('/login', this.loginForm)
        console.log(res)
        // 服务器验证失败
        if (res.meta.status !== 200) return this.$message.error('密码或用户名错误，登录失败')
        // 服务器验证成功
        this.$message({
          message: '恭喜你，登录成功',
          type: 'success',
        })

        // 3，保存服务器传过来的token
        window.sessionStorage.setItem('token', res.data.token)

        // 4,通过编程式导航跳转页面
        this.$router.push('/home')
      })
    },
  },
}
</script>

<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #365a7d;
}
.login_box {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 5px;
  .avatar_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    height: 130px;
    width: 130px;
    border-radius: 50%;
    padding: 4px;
    border: 1px solid #eee;
    background-color: #fff;
    box-shadow: 0 0 5px #ddd;
    img {
      height: 100%;
      border-radius: 50%;
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  .btns {
    float: right;
  }
}
</style>