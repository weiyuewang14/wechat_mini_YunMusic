// pages/songDetail.js
import request from "../../utils/request"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isPlay: false, //是否播放,
    songDetail: {}, // 当前歌曲的详细信息
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // options 用于接收路由跳转的query参数
    // let song = JSON.parse(wx.getStorageSync('songDetail')); // 使用本地存储的songDetail
    console.log(options);
    let songId = options.songId;
    // 根据歌曲 id 获得歌曲详细信息
    this.getSongDetailInfo(songId);
    let songName = this.data.songDetail.name;
    console.log(songName);
    // wx.setNavigationBarTitle({
    //   title: songName
    // })
  },
  // 获取当前歌曲的详细信息
  async getSongDetailInfo(songId) {
    let songDetailData = await request("/song/detail", { ids: songId });
    this.setData({
      songDetail: songDetailData.songs[0]
    })
  },
  // 处理音乐的播放
  handleMusicPlay() {
    let isPlay = !this.data.isPlay;
    this.setData({
      isPlay
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