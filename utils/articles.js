function pad(value) {
  return String(value).padStart(2, '0')
}

function formatDayKey(date) {
  return [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join('-')
}

function formatDateTime(date) {
  return [
    date.getFullYear() + '年' + pad(date.getMonth() + 1) + '月' + pad(date.getDate()) + '日',
    pad(date.getHours()) + ':' + pad(date.getMinutes())
  ].join(' ')
}

function formatShortTime(date) {
  return pad(date.getMonth() + 1) + '月' + pad(date.getDate()) + '日 ' + pad(date.getHours()) + ':' + pad(date.getMinutes())
}

function daysBetween(a, b) {
  return Math.floor((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function getCurrentArticle(now) {
  return {
    id: 'current-article',
    title: '把 AI 工作流连点成线：今天看到的内容，今晚自动整理给自己',
    author: '连点成线实验室',
    dateLabel: formatDateTime(now),
    excerpt: '轻点一个圆形按钮，即可把当前公众号文章发送到文件传输助手；系统按天归档、按周串联，再整理回发给你。',
    paragraphs: [
      '当你刷到一篇值得存档的公众号文章时，往往要么收藏后就沉底，要么手动转发给文件传输助手，后续仍然缺少按天、按周的统一整理。',
      '这个小程序版本保留了原来网页原型的核心体验：文章页右下角放一个类似苹果风格的圆形按钮，轻点一下，就把当前文章作为一条消息发送到“文件传输助手”。',
      '文件传输助手会自动把当天保存的内容归档到“今日灵感”，并在周维度生成“本周脉络”，将多条消息串联成线索再回发给你。'
    ],
    tags: ['AI 工作流', '知识管理', '公众号灵感'],
    points: [
      '用一次点击替代“收藏后遗忘”',
      '让当天输入的信息在晚上自动回看',
      '把一周内重复出现的主题连成同一条主线'
    ],
    summaryCards: {
      problem: '收藏动作太轻，回顾动作太重，导致优质文章最终没有进入自己的知识系统。',
      method: '通过一个固定入口把文章送入同一个收件箱，再按日/周自动聚合，降低整理启动成本。',
      value: '把零散阅读变成连续复盘，让信息输入最终能够反哺输出。'
    }
  }
}

function seedMessages(now) {
  var yesterday = new Date(now.getTime())
  yesterday.setDate(yesterday.getDate() - 1)

  var threeDaysAgo = new Date(now.getTime())
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)

  return [
    {
      id: 'seed-1',
      title: '我把提示词、知识库、公众号收藏接成一个循环',
      author: '效率研究所',
      excerpt: '从信息输入到自动回顾，关键不是记得更多，而是形成固定的整理路径。',
      tags: ['提示词', '知识库', '自动回顾'],
      points: ['输入内容要回流到回顾系统', '提示词和知识库应该互相喂养'],
      summaryCards: {
        problem: '很多知识输入停留在收集阶段，没有形成后续使用闭环。',
        method: '把提示词、知识库和收藏内容统一放进同一条整理流程。',
        value: '形成一套可重复执行的输入到输出路径。'
      },
      savedAt: yesterday.getTime(),
      note: '归入昨日灵感。'
    },
    {
      id: 'seed-2',
      title: '真正有用的灵感系统，不是收藏，而是二次重组',
      author: '第二大脑手册',
      excerpt: '当一周内的多篇文章围绕相同主题出现，应该自动识别并连成主题线。',
      tags: ['灵感系统', '二次重组', '主题线'],
      points: ['收藏只是输入，重组才产生价值', '同主题重复出现时适合做周报'],
      summaryCards: {
        problem: '信息越积越多，但没有真正转化为可执行的认识。',
        method: '按主题把多篇文章重新编排，而不是按时间堆积。',
        value: '让灵感系统从仓库变成决策辅助工具。'
      },
      savedAt: threeDaysAgo.getTime(),
      note: '归入本周脉络。'
    }
  ]
}

function createMessageFromArticle(article, now) {
  return {
    id: 'message-' + now.getTime(),
    title: article.title,
    author: article.author,
    excerpt: article.excerpt,
    tags: article.tags.slice(),
    points: article.points.slice(),
    summaryCards: article.summaryCards,
    savedAt: now.getTime(),
    note: '已发送到文件传输助手，等待按天/按周整理。'
  }
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
      return tag + ' · 提到 ' + counts[tag] + ' 次'
    })
}

function collectTopPoints(items) {
  var points = []

  items.forEach(function (item) {
    item.points.forEach(function (point) {
      if (points.indexOf(point) === -1) {
        points.push(point)
      }
    })
  })

  return points.slice(0, 4)
}

function buildConnections(items, mode) {
  var titles = items.map(function (item) {
    return '《' + item.title + '》'
  })

  if (mode === 'day') {
    return '今天这些内容能串起来，是因为它们都在解决同一个问题：如何把“看到”变成“整理过、可回看、可复用”的资产。' + (titles.length ? '当前最值得一起回看的内容包括：' + titles.join('、') + '。' : '')
  }

  return '本周这些内容反复指向同一条主线：知识输入不能只停留在收藏，而要进入“归档 → 重组 → 回顾 → 输出”的循环。' + (titles.length ? '形成主线的文章包括：' + titles.join('、') + '。' : '')
}

function buildActions(items, mode) {
  var actions = [
    '先挑 1 条最重要的观点，写成一句你自己的结论。',
    '把重复出现的主题建成一个固定清单，后续文章都归到这条线上。'
  ]

  if (mode === 'day') {
    actions.unshift('今晚把今天收录的内容压缩成 3 条复盘笔记，再发给自己。')
  } else {
    actions.unshift('把本周重复出现的内容整理成一份周报，沉淀为下周的行动方向。')
  }

  if (items.length > 1) {
    actions.push('优先比较这些文章之间“重复出现的判断”，不要只记录单篇内容。')
  }

  return actions
}

function buildArticleBriefs(items) {
  return items.map(function (item) {
    return {
      title: item.title,
      author: item.author,
      problem: item.summaryCards.problem,
      method: item.summaryCards.method,
      value: item.summaryCards.value
    }
  })
}

function buildWeeklyChain(items, themes) {
  if (items.length < 2) {
    return []
  }

  return [
    '第 1 步：先把看到的内容统一收进一个入口，避免优质信息散落在收藏夹里。',
    '第 2 步：再按相同主题把内容合并，当前重复最多的是 ' + themes.slice(0, 2).join('、') + '。',
    '第 3 步：最后把重复出现的观点压缩成自己的判断，再转成周报或行动清单。'
  ]
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
      summary: '暂无可整理内容。点击文章右下角按钮，先把当前文章发送到文件传输助手。',
      themes: [],
      keyPoints: [],
      connections: '目前还没有形成可串联的内容。',
      actions: [],
      items: [],
      articleBriefs: [],
      weeklyChain: []
    }
  }

  var themes = collectThemes(scoped)
  var keyPoints = collectTopPoints(scoped)
  var titles = scoped.map(function (item) {
    return '《' + item.title + '》'
  }).join('、')

  return {
    title: mode === 'day' ? '今日整理' : '本周脉络',
    summary: mode === 'day'
      ? '今天共收录 ' + scoped.length + ' 条消息，重点围绕 ' + themes.slice(0, 2).join('、') + ' 展开。最适合的整理方式不是逐条转发，而是压缩成一份晚间回顾：' + titles + '。'
      : '本周已形成 ' + scoped.length + ' 条可串联线索，核心集中在 ' + themes.slice(0, 3).join('、') + '。这些内容已经足够整理成一份“连点成线”周报：' + titles + '。',
    themes: themes,
    keyPoints: keyPoints,
    connections: buildConnections(scoped, mode),
    actions: buildActions(scoped, mode),
    items: scoped.map(function (item) {
      return item.title + ' → ' + item.excerpt
    }),
    articleBriefs: buildArticleBriefs(scoped),
    weeklyChain: buildWeeklyChain(scoped, themes)
  }
}

module.exports = {
  buildDigest: buildDigest,
  collectThemes: collectThemes,
  createMessageFromArticle: createMessageFromArticle,
  formatDateTime: formatDateTime,
  formatShortTime: formatShortTime,
  getCurrentArticle: getCurrentArticle,
  seedMessages: seedMessages
}
