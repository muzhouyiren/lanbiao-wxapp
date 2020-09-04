// pages/user/user.js
const util = require("../../utils/util.js");
const constants = require("../../utils/constants.js");

var app = getApp()
Page({
  /**
   * 页面的初始数据
   */
  data: {
    portrait: 'http://image.biaobaiju.com/uploads/20180803/23/1533308847-sJINRfclxg.jpeg',
    imgUrl: ["http://image.biaobaiju.com/uploads/20180803/23/1533308847-sJINRfclxg.jpeg"],
    nickName: '梅爽',
    mobile: '待补充',
    gender: '女',
    birthday: '',
    belongs: '学校',
    date: '待补充',
    constellationArr: [{
      id: 1,
      name: "摩羯座",
    }, {
      id: 2,
      name: "水瓶座",
    }, {
      id: 3,
      name: "双鱼座",
    }, {
      id: 4,
      name: "白羊座",
    }, {
      id: 5,
      name: "金牛座",
    }, {
      id: 6,
      name: "双子座",
    }, {
      id: 7,
      name: "巨蟹座",
    }, {
      id: 8,
      name: "狮子座",
    }, {
      id: 9,
      name: "处女座",
    }, {
      id: 10,
      name: "天秤座",
    }, {
      id: 11,
      name: "天蝎座",
    }, {
      id: 12,
      name: "射手座",
    }]
  },
  goToPage: function (name) {
    let _this = this;
    let pages = getCurrentPages();
    let pageUrl = '/' + pages[pages.length - 1].route;
    app.globalData.popupPagrUrl = pageUrl;
    let value = '';
    if (name == "nickName") {
      value = _this.data.nickName;
    }
    if (name == "mobile") {
      value = _this.data.mobileValue;
    }
    if (name == "professional") {
      value = _this.data.majorValue;
    }
    
    wx.navigateTo({
      url: '/pages/personalData/inputPage/inputPage?page=' + name + '&value=' + encodeURIComponent(value)
    })
  },
  bindListTap: function (e) {
    let _this = this;
    let name = e.currentTarget.dataset.name;
    let itemList;
    console.log("name===", name);
    if (name == "nickName" || name == "mobile" || name == "professional") {
      _this.goToPage(name);
    }
    if (name == "portrait") {
      let imgUrl = e.target.dataset.src //获取当前点击的 图片 url
      console.log("imgUrl==", imgUrl);
      if(imgUrl){
        wx.navigateTo({
          url: '/pages/personalData/setHead/setHead?img=' + imgUrl
        })
      }
      return
    }
    wx.getSystemInfo({
      success: function (result) {
        console.log('result.platform===', result.platform);
        if (result.platform == 'android') {
          // if (name == "portrait") {
          //   let current = e.target.dataset.src //获取当前点击的 图片 url
          //   console.log("current==", current);
          //   wx.previewImage({
          //     current,
          //     urls: _this.data.imgUrl
          //   })
          //   itemList = ["拍照", "从手机相册选择", "保存图片", "取消"];
          // } else 
          if (name == "belongs") {
            itemList = ["学校", "公司", "其他", "取消"];
          } else if (name == "gender") {
            itemList = ["女", "男", "保密", "取消"];
          }
        } else {
          // if (name == "portrait") {
          //   let current = e.target.dataset.src //获取当前点击的 图片 url
          //   console.log("current==", current);
          //   wx.previewImage({
          //     current,
          //     urls: _this.data.imgUrl
          //   })
          //   itemList = ["拍照", "从手机相册选择", "保存图片"];
          // } else 
          if (name == "belongs") {
            itemList = ["学校", "公司", "其他"];
          } else if (name == "gender") {
            itemList = ["女", "男", "保密"];
          }
        }
        wx.showActionSheet({
          itemList: itemList,
          itemColor: "#15519b",
          success: function (res) {
            // res.cancel 用户是不是点击了取消按钮
            // res.tapIndex 数组元素的序号，从0开始
            console.log("res==", res);
            if (name == "portrait") {
              let _sourceType;
              if (res.tapIndex == 0) {
                _sourceType = ['camera']
              } else if (res.tapIndex == 1) {
                _sourceType = ['album']
              }
              wx.chooseImage({
                count: 1,
                sizeType: ['compressed'],
                sourceType: _sourceType,
                success(res) {
                  // tempFilePath可以作为img标签的src属性显示图片
                  const tempFilePaths = res.tempFilePaths;
                  console.log("tempFilePaths==", tempFilePaths)
                  _this.data.portrait = tempFilePaths;
                  _this.setData({
                    portrait: tempFilePaths
                  });
                  _this.data.imgUrl = [];
                  _this.data.imgUrl.push(tempFilePaths);
                  console.log("_this.data.imgUrl===", _this.data.imgUrl);
                }
              })
              if (res.tapIndex == 2) {
                wx.getImageInfo({
                  src: _this.data.portrait,
                  success: function (res) {
                    console.log("get image info")
                    console.log(res)
                    wx.saveImageToPhotosAlbum({
                      filePath: res.path,
                      success(res) {
                        console.log("保存图片成功")
                        console.log(res)
                        wx.showToast({
                          title: '保存成功',
                          icon: 'success',
                          duration: 2000
                        })
                      },
                      fail(err) {
                        console.log('失败')
                        console.log(err)

                        if (err.errMsg == "saveImageToPhotosAlbum:fail cancel") {
                          wx.openSetting({
                            success(settingdata) {
                              console.log(settingdata)
                              if (settingdata.authSetting["scope.writePhotosAlbum"]) {
                                console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
                              } else {
                                console.log('获取权限失败，给出不给权限就无法正常使用的提示')
                              }
                            }
                          })
                        }
                      }
                    })
                  }
                })
              }
            } else {
              _this.setData({
                [name]: itemList[res.tapIndex]
              });
              if (name === 'belongs') {
                _this.changeBlongs(itemList[res.tapIndex]);
              }
              if (name === 'gender') {
                _this.changeGender(itemList[res.tapIndex]);
              }
            }
          }
        })
      },
    })
  },
  /**
   * 修改所属
   */
  changeBlongs: function (e) {
    util.showLoading("正在提交");
    let url = "/api/user/updateBelongs/" + app.globalData.user.id + '?belongs=' + e;
    util.httpPost(url, {}).subscribe(res => {
      util.hideLoading();
      if (res.success) {
        wx.showToast({
          title: '修改成功',
        });
      } else {
        console.log(res.message);
      }
    });
  },
  /**
   * 修改性别
   */
  changeGender: function (e) {
    let gender = 0;
    if (e === '女') {
      gender = 2;
    } else if (e === '男') {
      gender = 1
    } else if (e === '保密') {
      gender = 3;
    }
    util.showLoading("正在提交");
    let url = "/api/user/updateGender/" + app.globalData.user.id + '?gender=' + gender;
    util.httpPost(url, {}).subscribe(res => {
      util.hideLoading();
      if (res.success) {
        wx.showToast({
          title: '修改成功',
        });
      } else {
        console.log(res.message);
      }
    });
  },
  bindDateChange: function (e) {
    // 选择年龄，更新生日
    console.log('picker发送选择改变，携带值为', e.detail.value)

    var date = new Date(e.detail.value);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var name = this.getAstro(month, day);
    var constellationArr = this.data.constellationArr;
    var _id;
    for (var i = 0; i < constellationArr.length; i++) {
      if (name == constellationArr[i].name) {
        _id = i;
      }
    }

    this.setData({
      birthday: e.detail.value,
      id: _id
    })
    let url = "/api/user/updateAge/" + app.globalData.user.id + '?birthday=' + e.detail.value;
    util.httpPost(url, {}).subscribe(res => {
      util.hideLoading();
      if (res.success) {
        wx.showToast({
          title: '修改成功',
        });
      } else {
        console.log(res.message);
      }
    });
  },
  /*
  *获取星座
  */
  getAstro: function (month, day) {
    var s = "摩羯水瓶双鱼白羊金牛双子巨蟹狮子处女天秤天蝎射手摩羯";
    var arr = [20, 19, 21, 21, 21, 22, 23, 23, 23, 23, 22, 22];
    return s.substr(month * 2 - (day < arr[month - 1] ? 2 : 0), 2) + "座";
  },
  bindConstellationChange: function (e) {
    this.setData({
      id: e.detail.value || ''
    })
    let url = "/api/user/updateConstellation/" + app.globalData.user.id + '?constellation=' + e.detail.value;
    util.httpPost(url, {}).subscribe(res => {
      util.hideLoading();
      if (res.success) {
        wx.showToast({
          title: '修改成功',
        });
      } else {
        console.log(res.message);
      }
    });
    
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
    var _this = this;
    // 获取用户的信息
    util.showLoading();
    let url = "/api/user/getUserInfo/" + app.globalData.user.id;
    util.httpGet(url, {}).subscribe(res => {
      util.hideLoading();
      if (res.success) {
        _this.setData({
          portrait: res.data.headIcon,
          nickName: res.data.nickName,
          gender: _this.getGender(res.data.gender),
          belongs: res.data.belongs == null ? '待补充' : res.data.belongs,
          belongsValue: res.data.belongs == null ? '': res.data.belongs,
          mobile: res.data.mobile == null ? '待补充' : res.data.mobile,
          mobileValue: res.data.mobile == null ? '' : res.data.mobile,
          birthday: res.data.birthday == null ? '待补充' : res.data.birthday,
          age: res.data.age == 0 ? '待补充' : res.data.age,
          constellation: res.data.constellation == null ? '待补充' : res.data.constellation,
          major: res.data.major == null ? '待补充' : res.data.major,
          majorValue: res.data.major == null ? '' :res.data.major,
          id: res.data.constellation || ''
        });
      } else {
        console.log(res.message);
      }
    });
  },
  getGender: function (e) {
    if (e === 0) {
      return "未知";
    } else if (e === 1) {
      return '男';
    } else {
      return '女'
    }
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