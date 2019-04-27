// pages/address/address.js
const app = getApp()
const regeneratorRuntime = require("../../lib/runtime")
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  onShow: function () {
    this.getGoodsList();
  },

  async getGoodsList() {
    // 利用云开发新接口，读取所有商品数据
    const db = wx.cloud.database();
    const user = await db.collection('user').doc(app.globalData.id).get();

    let data = user.data || [];

    this.setData({
      list: data.address
    });
  },

  /**
   * 新建个人地址 -> 跳转到地址编辑页面
   */
  createAddress: function () {
    wx.navigateTo({
      url: '/pages/address/add',
    })
  },
  
  /**
   * 编辑个人地址 -> 传参跳转到地址编辑页面 -> e.currentTarget.dataset
   */
  editAddress: function (e) {
    wx.navigateTo({
      url: '/pages/address/add?state=edit&region_st=' + e.currentTarget.dataset.region[0] + 
           '&region_nd=' + e.currentTarget.dataset.region[1] +
           '&region_rd=' + e.currentTarget.dataset.region[2] +
           '&address=' + e.currentTarget.dataset.addre + 
           '&name=' + e.currentTarget.dataset.name + 
           '&sex=' + e.currentTarget.dataset.sex + 
           '&tele=' + e.currentTarget.dataset.tel +
           '&tag=' + e.currentTarget.dataset.tag + 
           '&id=' + e.currentTarget.dataset.id
    })
  },

  /**
   * 选择物流信息 -> 赋值给全局函数并跳转到订单页面
   */
  chooseAddress: function (e) {
    console.log(app.globalData)

    const oldAddress = app.globalData.allData.address

    for (var i = 0; i < oldAddress.length; i++) {
      if (oldAddress[i].id == e.detail.value) {
        oldAddress[i].choose = true
      } else {
        oldAddress[i].choose = false
      }
    }
    app.globalData.allData.address = oldAddress
    db.collection('user').doc(app.globalData.id).update({
      data: {
        address: db.command.set(app.globalData.allData.address)
      }
    }).then(result => {
      app.globalData.addressData = this.data.list[e.detail.value]
      wx.navigateBack({})
    })
  }
  
})