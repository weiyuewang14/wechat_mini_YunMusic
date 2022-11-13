import request from "../../utils/request"

// pages/personal/personal.js
let startY = 0; // 开始的纵坐标
let endY = 0; // 结束的纵坐标
let moveDistance = 0; // 纵向移动的距离
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverTransform: "translateY(0)",//下拉的动画
    coverTransition: "",// 回弹的动画
    userInfo: {}, //用户的信息
    recentPlayList: [], // 用户最近播放列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 读取用户的基本信息
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: JSON.parse(userInfo)
      })
      // 获取用户播放记录
      this.getUserRecentPlayList(this.data.userInfo.userId)
    }
  },
  // 获取用户播放记录的功能函数
  async getUserRecentPlayList(userId) {
    let recentPlayListData = await request('/user/record', { uid: userId, type: 0 });
    let index = 0;
    let recentPlayList = recentPlayListData.allData.slice(0, 10).map((item) => {
      item.id = index++;
      return item;
    })
    this.setData({
      recentPlayList
    })
  },
  // 跳转至登录页面的回调
  toLogin() {
    wx.navigateTo({
      url: '/pages/login/login',
    })
  },

  // 下拉的回调
  handleTouchStart(event) {
    startY = event.touches[0].clientY;
    this.setData({
      coverTransition: ''
    })
  },
  handleTouchMove(event) {
    endY = event.touches[0].clientY;
    moveDistance = endY - startY;
    if (moveDistance <= 0) {
      return;
    }
    if (moveDistance >= 80) {
      moveDistance = 80
    }
    this.setData({
      coverTransform: `translateY(${moveDistance}rpx)`,
    })
  },
  handleTouchEnd() {
    this.setData({
      coverTransform: `translateY(0)`,
      coverTransition: `transform .5s linear`
    })
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