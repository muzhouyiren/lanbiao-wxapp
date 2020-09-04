// components/share/share.js
/**
 * config{
 *  mainImg:大图
 *  title:标题
 *  userIcon:用户头像
 *  userNmae:用户姓名
 *  des:详情
 *  qrCode：二维码
 * path:分享地址 （没二维码时，会根据地址去获取二维码）
 * }
 */

var constants = require("../../utils/constants.js");
var util = require("../../utils/util.js");
var app = getApp();

const initPosterConfig = config => {
  if (config.mainImg) {
    config.mainImg = encodeURI(config.mainImg);
  }
  if (config.qrCode) {
    config.qrCode = encodeURI(config.qrCode);
  }

  return {
    width: 750,
    height: 1334,
    backgroundColor: '#fff',
    debug: false,
    blocks: [],
    texts: [{
      x: 30,
      y: 830,
      fontSize: 36,
      color: '#333333',
      width: 680,
      text: '',
      lineNum: 1,
    },
    {
      x: 30,
      y: 830,
      fontSize: 36,
      color: '#333333',
      width: 680,
      text: '',
      lineNum: 1,
    }],
    images: [{
      width: 750,
      height: 1334,
      x: 0,
      y: 0,
      url: config.mainImg
    },
    {
      width: 190,
      height: 190,
      x: 178,
      y: 1115,
      url: config.qrCode
    }]
  };
}

Component({
  options: {
    addGlobalClass: true, //使用全局样式
  },
  /**
   * 组件的属性列表
   */
  properties: {
    config: { //config 
      type: Object,
      value: {},
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    posterConfig: {
      debug: false
    },
  },

  /**
   * 组件的方法列表
   */
  methods: {
    posClick() {
      wx.showLoading({
        mask: true,
        title: '海报生成中'
      });
      if (this.data.config.path) {
        // 创建分享记录，并获取一个分享记录ID
        let sendData = {
          userId: this.data.config.userId,
          method: '海报分享',
        };
        util.httpPost('/api/share/create', sendData)
          .subscribe(res => {
            if (res.success) {
              // 添加分享记录成功
              let path = this.data.config.path + '&sid=' + res.data.id;
              res.data.shareUrl = path;
              this.setShare(res.data);
              // 获取二维码
              this.getQrCode(path);
            }
          });
      } else {
        wx.showToast({
          title: '分享失败',
          icon: 'none'
        })
      }
    },
    onPosterSuccess(e) {
      wx.hideLoading();
      const {
        detail
      } = e;
      wx.saveImageToPhotosAlbum({
        filePath: detail,
        fail: () => {
          wx.showModal({
            title: '生成海报成功',
            content: '生成海报成功，保存到相册失败，请长按图片手动保存',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.previewImage({
                  current: detail,
                  urls: [detail]
                });
              }
            }
          })
        },
        success: () => {
          wx.showModal({
            title: '生成海报成功',
            content: '生成海报成功，并已保存到手机相册',
            showCancel: false,
            success: res => {
              if (res.confirm) {
                wx.previewImage({
                  current: detail,
                  urls: [detail]
                });
              }
            }
          })
        }
      });
    },
    onPosterFail(err) {
      wx.hideLoading();
      console.error(err);
      wx.showModal({
        title: '生成海报失败',
        content: '生成海报失败，请联系客服',
        showCancel: false,
      })
    },
    // 获取二维码
    getQrCode(path) {
      let url = '/api/share/crate/qr/code';
      let sendData = {
        width: 280,
        path: path
      };
      util.httpPost(url, sendData)
        .subscribe(res => {
          wx.hideLoading();
          if (res.success) {
            this.data.config.qrCode = res.data;
            this.setData({
              posterConfig: initPosterConfig(this.data.config)
            }, function () {
              var poster = this.selectComponent('#poster');
              poster.data.config = initPosterConfig(this.data.config);
              poster.onCreate();
            });
          } else {
            util.popError('获取二维码失败');
          }
        }, err => {
          util.popError('获取二维码错误');
        }, () => {
        })
    },
    // 修改分享 
    setShare(data) {
      let url = '/api/share/update';
      util.httpPost(url, data)
        .subscribe(res => {
          if (res.success) {
            console.log('修改分享成功');
          }
        })
    }
  }
})
