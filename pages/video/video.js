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
    videoUpdateTime: [], // 记录视频播放的时间
    isTriggered: false, // 标记下拉刷新是否被触发
    moreVideoArr: [], // 上拉加载更多视频,
    offset: 1, //  定义初始的上拉次数为 1
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
      videoList,
      isTriggered: false,// 关闭下拉刷新
    });
    // 关闭正在加载
    wx.hideLoading();
  },
  // 点击视频播放的回调
  handlePlay(event) {
    // 获取当前视频的id
    let vid = event.currentTarget.id;
    /* 使用图片标签代替视频标签 */
    // 关闭上一个播放的视频
    // this.vid !== vid && this.videoContext && this.videoContext.stop();
    // this.vid = vid;
    // 更新data中videoId的状态数据
    this.setData({
      videoId: vid
    })
    // 创建控制video标签的实例对象
    this.videoContext = wx.createVideoContext(vid);
    // 判断当前视频是否播放过，如果播放过，则跳转至指定的位置，如没有，直接播放
    let { videoUpdateTime } = this.data;
    let videoItem = videoUpdateTime.find(item => item.vid === vid);
    if (videoItem) {
      this.videoContext.seek(videoItem.currentTime)
    }
    // 在标签上使用autoplay会更好一些
    // this.videoContext.autoplay();
  },
  // 监听视频播放进度的回调
  handleTimeUpdate(event) {
    let videoTimeObj = {
      vid: event.currentTarget.id,
      currentTime: event.detail.currentTime
    }
    let { videoUpdateTime } = this.data;

    let videoItem = videoUpdateTime.find(item => item.vid === videoTimeObj.vid);
    if (videoItem) {
      videoItem.currentTime = event.detail.currentTime;
    } else {
      videoUpdateTime.push(videoTimeObj)
    }
    this.setData({
      videoUpdateTime
    })

  },
  // 监听视频播放结束的回调
  handleEnded(event) {
    let { videoUpdateTime } = this.data;
    let vid = event.currentTarget.id;
    let videoItem = videoUpdateTime.findIndex(item => item.vid === vid);
    videoUpdateTime.splice(videoItem, 1)
    this.setData({
      videoUpdateTime
    })
  },
  // 下拉刷新回调
  handleRefresher() {
    // 再次发送请求，获取最新数据
    this.getVideoListData(this.data.navId)
  },
  // 自定义上拉触发事件的回调
  async handleToLower() {
    // 定义一个值,判断是第几次上拉
    let offset = this.data.offset;
    this.setData({ offset: offset + 1 })
    console.log("更多加载了" + offset + "次");
    let moreVideoArr = this.data.moreVideoArr;
    let navId = this.data.navId;
    let getVideoMoreListData = await request("/video/group", { id: navId, offset: offset });
    let index = this.data.videoList.length;
    let videoMoreList = getVideoMoreListData.datas.map(item => {
      item.id = index++;
      return item;
    })
    let videoList = this.data.videoList;
    videoList.push(...videoMoreList);
    this.setData({
      videoList
    })
    // // 数据分页：前端分页和后端分页
    // console.log("网易云暂时未实现接口");
    // // 模拟数据
    // let newVideoList = [
    //   {
    //     "type": 1,
    //     "displayed": false,
    //     "alg": "onlineHotGroup",
    //     "extAlg": null,
    //     "data": {
    //       "alg": "onlineHotGroup",
    //       "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
    //       "threadId": "R_VI_62_523F0451C093EA1CDD28A48C688E089C",
    //       "coverUrl": "https://p1.music.126.net/ZHYMgqEt9Ei-90jF-6gaDw==/109951163572666838.jpg",
    //       "height": 360,
    //       "width": 848,
    //       "title": "On.Drakon.他是龙.影片剪辑",
    //       "description": "很唯美的影片，剪辑了其中最美的画面分享给大家[可爱]",
    //       "commentCount": 233,
    //       "shareCount": 1875,
    //       "resolutions": [
    //         {
    //           "resolution": 240,
    //           "size": 33286817
    //         }
    //       ],
    //       "creator": {
    //         "defaultAvatar": false,
    //         "province": 330000,
    //         "authStatus": 0,
    //         "followed": false,
    //         "avatarUrl": "http://p1.music.126.net/VBweVakCEjKZ1WkYk14TIw==/7952767605092817.jpg",
    //         "accountStatus": 0,
    //         "gender": 1,
    //         "city": 331000,
    //         "birthday": 1098767441859,
    //         "userId": 81253763,
    //         "userType": 0,
    //         "nickname": "宁黑",
    //         "signature": "留在地球不走了 ( ´•灬•｀)\n宁黑的视频《香港经典影片之无间道.剪辑》: http://music.163.com/video/CBB714868EE6D6A34F85F02EDFB4CF88/?userid=81253763 (来自@网易云音乐)",
    //         "description": "",
    //         "detailDescription": "",
    //         "avatarImgId": 7952767605092817,
    //         "backgroundImgId": 3379898744919709,
    //         "backgroundUrl": "http://p1.music.126.net/G2kDRzT4Zf9tJ5BQ80ZZCQ==/3379898744919709.jpg",
    //         "authority": 0,
    //         "mutual": false,
    //         "expertTags": null,
    //         "experts": null,
    //         "djStatus": 0,
    //         "vipType": 11,
    //         "remarkName": null,
    //         "backgroundImgIdStr": "3379898744919709",
    //         "avatarImgIdStr": "7952767605092817"
    //       },
    //       "urlInfo": null,
    //       "videoGroup": [
    //         {
    //           "id": 58101,
    //           "name": "听BGM",
    //           "alg": null
    //         },
    //         {
    //           "id": 1105,
    //           "name": "最佳饭制",
    //           "alg": null
    //         },
    //         {
    //           "id": 3107,
    //           "name": "混剪",
    //           "alg": null
    //         },
    //         {
    //           "id": 5100,
    //           "name": "音乐",
    //           "alg": null
    //         },
    //         {
    //           "id": 3100,
    //           "name": "影视",
    //           "alg": null
    //         },
    //         {
    //           "id": 14242,
    //           "name": "伤感",
    //           "alg": null
    //         },
    //         {
    //           "id": 76106,
    //           "name": "饭制混剪",
    //           "alg": null
    //         },
    //         {
    //           "id": 13172,
    //           "name": "欧美",
    //           "alg": null
    //         },
    //         {
    //           "id": 23128,
    //           "name": "纯音乐",
    //           "alg": null
    //         },
    //         {
    //           "id": 24127,
    //           "name": "电影",
    //           "alg": null
    //         }
    //       ],
    //       "previewUrl": null,
    //       "previewDurationms": 0,
    //       "hasRelatedGameAd": false,
    //       "markTypes": [
    //         109
    //       ],
    //       "relateSong": [
    //         {
    //           "name": "Roxane's Veil",
    //           "id": 3796165,
    //           "pst": 0,
    //           "t": 0,
    //           "ar": [
    //             {
    //               "id": 83521,
    //               "name": "Vanessa-Mae",
    //               "tns": [],
    //               "alias": []
    //             }
    //           ],
    //           "alia": [],
    //           "pop": 50,
    //           "st": 0,
    //           "rt": "",
    //           "fee": 1,
    //           "v": 37,
    //           "crbt": null,
    //           "cf": "",
    //           "al": {
    //             "id": 384022,
    //             "name": "Choreography",
    //             "picUrl": "http://p4.music.126.net/BSBfM5zl2rjA1qeDXOr0Og==/109951165995538076.jpg",
    //             "tns": [],
    //             "pic_str": "109951165995538076",
    //             "pic": 109951165995538080
    //           },
    //           "dt": 282958,
    //           "h": {
    //             "br": 320000,
    //             "fid": 0,
    //             "size": 11318378,
    //             "vd": -15849
    //           },
    //           "m": {
    //             "br": 192000,
    //             "fid": 0,
    //             "size": 6791044,
    //             "vd": -13165
    //           },
    //           "l": {
    //             "br": 128000,
    //             "fid": 0,
    //             "size": 4527377,
    //             "vd": -10820
    //           },
    //           "a": null,
    //           "cd": "1",
    //           "no": 2,
    //           "rtUrl": null,
    //           "ftype": 0,
    //           "rtUrls": [],
    //           "djId": 0,
    //           "copyright": 1,
    //           "s_id": 0,
    //           "rurl": null,
    //           "mst": 9,
    //           "cp": 7001,
    //           "mv": 0,
    //           "rtype": 0,
    //           "publishTime": 1095609600000,
    //           "privilege": {
    //             "id": 3796165,
    //             "fee": 1,
    //             "payed": 0,
    //             "st": 0,
    //             "pl": 0,
    //             "dl": 0,
    //             "sp": 0,
    //             "cp": 0,
    //             "subp": 0,
    //             "cs": false,
    //             "maxbr": 320000,
    //             "fl": 0,
    //             "toast": false,
    //             "flag": 4,
    //             "preSell": false
    //           }
    //         }
    //       ],
    //       "relatedInfo": null,
    //       "videoUserLiveInfo": null,
    //       "vid": "523F0451C093EA1CDD28A48C688E089C",
    //       "durationms": 285884,
    //       "playTime": 1229321,
    //       "praisedCount": 3607,
    //       "praised": false,
    //       "subscribed": false
    //     }
    //   },
    //   {
    //     "type": 1,
    //     "displayed": false,
    //     "alg": "onlineHotGroup",
    //     "extAlg": null,
    //     "data": {
    //       "alg": "onlineHotGroup",
    //       "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
    //       "threadId": "R_VI_62_1699FB2632FA57AF4C52BAB620A47A56",
    //       "coverUrl": "https://p1.music.126.net/rgiHuo8Rsy-oXrKZufbIOQ==/109951165220679725.jpg",
    //       "height": 720,
    //       "width": 1366,
    //       "title": "关晓彤太上头，见过空姐版的晓彤吗",
    //       "description": null,
    //       "commentCount": 49,
    //       "shareCount": 58,
    //       "resolutions": [
    //         {
    //           "resolution": 240,
    //           "size": 9406363
    //         },
    //         {
    //           "resolution": 480,
    //           "size": 13867462
    //         },
    //         {
    //           "resolution": 720,
    //           "size": 20231454
    //         }
    //       ],
    //       "creator": {
    //         "defaultAvatar": false,
    //         "province": 410000,
    //         "authStatus": 0,
    //         "followed": false,
    //         "avatarUrl": "http://p1.music.126.net/jtAHHW_nuf9xntwlp_3AjA==/109951164943685163.jpg",
    //         "accountStatus": 0,
    //         "gender": 2,
    //         "city": 410200,
    //         "birthday": -2209017600000,
    //         "userId": 1612102921,
    //         "userType": 0,
    //         "nickname": "小思嘶",
    //         "signature": "装的没所谓的样子 转身哭的像个孩子",
    //         "description": "",
    //         "detailDescription": "",
    //         "avatarImgId": 109951164943685170,
    //         "backgroundImgId": 109951162868126480,
    //         "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
    //         "authority": 0,
    //         "mutual": false,
    //         "expertTags": null,
    //         "experts": null,
    //         "djStatus": 0,
    //         "vipType": 0,
    //         "remarkName": null,
    //         "backgroundImgIdStr": "109951162868126486",
    //         "avatarImgIdStr": "109951164943685163"
    //       },
    //       "urlInfo": null,
    //       "videoGroup": [
    //         {
    //           "id": 58101,
    //           "name": "听BGM",
    //           "alg": null
    //         },
    //         {
    //           "id": 1105,
    //           "name": "最佳饭制",
    //           "alg": null
    //         },
    //         {
    //           "id": 4101,
    //           "name": "娱乐",
    //           "alg": null
    //         },
    //         {
    //           "id": 16265,
    //           "name": "内地明星",
    //           "alg": null
    //         },
    //         {
    //           "id": 15241,
    //           "name": "饭制",
    //           "alg": null
    //         }
    //       ],
    //       "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_3083629481_MNLJaXOw.webp?wsSecret=d4f36dfff30b2e5ff9ae704b16c8503a&wsTime=1668156689",
    //       "previewDurationms": 4000,
    //       "hasRelatedGameAd": false,
    //       "markTypes": null,
    //       "relateSong": [],
    //       "relatedInfo": null,
    //       "videoUserLiveInfo": null,
    //       "vid": "1699FB2632FA57AF4C52BAB620A47A56",
    //       "durationms": 129803,
    //       "playTime": 309348,
    //       "praisedCount": 1302,
    //       "praised": false,
    //       "subscribed": false
    //     }
    //   },
    //   {
    //     "type": 1,
    //     "displayed": false,
    //     "alg": "onlineHotGroup",
    //     "extAlg": null,
    //     "data": {
    //       "alg": "onlineHotGroup",
    //       "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
    //       "threadId": "R_VI_62_CEEB1B5EB1F3B66ADCF764DB53C0870A",
    //       "coverUrl": "https://p1.music.126.net/FnCvcFx98jx5gVB7XQHCbw==/109951163839701012.jpg",
    //       "height": 1080,
    //       "width": 1920,
    //       "title": "ISAK&EVEN FOREVER",
    //       "description": "",
    //       "commentCount": 414,
    //       "shareCount": 1581,
    //       "resolutions": [
    //         {
    //           "resolution": 240,
    //           "size": 10639118
    //         },
    //         {
    //           "resolution": 480,
    //           "size": 17844675
    //         },
    //         {
    //           "resolution": 720,
    //           "size": 26978894
    //         },
    //         {
    //           "resolution": 1080,
    //           "size": 54050767
    //         }
    //       ],
    //       "creator": {
    //         "defaultAvatar": false,
    //         "province": 320000,
    //         "authStatus": 0,
    //         "followed": false,
    //         "avatarUrl": "http://p1.music.126.net/CmzwPNw2ZWUWFaC3jt5Zcw==/109951163099123214.jpg",
    //         "accountStatus": 0,
    //         "gender": 2,
    //         "city": 320100,
    //         "birthday": 888405761000,
    //         "userId": 259010793,
    //         "userType": 0,
    //         "nickname": "MSinby",
    //         "signature": "이성열&정찬우 1004Yeol&Chan",
    //         "description": "",
    //         "detailDescription": "",
    //         "avatarImgId": 109951163099123220,
    //         "backgroundImgId": 109951164715786850,
    //         "backgroundUrl": "http://p1.music.126.net/jdaEXWdaD6RpHxXOXlWOPA==/109951164715786844.jpg",
    //         "authority": 0,
    //         "mutual": false,
    //         "expertTags": null,
    //         "experts": null,
    //         "djStatus": 0,
    //         "vipType": 11,
    //         "remarkName": null,
    //         "backgroundImgIdStr": "109951164715786844",
    //         "avatarImgIdStr": "109951163099123214"
    //       },
    //       "urlInfo": null,
    //       "videoGroup": [
    //         {
    //           "id": 58101,
    //           "name": "听BGM",
    //           "alg": null
    //         },
    //         {
    //           "id": 1105,
    //           "name": "最佳饭制",
    //           "alg": null
    //         },
    //         {
    //           "id": 3107,
    //           "name": "混剪",
    //           "alg": null
    //         },
    //         {
    //           "id": 3100,
    //           "name": "影视",
    //           "alg": null
    //         },
    //         {
    //           "id": 23126,
    //           "name": "电视剧",
    //           "alg": null
    //         },
    //         {
    //           "id": 76106,
    //           "name": "饭制混剪",
    //           "alg": null
    //         },
    //         {
    //           "id": 13116,
    //           "name": "爱情",
    //           "alg": null
    //         },
    //         {
    //           "id": 81100,
    //           "name": "欧美剧",
    //           "alg": null
    //         }
    //       ],
    //       "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_2296831693_3998kXJt.webp?wsSecret=b5ac0a9719c0005a3439b7bfa4ba2350&wsTime=1668156689",
    //       "previewDurationms": 4000,
    //       "hasRelatedGameAd": false,
    //       "markTypes": null,
    //       "relateSong": [
    //         {
    //           "name": "Daddy",
    //           "id": 534228169,
    //           "pst": 0,
    //           "t": 0,
    //           "ar": [
    //             {
    //               "id": 12007313,
    //               "name": "YLXR",
    //               "tns": [],
    //               "alias": []
    //             },
    //             {
    //               "id": 996655,
    //               "name": "Isaac Sakima",
    //               "tns": [],
    //               "alias": []
    //             }
    //           ],
    //           "alia": [],
    //           "pop": 75,
    //           "st": 0,
    //           "rt": null,
    //           "fee": 8,
    //           "v": 31,
    //           "crbt": null,
    //           "cf": "",
    //           "al": {
    //             "id": 37252743,
    //             "name": "Ricky",
    //             "picUrl": "http://p4.music.126.net/0NUO0UrvehOaLd0TBRYqvw==/109951163125542553.jpg",
    //             "tns": [],
    //             "pic_str": "109951163125542553",
    //             "pic": 109951163125542560
    //           },
    //           "dt": 152079,
    //           "h": {
    //             "br": 320000,
    //             "fid": 0,
    //             "size": 6085529,
    //             "vd": -51430
    //           },
    //           "m": {
    //             "br": 192000,
    //             "fid": 0,
    //             "size": 3651335,
    //             "vd": -51430
    //           },
    //           "l": {
    //             "br": 128000,
    //             "fid": 0,
    //             "size": 2434238,
    //             "vd": -51430
    //           },
    //           "a": null,
    //           "cd": "1",
    //           "no": 6,
    //           "rtUrl": null,
    //           "ftype": 0,
    //           "rtUrls": [],
    //           "djId": 0,
    //           "copyright": 1,
    //           "s_id": 0,
    //           "rurl": null,
    //           "mst": 9,
    //           "cp": 631010,
    //           "mv": 0,
    //           "rtype": 0,
    //           "publishTime": 1507824000007,
    //           "privilege": {
    //             "id": 534228169,
    //             "fee": 8,
    //             "payed": 0,
    //             "st": 0,
    //             "pl": 128000,
    //             "dl": 0,
    //             "sp": 7,
    //             "cp": 1,
    //             "subp": 1,
    //             "cs": false,
    //             "maxbr": 999000,
    //             "fl": 128000,
    //             "toast": false,
    //             "flag": 260,
    //             "preSell": false
    //           }
    //         }
    //       ],
    //       "relatedInfo": null,
    //       "videoUserLiveInfo": null,
    //       "vid": "CEEB1B5EB1F3B66ADCF764DB53C0870A",
    //       "durationms": 151445,
    //       "playTime": 784971,
    //       "praisedCount": 5625,
    //       "praised": false,
    //       "subscribed": false
    //     }
    //   },
    //   {
    //     "type": 1,
    //     "displayed": false,
    //     "alg": "onlineHotGroup",
    //     "extAlg": null,
    //     "data": {
    //       "alg": "onlineHotGroup",
    //       "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
    //       "threadId": "R_VI_62_48D0DAB7BC5FA12553A43CF30FF304CD",
    //       "coverUrl": "https://p1.music.126.net/lerAra6xxTI3kUBIGkP6Yw==/109951164101399851.jpg",
    //       "height": 1080,
    //       "width": 1920,
    //       "title": "把手放在猫咪屁股上可以坚持多久？",
    //       "description": "我家的白猫叫Guitar~\n哈哈它能坚持这么久不错了\n还不咬我哈哈哈哈 \n假猫",
    //       "commentCount": 486,
    //       "shareCount": 73,
    //       "resolutions": [
    //         {
    //           "resolution": 240,
    //           "size": 5720831
    //         },
    //         {
    //           "resolution": 480,
    //           "size": 10487103
    //         },
    //         {
    //           "resolution": 720,
    //           "size": 16730343
    //         },
    //         {
    //           "resolution": 1080,
    //           "size": 36705982
    //         }
    //       ],
    //       "creator": {
    //         "defaultAvatar": false,
    //         "province": 310000,
    //         "authStatus": 1,
    //         "followed": false,
    //         "avatarUrl": "http://p1.music.126.net/tpZDo6CW8StJHKjQ8JDVPQ==/109951164389496792.jpg",
    //         "accountStatus": 0,
    //         "gender": 1,
    //         "city": 310101,
    //         "birthday": 858528000000,
    //         "userId": 1500714824,
    //         "userType": 4,
    //         "nickname": "深夜要加油鸭",
    //         "signature": "你会看到我的",
    //         "description": "",
    //         "detailDescription": "",
    //         "avatarImgId": 109951164389496800,
    //         "backgroundImgId": 109951164355872660,
    //         "backgroundUrl": "http://p1.music.126.net/UbVifK8-TBprNs140gZkbg==/109951164355872651.jpg",
    //         "authority": 0,
    //         "mutual": false,
    //         "expertTags": null,
    //         "experts": {
    //           "1": "音乐原创视频达人"
    //         },
    //         "djStatus": 10,
    //         "vipType": 11,
    //         "remarkName": null,
    //         "backgroundImgIdStr": "109951164355872651",
    //         "avatarImgIdStr": "109951164389496792"
    //       },
    //       "urlInfo": null,
    //       "videoGroup": [
    //         {
    //           "id": 58101,
    //           "name": "听BGM",
    //           "alg": null
    //         },
    //         {
    //           "id": 2100,
    //           "name": "生活",
    //           "alg": null
    //         },
    //         {
    //           "id": 1103,
    //           "name": "萌宠",
    //           "alg": null
    //         },
    //         {
    //           "id": 26100,
    //           "name": "随手拍",
    //           "alg": null
    //         },
    //         {
    //           "id": 72116,
    //           "name": "短片",
    //           "alg": null
    //         }
    //       ],
    //       "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_2520855326_Q3yn86jj.webp?wsSecret=6c3d57d85c574939ec2358b98287bc1f&wsTime=1668156689",
    //       "previewDurationms": 4000,
    //       "hasRelatedGameAd": false,
    //       "markTypes": null,
    //       "relateSong": [],
    //       "relatedInfo": null,
    //       "videoUserLiveInfo": null,
    //       "vid": "48D0DAB7BC5FA12553A43CF30FF304CD",
    //       "durationms": 73984,
    //       "playTime": 1037107,
    //       "praisedCount": 3907,
    //       "praised": false,
    //       "subscribed": false
    //     }
    //   },
    //   {
    //     "type": 1,
    //     "displayed": false,
    //     "alg": "onlineHotGroup",
    //     "extAlg": null,
    //     "data": {
    //       "alg": "onlineHotGroup",
    //       "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
    //       "threadId": "R_VI_62_AE02C9D4A9B59F4B25211944BFFF6F28",
    //       "coverUrl": "https://p1.music.126.net/c5fypjPl-g1nt2uPWF9Ajw==/109951164092323680.jpg",
    //       "height": 720,
    //       "width": 1280,
    //       "title": "爆笑虫子：神奇的果实，吃了让人发骚，你敢吃吗？",
    //       "description": "爆笑虫子：神奇的果实，吃了让人发骚，你敢吃吗？",
    //       "commentCount": 81,
    //       "shareCount": 43,
    //       "resolutions": [
    //         {
    //           "resolution": 240,
    //           "size": 15150587
    //         },
    //         {
    //           "resolution": 480,
    //           "size": 24213317
    //         },
    //         {
    //           "resolution": 720,
    //           "size": 30947046
    //         }
    //       ],
    //       "creator": {
    //         "defaultAvatar": false,
    //         "province": 370000,
    //         "authStatus": 0,
    //         "followed": false,
    //         "avatarUrl": "http://p1.music.126.net/I73JGI6GJ3p8Ob3EUbi2Qg==/18602637232435520.jpg",
    //         "accountStatus": 0,
    //         "gender": 1,
    //         "city": 370600,
    //         "birthday": -2209017600000,
    //         "userId": 425742571,
    //         "userType": 0,
    //         "nickname": "骚的一匹逗号",
    //         "signature": "",
    //         "description": "",
    //         "detailDescription": "",
    //         "avatarImgId": 18602637232435520,
    //         "backgroundImgId": 109951162868128400,
    //         "backgroundUrl": "http://p1.music.126.net/2zSNIqTcpHL2jIvU6hG0EA==/109951162868128395.jpg",
    //         "authority": 0,
    //         "mutual": false,
    //         "expertTags": null,
    //         "experts": null,
    //         "djStatus": 0,
    //         "vipType": 0,
    //         "remarkName": null,
    //         "backgroundImgIdStr": "109951162868128395",
    //         "avatarImgIdStr": "18602637232435520"
    //       },
    //       "urlInfo": null,
    //       "videoGroup": [
    //         {
    //           "id": 58101,
    //           "name": "听BGM",
    //           "alg": null
    //         },
    //         {
    //           "id": 3100,
    //           "name": "影视",
    //           "alg": null
    //         },
    //         {
    //           "id": 75117,
    //           "name": "创意动画",
    //           "alg": null
    //         },
    //         {
    //           "id": 14206,
    //           "name": "幽默",
    //           "alg": null
    //         },
    //         {
    //           "id": 13198,
    //           "name": "动画",
    //           "alg": null
    //         }
    //       ],
    //       "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_2514283569_efGaZFyU.webp?wsSecret=3024f5eed93b5128b913725cfecc5297&wsTime=1668156689",
    //       "previewDurationms": 4000,
    //       "hasRelatedGameAd": false,
    //       "markTypes": null,
    //       "relateSong": [],
    //       "relatedInfo": null,
    //       "videoUserLiveInfo": null,
    //       "vid": "AE02C9D4A9B59F4B25211944BFFF6F28",
    //       "durationms": 162347,
    //       "playTime": 747534,
    //       "praisedCount": 1508,
    //       "praised": false,
    //       "subscribed": false
    //     }
    //   },
    //   {
    //     "type": 1,
    //     "displayed": false,
    //     "alg": "onlineHotGroup",
    //     "extAlg": null,
    //     "data": {
    //       "alg": "onlineHotGroup",
    //       "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
    //       "threadId": "R_VI_62_23BE941E41F16DC7CE9F320144CF88CC",
    //       "coverUrl": "https://p1.music.126.net/g_LAF_vecmdBAE30PTD00Q==/109951163573937914.jpg",
    //       "height": 720,
    //       "width": 1280,
    //       "title": "郭敬明导演的烂片之王《小时代》主题曲竟这么好听",
    //       "description": null,
    //       "commentCount": 612,
    //       "shareCount": 344,
    //       "resolutions": [
    //         {
    //           "resolution": 240,
    //           "size": 21580197
    //         },
    //         {
    //           "resolution": 480,
    //           "size": 33114730
    //         },
    //         {
    //           "resolution": 720,
    //           "size": 45048737
    //         }
    //       ],
    //       "creator": {
    //         "defaultAvatar": false,
    //         "province": 110000,
    //         "authStatus": 0,
    //         "followed": false,
    //         "avatarUrl": "http://p1.music.126.net/obOrEusdlgZmXQhRYGjLSw==/109951163359841118.jpg",
    //         "accountStatus": 0,
    //         "gender": 0,
    //         "city": 110101,
    //         "birthday": -2209017600000,
    //         "userId": 1471190590,
    //         "userType": 0,
    //         "nickname": "华语TOP音乐榜",
    //         "signature": "华语热门歌曲排行，带给你全新音乐体验",
    //         "description": "",
    //         "detailDescription": "",
    //         "avatarImgId": 109951163359841120,
    //         "backgroundImgId": 109951162868126480,
    //         "backgroundUrl": "http://p1.music.126.net/_f8R60U9mZ42sSNvdPn2sQ==/109951162868126486.jpg",
    //         "authority": 0,
    //         "mutual": false,
    //         "expertTags": null,
    //         "experts": {
    //           "1": "泛生活视频达人"
    //         },
    //         "djStatus": 0,
    //         "vipType": 0,
    //         "remarkName": null,
    //         "backgroundImgIdStr": "109951162868126486",
    //         "avatarImgIdStr": "109951163359841118"
    //       },
    //       "urlInfo": null,
    //       "videoGroup": [
    //         {
    //           "id": 58101,
    //           "name": "听BGM",
    //           "alg": null
    //         },
    //         {
    //           "id": 1105,
    //           "name": "最佳饭制",
    //           "alg": null
    //         },
    //         {
    //           "id": 3107,
    //           "name": "混剪",
    //           "alg": null
    //         },
    //         {
    //           "id": 5100,
    //           "name": "音乐",
    //           "alg": null
    //         },
    //         {
    //           "id": 3100,
    //           "name": "影视",
    //           "alg": null
    //         },
    //         {
    //           "id": 13225,
    //           "name": "剧情",
    //           "alg": null
    //         },
    //         {
    //           "id": 76106,
    //           "name": "饭制混剪",
    //           "alg": null
    //         },
    //         {
    //           "id": 13244,
    //           "name": "华语电影",
    //           "alg": null
    //         },
    //         {
    //           "id": 24127,
    //           "name": "电影",
    //           "alg": null
    //         }
    //       ],
    //       "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_1769497465_AtgXNMMc.webp?wsSecret=a54368b7f19791afcd0b1ef2abb901f9&wsTime=1668156689",
    //       "previewDurationms": 4000,
    //       "hasRelatedGameAd": false,
    //       "markTypes": null,
    //       "relateSong": [],
    //       "relatedInfo": null,
    //       "videoUserLiveInfo": null,
    //       "vid": "23BE941E41F16DC7CE9F320144CF88CC",
    //       "durationms": 326914,
    //       "playTime": 535197,
    //       "praisedCount": 2232,
    //       "praised": false,
    //       "subscribed": false
    //     }
    //   },
    //   {
    //     "type": 1,
    //     "displayed": false,
    //     "alg": "onlineHotGroup",
    //     "extAlg": null,
    //     "data": {
    //       "alg": "onlineHotGroup",
    //       "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
    //       "threadId": "R_VI_62_B97BE1A1FCB244E8B8D2C4D40968E185",
    //       "coverUrl": "https://p1.music.126.net/jSsM-ptVjBZroFVaVgnK5w==/109951164154333152.jpg",
    //       "height": 1080,
    //       "width": 1920,
    //       "title": "前方高能！！！感受这场视觉盛宴吧！游戏混剪/全程高燃",
    //       "description": "-求点赞/收藏/转发(๑•̀ㅂ•́)و✧-\n-视频封面来自Drakengard3-\n-视频素材欢迎大家视频下方补充！！-\n-视频背景音乐Lullaby-R3hab / Mike Williams-",
    //       "commentCount": 79,
    //       "shareCount": 158,
    //       "resolutions": [
    //         {
    //           "resolution": 240,
    //           "size": 22720629
    //         },
    //         {
    //           "resolution": 480,
    //           "size": 35742388
    //         },
    //         {
    //           "resolution": 720,
    //           "size": 50652153
    //         },
    //         {
    //           "resolution": 1080,
    //           "size": 92215930
    //         }
    //       ],
    //       "creator": {
    //         "defaultAvatar": false,
    //         "province": 510000,
    //         "authStatus": 0,
    //         "followed": false,
    //         "avatarUrl": "http://p1.music.126.net/mS8reRIof8wklMj4kGLBhw==/109951166602299816.jpg",
    //         "accountStatus": 0,
    //         "gender": 2,
    //         "city": 510100,
    //         "birthday": 881856000000,
    //         "userId": 310007605,
    //         "userType": 204,
    //         "nickname": "赤瞳混剪",
    //         "signature": "“爱意随风起，风止意难平！”感谢你的点赞支持！哔哩哔哩@赤瞳混剪 更多合作.建议Q2068738260",
    //         "description": "",
    //         "detailDescription": "",
    //         "avatarImgId": 109951166602299800,
    //         "backgroundImgId": 109951163524355970,
    //         "backgroundUrl": "http://p1.music.126.net/PNQZVUdynNohLfFPZzjLsg==/109951163524355960.jpg",
    //         "authority": 0,
    //         "mutual": false,
    //         "expertTags": null,
    //         "experts": {
    //           "1": "音乐视频达人"
    //         },
    //         "djStatus": 0,
    //         "vipType": 0,
    //         "remarkName": null,
    //         "backgroundImgIdStr": "109951163524355960",
    //         "avatarImgIdStr": "109951166602299816"
    //       },
    //       "urlInfo": null,
    //       "videoGroup": [
    //         {
    //           "id": 58101,
    //           "name": "听BGM",
    //           "alg": null
    //         },
    //         {
    //           "id": 2103,
    //           "name": "游戏",
    //           "alg": null
    //         },
    //         {
    //           "id": 57104,
    //           "name": "ACG音乐",
    //           "alg": null
    //         },
    //         {
    //           "id": 59114,
    //           "name": "GMV",
    //           "alg": null
    //         },
    //         {
    //           "id": 14104,
    //           "name": "网络游戏",
    //           "alg": null
    //         }
    //       ],
    //       "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_2540780187_FA4g3YM1.webp?wsSecret=3aa3c6a9ec3de980d6033820c606f583&wsTime=1668156689",
    //       "previewDurationms": 4000,
    //       "hasRelatedGameAd": false,
    //       "markTypes": null,
    //       "relateSong": [
    //         {
    //           "name": "Lullaby",
    //           "id": 529557738,
    //           "pst": 0,
    //           "t": 0,
    //           "ar": [
    //             {
    //               "id": 197248,
    //               "name": "R3HAB",
    //               "tns": [],
    //               "alias": []
    //             },
    //             {
    //               "id": 302020,
    //               "name": "Mike Williams",
    //               "tns": [],
    //               "alias": []
    //             }
    //           ],
    //           "alia": [],
    //           "pop": 100,
    //           "st": 0,
    //           "rt": null,
    //           "fee": 8,
    //           "v": 26,
    //           "crbt": null,
    //           "cf": "",
    //           "al": {
    //             "id": 37252068,
    //             "name": "Lullaby",
    //             "picUrl": "http://p4.music.126.net/Dy67aVabKMf8TzajdW-SIQ==/109951163109495697.jpg",
    //             "tns": [],
    //             "pic_str": "109951163109495697",
    //             "pic": 109951163109495700
    //           },
    //           "dt": 160183,
    //           "h": {
    //             "br": 320000,
    //             "fid": 0,
    //             "size": 6410493,
    //             "vd": -69004
    //           },
    //           "m": {
    //             "br": 192000,
    //             "fid": 0,
    //             "size": 3846313,
    //             "vd": -69004
    //           },
    //           "l": {
    //             "br": 128000,
    //             "fid": 0,
    //             "size": 2564223,
    //             "vd": -69004
    //           },
    //           "a": null,
    //           "cd": "1",
    //           "no": 1,
    //           "rtUrl": null,
    //           "ftype": 0,
    //           "rtUrls": [],
    //           "djId": 0,
    //           "copyright": 1,
    //           "s_id": 0,
    //           "rurl": null,
    //           "mst": 9,
    //           "cp": 1416676,
    //           "mv": 5806240,
    //           "rtype": 0,
    //           "publishTime": 1516896000007,
    //           "privilege": {
    //             "id": 529557738,
    //             "fee": 8,
    //             "payed": 0,
    //             "st": 0,
    //             "pl": 128000,
    //             "dl": 0,
    //             "sp": 7,
    //             "cp": 1,
    //             "subp": 1,
    //             "cs": false,
    //             "maxbr": 999000,
    //             "fl": 128000,
    //             "toast": false,
    //             "flag": 4,
    //             "preSell": false
    //           }
    //         }
    //       ],
    //       "relatedInfo": null,
    //       "videoUserLiveInfo": null,
    //       "vid": "B97BE1A1FCB244E8B8D2C4D40968E185",
    //       "durationms": 185203,
    //       "playTime": 205349,
    //       "praisedCount": 1356,
    //       "praised": false,
    //       "subscribed": false
    //     }
    //   },
    //   {
    //     "type": 1,
    //     "displayed": false,
    //     "alg": "onlineHotGroup",
    //     "extAlg": null,
    //     "data": {
    //       "alg": "onlineHotGroup",
    //       "scm": "1.music-video-timeline.video_timeline.video.181017.-295043608",
    //       "threadId": "R_VI_62_E0EAB5881BCE4359CD2C68C6D57EAF96",
    //       "coverUrl": "https://p1.music.126.net/cE0Oeqxhqk5zPdk8xU6D8w==/109951163802632528.jpg",
    //       "height": 720,
    //       "width": 1280,
    //       "title": "女人的复仇有很多种，这一次我看的最爽。",
    //       "description": "",
    //       "commentCount": 41,
    //       "shareCount": 52,
    //       "resolutions": [
    //         {
    //           "resolution": 240,
    //           "size": 20608405
    //         },
    //         {
    //           "resolution": 480,
    //           "size": 34194214
    //         },
    //         {
    //           "resolution": 720,
    //           "size": 53162079
    //         }
    //       ],
    //       "creator": {
    //         "defaultAvatar": false,
    //         "province": 440000,
    //         "authStatus": 0,
    //         "followed": false,
    //         "avatarUrl": "http://p1.music.126.net/6r6gsZCqdaeZlINrq1lObA==/109951163295092570.jpg",
    //         "accountStatus": 0,
    //         "gender": 1,
    //         "city": 440300,
    //         "birthday": 613152000000,
    //         "userId": 49515016,
    //         "userType": 0,
    //         "nickname": "听音乐选电影",
    //         "signature": "关注《听音乐选电影》，以音乐品人生，以电影尉时光。 ",
    //         "description": "",
    //         "detailDescription": "",
    //         "avatarImgId": 109951163295092580,
    //         "backgroundImgId": 109951163298515970,
    //         "backgroundUrl": "http://p1.music.126.net/WV4DuzXYCASe8NY1k8Mxqg==/109951163298515968.jpg",
    //         "authority": 0,
    //         "mutual": false,
    //         "expertTags": null,
    //         "experts": {
    //           "1": "音乐原创视频达人"
    //         },
    //         "djStatus": 0,
    //         "vipType": 11,
    //         "remarkName": null,
    //         "backgroundImgIdStr": "109951163298515968",
    //         "avatarImgIdStr": "109951163295092570"
    //       },
    //       "urlInfo": null,
    //       "videoGroup": [
    //         {
    //           "id": 58101,
    //           "name": "听BGM",
    //           "alg": null
    //         },
    //         {
    //           "id": 1105,
    //           "name": "最佳饭制",
    //           "alg": null
    //         },
    //         {
    //           "id": 3107,
    //           "name": "混剪",
    //           "alg": null
    //         },
    //         {
    //           "id": 3100,
    //           "name": "影视",
    //           "alg": null
    //         },
    //         {
    //           "id": 15112,
    //           "name": "欧美电影",
    //           "alg": null
    //         },
    //         {
    //           "id": 13225,
    //           "name": "剧情",
    //           "alg": null
    //         },
    //         {
    //           "id": 76106,
    //           "name": "饭制混剪",
    //           "alg": null
    //         },
    //         {
    //           "id": 24127,
    //           "name": "电影",
    //           "alg": null
    //         }
    //       ],
    //       "previewUrl": "http://vodkgeyttp9.vod.126.net/vodkgeyttp8/preview_2262681087_nN8Ymdnr.webp?wsSecret=75ee178535d7e27070e0c4f1894cc83e&wsTime=1668156689",
    //       "previewDurationms": 4000,
    //       "hasRelatedGameAd": false,
    //       "markTypes": null,
    //       "relateSong": [
    //         {
    //           "name": "Don't Follow Me",
    //           "id": 34248357,
    //           "pst": 0,
    //           "t": 0,
    //           "ar": [
    //             {
    //               "id": 860517,
    //               "name": "Ella Eyre",
    //               "tns": [],
    //               "alias": []
    //             }
    //           ],
    //           "alia": [],
    //           "pop": 95,
    //           "st": 0,
    //           "rt": null,
    //           "fee": 8,
    //           "v": 16,
    //           "crbt": null,
    //           "cf": "",
    //           "al": {
    //             "id": 3181004,
    //             "name": "Feline",
    //             "picUrl": "http://p3.music.126.net/FdYjM5ro6kt4sk2c5jEJzw==/7957165651273864.jpg",
    //             "tns": [],
    //             "pic": 7957165651273864
    //           },
    //           "dt": 209652,
    //           "h": {
    //             "br": 320000,
    //             "fid": 0,
    //             "size": 8386394,
    //             "vd": -61628
    //           },
    //           "m": {
    //             "br": 192000,
    //             "fid": 0,
    //             "size": 5031853,
    //             "vd": -61628
    //           },
    //           "l": {
    //             "br": 128000,
    //             "fid": 0,
    //             "size": 3354583,
    //             "vd": -61628
    //           },
    //           "a": null,
    //           "cd": "1",
    //           "no": 16,
    //           "rtUrl": null,
    //           "ftype": 0,
    //           "rtUrls": [],
    //           "djId": 0,
    //           "copyright": 0,
    //           "s_id": 0,
    //           "rurl": null,
    //           "mst": 9,
    //           "cp": 7003,
    //           "mv": 0,
    //           "rtype": 0,
    //           "publishTime": 1439481600007,
    //           "privilege": {
    //             "id": 34248357,
    //             "fee": 8,
    //             "payed": 0,
    //             "st": 0,
    //             "pl": 128000,
    //             "dl": 0,
    //             "sp": 7,
    //             "cp": 1,
    //             "subp": 1,
    //             "cs": false,
    //             "maxbr": 320000,
    //             "fl": 128000,
    //             "toast": false,
    //             "flag": 260,
    //             "preSell": false
    //           }
    //         }
    //       ],
    //       "relatedInfo": null,
    //       "videoUserLiveInfo": null,
    //       "vid": "E0EAB5881BCE4359CD2C68C6D57EAF96",
    //       "durationms": 296333,
    //       "playTime": 252808,
    //       "praisedCount": 1036,
    //       "praised": false,
    //       "subscribed": false
    //     }
    //   }
    // ];
    // let videoList = this.data.videoList;
    // videoList.push(...newVideoList);
    // this.setData({
    //   videoList
    // })
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
  onShareAppMessage({ from }) {
    return {
      title: "自定义内容",
      page: "/pages/video/video",
      imageUrl: "/static/images/nvsheng.jpg"
    }
  }
})