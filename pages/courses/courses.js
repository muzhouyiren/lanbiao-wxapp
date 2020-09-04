// pages/courses/courses.js
const util = require("../../utils/util.js");
const constants = require("../../utils/constants.js");

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    hasAuth: false,
    likeCount: 0,
    auditionCount: 0,
    dataDetails: {
      type: "必修课",
      title: "40天成就营销新⼈王",
      audition: "999",
      praise: "999",
      priceName: "购买特训组合",
      boutiquePriceName: "购买精选组合",
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
      }, {
        num: "第六章 ",
        catalogName: "移动大数据产品营销分析",
      }, {
        num: "第七章 ",
        catalogName: "移动端营销大全",
      }, {
        num: "第八章 ",
        catalogName: "大数据技术的战略意义",
      }, {
        num: "第九章 ",
        catalogName: "想要系统的认知大数据，必须要全面而细致的分解它",
      }, {
        num: "第十章 ",
        catalogName: "实践是大数据的最终价值体现",
      }, {
        num: "第十一章 ",
        catalogName: "大数据技术的战略意义",
      }, {
        num: "第十二章 ",
        catalogName: "想要系统的认知大数据，必须要全面而细致的分解它",
      }, {
        num: "第十三章 ",
        catalogName: "实践是大数据的最终价值体现",
      }]
    },
    modalShow: false,
    modal299: false,
    modal2999: false
  },
  //打开购买特训组合弹窗
  to2999layer: function(){
    this.setData({
      modalShow: true,
      modal2999: true,
    });
  },
  //打开购买特训组合弹窗
  to299layer: function () {
    this.setData({
      modalShow: true,
      modal299: true,
    });
  },
  //关闭弹窗
  closeModal: function(){
    this.setData({
      modalShow: false,
      modal2999: false,
      modal299: false,
    });
  },
  addLike: function () {
    let _this = this;
    let url = "/api/course/like/" + this.data.dataDetails.id;
    util.httpPost(url, {}).subscribe(res => {
      if (res.success) {
        let count = _this.data.likeCount + 1;
        _this.setData({
          likeCount: count
        });
        wx.showToast({
          title: '点赞成功',
        })
      }
    });
  },
  toOrder: function (e) {
    let _this = this;
    let course = this.data.dataDetails;
    let pages = getCurrentPages();
    app.loginAfter().subscribe(globalData => {
      if (globalData.isAuthed === false) {
        // 判断是否授权，如果没有授权，则启动授权页面，让用户授权
        let pageParams = '?id=' + course.id;
        app.checkNeedAuth(pageParams);
      } else {
        if (globalData.user.mobile === null || globalData.user.mobile === '') {
          // 用户没有绑定手机号，那么跳转到绑定手机号页面,申请微信绑定的手机号
          wx.showModal({
            title: '提示',
            content: '购买课程需绑定手机号，确定绑定吗？',
            success(res) {
              if (res.confirm) {
                let pageUrl = '/' + pages[pages.length - 1].route;
                app.globalData.popupPagrUrl = pageUrl + '?id=' + course.id;
                wx.redirectTo({
                  url: '/pages/personalData/inputPage/inputPage?page=mobile',
                });
              } else if (res.cancel) {
                wx.showToast({
                  title: '绑定手机号失败',
                  icon: 'none'
                })
              }
            }
          });
        } else {
          // 跳转到支付页面
          let url = "/api/order/pay?userId=" + app.globalData.user.id + '&courseId=' + course.id + "&courseType=" + e.currentTarget.dataset.coursetype;
          util.httpPost(url, {}).subscribe(res => {
            if (res.success) {
              // 小程序发起支付请求
              wx.requestPayment({
                appId: res.data.appId,
                nonceStr: res.data.nonceStr,
                package: res.data.package,
                paySign: res.data.paySign,
                timeStamp: res.data.timeStamp,
                signType: res.data.signType,
                success: function (res) {
                  // 支付成功，通知后台支付成功
                  if (res.errMsg === 'requestPayment:ok') {
                    _this.loadData({
                      id: course.id
                    });
                  }
                },
                fail: function (res) {
                  if (res.errMsg === 'requestPayment:fail cancel') {

                  }
                },
                complete: function (res) {
                  console.log(res);
                }
              })
            } else {
              wx.showToast({
                title: '购买失败',
                icon: 'none'
              })
            }
          });
        }
      }
    });
  },
  toPlay: function (e) {
    const lesson = e.currentTarget.dataset.lesson;
    if (lesson.free === true) {
      // 小节免费，可以跳转到试看页面，观看视频
      wx.navigateTo({
        url: '/pages/listeningCourse/listeningCourse?id=' + lesson.id + '&courseId=' + this.data.dataDetails.id,
      });
    } else {
      // 小节付费，可以跳转到正式播放页面，观看视频
      // 检查当前用户是否购买了该课程
      let _this = this;
      let url = "/api/course/getCourseAuth/" + this.data.dataDetails.id + '?userId=' + app.globalData.user.id;
      util.httpPost(url, {}).subscribe(res => {
        console.log(res.data);
        if (res.data) {
          wx.navigateTo({
            url: '/pages/myCourse/myCourse?id=' + lesson.id + '&courseId=' + _this.data.dataDetails.id,
          });
        } else {
          wx.showToast({
            title: '请购买课程',
            icon: 'none'
          })
        }
      });
    }
  },
  /**
   * 继续学习按钮
   */
  continueLearn: function (e) {
    // 通过用户ID和课程ID查询用户已学过的课程，获取最近的一次学习记录，并跳转到学习页
    const myCourse = e.currentTarget.dataset.mycourse;
    const courseId = myCourse.id;
    let lessonId = 0;
    let url = "/api/user/getMyCourseLastLearn?userId=" + app.globalData.user.id + "&courseId=" + courseId;
    util.httpGet(url, {}).subscribe(res => {
      util.hideLoading();
      if (res.success) {
        if(res.data.lastLearn){
          // 用户已经开始学习了课程，并且这是最近一次学习的记录
          lessonId = res.data.lastLearn.lessonId;
        }else{
          // 用户购买课程后还没有学习，那么继续学习直接播放课程的第一小节
          for (const item of myCourse.myCourse.chapterList) {
            for (const lesson of item.lessonList) {
              lessonId = lesson.id;
              break;
            }
            break;
          }
        }
        wx.navigateTo({
          url: '/pages/myCourse/myCourse?id=' + lessonId + '&courseId=' + courseId,
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
    this.loadData(options);
  },
  loadData: function (opts) {
    let _this = this;
    app.loginAfter().subscribe(globalData => {
      util.showLoading();
      let url = "/api/course/getCourse/" + opts.id + '?userId=' + globalData.user.id;
      util.httpGet(url, {}).subscribe(res => {
        util.hideLoading();
        if (res.success) {
          for (const item of res.data.course.chapterList) {
            item.number = '第' + util.toChinesNum(item.number) + '章';
            let num = 1;
            for (const lesson of item.lessonList) {
              lesson.title = '第' + util.toChinesNum(num++) + '节 ' + lesson.title;
            }
          }
          _this.setData({
            dataDetails: res.data.course,
            likeCount: res.data.course.likeCount,
            auditionCount: res.data.course.auditionCount,
            hasAuth: res.data.hasAuth,
            shareConfig: {
              mainImg: res.data.course.sharePoster,
              userId: app.globalData.user.id,
              path: 'pages/courses/courses?id=' + res.data.course.id + '&uid=' + app.globalData.user.id,
            }
          });
        } else {
          console.log(res.message);
        }
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