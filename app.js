const article = {
  id: crypto.randomUUID(),
  title: '把 AI 工作流连点成线：今天看到的内容，今晚自动整理给自己',
  author: '连点成线实验室',
  excerpt:
    '轻点一个圆形按钮，即可把当前公众号文章发送到文件传输助手；系统按天归档、按周串联，再整理回发给你。',
  contentTags: ['AI 工作流', '知识管理', '公众号灵感'],
};

const state = {
  mode: 'day',
  savedMessages: [],
};

const articleDate = document.getElementById('article-date');
const messagesEl = document.getElementById('messages');
const digestEl = document.getElementById('digest');
const digestTitleEl = document.getElementById('digest-title');
const saveButton = document.getElementById('save-button');
const summaryButton = document.getElementById('summary-mode');
const toast = document.getElementById('toast');
const messageTemplate = document.getElementById('message-template');

const now = new Date();
articleDate.textContent = new Intl.DateTimeFormat('zh-CN', {
  dateStyle: 'long',
  timeStyle: 'short',
}).format(now);

autoSeedHistory();
render();

saveButton.addEventListener('click', () => {
  const timestamp = new Date();
  state.savedMessages.unshift({
    ...article,
    savedAt: timestamp,
    note: '已发送到文件传输助手，等待按天/周整理。',
  });

  render();
  showToast('已放入文件传输助手，并加入今日整理队列。');
});

summaryButton.addEventListener('click', () => {
  state.mode = state.mode === 'day' ? 'week' : 'day';
  summaryButton.textContent = state.mode === 'day' ? '切换为周整理' : '切换为日整理';
  renderDigest();
});

function autoSeedHistory() {
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const threeDaysAgo = new Date(now);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  state.savedMessages.push(
    {
      id: crypto.randomUUID(),
      title: '我把提示词、知识库、公众号收藏接成一个循环',
      author: '效率研究所',
      excerpt: '从信息输入到自动回顾，关键不是记得更多，而是形成固定的整理路径。',
      contentTags: ['提示词', '知识库', '自动回顾'],
      savedAt: yesterday,
      note: '归入昨日灵感。',
    },
    {
      id: crypto.randomUUID(),
      title: '真正有用的灵感系统，不是收藏，而是二次重组',
      author: '第二大脑手册',
      excerpt: '当一周内的多篇文章围绕相同主题出现，应该自动识别并连成主题线。',
      contentTags: ['灵感系统', '二次重组', '主题线'],
      savedAt: threeDaysAgo,
      note: '归入本周脉络。',
    }
  );
}

function render() {
  renderMessages();
  renderDigest();
}

function renderMessages() {
  messagesEl.innerHTML = '';

  if (state.savedMessages.length === 0) {
    messagesEl.innerHTML = '<div class="empty-state">还没有收录消息。点击右下角圆形按钮，模拟把文章发到文件传输助手。</div>';
    return;
  }

  state.savedMessages
    .slice()
    .sort((a, b) => b.savedAt - a.savedAt)
    .forEach((message) => {
      const fragment = messageTemplate.content.cloneNode(true);
      fragment.querySelector('time').textContent = formatTimestamp(message.savedAt);
      fragment.querySelector('h4').textContent = message.title;
      fragment.querySelector('p').textContent = `${message.excerpt} ${message.note}`;
      messagesEl.appendChild(fragment);
    });
}

function renderDigest() {
  digestEl.innerHTML = '';
  const groupedMessages = state.mode === 'day' ? groupByDay(state.savedMessages) : groupByWeek(state.savedMessages);
  digestTitleEl.textContent = state.mode === 'day' ? '今日整理' : '本周脉络';

  if (groupedMessages.length === 0) {
    digestEl.innerHTML = '<div class="empty-state">暂无可整理内容。</div>';
    return;
  }

  groupedMessages.forEach((group) => {
    const wrapper = document.createElement('article');
    wrapper.className = 'digest-item';

    const heading = document.createElement('h4');
    heading.textContent = group.label;

    const summary = document.createElement('p');
    summary.textContent = buildSummary(group.items, state.mode);

    const bulletList = document.createElement('ul');
    collectThemes(group.items).forEach((theme) => {
      const li = document.createElement('li');
      li.textContent = theme;
      bulletList.appendChild(li);
    });

    wrapper.append(heading, summary, bulletList);
    digestEl.appendChild(wrapper);
  });
}

function groupByDay(messages) {
  const todayKey = formatDayKey(now);
  const todayItems = messages.filter((message) => formatDayKey(message.savedAt) === todayKey);

  return todayItems.length
    ? [{ label: '今天收录的消息', items: todayItems }]
    : [];
}

function groupByWeek(messages) {
  const weekItems = messages.filter((message) => daysBetween(message.savedAt, now) < 7);

  return weekItems.length
    ? [{ label: '最近 7 天主题串联', items: weekItems }]
    : [];
}

function buildSummary(items, mode) {
  const titles = items.map((item) => `《${item.title}》`).join('、');

  if (mode === 'day') {
    return `今天共收录 ${items.length} 条消息，重点围绕 ${collectThemes(items).slice(0, 2).join('、')} 展开，可在今晚统一回顾：${titles}。`;
  }

  return `本周已形成 ${items.length} 条可串联线索，从 ${collectThemes(items).slice(0, 3).join('、')} 几个方向反复出现，建议整理为一份“连点成线”周报：${titles}。`;
}

function collectThemes(items) {
  const themeCounts = new Map();
  items.flatMap((item) => item.contentTags).forEach((theme) => {
    themeCounts.set(theme, (themeCounts.get(theme) || 0) + 1);
  });

  return [...themeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([theme, count]) => `${theme} · 提到 ${count} 次`);
}

function formatTimestamp(date) {
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDayKey(date) {
  return date.toISOString().slice(0, 10);
}

function daysBetween(a, b) {
  return Math.floor((b - a) / (1000 * 60 * 60 * 24));
}

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 1800);
}
