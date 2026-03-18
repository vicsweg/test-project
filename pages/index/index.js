const {
  articleFromInput,
  buildDigest,
  buildTransferText,
  formatDateTime,
  seedArticles
} = require('../../utils/articles')

Page({
  data: {
    articleUrl: '',
    mode: 'day',
    messages: [],
    digest: {
      title: '今日整理',
      summary: '',
      themes: [],
      timeline: []
    },
    canUseClipboard: typeof wx.setClipboardData === 'function',
    supportMessage: '说明：小程序可以在微信里使用，但不能直接控制“文件传输助手”会话；当前采用“复制整理结果/转发卡片”的可落地方案。'
  },

  onLoad() {
    const now = new Date()
    const messages = seedArticles(now)
    this.now = now
    this.setData({
      messages: this.decorateMessages(messages)
    })
    this.refreshDigest()
  },

  onShareAppMessage() {
    return {
      title: '文章线索助手：把公众号文章按天/周整理起来',
      path: '/pages/index/index'
    }
  },

  handleUrlInput(event) {
    this.setData({
      articleUrl: event.detail.value.trim()
    })
  },

  fillDemoLink() {
    this.setData({
      articleUrl: 'https://mp.weixin.qq.com/s/ai-workflow-demo'
    })
  },

  importArticle() {
    const articleUrl = this.data.articleUrl
    if (!articleUrl) {
      wx.showToast({
        title: '先贴一个文章链接',
        icon: 'none'
      })
      return
    }

    const now = new Date()
    const article = articleFromInput(articleUrl, now)
    const messages = [article].concat(this.data.messages.map(this.restoreRawMessage))

    this.now = now
    this.setData({
      articleUrl: '',
      messages: this.decorateMessages(messages)
    })
    this.refreshDigest()

    wx.showToast({
      title: '已收进助手',
      icon: 'success'
    })
  },

  toggleMode() {
    this.setData({
      mode: this.data.mode === 'day' ? 'week' : 'day'
    })
    this.refreshDigest()
  },

  pasteFromClipboard() {
    const page = this
    wx.getClipboardData({
      success(res) {
        page.setData({
          articleUrl: (res.data || '').trim()
        })
      },
      fail() {
        wx.showToast({
          title: '读取剪贴板失败',
          icon: 'none'
        })
      }
    })
  },

  copyDigest() {
    const text = buildTransferText(this.data.messages.map(this.restoreRawMessage), this.data.mode, this.now || new Date())
    wx.setClipboardData({
      data: text,
      success() {
        wx.showToast({
          title: '已复制整理结果',
          icon: 'success'
        })
      }
    })
  },

  refreshDigest() {
    const messages = this.data.messages.map(this.restoreRawMessage)
    const digest = buildDigest(messages, this.data.mode, this.now || new Date())
    this.setData({
      digest: digest
    })
  },

  decorateMessages(messages) {
    return messages
      .slice()
      .sort(function (left, right) {
        return right.savedAt - left.savedAt
      })
      .map(function (item) {
        return Object.assign({}, item, {
          displayTime: formatDateTime(new Date(item.savedAt))
        })
      })
  },

  restoreRawMessage(item) {
    return {
      id: item.id,
      title: item.title,
      source: item.source,
      excerpt: item.excerpt,
      url: item.url,
      tags: item.tags,
      savedAt: item.savedAt,
      note: item.note
    }
  }
})
