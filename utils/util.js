import rxwx, {
  Rx
} from './rx/RxWX.js';
const constants = require("./constants.js");

const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-');
}

const toChinesNum = num => {
  let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  let unit = ["", "十", "百", "千", "万"];
  num = parseInt(num);
  let getWan = (temp) => {
    let strArr = temp.toString().split("").reverse();
    let newNum = "";
    for (var i = 0; i < strArr.length; i++) {
      newNum = (i == 0 && strArr[i] == 0 ? "" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
    }
    return newNum;
  }
  let overWan = Math.floor(num / 10000);
  let noWan = num % 10000;
  if (noWan.toString().length < 4) noWan = "0" + noWan;
  return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

/**
 * 对象转查询字符串
 */
function objToQueryString(obj) {
  var rurl = "";
  for (var item in obj) {
    rurl += item + "=" + obj[item] + "&";
  }
  rurl = rurl.replace(/&$/, '');
  return rurl;
}



const httpGet = (url, data, obj = {}) => {
  let app = getApp();
  let header = {};
  url = constants.urlBase + url;
  //登录之后的请求改变header
  if (app.globalData.isLogin) {
    header = {
      "userId": app.globalData.user.id
    };
  }
  return rxwx.request({
    method: 'GET',
    url,
    data,
    header,
    ...obj
  })
    .map(res => {
      if (res.statusCode === 200) {
        return res.data;
      } else {
        console.error('http请求状态错误', res);
        return;
      }
    })
    .catch((e) => console.error(`${url} 请求错误`, e))
}

const httpPost = (url, data, obj = {}) => {
  let app = getApp();
  let header = {};
  url = constants.urlBase + url;
  //登录之后的请求改变header
  if (app.globalData.isLogin) {
    header = {
      "userId": app.globalData.user.id
    };
  }
  return rxwx.request({
    method: 'POST',
    url,
    data,
    header,
    ...obj
  })
    .map(res => {
      if (res.statusCode === 200) {
        return res.data;
      } else {
        console.error('http请求状态错误', res);
        return;
      }
    })
    .catch((e) => {
      console.error(`${url} 请求错误`, e)
    })
}

const showLoading = (title = '正在加载') => {
  wx.showLoading({
    title: title,
  });
}

const hideLoading = () => {
  wx.hideLoading({
    complete: (res) => { },
  })
}


/**
 * 错误消息
 */
const popError = msg => {
  wx.showModal({
    title: '错误',
    content: msg + ",请稍后再试或联系客服",
  })
}

module.exports = {
  toChinesNum: toChinesNum,
  formatDate: formatDate,
  formatTime: formatTime,
  showLoading: showLoading,
  hideLoading: hideLoading,
  objToQueryString: objToQueryString,
  httpGet: httpGet,
  httpPost: httpPost,
  popError: popError
}