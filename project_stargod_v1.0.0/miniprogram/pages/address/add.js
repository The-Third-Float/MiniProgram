// pages/address/add.js
const db = wx.cloud.database()
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: "",
    region: ['', '', ''],
    customItem: '全部',
    checkboxItems: [
      { name: '家', value: '家'},
      { name: '公司', value: '公司'},
      { name: '学校', value: '学校'},
    ],
    radioItems: [
      { name: '先生', value: '先生' },
      { name: '女士', value: '女士' },
    ],
    user_sex: "",
    user_tag: "",
    user_add: "",
    user_nam: "",
    user_tel: "",
    user_id: -1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (options.state == "edit") {
      this.comeFromEdit(options)
    }
  },

  comeFromEdit: function (options) {
    wx.setNavigationBarTitle({
      title: '编辑收货地址',
    })
    var cash_rgin = [options.region_st, options.region_nd, options.region_rd]
    this.setData({
      user_add: options.address,
      user_tel: options.tele,
      user_nam: options.name,
      user_tag: options.tag,
      user_sex: options.sex,
      type: "edit",
      region: cash_rgin,
      user_id: options.id
    });
    var checked = this.data.user_tag
    var choosed = this.data.user_sex
    var changed = {}
    for (var i = 0; i < this.data.checkboxItems.length; i++) {
      if (checked.indexOf(this.data.checkboxItems[i].name) !== -1) {
        changed['checkboxItems[' + i + '].checked'] = true
      } else {
        changed['checkboxItems[' + i + '].checked'] = false
      }
    }
    this.setData(changed)
    for (var i = 0; i < this.data.radioItems.length; i++) {
      if (choosed.indexOf(this.data.radioItems[i].name) !== -1) {
        changed['radioItems[' + i + '].checked'] = true
      } else {
        changed['radioItems[' + i + '].checked'] = false
      }
    }
    this.setData(changed)
  },

  radioChange: function(e) {
    this.setData ({
      user_sex: e.detail.value
    });
  },

  addressChange: function(e) {
    this.setData ({
      user_add: e.detail.value
    });
  },

  nameChange: function(e) {
    this.setData({
      user_nam: e.detail.value
    });
  },

  telephoneChange: function(e) {
    this.setData({
      user_tel: e.detail.value
    });
  },

  bindRegionChange: function(e) {
    this.setData({
      region: e.detail.value
    })
  },

  checkboxChange: function (e) {
    var checked = e.detail.value
    var changed = {}
    for (var i = 0; i < this.data.checkboxItems.length; i++) {
      if (checked.indexOf(this.data.checkboxItems[i].name) !== -1) {
        changed['checkboxItems[' + i + '].checked'] = true
      } else {
        changed['checkboxItems[' + i + '].checked'] = false
      }
    }
    this.setData(changed)
    this.setData({
      user_tag: e.detail.value
      }
    );
  },

  saveInfo: function (e) {
    var warn = "";
    var flag = false;
    if (this.data.user_nam == "") {
      warn = "请填写您的姓名！";
    } else if (this.data.user_tel == "") {
      warn = "请填写您的手机号！";
    } else if (!(/^1(3|4|5|7|8)\d{9}$/.test(this.data.user_tel))) {
      warn = "手机号格式不正确";
    } else if (this.data.region[0] == "") {
      warn = "请选择您的所在区域";
    } else if (this.data.region[1] == "全部" || this.data.region[2] == "全部") {
      warn = "区域请精确到区县";
    } else if (this.data.user_add == "") {
      warn = "请输入您的具体地址";
    } else if (this.data.user_sex == "") {
      warn = "请选择您的称谓";
    } else {
      flag = true;
      if (this.data.type == "edit"){
        this.changeAddress(this.data)
      } else {
        this.addAddress(this.data)
      }
    }
    if (flag == false) {
      wx.showModal({
        title: '提示',
        content: warn
      })
    }
  },

  askForDeleteAddress: function (e) {
    var that = this
    wx.showModal({
      title: '提示',
      content: '确认要删除地址',
      success(res) {
        if (res.confirm) {
          that.deleteAddress(e)
        } else if (res.cancel) {

        }
      }
    })
  },

  //添加用户收货地址
  addAddress: function (e) {
    const oldAddress = app.globalData.allData.address
    for (var i = 0; i < oldAddress.length; i++) {
      oldAddress[i].id = i
      if (oldAddress[i].choose == true) {
        oldAddress[i].choose = false
      }
    }
    const newAddress = [{
      region: e.region,
      address: e.user_add,
      name: e.user_nam,
      tele: e.user_tel,
      sex: e.user_sex,
      tag: e.user_tag,
      choose: true,
      id: oldAddress.length
    }]
    app.globalData.allData.address = [...oldAddress, ...newAddress]
    app.globalData.addressData = newAddress[0]
    db.collection('user').doc(app.globalData.id).update({
      data: {
        address: db.command.set(app.globalData.allData.address)
      }
    }).then(result => {
      wx.showToast({
        title: '地址创建成功',
        icon: 'success',
        duration: 1000,
        success: function () {
          setTimeout(function () {
            wx.navigateBack()
          }, 1100);
        }
      })
    })
  },

  //修改用户收货地址
  changeAddress: function (e) {
    const oldAddress = app.globalData.allData.address
    const cshAddress = [{
      region: e.region,
      address: e.user_add,
      name: e.user_nam,
      tele: e.user_tel,
      sex: e.user_sex,
      tag: e.user_tag,
      choose: true,
      id: parseInt(e.user_id)
    }]
    const newAddress = []
    for (var i = 0; i < oldAddress.length; i++) {
      if (oldAddress[i].id == this.data.user_id) {
        newAddress[i] = cshAddress[0]
      } else {
        oldAddress[i].choose = false
        newAddress[i] = oldAddress[i]
      }
    }
    app.globalData.allData.address = newAddress
    app.globalData.addressData = newAddress[this.data.user_id]
    db.collection('user').doc(app.globalData.id).update({
      data: {
        address: db.command.set(app.globalData.allData.address)
      }
    }).then(result => {
      wx.showNavigationBarLoading()
      setTimeout(function () {
        wx.navigateBack()
      }, 500);
    })
  },

  //删除用户收货地址
  deleteAddress: function (e) {
    const oldAddrIds = []
    const oldAddress = app.globalData.allData.address
    for (var i = 0; i < oldAddress.length; i++) {
      oldAddrIds[i] = oldAddress[i].id
    }
    const newAddrIds = oldAddrIds.filter(id => id != this.data.user_id)
    const newAddress = oldAddress.filter(address => !!~newAddrIds.indexOf(address.id))
    for (var i = 0; i < newAddress.length; i++) {
      newAddress[i].id = i
      if (i == 0) {
        newAddress[i].choose = true
      } else {
        newAddress[i].choose = false
      }
    }
    app.globalData.allData.address = newAddress
    app.globalData.addressData = newAddress[0]
    db.collection('user').doc(app.globalData.id).update({
      data: {
        address: db.command.set(app.globalData.allData.address)
      }
    }).then(result => {
      wx.showToast({
        title: '成功删除地址',
        icon: 'success',
        duration: 1000,
        success: function () {
          setTimeout(function () {
            wx.navigateBack()
          }, 1100);
        }
      })
    })
  }

})
