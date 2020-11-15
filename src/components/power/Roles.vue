<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加角色按钮区 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="roleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区 -->
      <el-table stripe :data="rolesList">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['vcenter', 'bd-bottom', { 'bd-top': i1 == 0 }]">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag type="success" closable @close="removeRightById(scope.row, item1.id)"> {{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id">
                  <!-- 二级 -->
                  <el-col :class="['vcenter', { 'bd-top': i2 !== 0 }]" :span="6">
                    <el-tag closable @close="removeRightById(scope.row, item2.id)"> {{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag v-for="item3 in item2.children" :key="item3.id" type="info" closable @close="removeRightById(scope.row, item3.id)"> {{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>

        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" prop="roleDesc" width="300px">
          <template v-slot="scope">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" round @click="editOpen(scope.row.id)">编辑</el-button>
            <!-- 分配权限按钮 -->
            <el-button type="warning" icon="el-icon-setting" size="mini" round @click="showSetRightDialog(scope.row)">分配权限</el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" round @click="removeRole(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <!--添加角色对话框  -->
      <el-dialog title="添加角色" :visible.sync="roleDialogVisible" width="50%" @close="addRoleClosed">
        <!-- 对话框内容主体 -->
        <el-form :model="addRoleForm" :rules="addRoleRules" ref="addRoleRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="addRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="addRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
        </span>
      </el-dialog>

      <!--编辑角色对话框  -->
      <el-dialog title="编辑角色" :visible.sync="editDialogVisible" width="50%" @close="editRoleClosed">
        <!-- 对话框内容主体 -->
        <el-form :model="editRoleForm" :rules="addRoleRules" ref="editRoleRef" label-width="80px">
          <el-form-item label="角色名称" prop="roleName">
            <el-input v-model="editRoleForm.roleName"></el-input>
          </el-form-item>
          <el-form-item label="角色描述">
            <el-input v-model="editRoleForm.roleDesc"></el-input>
          </el-form-item>
        </el-form>
        <!-- 底部按钮 -->
        <span slot="footer" class="dialog-footer">
          <el-button @click="editDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editRole">确 定</el-button>
        </span>
      </el-dialog>

      <!-- 分配权限对话框 -->
      <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="defKeys = []">
        <!-- 树形控件 id是data绑定的数据中的 勾选节点即勾选其id值-->
        <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>

        <span slot="footer" class="dialog-footer">
          <el-button @click="setRightDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="allotRights">确 定</el-button>
        </span>
      </el-dialog>
    </el-card>
  </div>
</template>
<script>
export default {
  created() {
    this.getRolesList()
  },
  data() {
    return {
      // 所有角色列表数据源
      rolesList: [],
      // 添加角色
      addRoleForm: {},
      // 添加角色的显示
      roleDialogVisible: false,
      // 添加角色验证规则
      addRoleRules: {
        roleName: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          {
            min: 1,
            max: 10,
            message: '长度在 1 到 10 个字符',
            trigger: 'blur',
          },
        ],
      },
      // 编辑角色对话框显示隐藏
      editDialogVisible: false,
      // 编辑角色表单
      editRoleForm: {},
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 权限列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        // 需要展示的属性
        label: 'authName',
        // 父子节点实现嵌套的属性
        children: 'children',
      },
      // 默认选中的节点id值
      defKeys: [],
      // 当前即将分配权限的角色id
      roleId: '',
    }
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('/roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 关闭添加角色对话框
    addRoleClosed() {
      this.$refs.addRoleRef.resetFields()
    },
    // 提交新角色
    addRole() {
      this.$refs.addRoleRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('未通过验证')
        }
        const { data: res } = await this.$http.post('/roles', this.addRoleForm)
        if (res.meta.status !== 201) {
          return this.$message.error('创建角色失败')
        }
      })
      this.roleDialogVisible = false
      this.$message.success('创建用户成功')
      this.getRolesList()
    },
    // 弹出编辑对话框
    async editOpen(id) {
      this.editDialogVisible = true
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.editRoleForm = res.data
    },
    // 关闭编辑角色对话框
    editRoleClosed() {
      this.$refs.editRoleRef.resetFields()
    },
    // 提交修改信息
    editRole() {
      this.$refs.editRoleRef.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('未通过验证')
        }
        const { data: res } = await this.$http.put(`/roles/${this.editRoleForm.roleId}`, {
          roleName: this.editRoleForm.roleName,
          roleDesc: this.editRoleForm.roleDesc,
        })
        if (res.meta.status !== 200) {
          return this.$message.error('编辑角色失败')
        }
        this.editDialogVisible = false
        this.$message.success('编辑角色成功')
        this.getRolesList()
      })
    },
    // 删除角色
    async removeRole(id) {
      // 弹框确认是否删除
      const confirRes = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)
      if (confirRes !== 'confirm') {
        return this.$message.info('取消删除')
      }

      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除角色失败')
      }
      this.$message.success('删除角色成功')
      this.getRolesList()
    },
    //根据id删除对应的权限
    async removeRightById(role, rid) {
      const confirRes = await this.$confirm('是否删除该权限？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).catch((err) => err)
      if (confirRes != 'confirm') {
        return this.$message.info('取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rid}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      this.$message.success('删除权限成功')
      // 不会发生页面跳转
      role.children = res.data
    },
    // 展示分配权限对话框
    async showSetRightDialog(role) {
      // 保存当前id，可供其他api使用
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      this.rightsList = res.data

      //默认勾选项：获得递归获取三级节点的id
      this.getDefKeys(role, this.defKeys)

      this.setRightDialogVisible = true
    },
    //defKeys只需要最低层级，抽取三级节点,将其id传到defKeys
    getDefKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach((item) => {
        this.getDefKeys(item, arr)
      })
    },
    // 分配权限提交
    async allotRights() {
      const keys = [
        // 获取所有全选节点
        ...this.$refs.treeRef.getCheckedKeys(),
        // 获取所有半选节点
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // 转换为以逗号分割的字符串
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr,
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRightDialogVisible = false
    },
  },
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bd-top {
  border-top: 1px solid #eee;
}
.bd-bottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>