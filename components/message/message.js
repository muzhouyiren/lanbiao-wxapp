// components/message/message.js
const util = require("../../utils/util.js");

Component({
  options: {
    addGlobalClass: true, //使用全局样式
  },
  /**
   * 组件的属性列表
   */
  properties: {
    dataList: { // 消息列表
      type: Array,
      value: [],
    },
    showModal: {
      type: Boolean,
      value: false,
    },
    isScroll: {
      type: Boolean,
      value: true,
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    showModal: false,
    isScroll: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    clickMessage: function (e) {
      // 点击消息，设置已读
      let id = e.currentTarget.dataset.item.id;
      util.httpPost('/station/message/change/status/' + id)
        .subscribe(res => {
          if (res.success) {
            // 设置消息已读成功，将当前消息的样式修改为已读样式
            for (const item of this.data.dataList) {
              if (item.id == id) {
                item.status = 1;
                break;
              }
            }
            this.setData({
              dataList: this.data.dataList
            });
          }
        });
    },
    closeModal: function () {
      this.setData({
        showModal: false,
        isScroll: true,
      });
      this.triggerEvent('myevent', { isScroll: true });
    }
  }
})
