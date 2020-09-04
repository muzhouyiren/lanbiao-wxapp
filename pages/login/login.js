// pages/login/login.js
const util = require("../../utils/util.js");
const constants = require("../../utils/constants.js");

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  getUserInfo: function (e) {
    console.log(e);
    if (e.detail.errMsg !== 'getUserInfo:ok') {
      //授权未成功;
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      })
      return;
    }

    //授权成功;
    let userInfo = e.detail.userInfo;
    wx.showLoading();
    var url = "/api/user/setUserInfo/" + app.globalData.user.id;
    util.httpPost(url, userInfo)
      .subscribe(res => {
        if (res.success === true) {
          this.returnRouter();

          app.globalData.user = res.data;
          app.globalData.isAuthed = true;

          wx.showToast({
            title: '授权成功',
            icon: 'none'
          });
        }else{
          wx.showToast({
            title: '授权失败',
            icon: 'none'
          });
        }
      }, err => {
        console.error(err)
      }, () => {
        wx.hideLoading();
      })
  },
  //返回上页
  returnRouter() {
    let switchArr = ['/pages/center/center', '/pages/index/index'];
    if (app.globalData.popupPagrUrl) {
      let url = app.globalData.popupPagrUrl.split('?')[0];
      if (switchArr.indexOf(url) === -1) {
        wx.redirectTo({
          url: app.globalData.popupPagrUrl
        });
      } else {
        wx.switchTab({
          url: app.globalData.popupPagrUrl
        });
      }
    } else {
      wx.switchTab({
        url: app.globalData.homePage,
      });
    }
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