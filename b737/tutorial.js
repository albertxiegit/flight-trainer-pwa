(function () {
  'use strict';

  const CHAPTERS = [
    { id: 'basic', name: '基础操作' },
    { id: 'init', name: '初始化' },
    { id: 'fpln', name: '飞行计划' },
    { id: 'deparr', name: '离场程序' },
    { id: 'perf', name: '性能' },
    { id: 'legs', name: '航段检查' },
    { id: 'exec', name: '执行与完成' }
  ];

  const STEPS = [
    // 基础
    { chapter: 'basic', title: 'B1. CDU / FMC / FMS 是什么', text: '波音 737-800 上有两台完全相同的 CDU（Control Display Unit，控制显示组件），左右飞行员各一台。CDU 是你和 FMC 对话的屏幕与键盘；FMC（Flight Management Computer）才是真正计算导航与性能的计算机；FMS 则是包含 FMC、CDU、导航数据库及自动驾驶连接的整套系统。屏幕顶部是标题行，中间是 6 组行选键（LSK）对应的数据行，底部是草稿栏 SCRATCH。', manual: true, check: () => true },
    { chapter: 'basic', title: 'B2. 分离式数字/字母键盘', text: '注意：本练习器按真实 X-Plane CDU 面板图，采用分离键盘——左边 12 个圆形数字键（1-9、.、0、+/-），右边 5×6 方形字母键（A-Z、SP、DEL、/、CLR）。数字键直接输入数字，字母键直接输入字母，无需长短按。E、N、S 键上有白框，是波音 CDU 上的标记键。试着短按数字键 2。', hint: '按数字键 2 → 草稿栏出现 2', check: (s) => s.scratchpad === '2' },
    { chapter: 'basic', title: 'B3. 字母键输入', text: '右侧字母键直接输入对应字母。按 CLR 清空后，按字母 K 键，草稿栏会出现 K。机场代码、航路点都用字母键输入。', hint: 'CLR → 按 K → 草稿栏出现 K', check: (s) => s.scratchpad === 'K' },
    { chapter: 'basic', title: 'B4. CLR 清除草稿栏', text: 'CLR（Clear）键清空草稿栏中尚未提交的内容。如果草稿栏为空，它会清除 FMC 提示信息。按一下 CLR 把刚才的输入清掉。', hint: '按 CLR → 草稿栏清空', check: (s) => s.scratchpad === '' },
    { chapter: 'basic', title: 'B5. DEL 删除字段', text: 'DEL（Delete）与 CLR 不同：按 DEL 会在草稿栏放入 DELETE，再按要删除字段旁的 LSK，才会删除该字段的数据。这是 FCOM 的标准删除流程。按一下 DEL 看看。', hint: '按 DEL → 草稿栏显示 DELETE', check: (s) => s.scratchpad === 'DELETE' },
    { chapter: 'basic', title: 'B6. LSK 双向操作', text: '行选键 LSK 是双向的：草稿栏有内容时按 LSK = 把数据推入该行字段；草稿栏为空时按 LSK = 把该行字段的数据取回草稿栏。屏幕左右各 6 个，编号 1L–6L 与 1R–6R。', manual: true, check: () => true },
    { chapter: 'basic', title: 'B7. EXEC 键与执行灯', text: '面板右侧独立 EXEC 键，其上方有白色小灯。当页面出现 MOD（待执行修改）时，EXEC 灯亮；按 EXEC 后修改生效、灯灭。这就是波音 FMC 的核心 MOD → EXEC → ACT 流程。', manual: true, check: () => true },

    // 初始化（博客流程）
    { chapter: 'init', title: 'I1. INIT REF 查看数据库', text: '航前第一步：查看当前导航数据库版本（博客示例：2023年8月10日至9月7日）。必须确认数据库在有效期内才能用于导航。按功能键区左上角的 INIT REF 进入初始/参考索引，1L 的 IDENT 可查看有效期。', hint: '按 INIT REF，再按 1L IDENT', check: (s) => s.page === 'INIT REF' || s.page === 'IDENT' },
    { chapter: 'init', title: 'I2. MENU 返回主菜单', text: 'MENU 键回到 FMC 主菜单窗口，位于功能键区第二行第一列。从主菜单可以直接进入各功能页面。', manual: true, check: () => true },
    { chapter: 'init', title: 'I3. CLR 清除过期提示', text: '如果草稿栏出现 [NAV DATA OUT OF DATE]（导航数据过期）提示，按 CLR 清除它。这也演示了 CLR 清除 FMC 消息的用途。', manual: true, check: () => true },

    // 飞行计划
    { chapter: 'fpln', title: 'F1. RTE 进入飞行计划', text: '按 RTE 键进入航路（飞行计划）窗口，在这里输入起飞机场和目的地机场。博客示例：杭州萧山 ZSHC 飞往 ZBAD。', hint: '按 RTE 键', check: (s) => s.page === 'RTE' },
    { chapter: 'fpln', title: 'F2. 输入起飞机场 ZSHC', text: '用字母键输入四字 ICAO 代码 ZSHC，然后按左上角 LSK（1L）把它填入起点字段。必须是四字代码。', hint: 'ZSHC → 1L', check: (s) => s.data.origin === 'ZSHC' },
    { chapter: 'fpln', title: 'F3. 输入目的地 ZBAD', text: '用字母键输入 ZBAD，按右上角 LSK（1R）填入目的地。这样飞行计划就建立了起点和终点。', hint: 'ZBAD → 1R', check: (s) => s.data.dest === 'ZBAD' },
    { chapter: 'fpln', title: 'F4. 激活航路', text: '起终点都输入后，6L 出现 ACTIVATE> 提示。按 6L 激活航路——此时只是 MOD（待执行），还需要按 EXEC 才真正生效。', hint: '按 6L ACTIVATE>', check: (s) => s.modified },

    // 离场程序（博客核心）
    { chapter: 'deparr', title: 'D1. 离场页 DEP/ARR', text: '真机 CDU 的离场/进场页显示 ZSHC DEPART，列出 SID（标准仪表离场）和可用跑道。本练习器默认就打开在这个页面；按 RTE 后可从屏幕 6L 的提示返回。', hint: '当前即为离场页', check: (s) => s.page === 'DEPARTURES' },
    { chapter: 'deparr', title: 'D2. 选择跑道 RW06', text: '博客场景在 06 号跑道，点击 RW06 右侧按钮选定跑道。选跑道后 EXEC 灯亮，表示有程序待执行。试着选 RW06（1R）。', hint: '按 1R RW06', check: (s) => s.data.runway === 'RW06' },
    { chapter: 'deparr', title: 'D3. 选择离场程序 ABV91D', text: '从左侧选择离场程序 SID，博客示例为 ABV91D。选好后 EXEC 灯亮。试着按 5L 选 ABV91D。', hint: '按 5L ABV91D', check: (s) => s.data.sid === 'ABV91D' },
    { chapter: 'deparr', title: 'D4. 按 EXEC 执行', text: '程序选择后 EXEC 上方灯亮。按 EXEC，飞行计划才会真正显示到导航窗口。这是博客里最后一步，也是波音 FMC 最关键的执行动作。', hint: '按 EXEC', check: (s) => s.executed },
    { chapter: 'deparr', title: 'D5. DEP/ARR IDX 返回索引', text: '屏幕 6L 的 <DEP/ARR IDX 可返回离场/进场索引，FPLN> 跳回飞行计划。真机上这些是行选键提示。', manual: true, check: () => true },

    // 性能
    { chapter: 'perf', title: 'P1. PERF INIT 性能初始化', text: '按相关功能键进入 PERF INIT 性能初始化页。输入 GW（全机重）、ZFW（零燃油重）、RESERVES（储备油）、COST INDEX（成本指数）和 CRZ ALT（巡航高度）。没有这些数据，VNAV 无法接通。', manual: true, check: () => true },
    { chapter: 'perf', title: 'P2. N1 LIMIT 推力限制', text: 'N1 LIMIT 页可选择全额定 TOGA、减推力 TO-1/TO-2，或输入假设温度（SEL/OAT）实现减推力起飞。', manual: true, check: () => true },

    // 航段检查
    { chapter: 'legs', title: 'L1. LEGS 查看航段', text: '按 LEGS 键查看逐段航路点。LEGS 显示 VIA/TO、航迹、距离、速度与高度限制。博客里 EXEC 后就是到 LEGS 查看飞行程序。', hint: '按 LEGS 键', check: (s) => s.page === 'LEGS' },
    { chapter: 'legs', title: 'L2. STEP 逐段检查', text: '在 LEGS 页面可用 STEP 逐段查看飞行程序的各个航段，结合 AIP 航图核对。博客特别提醒：航图中 ABV-91D 过飞越点用 CF 编码，模拟机里更像 DF 编码，存在数据库编码应用风险。', manual: true, check: () => true },

    // 执行
    { chapter: 'exec', title: 'E1. MOD → EXEC → ACT', text: '这是波音 FMC 的核心理念。对激活的计划做修改时：标题出现 MOD、EXEC 白灯亮——修改已暂存但还没生效。按 EXEC 后标题变 ACT、灯灭、修改成为激活计划。', manual: true, check: () => true },
    { chapter: 'exec', title: 'E2. ERASE 放弃修改', text: '如果在按 EXEC 前反悔，按 6L 的 ERASE 可以放弃整组修改，标题恢复 ACT。这与空客的临时计划概念不同。', manual: true, check: () => true },
    { chapter: 'exec', title: 'E3. 完成', text: '你已经掌握了 737 CDU 的核心操作：分离式数字/字母键盘、草稿栏 + LSK 的输入逻辑、FPLN 飞行计划、DEP/ARR 离场程序、跑道与 SID 选择、LEGS 逐段检查，以及最重要的 MOD→EXEC→ACT 流程。', manual: true, check: () => true }
  ];

  let getState = null, getPageNote = null;
  let index = 0;
  let open = true;
  let mode = 'tutorial';
  const completed = new Set();
  const $ = (id) => document.getElementById(id);

  function chapterOf(i) { return STEPS[i].chapter; }
  function firstIndexOf(chapter) { const i = STEPS.findIndex((s) => s.chapter === chapter); return i < 0 ? 0 : i; }
  function chapterDone(chapter) { return STEPS.every((s, i) => s.chapter !== chapter || completed.has(i)); }

  function renderChapters() {
    const current = chapterOf(index);
    $('chapterNav').innerHTML = CHAPTERS.map((c) => {
      const cls = [c.id === current ? 'active' : '', chapterDone(c.id) ? 'done' : ''].filter(Boolean).join(' ');
      return `<button class="chapter-btn ${cls}" data-chapter="${c.id}" type="button">${c.name}</button>`;
    }).join('');
    document.querySelectorAll('.chapter-btn').forEach((b) => {
      b.addEventListener('click', () => { index = firstIndexOf(b.dataset.chapter); render(); });
    });
  }

  function render() {
    const s = getState ? getState() : { scratchpad: '', page: 'DEPARTURES', data: {} };
    const step = STEPS[index];
    renderChapters();
    $('tutorialTitle').textContent = step.title;
    $('tutorialText').innerHTML = step.text + (step.hint ? `<span class="hint">提示：${step.hint}</span>` : '');
    $('pageNote').textContent = getPageNote ? getPageNote() : '';
    $('progress').innerHTML = `<span style="width:${Math.round((completed.size / STEPS.length) * 100)}%"></span>`;
    const list = $('stepList');
    list.innerHTML = STEPS.map((st, i) => {
      const cls = completed.has(i) ? 'done' : (i === index ? 'current' : '');
      return `<li class="${cls}" data-index="${i}">${st.title}</li>`;
    }).join('');
    document.querySelectorAll('#stepList li').forEach((li) => {
      li.addEventListener('click', () => { index = Number(li.dataset.index); render(); });
    });
    $('prevStep').disabled = index === 0;
    $('nextStep').disabled = false;
    $('nextStep').textContent = index === STEPS.length - 1 ? '完成' : '下一步';
    $('tutorial').classList.toggle('hidden', !open);
    checkCurrent(s);
  }

  function checkCurrent(s) {
    const step = STEPS[index];
    if (!step.manual && step.check && step.check(s)) {
      if (!completed.has(index)) { completed.add(index); render(); }
    }
  }

  function renderGlossary() {
    const q = ($('termSearch') ? $('termSearch').value : '').trim().toLowerCase();
    const G = window.B737_GLOSSARY || {};
    const items = Object.keys(G).filter((k) => !q || (k + ' ' + G[k]).toLowerCase().includes(q));
    $('termList').innerHTML = items.map((k) => `<div class="term-item"><b>${k}</b> <span>${G[k]}</span></div>`).join('') || '<div class="page-note">没有匹配术语</div>';
  }

  function setMode(next) {
    mode = next;
    $('viewTutorial').classList.toggle('hidden', mode !== 'tutorial');
    $('viewGlossary').classList.toggle('hidden', mode !== 'glossary');
    $('tabTutorial').classList.toggle('active', mode === 'tutorial');
    $('tabGlossary').classList.toggle('active', mode === 'glossary');
    if (mode === 'glossary') renderGlossary();
  }

  function init(stateGetter, pageNoteGetter) {
    getState = stateGetter; getPageNote = pageNoteGetter;
    $('prevStep').addEventListener('click', () => { if (index > 0) { index -= 1; render(); } });
    $('nextStep').addEventListener('click', () => { if (index < STEPS.length - 1) index += 1; render(); });
    $('skipStep').addEventListener('click', () => { completed.add(index); if (index < STEPS.length - 1) index += 1; render(); });
    $('closeTutorial').addEventListener('click', () => { open = false; render(); });
    $('tabTutorial').addEventListener('click', () => setMode('tutorial'));
    $('tabGlossary').addEventListener('click', () => setMode('glossary'));
    if ($('termSearch')) $('termSearch').addEventListener('input', renderGlossary);
    setMode('tutorial'); render();
  }

  function showTutorial() { open = true; setMode('tutorial'); render(); }
  function showGlossary() { open = true; setMode('glossary'); render(); }
  function notify() { if (getState) checkCurrent(getState()); }

  window.B737_TUTORIAL = { init, showTutorial, showGlossary, notify };
})();
