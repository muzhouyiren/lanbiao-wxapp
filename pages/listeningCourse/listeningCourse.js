// pages/listeningCourse/listeningCourse.js
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
    videoProgress: 0,
    videoDuration: 0,
    likeCount: 0,
    auditionCount: 0,
    lesson: null,
    dataDetails: {
      type: "必修课",
      title: "40天成就营销新⼈王",
      audition: "999",
      praise: "999",
      des: '课程简介课程简介课程简介课程简介课程简介课程简介课程简介课程简介课程简介课程简介程简介课程简介程简介课程简介',
      hasPre: false,
      hasNext: false
    }
  },
  toOrder: function () {
    console.log("立即购买");
    // 跳转到购买页面

  },
  toPrev: function () {
    if (this.data.lesson.preLessonId > 0) {
      this.loadData({
        id: this.data.lesson.preLessonId,
        courseId: this.data.dataDetails.id,
      });
    } else {
      wx.showToast({
        title: '已经是第一节',
      });
    }
  },
  toNext: function () {
    if (this.data.lesson.nextLessonId > 0) {
      // 跳转到下一小节
      this.loadData({
        id: this.data.lesson.nextLessonId,
        courseId: this.data.dataDetails.id,
      });
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
    this.loadData(options);
  },
  loadData: function (opts) {
    let _this = this;
    this.setData({
      urlBase: constants.urlBase,
      videoProgress: 0,
      videoDuration: 0,
      likeCount: 0,
      auditionCount: 0,
      lesson: {},
      dataDetails: {}
    });
    app.loginAfter().subscribe(globalData => {
      if (globalData.isAuthed === false) {
        // 判断是否授权，如果没有授权，则启动授权页面，让用户授权
        let pageParams = '?id=' + opts.id + '&courseId=' + opts.courseId;
        app.checkNeedAuth(pageParams);
      } else {
        let url = "/api/course/getFreeLesson/" + opts.id + '?courseId=' + opts.courseId;
        util.showLoading();
        util.httpGet(url, {}).subscribe(res => {
          util.hideLoading();
          if (res.success) {
            console.log(res.data)
            _this.setData({
              lesson: res.data,
              dataDetails: res.data.course,
              likeCount: res.data.course.likeCount,
              auditionCount: res.data.course.auditionCount,
            });
          } else {
            console.log(res.message);
          }
        });
      }
    });
  },
  /**
   * 点击播放视频触发
   */
  play: function (e) {
    let _this = this;
    let url = "/api/course/audition/" + this.data.dataDetails.id;
    util.httpPost(url, {}).subscribe(res => {
      let count = _this.data.auditionCount + 1;
      _this.setData({
        auditionCount: count
      });
    });
  },
  /**
   * 视频播放结束触发
   */
  playFinished: function (e) {
    let url = "/api/course/playFinished/" + this.data.lesson.id + '?userId=' + app.globalData.user.id + '&courseId=' + this.data.dataDetails.id;
    util.httpPost(url, {}).subscribe(res => { });
  },
  /**
   * 视频播放时触发，我们可以每隔多长时间记录一次播放时长（如有需要可以实现）
   */
  playProgress: function (e) {
    this.setData({
      videoProgress: e.detail.currentTime,
      videoDuration: e.detail.duration,
    });
  },
  /**
   * 点赞
   */
  addLike: function () {
    let _this = this;
    let url = "/api/course/like/" + this.data.dataDetails.id;
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