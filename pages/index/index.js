//index.js
const util = require("../../utils/util.js");
//获取应用实例
const app = getApp();

Page({
  data: {
    columnList: null,
    showModal: false,
    isScroll: true,
    messageList: [],
  },
  //事件处理函数
  toMyCourse: function () {
    wx.switchTab({
      url: '/pages/center/center',
    })
  },
  onLoad: function () {
    // 加载首页数据
    util.showLoading();
    util.httpGet('/api/home/getColumnList', {})
      .subscribe(res => {
        util.hideLoading();
        if (res.success) {
          this.setData({
            columnList: res.data
          });
        } else {
          console.log(res.message);
        }
      });
  },
  /**
   * 加载消息
   */
  loadMessage: function () {
    app.loginAfter().subscribe(globalData => {
      let sendData = {
        userId: app.globalData.user.id,
        status: 0,
      }
      util.httpGet('/station/message/query', sendData)
        .subscribe(res => {
          this.setData({
            messageList: res.data.list,
            showModal: res.data.total > 0,
            isScroll: res.data.total == 0
          });
        });
    });
  },
  onShow: function () {
    this.loadMessage();
  }
})