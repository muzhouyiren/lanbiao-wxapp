// pages/myCourse/myCourse.js
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
    user: app.globalData.user,
    lesson: {},// 小节
    videoProgress: 0,// 视频进度
    videoDuration: 0, // 视频播放时长
    likeCount: 0,// 点赞数量
    auditionCount: 0,// 试听数量
    palyEnd: false,// 播放完毕
    commitTask: false,// 进入小节视频，默认是没有提交作业，如果视频已经观看过且提交过作业，那么提交作业置为true
    motto: '蓝标大学',
    aniInterval: null,// 动画的计时器
  },
  bindTextareaSubmit: function (e) {// 提交作业
    if (!this.data.palyEnd) {
      wx.showToast({
        title: '视频未播放完毕',
        icon: 'none'
      });
      return;
    }
    if (e.detail.value.textarea == null || e.detail.value.textarea == '') {
      wx.showToast({
        title: '请输入答案',
        icon: 'none'
      });
      return;
    }
    let _this = this;
    let url = "/api/course/commitTask";
    util.showLoading();
    util.httpPost(url, {
      taskId: _this.data.lesson.task.id,// 作业ID
      userId: app.globalData.user.id,
      answer: e.detail.value.textarea
    }).subscribe(res => {
      util.hideLoading();
      if (res.success) {
        wx.showToast({
          title: '提交作业成功',
          duration: 3000,
        });
        // 重新加载数据
        _this.loadData({
          id: _this.data.lesson.id,
          courseId: _this.data.lesson.course.id,
        });
      } else {
        console.log(res.message);
      }
    });
  },
  sendQuestion: function (e) {// 发送问题
    if (e.detail.value.question == null || e.detail.value.question == '') {
      wx.showToast({
        title: '请输入问题',
        icon: 'none'
      });
      return;
    }
    let _this = this;
    let url = "/api/course/commitQuestion";
    util.httpPost(url, {
      question: e.detail.value.question,
      userId: app.globalData.user.id,
      courseId: _this.data.lesson.course.id,
      chapterId: _this.data.lesson.chapterId,
      lessonId: _this.data.lesson.id,
    }).subscribe(res => {
      if (res.success) {
        wx.showToast({
          title: '发送成功'
        })
      } else {
        console.log(res.message);
      }
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      motto: app.globalData.user.nickName + ':' + app.globalData.user.mobile
    });
    this.loadData(options);
  },
  loadData: function (opts) {
    let _this = this;
    // 首先清空下数据
    this.setData({
      urlBase: constants.urlBase,
      user: app.globalData.user,
      lesson: {},// 小节
      videoProgress: 0,// 视频进度
      videoDuration: 0, // 视频播放时长
      likeCount: 0,// 点赞数量
      auditionCount: 0,// 试听数量
      palyEnd: false,// 播放完毕
      commitTask: false,// 进入小节视频，默认是没有提交作业，如果视频已经观看过且提交过作业，那么提交作业置为true
    });
    app.loginAfter().subscribe(globalData => {
      if (globalData.isAuthed === false) {
        // 判断是否授权，如果没有授权，则启动授权页面，让用户授权
        let pageParams = '?id=' + opts.id + '&courseId=' + opts.courseId;
        app.checkNeedAuth(pageParams);
      } else {
        let url = "/api/course/getLesson/" + opts.id + '?userId=' + app.globalData.user.id + '&courseId=' + opts.courseId;
        util.showLoading();
        util.httpGet(url, {}).subscribe(res => {
          util.hideLoading();
          if (res.success) {
            if (res.data.taskCorrect != null) {
              // 用户已经在本小节提交过作业
              _this.setData({
                commitTask: true
              });
            }
            _this.setData({
              lesson: res.data,
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
    let url = "/api/course/audition/" + this.data.lesson.course.id;
    util.httpPost(url, {}).subscribe(res => {
      let count = _this.data.auditionCount + 1;
      _this.setData({
        auditionCount: count
      });
    });
  },
  /**
   * 视频播放结束时触发
   */
  playFinished: function (e) {
    // 播放完毕设置true
    this.setData({
      palyEnd: true
    });
    let url = "/api/course/playFinished/" + this.data.lesson.id + '?userId=' + app.globalData.user.id + '&courseId=' + this.data.lesson.course.id;
    util.httpPost(url, {}).subscribe(res => { });
  },
  /**
   * 视频播放时触发，每隔250ms触发一次
   */
  playProgress: function (e) {
    this.setData({
      videoProgress: e.detail.currentTime,
      videoDuration: e.detail.duration,
    });
  },
  addLike: function () {
    let _this = this;
    let url = "/api/course/like/" + this.data.lesson.course.id;
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
   * 上一节
   */
  toPrev: function () {
    if (this.data.lesson.preLessonId > 0) {
      this.loadData({
        id: this.data.lesson.preLessonId,
        courseId: this.data.lesson.course.id,
      });
    } else {
      wx.showToast({
        title: '已经是第一节',
      });
    }
  },
  /**
   * 下一节
   */
  toNext: function () {
    if (this.data.lesson.nextLessonId > 0) {
      if (!this.data.commitTask) {
        wx.showToast({
          title: '请先提交作业',
          icon: 'none'
        });
        return;
      }
      if(this.data.lesson.taskCorrect.level == 0){
        wx.showToast({
          title: '作业未完成批改',
          icon: 'none'
        });
        return;
      }
      // 跳转到下一小节
      this.loadData({
        id: this.data.lesson.nextLessonId,
        courseId: this.data.lesson.course.id,
      });
    } else {
      // 提示已经是最后一小节
      wx.showToast({
        title: '已经是最后一节',
      })
    }
  },
  toTask: function(e){
    console.log(e);
    // wx.navigateTo({
    //   url: '/pages/task/task?url=' + e.currentTarget.dataset.url,
    // })
    wx.navigateToMiniProgram({
      appId:'wxd947200f82267e58',
      path:e.currentTarget.dataset.url,
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    // 页面渲染完成
    // 实例化一个动画
    var that = this;
    var i = 0;
    var animation = wx.createAnimation({
      duration: 5000, // 默认为400   动画持续时间，单位ms
      timingFunction: 'linear',
    });
    //动画的脚本定义必须每次都重新生成，不能放在循环外
    animation.translate(100, 50).step().translate(-100, 100).step();

    // 更新数据
    that.setData({
      // 导出动画示例
      ani: animation.export(),
    })
    var aniInterval = setInterval(function () {
      //动画的脚本定义必须每次都重新生成，不能放在循环外
      animation.translate(100, 50).step().translate(-100, 100).step().translate(-50, -50).step();
      // 更新数据
      that.setData({
        // 导出动画示例
        ani: animation.export()
      })
      ++i;
      console.log(i);
    }.bind(that), 5000);
    this.setData({
      aniInterval: aniInterval
    });
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
    if (this.data.aniInterval) {
      clearInterval(this.data.aniInterval);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.data.aniInterval) {
      clearInterval(this.data.aniInterval);
    }
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