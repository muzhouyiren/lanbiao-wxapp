// pages/center/center.js
// import Canvas from '../../utils/canvas.js'
const util = require("../../utils/util.js");
const constants = require("../../utils/constants.js");

//获取应用实例
const app = getApp()

Page({
  // ...Canvas.options,
  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    courseId: null,
    urlBase: constants.urlBase,
    user: app.globalData.user,
    payLevel: null,
    myCourseList: [],
    dataDetails: [{
      videoBg: "../../images/courses-banner.jpg",
      type: "必修课",
      title: "40天成就营销新⼈王—移动营销产品大数据分析",
      audition: "999",
      praise: "999",
      des: '课程简介课程简介课程简介课程简介课程简介课程简介课程简介课程简介课程简介课程简介程简介课程简介程简介课程简介',
      menuList: [{
        num: "第一章 ",
        catalogName: "移动大数据产品营销分析",
        open: true,
        secondMenu: [{
          title: "第一节 发展概况"
        }, {
          title: "第二节 应用领域"
        }, {
          title: "第三节 市场意义"
        }, {
          title: "第四节 解决方案"
        }]
      }, {
        num: "第二章 ",
        catalogName: "移动端营销大全",
      }, {
        num: "第三章 ",
        catalogName: "大数据技术的战略意义",
      }, {
        num: "第四章 ",
        catalogName: "想要系统的认知大数据，必须要全面而细致的分解它",
      }, {
        num: "第五章 ",
        catalogName: "实践是大数据的最终价值体现",
      }]
    }, {
      videoBg: "../../images/courses-banner.jpg",
      type: "必修课",
      title: "移动营销产品大数据分析",
      audition: "999",
      praise: "999",
      des: '课程简介课程简介课程简介课程简介课程简介课程简介课程简介课程简介课程简介课程简介程简介课程简介程简介课程简介',
      menuList: [{
        num: "第一章 ",
        catalogName: "移动大数据产品营销分析",
        open: true,
        secondMenu: [{
          title: "第一节 发展概况"
        }, {
          title: "第二节 应用领域"
        }, {
          title: "第三节 市场意义"
        }, {
          title: "第四节 解决方案"
        }]
      }, {
        num: "第二章 ",
        catalogName: "移动端营销大全",
      }, {
        num: "第三章 ",
        catalogName: "大数据技术的战略意义",
      }, {
        num: "第四章 ",
        catalogName: "想要系统的认知大数据，必须要全面而细致的分解它",
      }, {
        num: "第五章 ",
        catalogName: "实践是大数据的最终价值体现",
      }]
    }],
    shareConfig: {},
    showModal: false,
    isScroll: true,
    newMessageCount: 0,
    messageList: [],
  },
  goPersonalData: function () {
    wx.navigateTo({
      url: '/pages/personalData/personalData',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.loadData();
  },
  
  /**
   * 加载数据
   */
  loadData: function () {
    let _this = this;
    app.loginAfter().subscribe(globalData => {
      if (globalData.isAuthed === false) {
        // 判断是否授权，如果没有授权，则启动授权页面，让用户授权
        app.checkNeedAuth();
      } else {
        wx.showLoading({
          title: '加载中',
        })
        let url = "/api/user/getMyCourseList?userId=" + app.globalData.user.id;
        util.httpGet(url, {})
          .subscribe(res => {
            wx.hideLoading({
              complete: (res) => { },
            })
            if (res.success) {
              for (const item of res.data.myCourseList) {
                item.shareConfig = {
                  mainImg: item.myCourse.sharePoster,
                  userId: app.globalData.user.id,
                  path: 'pages/courses/courses?id=' + item.myCourse.id + '&uid=' + app.globalData.user.id,
                };
                for (const iterator of item.myCourse.chapterList) {
                  iterator.courseId = item.myCourse.id;
                  iterator.number = '第' + util.toChinesNum(iterator.number) + '章';
                }
              }
              // 设置用户分享数据
              _this.setData({
                user: app.globalData.user,
                myCourseList: res.data.myCourseList,
                payLevel: res.data.payLevel,
                shareConfig: {
                  userId: app.globalData.user.id,
                  mainImg: 'https://lsgboss.chuangzhikeji.com/images/user_share_poster.jpg',
                  path: 'pages/index/index?uid=' + app.globalData.user.id,
                }
              });
            } else {
              _this.setData({
                user: app.globalData.user,
              });
              console.log(res.message);
            }
          }, err => {
            util.popError('获取信息错误');
          }, () => {
            wx.hideLoading();
            this.ifLoad = false;
            wx.stopPullDownRefresh();
          });
      }
    });
  },
  /**
   * 打开消息面板
   */
  openMsg: function () {
    // 加载所有消息
    this.loadMessage(-1);

    // 显示窗口
    this.setData({
      showModal: true,
      isScroll: false
    });
  },
  getIsScroll:function(e){
    
  },
  /**
   * 继续学习按钮
   */
  continueLearn: function (e) {
    // 通过用户ID和课程ID查询用户已学过的课程，获取最近的一次学习记录，并跳转到学习页
    const myCourse = e.currentTarget.dataset.mycourse;
    const courseId = myCourse.courseId;
    let lessonId = 0;
    if (myCourse.lastLearn == null) {
      // 用户购买课程后还没有学习，那么继续学习直接播放课程的第一小节
      for (const item of myCourse.myCourse.chapterList) {
        for (const lesson of item.lessonList) {
          lessonId = lesson.id;
          break;
        }
        break;
      }
    } else {
      // 用户已经开始学习了课程，并且这是最近一次学习的记录
      lessonId = myCourse.lastLearn.lessonId;
    }
    wx.navigateTo({
      url: '/pages/myCourse/myCourse?id=' + lessonId + '&courseId=' + courseId,
    })
  },
  /**
   * 点击课程目录，跳转听课页面
   */
  toPlay: function (e) {
    const chapter = e.currentTarget.dataset.chapter;
    // 跳转至当前章节的第一节播放
    if (chapter.lessonList.length > 0) {
      const lesson = chapter.lessonList[0];
      wx.navigateTo({
        url: '/pages/myCourse/myCourse?id=' + lesson.id + '&courseId=' + chapter.courseId,
      });
    } else {
      wx.showToast({
        title: '章节没有小节',
        icon: 'none'
      })
    }
  },
  /**
   * 查看课程所有目录
   */
  viewAll: function (e) {
    // 我的课程，查看所有课程目录，直接跳转到课程详情页面
    const myCourse = e.currentTarget.dataset.mycourse;
    wx.navigateTo({
      url: '/pages/courses/courses?id=' + myCourse.courseId,
    })
  },
  /**
   * 加载消息
   */
  loadMessage: function (status) {
    app.loginAfter().subscribe(globalData => {
      let sendData = {
        userId: app.globalData.user.id,
        status: status,
      }
      util.httpGet('/station/message/query', sendData)
        .subscribe(res => {
          if (status == 0) {
            this.setData({
              newMessageCount: res.data.list.length
            });
          }
          this.setData({
            messageList: res.data.list
          });
        });
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
    // 首先加载未读消息
    this.loadMessage(0);
    this.loadData();
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
    if (!this.ifLoad) {
      this.ifLoad = true;
      this.loadData();
    }
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