// pages/login/login.js
import request from "../../utils/request.js"
/*
  登录流程：
    1. 收集表单项数据
    2. 前端验证
      1）验证用户信息（输入的信息）是否合法
      2）前端验证不通过的话，就会提示用户输入合法信息，此时不需要发请求给后端
      3）验证通过的话，发送请求（请求中携带着登录用到的信息如用户名、密码等）给服务器
    3. 后端验证
      1）验证用户是否存在
      2）用户不存在，告诉前端用户不存在
      3）用户存在的话，验证前端发送的验证密码是否正确
      4）如果不正确，返回给前端提示密码不正确
      5）如果正确，返回给前端数据，提示用户登录成功
*/
Page({

  /**
   * 页面的初始数据
   */
  data: {
    phone: "18851980830",
    password: "Wangweiyue0830"
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {

  },
  // 表单项内容发生改变时的回调
  handleInput(event) {
    // let type = event.currentTarget.id; // 使用id传值 取值： phone||password
    let type = event.currentTarget.dataset.type;  // 使用data-key=value

    this.setData({
      [type]: event.detail.value
    })
  },
  // 登录的回调
  async handleLogin() {
    // 1. 收集表单数据
    let { phone, password } = this.data;
    // 2. 前端验证
    if (!phone) {
      wx.showToast({
        title: '手机号不能为空',
        icon: "none"
      })
      return;
    }
    let phoneReg = /^1[3-9]\d{9}$/;
    if (!phoneReg.test(phone)) {
      wx.showToast({
        title: '手机号格式有误',
        icon: "none"
      })
      return;
    }
    if (!password) {
      wx.showToast({
        title: '密码不能为空',
        icon: "none"
      })
      return;
    }
    // 前端验证通过后，需要后端验证
    let res = await request(`/login/cellphone`, { phone, password, isLogin: true });
    if (res.code === 200) {
      wx.showToast({
        title: '登录成功',
      })
      // 将用户的信息存储至本地
      wx.setStorageSync('userInfo', JSON.stringify(res.profile));
      // 跳转至个人中心
      wx.reLaunch({
        url: '/pages/personal/personal',
      })
    } else if (res.code === 400) {
      wx.showToast({
        title: "手机号错误",
        icon: "none"
      })
    } else if (res.code === 502) {
      wx.showToast({
        title: "密码错误",
        icon: "none"
      })
    } else {
      wx.showToast({
        title: '登录失败，请重新登录',
        icon: "none"
      })
    }

  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})