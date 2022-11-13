// index.js
import request from "../../utils/request.js"
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [], //轮播图数据
    recommendSongList: [],//推荐歌单数据
    topList: [],  //排行榜数据
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: async function (options) {
    // 获取轮播图数据
    let bannerListData = await request('/banner', { type: 2 })
    this.setData({
      bannerList: bannerListData.banners
    })

    // 获取推荐歌单数据 //http://localhost:3000/personalized?limit=10
    let recommendSongListData = await request('/personalized', { limit: 10 })
    this.setData({
      recommendSongList: recommendSongListData.result
    })

    /* 获取排行榜数据 */
    // 根据 http://localhost:3000/toplist  获取排行榜的id
    // 根据 id  去 http://localhost:3000/playlist/detail?id=xxx 获取排行榜数据
    let allTopListData = await request('/toplist')
    let topList = allTopListData.list.slice(0, 5)
    let topListDetail = []
    for (let item of topList) {
      let detailList = await request(`/playlist/detail?id=${item.id}`, { limit: 10 })
      topListDetail.push({
        id: item.id,
        name: detailList.playlist.name,
        tracks: detailList.playlist.tracks.slice(0, 3)
      })
      // 不需要等待五次请求全部结束才更新，但渲染次数会变多
      this.setData({
        topList: topListDetail
      })
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
