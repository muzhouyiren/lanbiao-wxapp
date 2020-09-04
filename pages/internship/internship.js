// pages/internship/internship.js
const util = require("../../utils/util.js");
const constants = require("../../utils/constants.js");
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    urlBase: constants.urlBase,
    posData: null,
    posList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData(options);
  },
  loadData: function (options) {
    util.httpGet("/api/postion/getPostion/" + options.id, {})
      .subscribe(res => {
        if (res.success) {
          res.data.createdTime = util.formatDate(new Date(res.data.createdTime));
          res.data.expiredTime = util.formatDate(new Date(res.data.expiredTime));

          this.setData({
            posData: res.data,
            posList: res.data.recommendedList
          });
          this.goTop();
        } else {
          console.log(res.message);
        }
      });
  },
  toInternShip: function (e) {
    const item = e.currentTarget.dataset.item;
    this.loadData({
      id: item.id
    });
  },
  goTop: function (e) {  // 一键回到顶部
    if (wx.pageScrollTo) {
      wx.pageScrollTo({
        scrollTop: 0
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
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
  onShareAppMessage: function (e) {
    console.log(e);
  }
})