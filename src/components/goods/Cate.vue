<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog" class="topbtn"
            >添加分类</el-button
          >
        </el-col>
      </el-row>

      <!-- 商品分类列表区 -->
      <tree-table
        :data="catesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-index="true"
        index-text=""
        :show-row-hover="false"
      >
        <!-- 在表格内部，isok插槽处，使用作用域插槽-->
        <template v-slot:isok="scope">
          <i
            class="el-icon-success"
            v-if="!scope.row.cat_deleted"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>

        <!-- 排序插槽 -->
        <template v-slot:order="scope">
          <el-tag type="success" size="mini" v-if="scope.row.cat_level == 0"
            >一级</el-tag
          >
          <el-tag size="mini" v-else-if="scope.row.cat_level == 1">二级</el-tag>
          <el-tag size="mini" type="info" v-else>三级</el-tag>
        </template>
        <template v-slot:opt="scope">
          <el-button
            type="primary"
            size="mini"
            round
            icon="el-icon-edit"
            @click="openEditCate(scope.row)"
            >编辑</el-button
          >
          <el-button
            type="danger"
            size="mini"
            round
            icon="el-icon-delete"
            @click="removeCate(scope.row)"
            >删除</el-button
          >
        </template>
      </tree-table>
      <!-- 操作插槽 -->

      <!-- 分页条 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 20, 30]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 添加分页对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateRules"
        label-width="100px"
        ref="addCateFormRef"
      >
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <!-- options指定数据源 -->
          <!-- props用于配置对象 -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChanged"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类对话框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="resetEditDialog"
    >
      <el-form
        ref="editCateFormRef"
        :model="editCateForm"
        label-width="80px"
        :rules="addCateRules"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
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
      catesList: [],
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      // 为tree-table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          // 表示将当前列定义为模板列，挖空
          type: 'template',
          // 当前列使用的插槽名称
          template: 'isok',
        },
        {
          label: '排序',
          type: 'template',
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt',
        },
      ],
      // 添加分类对话框显示
      addCateVisible: false,
      // 添加分类
      addCateForm: {
        // 将要添加的类名
        cat_name: '',
        // 默认添加一级分类
        cat_pid: 0,
        cat_level: 0,
      },
      addCateRules: {},
      // 添加分类的表单验证规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' },
        ],
      },
      // 父级分类列表
      parentCateList: [],
      // 选中的父级id
      selectedKeys: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        checkStrictly: true,
        expandTrigger: 'hover',
        // 选中的值
        value: 'cat_id',
        // 看见的值
        label: 'cat_name',
        children: 'children',
      },
      // 编辑分类
      editCateDialogVisible: false,
      editCateForm: {
        cat_name: '',
      },
      // 要编辑的分类id
      cateId: '',
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('/categories', {
        params: this.queryInfo,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catesList = res.data.result
      this.total = res.data.total
      console.log(res.data)
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      // newSize是组件传过来的值，下面newPage同理
      this.queryInfo.pagesize = newSize
      // 要重新渲染页面
      this.getCateList()
    },
    // 监听当前页变化
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 打开添加分类对话框
    showAddCateDialog() {
      // 先获取父级元素再打开对话框
      this.getparentCateList()
      this.addCateVisible = true
    },
    // 获取父级分类的数据列表
    async getparentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 },
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类失败')
      }
      this.parentCateList = res.data
    },
    // 选择项变化时触发
    parentCateChanged() {
      // 根据数组长度判断层级
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
      }
      this.addCateForm.cat_level = this.selectedKeys.length
    },
    // 关闭时重置表单
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      // 重置级联选择器值发生变化时的改变
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_id = 0
    },

    //提交新增的分类
    async addCate() {
      this.$refs.addCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.addCateVisible = false
        this.$message.success('添加分类成功')
        this.getCateList()
      })
    },
    // 删除分类
    async removeCate(cate) {
      const conRes = await this.$confirm(
        '此操作将永久删除该分类, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (conRes == 'confirm') {
        const { data: res } = await this.$http.delete(
          `categories/${cate.cat_id}`
        )
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('删除分类失败')
        }
        this.$message.success('删除分类成功')
        this.getCateList()
      }
    },
    // 编辑分类
    openEditCate(cate) {
      this.editCateDialogVisible = true
      this.cateId = cate.cat_id
this.editCateForm.cat_name=cate.cat_name
    },
    resetEditDialog() {
      this.$refs.editCateFormRef.resetFields()
    },
    // 提交分类编辑
    editCate() {
      this.$refs.editCateFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}`, {
          cat_name: this.editCateForm.cat_name,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('更新分类失败')
        }
        this.editCateDialogVisible = false
        this.$message.success('更新分类成功')
        this.getCateList()
      })
    },
  },
}
</script>
<style lang="less" scoped>
.tree {
  margin-bottom: 15px;
  font-size: 12px;
}
.el-cascader {
  width: 100%;
}
.topbtn {
  margin-bottom: 15px;
}
</style>