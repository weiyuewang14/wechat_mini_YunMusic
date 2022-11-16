// pages/recommendSong/recommendSong.js
import request from "../../utils/request"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    day: "",
    month: "",
    recommendList: [], // 每日推荐歌曲列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 判断用户是否登录
    let userInfo = wx.getStorageSync("userInfo")
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: "none",
        success: () => {
          // 跳转至登录页
          wx.reLaunch({
            url: '/pages/login/login',
          })
        }
      })
    }
    // 更新日期
    this.setData({
      day: new Date().getDate(),
      month: new Date().getMonth() + 1
    })

    // 获取每日数据
    this.getRecommendList()
  },
  // 获取用户每日推荐的数据
  async getRecommendList() {
    let res = await request("/recommend/songs");
    this.setData({
      recommendList: res.data.dailySongs
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