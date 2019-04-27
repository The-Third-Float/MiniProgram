// pages/add/add.js
const regeneratorRuntime = require("../../lib/runtime");
const app = getApp()
let IMAGE_WIDTH = 332,
    IMG_REAL_W = 0,
    IMG_REAL_H = 0,
    IMG_RATIO = 0,
    IMAGE_RATE = 0
Page({

  /**
   * 页面的初始数据
   */
  data: {
    currentPhoto: false,
    albumIndex: -1,
    albumName:'',
    albums: [],
    photosNew: [],
    newphotos_url: [],
    index: '',

    // 页面加载信息
    imageW: IMAGE_WIDTH,
    imageH: IMAGE_WIDTH,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onShow: function (options) {
    const photosNew = app.globalData.allData.albums
    var image_rate = app.globalData.productData.height / app.globalData.productData.width
    IMAGE_RATE = image_rate
    this.setData({
      photosNew,
    })
    this.setData({
      albumIndex: app.globalData.productData._id,
      albumName: app.globalData.productData.name,
      imageH: this.data.imageW * image_rate
    })
  },

  // 预览图片
  previewImage(e) {
    const current = e.target.dataset.src
    wx.navigateTo({
      url: '/pages/photos/photos?src=' + current.src + '&orderNum=' + current.orderNum
           + '&imgH=' + current.imgH + '&imgW=' + current.imgW + '&count=' + current.count
    })
  },

  // 删除照片
  deleteImage (e) {
    const imgSrc = e.target.dataset.src.src
    // 展示操作菜单
    wx.showActionSheet({
      itemList: ['删除照片'],
      success: res => {
        if (res.tapIndex === 0) {
          this.deleteFile(imgSrc)
        }
      }
    })
  },

  // 删除图片的具体代码
  deleteFile (e) {
    const oldPhotos = []
    const oldAlbums = app.globalData.allData.albums
    for (var i = 0; i < oldAlbums.length; i++) {
      oldPhotos[i] = oldAlbums[i].src
    }
    const newPhotos = oldPhotos.filter(src => src != e)
    const newAlbums = oldAlbums.filter(albums => !!~newPhotos.indexOf(albums.src))
    app.globalData.allData.albums = newAlbums
    this.onShow()
  },

  // 按下一步按钮时提交备注
  formSubmit (e) {
    app.globalData.allData.albums.remark = e.detail.value.remark
  },

  doUpload: function () {
    // 选择图片
    const items = this.data.photosNew
    const length = items.length
    wx.chooseImage({
      count: 9,
      sizeType: ['original'],
      sourceType: ['album', 'camera'],
      success: res => {
        let tempFilePaths = res.tempFilePaths
        let type = 0
        let isOrigin = false
        let width = app.globalData.productData.width
        let height = app.globalData.productData.height
        for (const tempFilePath of tempFilePaths) {
          wx.getImageInfo({
            src: tempFilePath,
            success: res => {
              IMG_REAL_W = res.width
              IMG_REAL_H = res.height
              IMG_RATIO = IMG_REAL_W / IMG_REAL_H
              if (IMG_RATIO > IMAGE_RATE) {
                type = 1
              } else {
                type = 0
              }
              var imgMin = Math.min(IMG_REAL_W, IMG_REAL_H)
              var imgMax = Math.max(IMG_REAL_W, IMG_REAL_H)
              if (width > imgMin || height > imgMax) {
                isOrigin = true
              } else {
                isOrigin = false
              }
              items.push({
                src: tempFilePath,
                type: type,
                isOrigin: isOrigin,
                orderNum: 1,
                imgH: IMG_REAL_H,
                imgW: IMG_REAL_W,
              })
              if (items.length - length === tempFilePaths.length){
                this.onShow()
              }
            }
          })
        }
        app.globalData.allData.orderNum += tempFilePaths.length
        app.globalData.allData.albums = items
      }
    })
  },

  gotoBook(e) {
    if (app.globalData.allData.albums.length == 0) {
      wx.showModal({
        title: '提示',
        content: '您还没有选择照片哟',
        showCancel: false,
        confirmText: "好嘞",
        confirmColor: 'skyblue',
      })
    } else if (app.globalData.allData.albums.filter(albums => !!albums.isOrigin).length !== 0) {
      wx.showModal({
        title: '提示',
        content: '照片中存在像素过小的照片，请长按删除后重试',
        showCancel: false,
        confirmText: "好嘞",
        confirmColor: 'skyblue',
      })
    } else {
      wx.navigateTo({
        url: `/pages/book/book`
      })
    }
  }
  
})
