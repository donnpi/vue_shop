<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 提示区 -->
      <el-alert
        title="添加商品信息"
        type="info"
        center
        show-icon
        :closable="false"
      >
      </el-alert>
      <!-- 步骤条区域 -->
      <el-steps
        :space="200"
        :active="+activeIndex"
        finish-status="success"
        align-center
      >
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- 侧边tab栏 -->
      <!-- 要用一个form包裹，让各个tab的表单数据整合到一起 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <!-- v-model 绑定的是tab项的tab值 -->
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <!-- tab1 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品分类">
              <el-cascader
                v-model="selectedCateId"
                :options="cateList"
                @change="handleChange"
                :props="cateProps"
              ></el-cascader>
            </el-form-item>
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <!-- type='number'限定只能输入数字 -->
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>

            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- tab2 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item
              v-for="item in manyTableData"
              :key="item.attr_id"
              :label="item.attr_name"
            >
              <!-- 复选框组 选中项绑定manyTableData的数据-->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(cb, i) in item.attr_vals"
                  :key="i"
                  :label="cb"
                  border
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- tab3 -->
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyTableData"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- tab4 -->
          <el-tab-pane label="商品图片" name="3">
            <!-- action图片要上传的后台服务器的绝对路径，写相对路径会解析为浏览器中的地址，入口文件配置的是默认路径是供axios使用的-->
            <!-- 该上传控件，发送ajax请求时，没有用到axios，所以其配置的发送token的拦截器也不能用，用headers单独设置请求头-->
            <el-upload
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="imgHeaders"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- tab5-->
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor
              ref="myQuillEditor"
              v-model="addForm.goods_introduce"
            />
            <el-button type="primary" class="addBtn" @click="add"
              >添加商品</el-button
            >
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 预览图片的对话框 -->
    <el-dialog :visible.sync="imgVisible">
      <img :src="previewPath" alt="" class="preview" />
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateLIst()
  },
  data() {
    return {
      activeIndex: 0,
      // 添加商品的表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: '',
        goods_introduce: '',
        pics: [],
        attrs: [],
      },
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' },
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' },
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' },
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' },
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' },
        ],
        goods_introduce: '',
        pics: [],
        attrs: [],
      },
      // 选中的商品分类
      selectedCateId: [],
      // 商品列表
      cateList: [],
      // 级联选择器的配置
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 动态参数列表
      manyTableData: [],
      // 静态属性列表数组
      onlyTableData: [],
      // 图片上传到后台api时携带的请求头
      imgHeaders: {
        Authorization: window.sessionStorage.getItem('token'),
      },
      // 预览图片的地址
      previewPath: '',
      // 预览图片对话框
      imgVisible: false,
    }
  },
  methods: {
    // 获取商品分类
    async getCateLIst() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 级联选择器选项变化时触发
    handleChange() {
      // 只能选中三级分类
      if (this.selectedCateId.length !== 3) {
        return (this.selectedCateId = [])
      }
      this.addForm.goods_cat = this.selectedCateId
    },
    // tab页切换前触发，activeName即将进入的标签名，oldActiveName原标签名
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName == 0 && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品分类')
        // 阻止标签页切换
        return false
      }
    },
    // 获取商品参数
    async getParams(sel) {
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel },
        }
      )
      console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品参数失败')
      }
      return res.data
    },
    // tab栏被选中时触发
    async tabClicked() {
      if (this.activeIndex == 1) {
        // 获取动态参数
        const data = await this.getParams('many')
        data.forEach((item) => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = data
        console.log(this.manyTableData)
      } else if (this.activeIndex == 2) {
        // 获取静态属性
        this.onlyTableData = await this.getParams('only')
        console.log(this.onlyTableData)
      }
    },
    // 监听图片上传成功事件
    handleSuccess(response) {
      // response 服务器返回的数据
      if (response.meta.status !== 200) {
        return this.$message.error('上传图片失败')
      }
      this.$message.success('上传图片成功')
      this.addForm.pics.push({ pic: response.data.tmp_path })
      console.log(this.addForm.pics)
    },
    // 移除图片
    handleRemove(file) {
      // file要被移除的图片的信息
      // 获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path
      const i = this.addForm.pics.findIndex((x) => {
        x.pic === filePath
      })
      this.addForm.pics.splice(i, 1)
      console.log(this.addForm.pics)
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.imgVisible = true
    },
    // 添加商品
    async add() {
      this.$refs.addFormRef.validate((valid) => {
        if (!valid) return this.$message.error('请填写必要的表单项')
      })
      // 添加执行业务逻辑
      // 级联选择器双向绑定了addForm.goods_cat，且只能时[]格式，否则报错，，而提交到服务器端时需要是字符串格式的
      // 使用loadash 进行深拷贝（我不用了，这也太大了,重设变量完事了）
      this.addForm.goods_cat = this.addForm.goods_cat.join(',')
      // 处理动态参数和静态属性
      this.manyTableData.forEach((item) => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals.join(' '),
        }
        this.addForm.attrs.push(newInfo)
      })
      this.onlyTableData.forEach((item) => {
        const newInfo = {
          attr_id: item.attr_id,
          attr_value: item.attr_vals,
        }
        this.addForm.attrs.push(newInfo)
      })
      console.log(this.addForm)
      // 发起添加商品请求
      // 商品名称需是唯一的
      const{data:res}=await this.$http.post('goods',this.addForm)
      if(res.meta.status!==201){
        return this.$message.error('添加商品失败')
      }
      this.$message.success('添加商品成功')
      this.$router.push('/goods')
  },
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    },
  },
}
</script>

<style lang="less" scoped>
.el-input {
  width: 400px;
}

.el-checkbox {
  margin: 0 8px 0 0 !important;
}
.el-tab-pane {
  margin-left: 30px;
}
.preview {
  width: 100%;
}
.addBtn {
  margin-top: 10px;
}
</style>