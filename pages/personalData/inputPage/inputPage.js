// pages/personalData/inputPage/inputPage.js

const util = require("../../../utils/util.js");
const constants = require("../../../utils/constants.js");

//获取应用实例
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    key: null,
    disabled: true,
    isfocus: true,
    nickName: '',
    nickNameShow: false,
    mobile: '',
    mobileShow: false,
    professional: '',
    professionalShow: false,
    sendText: '发送验证码',
    waitTime: 60,
  },
  /**
   * 发送短信验证码
   */
  sendCode: function () {
    let _this = this;
    if (_this.data.waitTime < 60) {
      return;
    }
    console.log("手机号码===", _this.data.mobile);
    if (_this.data.mobile == null || _this.data.mobile == '') {
      wx.showToast({
        title: '请输入手机号码',
        icon: 'none',
      })
      return;
    }
    util.showLoading("正在发送");
    let url = "/api/sms/send?mobile=" + _this.data.mobile;
    util.httpPost(url, {}).subscribe(res => {
      util.hideLoading();
      if (res.success) {
        let s = setInterval(() => {
          _this.setData({
            sendText: _this.data.waitTime-- + "s"
          });
          if (_this.data.waitTime === 0) {
            clearInterval(s);
            _this.setData({
              waitTime: 60,
              sendText: '重新发送',
            });
          }
        }, 1000);
      } else {
        wx.showToast({
          title: res.message,
          icon: 'none'
        })
      }
    });
  },
  /**
   * 获取输入内容
   */
  getInput: function (e) {
    let _this = this;
    var _value = e.detail.value;
    if (_this.trim(_value)) {
      _this.setData({
        disabled: false
      });
    } else {
      _this.setData({
        disabled: true
      });
    }
    if (_this.data.mobileShow && e.target.id === 'mobile') {
      _this.setData({
        mobile: e.detail.value
      });
    }
  },
  deleteBtn: function () {
    let _this = this;
    _this.setData({
      isfocus: false,
      disabled: true
    }, () => {
      _this.setData({
        nickName: ''
      })
    })
  },
  trim: function (s) {
    return s.replace(/(^\s*)|(\s*$)/g, "");
  },
  showToast: function (event) {

    /* console.log(phone);
     var phone = event.currentTarget.dataset.phone;
     var pages = getCurrentPages();
     var currPage = pages[pages.length - 1];  //当前页面
     var prevPage = pages[pages.length - 2]; //上一个页面
     //直接调用上一个页面的setData()方法，把数据存到上一个页面中去
     prevPage.setData({
       "phone": phone
     });*/

    wx.navigateBack({
    });
    wx.showToast({
      title: "提交成功",
      duration: 1000,
      icon: "success"
    })
  },
  setNavBarTitle: function (title) {
    wx.setNavigationBarTitle({
      title: title
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("options==", options)
    let name = options.page;
    let _name = name + 'Show';
    if (name == "nickName") {
      this.setNavBarTitle('昵称')
      if (options.value) {
        this.setData({
          nickName: decodeURIComponent(options.value)
        })
      }
    } else if (name == "mobile") {
      this.setNavBarTitle('手机号')
      if (options.value){
        this.setData({
          mobile: decodeURIComponent(options.value)
        })
      }
    } else if (name == "professional") {
      this.setNavBarTitle('专业')
      if (options.value) {
        this.setData({
          professional: decodeURIComponent(options.value)
        })
      }
    }
    this.setData({
      [_name]: true
    })
  },
  formSubmit: function (e) {
    if (this.data.nickNameShow) {
      util.showLoading("正在提交");
      let url = "/api/user/updateNickName/" + app.globalData.user.id + '?nickName=' + encodeURIComponent(e.detail.value.nickName);
      util.httpPost(url, {}).subscribe(res => {
        util.hideLoading();
        if (res.success) {
          console.log(res.data);
          app.globalData.user = res.data;
          wx.navigateBack({
            delta:1
          })({
            url: app.globalData.popupPagrUrl,
          });
          // wx.n({
          //   url: app.globalData.popupPagrUrl,
          // });
        } else {
          console.log(res.message);
        }
      });
    }
    if (this.data.mobileShow) {
      util.showLoading("正在提交");
      let url = "/api/user/updateMobile/" + app.globalData.user.id + '?mobile=' + e.detail.value.mobile + '&code=' + e.detail.value.msgcode;
      util.httpPost(url, {}).subscribe(res => {
        util.hideLoading();
        if (res.success) {
          app.globalData.user = res.data;
          wx.navigateBack({
            delta: 1
          });
          // wx.redirectTo({
          //   url: app.globalData.popupPagrUrl,
          // });
        } else {
          wx.showToast({
            title: res.message,
            icon: 'none'
          })
          console.log(res.message);
        }
      });
    }
    if (this.data.professionalShow) {
      util.showLoading("正在提交");
      let url = "/api/user/updateMajor/" + app.globalData.user.id + '?major=' + e.detail.value.professional;
      util.httpPost(url, {}).subscribe(res => {
        util.hideLoading();
        if (res.success) {
          wx.navigateBack({
            delta: 1
          });
          // wx.redirectTo({
          //   url: app.globalData.popupPagrUrl,
          // });
        } else {
          console.log(res.message);
        }
      });
    }
  },
  getTelNumber: function (e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      //授权未成功
      wx.showToast({
        title: '授权失败',
        icon: 'none'
      })
      return;
    }
    //授权成功
    let sendData = {
      iv: e.detail.iv,
      encryptedData: e.detail.encryptedData,
      cryptedKey: app.globalData.cryptedKey
    };
    util.httpPost('/api/user/getMobile', sendData)
      .subscribe(res => {
        if (res.success) {
          if (res.data != null) {
            var obj = res.data;
            app.globalData.user.mobile = obj.purePhoneNumber;
            this.setData({
              mobile: obj.purePhoneNumber
            });
            this.sendCode();
          } else {
            wx.showToast({
              title: '获取微信绑定手机号失败，请重试',
              icon: 'none'
            })
          }
        }
      }, err => {
        console.error(err);
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