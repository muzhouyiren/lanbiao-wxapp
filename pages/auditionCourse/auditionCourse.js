// pages/auditionCourse.js
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
    likeCount: 0,
    auditionCount: 0,
    course: null,
  },
  toPrev: function () {
    if (this.data.course.preCourseId > 0) {
      this.loadData(this.data.course.preCourseId);
    } else {
      wx.showToast({
        title: '已经是第一节',
      });
    }
  },
  toNext: function () {
    if (this.data.course.nextCourseId > 0) {
      // 跳转到下一小节
      this.loadData(this.data.course.nextCourseId);
    } else {
      // 提示已经是最后一小节
      wx.showToast({
        title: '已经是最后一节',
      })
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData(options.id);
  },
  /**
   * 加载数据
   */
  loadData: function (id) {
    let _this = this;
    util.showLoading();
    util.httpGet("/api/lecturer/getCourse/" + id, {})
      .subscribe(res => {
        util.hideLoading();
        if (res.success) {
          console.log(res.data);
          if (res.data.image !== null && res.data.image !== '') {
            res.data.image = _this.data.urlBase + res.data.image;
          } else {
            res.data.image = '';
          }
          _this.setData({
            course: res.data,
            likeCount: res.data.likeCount == null ? 0 : res.data.likeCount,
            auditionCount: res.data.auditionCount == null ? 0 : res.data.auditionCount,
          });
        } else {
          console.log(res.message);
        }
      });
  },
  play: function () {
    let _this = this;
    let url = "/api/lecturer/audition/" + this.data.course.id;
    util.httpPost(url, {}).subscribe(res => {
      let count = _this.data.auditionCount + 1;
      _this.setData({
        auditionCount: count
      });
    });
  },
  addLike: function () {
    let _this = this;
    let url = "/api/lecturer/like/" + this.data.course.id;
    util.httpPost(url, {}).subscribe(res => {
      if (res.success) {
        let count = _this.data.likeCount += 1;
        _this.setData({
          likeCount: count
        });
        wx.showToast({
          title: '点赞成功',
        })
      }
    });
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