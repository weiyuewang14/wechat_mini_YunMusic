
// 发送 ajax 请求
import config from "./config"
export default (url, data = {}, method = "GET") => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.ipHost + url,
      data,
      method,
      header: {
        // cookie不要写错了，请求头里的是cookie
        cookie: wx.getStorageSync('cookies') ? wx.getStorageSync('cookies').find(item => item.indexOf('MUSIC_U') !== -1) : ""
      },
      success: (res) => {

        if (data.isLogin) {
          wx.setStorage({ key: 'cookies', data: res.cookies })
        }
        resolve(res.data)
      },
      fail: (err) => {
        reject(err)
      }
    })
  });

}
