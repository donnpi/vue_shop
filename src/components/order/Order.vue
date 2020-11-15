<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row>
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query">
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getOrderList"
            ></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 列表区 -->
      <el-table :data="ordersList" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="order_number" label="订单编号"></el-table-column>
        <el-table-column
          prop="order_price"
          label="订单价格"
          width="100px"
        ></el-table-column>
        <el-table-column label="是否付款" width="120px">
          <template v-slot="scope">
            <el-tag v-if="scope.row.order_pay == 1" type="success"
              >已付款</el-tag
            >
            <el-tag v-else type="danger">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="is_send"
          label="是否发货"
          width="100px"
        ></el-table-column>
        <el-table-column prop="create_time" label="下单时间" width="200px">
          <template v-slot="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200px">
          <template v-slot="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              round
              @click="showBox"
            ></el-button>
            <el-button
              type="success"
              icon="el-icon-location"
              size="mini"
              round
              @click="showprogressBox"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页条 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[10, 20, 30, 50]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="adressVisible"
      width="50%"
      @close="adressColsed"
    >
      <el-form
        ref="adressFormRef"
        :model="adressForm"
        label-width="100px"
        :rules="adressFormRuels"
      >
        <el-form-item label="省市区/县" prop="adress1">
          <el-cascader :options="cityData" v-model="adressForm.adress1">
          </el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="adress2">
          <el-input v-model="adressForm.adress2"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="adressVisible = false">取 消</el-button>
        <el-button type="primary" @click="adressVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>

    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progressVisible" width="50%">
      <!-- 时间线 -->
      <el-timeline >
        <el-timeline-item
          v-for="(activity, index) in progressInfo"
          :key="index"
          :timestamp="activity.time"
        >
          {{ activity.context }}
        </el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
// 导入地址数据
import cityData from './citydata.js'
export default {
  created() {
    this.getOrderList()
  },
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
        user_id: '',
        pay_status: '',
        is_send: '',
        order_fapiao_title: '',
        order_fapiao_company: '',
        order_fapiao_content: '',
        consignee_addr: '',
      },
      ordersList: [],
      total: 0,
      adressVisible: false,
      adressForm: {
        adress1: [],
        adress2: '',
      },
      adressFormRuels: {
        adress1: [
          { required: true, message: '请选择省市区/县城', trigger: 'blur' },
        ],
        adress2: [
          { required: true, message: '请填写详细地址', trigger: 'blur' },
        ],
      },
      // 使用导入的地址数据
      cityData,
      progressVisible: false,
      progressInfo: [],
    }
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$http.get('/orders', {
        params: this.queryInfo,
      })
      console.log(res.data)
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单列表失败')
      }
      this.ordersList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    // 展示修改地址的对话框
    showBox() {
      this.adressVisible = true
    },
    adressColsed() {
      this.$refs.adressFormRef.resetFields()
    },
    async showprogressBox() {
      const { data: res } = await this.$http.get('/kuaidi/1106975712662')
      console.log(res)
      if (res.meta.status !== 200)
        return this.$message.error('获取物流信息失败')
      this.progressInfo = res.data
      console.log(this.progressInfo)
      this.progressVisible = true
    },
  },
}
</script>
<style lang="less" scoped>

.el-cascader {
  width: 100%;
}
</style>