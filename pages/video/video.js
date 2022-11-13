// pages/video/video.js
import request from "../../utils/request"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    videoGroupList: [], //导航标签数据
    navId: '', //导航的标识
    videoList: [], // 视频列表
    videoId: "",// 视频id标识
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getVideoGroupListData();
  },
  // 获取导航数据
  async getVideoGroupListData() {
    let videoGroupListData = await request("/video/group/list");
    this.setData({
      videoGroupList: videoGroupListData.data.slice(0, 14),
      navId: videoGroupListData.data[0].id
    })
    // 获取视频列表数据
    this.getVideoListData(this.data.navId);
  },
  // 点击切换导航的回调
  changeNav(event) {
    let navId = event.currentTarget.id;
    // let navId = event.currentTarget.dataset.id;
    this.setData({
      navId: navId * 1,
      videoList: []
    })
    // 显示正在加载
    wx.showLoading({
      title: '正在加载',
    })
    //获取当前导航对应的视频数据
    this.getVideoListData(this.data.navId);
  },
  //获取视频列表数据
  async getVideoListData(navId) {
    // 如果没有导航的 id 直接返回
    if (!navId) return;
    // 根据当前导航的 id 请求数据
    let videoListData = await request('/video/group', { id: navId });

    let index = 0;
    let videoList = videoListData.datas.map(item => {
      item.id = index++;
      return item
    })

    // 设置一个 Url 列表
    let videoUrlList = [];
    // 获取 Url
    for (let i = 0; i < videoList.length; i++) {
      let videoUrlItem = await request('/video/url', { id: videoList[i].data.vid })
      videoUrlList.push(videoUrlItem.urls[0].url)
    }
    // 将 Url 导入进 videoList 中
    for (let i = 0; i < videoUrlList.length; i++) {
      videoList[i].data.urlInfo = videoUrlList[i];
    }
    this.setData({
      videoList
    });
    // 关闭正在加载
    wx.hideLoading();
  },
  // 点击视频播放的回调
  handlePlay(event) {
    // 获取当前视频的id
    let vid = event.currentTarget.id;
    // 关闭上一个播放的视频
    this.vid !== vid && this.videoContext && this.videoContext.stop();
    this.vid = vid;
    // 更新data中videoId的状态数据
    
    // 创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid);
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