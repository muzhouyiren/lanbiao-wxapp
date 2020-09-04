//app.js
import rxwx, {
  Rx
} from './utils/rx/RxWX.js';
const util = require("./utils/util.js");
const constants = require("./utils/constants.js");

App({
  globalData: {
    launchInfo: null,
    userInfo: null,
    user: null,
    isLogin: false,
    isAuthed: false,
    popupPagrUrl: null,
    cryptedKey: null,
    homePage: "/pages/index/index"
  },
  onLaunch: function (opts) {
    this.globalData.launchInfo = opts;
    this.getSetting();
  },
  /**
   * 授权
   */
  getSetting() {
    rxwx.getSetting()
      .catch((e) => console.log('getSetting错误', e))
      .subscribe(res => {
        console.log("获取授权信息", res)
        //先登陆， 再检测授权。 
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          rxwx.getUserInfo({
            lang: 'zh_CN'
          })
            .catch((e) => console.error('getUserInfo错误', e))
            .subscribe(res1 => {
              console.log("获取用户信息：", res1.userInfo);
              this.globalData.isAuthed = true;
              this.appLogin(res1.userInfo);
            })
        } else {
          this.globalData.isAuthed = false;
          //用户没有授权,去登录
          this.appLogin({});
        }
      })
  },
  /**
   * 登录
   */
  _loginAfter: new Rx.Subject(),
  appLogin(userInfo) {
    let _this = this;
    let opts = this.globalData.launchInfo;
    // 获取
    let lunchInfo = this.globalData.bridgeOptions || this.globalData.launchInfo; //启动参数
    console.log(lunchInfo, 'lunchInfo...', new Date().toLocaleString());
    // 微信登录
    wx.showLoading({
      title: '拼命登录中'
    });
    rxwx.login()
      .subscribe(res => {
        console.log(res, 'wx login')
        //自己后台登录
        let url = '/api/user/login?';
        let sendData = {
          code: res.code,
          fromUserId: lunchInfo.query.uid || "",
          shareId: lunchInfo.query.sid || "",
          fromScene: this.globalData.launchInfo.scene,
          fromUrl: encodeURIComponent(lunchInfo.path + "?" + util.objToQueryString(lunchInfo.query)),
          fromExtra: encodeURIComponent(JSON.stringify(lunchInfo)),
          ...lunchInfo.query
        }
        let urlData = util.objToQueryString(sendData);
        //登录🚀🚀
        util.httpPost(url + urlData, userInfo)
          .subscribe(resData => {
            wx.hideLoading();
            if (resData.success) {
              // 添加分享数量
              this.addShareCount(lunchInfo.scene, lunchInfo.query.sid, resData.data.isFirst);
              // 对象保存
              this.globalData.cryptedKey = resData.data.cryptedKey;
              this.globalData.user = resData.data;
              this.globalData.isLogin = true;
              this.globalData.isAuthed = resData.data.hadAuthed;
              //登陆完成， 执行回调。 
              this._loginAfter.next(this.globalData);
            } else {
              util.popError('登陆失败');
            }
          }, err => {
            wx.hideLoading();
            util.popError('登陆错误');
          }, () => {
            wx.hideLoading();
          })
      })
  },
  //获取登录信息，返回Observable<globalData>
  loginAfter() {
    //判断是否登录
    if (this.globalData.isLogin) {
      return Rx.Observable.of(this.globalData);
    } else {
      return this._loginAfter;
    }
  },
  /**
   * 检查需要授权
   */
  checkNeedAuth: function (pageParams = '') {
    // 进入的历史页面
    let pages = getCurrentPages();
    console.log("历史页面======", pages, pages[0].route);
    console.log("当前登录的用户======", this.globalData.user);
    if ((pages.length == 1 && pages[0].route != 'pages/center/center' && this.globalData.user.isFirst) || this.globalData.user.hadAuthed) {
      // 用户第一次进入小程序的页面，不需要授权，为了防止用户
      // 用户通过扫码第一次进入小程序的页面，无论页面需不需要用户授权，一律都不启动授权
      // 第一次进入个人中心也需要授权

      // 或者用户已经授权过用户信息，那么，也不会启动授权

    } else {
      // 跳转到授权页面
      let _this = this;
      wx.getSetting({
        success(res) {
          //判断是否授权基本信息
          let pageUrl = '/' + pages[pages.length - 1].route;
          if (!res.authSetting['scope.userInfo']) {
            //未授权，去授权              
            _this.globalData.popupPagrUrl = pageUrl + pageParams;
            wx.redirectTo({
              url: '/pages/login/login',
            });
            return;
          }
        }
      });
    }
  },
  addShareCount: function (scene, id, isFirst) {
    if (scene == '1047') {
      let sendData = {
        id: id,
        newUser: isFirst
      };
      util.httpPost('/api/share/change/share/user/count', sendData)
        .subscribe(res => {
          if (res.success) {
            console.log("增加分享数量成功");
          } else {
            console.log(res.message);
          }
        });
    }
  }
})