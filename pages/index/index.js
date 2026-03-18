const {
  buildDigest,
  createMessageFromArticle,
  formatDateTime,
  formatShortTime,
  getCurrentArticle,
  seedMessages
} = require('../../utils/articles')

Page({
  data: {
    mode: 'day',
    article: null,
    messages: [],
    digest: {
      title: '今日整理',
      summary: '',
      themes: [],
      items: []
    }
  },

  onLoad() {
    const now = new Date()
    const article = getCurrentArticle(now)
    const messages = seedMessages(now)

    this.now = now
    this.setData({
      article: article,
      messages: this.decorateMessages(messages)
    })
    this.refreshDigest()
  },

  sendToAssistant() {
    const now = new Date()
    const newMessage = createMessageFromArticle(this.data.article, now)
    const rawMessages = [newMessage].concat(this.data.messages.map(this.restoreRawMessage))

    this.now = now
    this.setData({
      article: Object.assign({}, this.data.article, {
        dateLabel: formatDateTime(now)
      }),
      messages: this.decorateMessages(rawMessages)
    })
    this.refreshDigest()

    wx.showToast({
      title: '已发送到助手',
      icon: 'success'
    })
  },

  toggleMode() {
    this.setData({
      mode: this.data.mode === 'day' ? 'week' : 'day'
    })
    this.refreshDigest()
  },

  refreshDigest() {
    const digest = buildDigest(this.data.messages.map(this.restoreRawMessage), this.data.mode, this.now || new Date())
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
          displayTime: formatShortTime(new Date(item.savedAt))
        })
      })
  },

  restoreRawMessage(item) {
    return {
      id: item.id,
      title: item.title,
      author: item.author,
      excerpt: item.excerpt,
      tags: item.tags,
      points: item.points,
      savedAt: item.savedAt,
      summaryCards: item.summaryCards,
      note: item.note
    }
  }
})
