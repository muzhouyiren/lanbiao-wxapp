// pages/higherUps/higherUps.js
const util = require("../../utils/util.js");
const constants = require("../../utils/constants.js");
//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    higherUps: null,
    isPlay: false,
    pass_time: '',
    total_time: '',
    motto: '蓝标大学',
    aniInterval: null,// 动画的计时器
  },
  toHigherUps: function (e) {
    const id = e.currentTarget.dataset.id;
    this.loadData(id);
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      motto: app.globalData.user.nickName + ':' + app.globalData.user.mobile
    });
    this.loadData(options.id);
  },
  loadData: function (id) {
    let _this = this;
    util.showLoading();
    util.httpGet("/api/bigShotSay/getBigShotSay/" + id, {}).subscribe(res => {
      util.hideLoading();
      if (res.success) {
        if (res.data.audioUrl !== null && res.data.audioUrl !== '') {
          _this.innerAudioContext = wx.createInnerAudioContext();
          // _this.innerAudioContext.autoplay = true;
          _this.innerAudioContext.src = _this.data.urlBase + res.data.audioUrl;
          _this.innerAudioContext.onPlay(() => {
            console.log('开始播放')
          });
          _this.innerAudioContext.onPause(() => {
            console.log('暂停播放')
          });
          _this.innerAudioContext.onEnded(() => {
            console.log("播放结束");
            _this.setData({
              isPlay: false
            });
          });
          _this.innerAudioContext.onTimeUpdate((res) => {
            _this.setData({
              pass_time: _this.secondTransferTime(_this.innerAudioContext.currentTime),
              total_time: _this.secondTransferTime(_this.innerAudioContext.duration)
            });
          });
          _this.innerAudioContext.onError((res) => {
            console.log(res.errMsg)
            console.log(res.errCode)
          })
        }
        this.setData({
          higherUps: res.data
        });
        this.goTop();
      } else {
        console.log(res.message);
      }
    });
  },
  /**
   * 秒转时间
   */
  secondTransferTime: function (time) {
    if (time > 3600) {
      return [
        parseInt(time / 60 / 60),
        parseInt(time / 60 % 60),
        parseInt(time % 60)
      ]
        .join(":")
        .replace(/\b(\d)\b/g, "0$1");
    } else {
      return [
        parseInt(time / 60 % 60),
        parseInt(time % 60)
      ]
        .join(":")
        .replace(/\b(\d)\b/g, "0$1");
    }
  },
  /**
   * 控制播放按钮
   */
  bindIsPlay: function () {
    if (this.data.isPlay) {
      this.innerAudioContext.pause();
      this.setData({
        isPlay: false
      });
    } else {
      this.innerAudioContext.play();
      this.setData({
        isPlay: true
      });
    }
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
    setInterval(function () {
      //动画的脚本定义必须每次都重新生成，不能放在循环外
      animation.translate(100, 50).step().translate(-100, 100).step().translate(-50, -50).step();
      // 更新数据
      that.setData({
        // 导出动画示例
        ani: animation.export(),
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
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }
    if (this.data.aniInterval) {
      clearInterval(this.data.aniInterval);
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    if (this.innerAudioContext) {
      this.innerAudioContext.stop();
    }
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