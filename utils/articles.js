function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDayKey(date) {
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-')
}

function formatDateTime(date) {
  return [
    formatDayKey(date),
    [pad(date.getHours()), pad(date.getMinutes())].join(':')
  ].join(' ')
}

function daysBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function collectThemes(items) {
  var counts = {}
  items.forEach(function (item) {
    item.tags.forEach(function (tag) {
      counts[tag] = (counts[tag] || 0) + 1
    })
  })

  return Object.keys(counts)
    .sort(function (left, right) {
      return counts[right] - counts[left]
    })
    .map(function (tag) {
      return tag + ' · ' + counts[tag] + '次'
    })
}

function seedArticles(now) {
  var yesterday = new Date(now.getTime())
  yesterday.setDate(yesterday.getDate() - 1)

  var threeDaysAgo = new Date(now.getTime())
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  return [
    {
      id: 'seed-1',
      title: '我把提示词、知识库、公众号收藏接成一个循环',
      source: '效率研究所',
      excerpt: '从信息输入到自动回顾，关键不是记得更多，而是形成固定的整理路径。',
      url: 'https://mp.weixin.qq.com/s/example-1',
      tags: ['提示词', '知识库', '自动回顾'],
      savedAt: yesterday.getTime(),
      note: '归入昨日灵感。'
    },
    {
      id: 'seed-2',
      title: '真正有用的灵感系统，不是收藏，而是二次重组',
      source: '第二大脑手册',
      excerpt: '当一周内的多篇文章围绕相同主题出现，应该自动识别并连成主题线。',
      url: 'https://mp.weixin.qq.com/s/example-2',
      tags: ['灵感系统', '二次重组', '主题线'],
      savedAt: threeDaysAgo.getTime(),
      note: '归入本周脉络。'
    }
  ]
}

function articleFromInput(url, now) {
  var title = '从公众号文章进入整理链路'
  var source = '微信导入文章'
  var excerpt = '从链接导入后，进入今日收件箱，等待晚间整理或周回顾。'
  var tags = ['公众号文章', '待整理', '知识归档']

  if (url.indexOf('ai') > -1) {
    title = 'AI 相关文章已导入助手'
    source = 'AI 观察'
    excerpt = '这篇文章围绕 AI 工作流与知识管理，可与本周灵感自动串联。'
    tags = ['AI 工作流', '知识管理', '公众号灵感']
  } else if (url.indexOf('note') > -1) {
    title = '笔记系统文章已导入助手'
    source = '笔记方法论'
    excerpt = '这篇内容更偏向二次整理与复盘，适合和周报主题结合。'
    tags = ['笔记系统', '二次整理', '复盘']
  }

  return {
    id: 'article-' + now.getTime(),
    title: title,
    source: source,
    excerpt: excerpt,
    url: url,
    tags: tags,
    savedAt: now.getTime(),
    note: '已放入今日收件箱。'
  }
}

function buildDigest(messages, mode, now) {
  var scoped = mode === 'day'
    ? messages.filter(function (item) {
      return formatDayKey(new Date(item.savedAt)) === formatDayKey(now)
    })
    : messages.filter(function (item) {
      return daysBetween(new Date(item.savedAt), now) < 7
    })

  if (!scoped.length) {
    return {
      title: mode === 'day' ? '今日整理' : '本周脉络',
      summary: '还没有可整理内容，先导入一篇公众号文章试试。',
      themes: [],
      timeline: []
    }
  }

  return {
    title: mode === 'day' ? '今日整理' : '本周脉络',
    summary: mode === 'day'
      ? '今天共收录 ' + scoped.length + ' 条文章，可在今晚整理成一条发送给自己的回顾消息。'
      : '最近 7 天共收录 ' + scoped.length + ' 条文章，已经形成可串联的主题周报。',
    themes: collectThemes(scoped).slice(0, 4),
    timeline: scoped.map(function (item, index) {
      return (index + 1) + '. ' + item.title + ' → ' + item.excerpt
    })
  }
}

function buildTransferText(messages, mode, now) {
  var digest = buildDigest(messages, mode, now)
  var lines = [
    '【' + digest.title + '】',
    digest.summary
  ]

  if (digest.themes.length) {
    lines.push('主题：' + digest.themes.join(' / '))
  }

  if (digest.timeline.length) {
    lines.push('线索：')
    digest.timeline.forEach(function (line) {
      lines.push(line)
    })
  }

  return lines.join('\n')
}

module.exports = {
  articleFromInput: articleFromInput,
  buildDigest: buildDigest,
  buildTransferText: buildTransferText,
  collectThemes: collectThemes,
  formatDateTime: formatDateTime,
  seedArticles: seedArticles
}
