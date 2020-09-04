// pages/personalData/setHead/setHead.js
const constants = require("../../../utils/constants.js");
const util = require("../../../utils/util.js");
var app = getApp()


Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgUrl: 'http://image.biaobaiju.com/uploads/20180803/23/1533308847-sJINRfclxg.jpeg'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let imgUrl = options.img;
    console.log("name==", imgUrl);
    console.log("constants==", constants.urlBase);
    this.setData({
      imgUrl: imgUrl
    });


  },
  editImg: function () {
    let _this = this;
    wx.getSystemInfo({
      success: function (result) {
        let itemList;
        console.log('result.platform===', result.platform);
        if (result.platform == 'android') {
          itemList = ["拍照", "从手机相册选择", "保存图片", "取消"];
        } else {
          itemList = ["拍照", "从手机相册选择", "保存图片"];
        }
        wx.showActionSheet({
          itemList: itemList,
          itemColor: "#15519b",
          success: function (res) {
            // res.cancel 用户是不是点击了取消按钮
            // res.tapIndex 数组元素的序号，从0开始
            let _sourceType;
            if (res.tapIndex == 0) {
              _sourceType = ['camera']
            } else if (res.tapIndex == 1) {
              _sourceType = ['album']
            }
            wx.chooseImage({
              count: 1,
              sizeType: ['compressed'],
              sourceType: _sourceType,
              success(vres) {
                // tempFilePath可以作为img标签的src属性显示图片
                const tempFilePaths = vres.tempFilePaths;
                console.log("tempFilePaths==", tempFilePaths)
                
                wx.uploadFile({
                  url: constants.urlBase + `/v1/upload/image`, 
                  filePath: tempFilePaths[0],
                  
                  method: 'post',
                  name: 'file',
                  formData: {
                    'user': 'test'
                  },
                  success: function (resp) {
                    var data = JSON.parse(resp.data);
                    if (data.success) {
                      //do something
                     
                      let url = "/api/user/updateHeadIcon/" + app.globalData.user.id + '?headIcon=' + data.data;
                      util.httpPost(url, {}).subscribe(res => {
                        util.hideLoading();
                        if (res.success) {
                          _this.setData({
                            imgUrl: data.data
                          });
                          app.globalData.user.headIcon = data.data;
                          wx.showToast({
                            title: '修改成功',
                          });
                        } else {
                          console.log(res.message);
                        }
                      });
                    }
                  }
                })
                
                // wx.request({
                //   url: constants.urlBase + `/v1/upload/image`,
                //   method: 'post',
                //   header: 'Content-Type: multipart/form-data',
                //   data: {
                //     file: tempFilePaths.toString(),
                //   },
                //   success(res) {
                //     console.log("res==", res);

                //   },
                //   fail: function () {

                //   }
                // })
              }
            })
            if (res.tapIndex == 2) {
              wx.getImageInfo({
                src: _this.data.imgUrl,
                success: function (res) {
                  console.log("get image info")
                  console.log(res)
                  wx.saveImageToPhotosAlbum({
                    filePath: res.path,
                    success(res) {
                      console.log("保存图片成功")
                      console.log(res)
                      wx.showToast({
                        title: '保存成功',
                        icon: 'success',
                        duration: 2000
                      })
                    },
                    fail(err) {
                      console.log('失败')
                      console.log(err)

                      if (err.errMsg == "saveImageToPhotosAlbum:fail cancel") {
                        wx.openSetting({
                          success(settingdata) {
                            console.log(settingdata)
                            if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                              console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                            } else {
                              console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                            }
                          }
                        })
                      }
                    }
                  })
                }
              })
            }
          }
        })

      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})