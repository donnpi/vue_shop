<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数"
        type="warning"
        :closable="false"
        show-icon
      ></el-alert>
      <!-- 选择商品分类区 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateProps"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签页 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick" v-show="cateId">
        <el-tab-pane label="动态参数" name="many">
          <!-- 添加动态参数面板 -->
          <el-button
            type="primary"
            :disabled="idBtnDisabled"
            size="small"
            @click="addDialogVisible = true"
            >添加动态参数</el-button
          >
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" stripe>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(scope.row, i)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 列表行 -->
            <el-table-column
              label="参数名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  round
                  icon="el-icon-edit"
                  size="mini"
                  @click="openEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  round
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="静态属性" name="only">
          <!-- 添加动态属性面板 -->
          <el-button
            type="primary"
            :disabled="idBtnDisabled"
            size="small"
            @click="addDialogVisible = true"
            >添加静态属性</el-button
          >
          <!-- 静态属性 -->
          <el-table :data="onlyTableData" stripe>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <!-- 展开行 -->
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag标签 -->
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(scope.row, i)"
                >
                  {{ item }}
                </el-tag>
                <!-- 输入文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                  >+ New Tag</el-button
                >
              </template>
            </el-table-column>
            <!-- 列表行 -->
            <el-table-column
              label="属性名称"
              prop="attr_name"
            ></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button
                  type="primary"
                  round
                  icon="el-icon-edit"
                  size="mini"
                  @click="openEditDialog(scope.row.attr_id)"
                  >编辑</el-button
                >
                <el-button
                  type="danger"
                  round
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                  >删除</el-button
                >
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form
        ref="addFormRef"
        :model="addForm"
        label-width="80px"
        :rules="addFormRules"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        ref="editFormRef"
        :model="editForm"
        label-width="80px"
        :rules="addFormRules"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  created() {
    this.getCateList()
  },
  data() {
    return {
      cateList: [],
      cateProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
      },
      // 级联选择器双向绑定的数据
      selectedCateKeys: [],
      // 被激活的页签名
      activeName: 'many',
      // 动态参数
      onlyTableData: [],
      // 静态属性
      manyTableData: [],
      // 添加对话框显示
      addDialogVisible: false,
      addForm: {
        attr_name: '',
      },
      addFormRules: {
        attr_name: [
          {
            required: true,
            message: '请输入参数名称',
            trigger: 'blur',
          },
        ],
      },
      editDialogVisible: false,
      editForm: {
        attr_name: '',
        // 要编辑的参数id
        attr_id: '',
      },
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 级联选择器值变化时触发
    handleChange() {
      this.getParamsList()
    },
    handleTabClick() {
      this.getParamsList()
    },
    // 获取参数列表
    async getParamsList() {
      // 只允许选中三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        // 从三级分类切换到二级分类时，把数据清空
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName,
          },
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      console.log(res.data)
      res.data.forEach((item) => {
        // 将字符串转换为数组
        // 如果attr_vals为空字符串，按以下分割方式会输出带一个空格元素的数组，渲染一个空标签，所以要判断
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制每一个参数各自文本框的显示隐藏
        item.inputVisible = false
        // 控制每一个参数各自文本框各自的值
        item.inputValue = ''
      })
      console.log(res.data)
      //将获取到的参数挂载到不同的数据源
      if (this.activeName == 'only') {
        this.onlyTableData = res.data
      } else {
        this.manyTableData = res.data
      }
    },
    // 重置对话框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 提交新增的参数
    addParams() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsList()
      })
    },
    // 关闭编辑对话框
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 打开编辑对话框
    async openEditDialog(parId) {
      this.editForm.attr_id = parId
      // 为了获取最新的后台数据，使用请求的方式获得参数名
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${parId}`,
        {
          params: { attr_sel: this.activeName },
        }
      )
      if (res.meta.status !== 200) {
        console.log(res)
        return this.$message.error('获取参数名称失败')
      }

      this.editForm.attr_name = res.data.attr_name
      this.editDialogVisible = true
    },
    // 编辑参数的提交
    editParams() {
      console.log(this.editForm)
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName,
          }
        )
        if (res.meta.status !== 200) {
          console.log(res)
          return this.$message.error('编辑参数失败')
        }
        this.$message.success('编辑参数成功')
        this.editDialogVisible = false
        this.getParamsList()
      })
    },
    // 删除参数
    async removeParams(parId) {
      const conRes = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (conRes !== 'confirm') return
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${parId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsList()
    },
    // 显示属性文本框
    showInput(attr) {
      attr.inputVisible = true
      // 把 attr.inputVisible重置为true之后，页面上el-input还没有被渲染
      // $nextTick:当页面上的元素被重新渲染后，才会调用回调函数中的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.focus()
      })
    },
    // 属性文本框失去焦点，或按下enter键时触发
    async handleInputConfirm(item) {
      // 如输入内容不合法，则清空
      if (item.inputValue.trim().length === 0) {
        item.inputValue = ''
        item.inputVisible = false
        return
      }
      item.attr_vals.push(item.inputValue.trim())
      // 重置文本框
      item.inputValue = ''
      item.inputVisible = false
      // 保存操作
      this.saveAttrVals(item)
    },
    async saveAttrVals(item) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${item.attr_id}`,
        {
          attr_name: item.attr_name,
          attr_sel: this.activeName,
          attr_vals: item.attr_vals.join(' '),
        }
      )

      if (res.meta.status !== 200) {
        console.log(res)
        return this.$message.error('添加属性失败')
        item.inputValue = ''
      }
    },
    // 删除属性
    async handleClose(item, index) {
      item.attr_vals.splice(index, 1)
      this.saveAttrVals(item)
    },
  },
  computed: {
    // 控制按钮的禁用
    idBtnDisabled() {
      if (this.selectedCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },
    // 对话框标题文本
    titleText() {
      if (this.activeName == 'many') {
        return '动态参数'
      }
      return '静态属性'
    },
  },
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 5px;
}
.input-new-tag {
  width: 120px;
}
</style>