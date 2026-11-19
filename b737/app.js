(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const STORE_KEY = 'b737CduStateV1';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function decorate(text) {
    const G = window.B737_GLOSSARY || {};
    const keys = Object.keys(G).sort((a, b) => b.length - a.length);
    if (!keys.length) return esc(text);
    const re = new RegExp('(' + keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
    return esc(text).replace(re, (m) => `<abbr class="abbr" title="${esc(G[m])}">${m}</abbr>`);
  }

  const PAGE_ORDER = ['RTE', 'LEGS', 'INIT REF', 'CLB', 'CRZ', 'DES', 'PROG', 'N1 LIMIT', 'FIX', 'MENU'];

  // 热区绝对坐标（百分比，基于新贴图 652x1024），由图像检测精确得到键帽中心
  // LSK：左右各6，中心 y（白色横条）；x 为可见白条中心
  const LSK_X_L = 4.6, LSK_X_R = 95.4;
  const LSK_Y = [13.28, 17.82, 22.36, 26.9, 31.4, 35.99];
  // 功能键：{label, x, y} 坐标为键帽中心百分比（按新图 4 排布局）
  const FUNC_KEYS = [
    { label: 'INIT REF', x: 20.4, y: 47.07 }, { label: 'RTE', x: 31.9, y: 47.07 },
    { label: 'CLB', x: 43.56, y: 47.07 }, { label: 'CRZ', x: 55.21, y: 47.07 }, { label: 'DES', x: 66.87, y: 47.07 },
    { label: 'MENU', x: 20.4, y: 53.12 }, { label: 'LEGS', x: 31.9, y: 53.12 },
    { label: 'APR', x: 43.56, y: 53.12 }, { label: 'HOLD', x: 55.21, y: 53.12 }, { label: 'PROG', x: 66.87, y: 53.12 },
    { label: 'N1 LIMIT', x: 20.4, y: 59.18 }, { label: 'FIX', x: 31.9, y: 59.18 },
    { label: 'PREV PAGE', x: 20.4, y: 65.24 }, { label: 'NEXT PAGE', x: 31.9, y: 65.24 }
  ];
  // 数字圆键：3列 x 4行
  const NUM_X = [15.34, 24.92, 34.36];
  const NUM_Y = [71.49, 77.94, 84.04, 90.62];
  const NUM_KEYS = [
    { v: '1', x: NUM_X[0], y: NUM_Y[0] }, { v: '2', x: NUM_X[1], y: NUM_Y[0] }, { v: '3', x: NUM_X[2], y: NUM_Y[0] },
    { v: '4', x: NUM_X[0], y: NUM_Y[1] }, { v: '5', x: NUM_X[1], y: NUM_Y[1] }, { v: '6', x: NUM_X[2], y: NUM_Y[1] },
    { v: '7', x: NUM_X[0], y: NUM_Y[2] }, { v: '8', x: NUM_X[1], y: NUM_Y[2] }, { v: '9', x: NUM_X[2], y: NUM_Y[2] },
    { v: '.', x: NUM_X[0], y: NUM_Y[3] }, { v: '0', x: NUM_X[1], y: NUM_Y[3] }, { v: '-', label: '+/-', x: NUM_X[2], y: NUM_Y[3] }
  ];
  // 字母方键：5列 x 6行
  const LET_X = [46.54, 56.6, 66.71, 76.89, 86.15];
  const LET_Y = [59.69, 65.92, 72.23, 78.44, 84.58, 90.81];
  const LETTER_KEYS = [
    { v: 'A', x: LET_X[0], y: LET_Y[0] }, { v: 'B', x: LET_X[1], y: LET_Y[0] },
    { v: 'C', x: LET_X[2], y: LET_Y[0] }, { v: 'D', x: LET_X[3], y: LET_Y[0] }, { v: 'E', x: LET_X[4], y: LET_Y[0] },
    { v: 'F', x: LET_X[0], y: LET_Y[1] }, { v: 'G', x: LET_X[1], y: LET_Y[1] },
    { v: 'H', x: LET_X[2], y: LET_Y[1] }, { v: 'I', x: LET_X[3], y: LET_Y[1] }, { v: 'J', x: LET_X[4], y: LET_Y[1] },
    { v: 'K', x: LET_X[0], y: LET_Y[2] }, { v: 'L', x: LET_X[1], y: LET_Y[2] },
    { v: 'M', x: LET_X[2], y: LET_Y[2] }, { v: 'N', x: LET_X[3], y: LET_Y[2] }, { v: 'O', x: LET_X[4], y: LET_Y[2] },
    { v: 'P', x: LET_X[0], y: LET_Y[3] }, { v: 'Q', x: LET_X[1], y: LET_Y[3] },
    { v: 'R', x: LET_X[2], y: LET_Y[3] }, { v: 'S', x: LET_X[3], y: LET_Y[3] }, { v: 'T', x: LET_X[4], y: LET_Y[3] },
    { v: 'U', x: LET_X[0], y: LET_Y[4] }, { v: 'V', x: LET_X[1], y: LET_Y[4] },
    { v: 'W', x: LET_X[2], y: LET_Y[4] }, { v: 'X', x: LET_X[3], y: LET_Y[4] }, { v: 'Y', x: LET_X[4], y: LET_Y[4] },
    { v: 'Z', x: LET_X[0], y: LET_Y[5] }, { v: 'SP', label: 'SP', char: ' ', x: LET_X[1], y: LET_Y[5] },
    { v: 'DEL', action: true, x: LET_X[2], y: LET_Y[5] }, { v: '/', label: '/', x: LET_X[3], y: LET_Y[5] },
    { v: 'CLR', action: true, x: LET_X[4], y: LET_Y[5] }
  ];

  const VALIDATORS = {
    icao: (v) => /^[A-Z]{4}$/.test(v),
    fltNo: (v) => /^[A-Z0-9]{1,7}$/.test(v),
    weight: (v) => /^\d{2,3}(\.\d)?$/.test(v) && +v >= 50 && +v <= 999,
    ci: (v) => /^\d{1,3}$/.test(v),
    alt: (v) => /^(FL\d{2,3}|\d{4,5})$/.test(v),
    speed: (v) => /^\d{2,3}(K|M)?$/.test(v),
    vspeed: (v) => /^\d{2,3}$/.test(v) && +v >= 90 && +v <= 220,
    latlon: (v) => /^[NS]\d{4}\.\d[EW]\d{5}\.\d$/.test(v),
    generic: (v) => v.length > 0
  };

  function createState() {
    return {
      page: 'DEPARTURES', scratchpad: '', padError: false, modified: false, executed: false,
      msgLight: false, ofstLight: false, failLight: false,
      data: {
        origin: '', dest: '', fltNo: '', coRoute: '', runway: '', route1: '',
        legs: [], originSet: false,
        gw: '', zfw: '', blockFuel: '', reserves: '', ci: '', crzAlt: '', crzCg: '',
        flap: '', toCG: '', v1: '', vr: '', v2: '', oat: '', vref: '',
        irsPos: '', navDate: '2605/2611', gate: '', directTo: '',
        messages: []
      }
    };
  }

  let state = loadState() || createState();
  let toastTimer = null;
  let holdTimer = null;
  let holdTriggered = false;

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      if (!s || !s.data) return null;
      const base = createState();
      s.data = Object.assign(base.data, s.data);
      return Object.assign(base, s);
    } catch (e) { return null; }
  }
  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  function afterChange() {
    saveState();
    render();
    if (window.B737_TUTORIAL) window.B737_TUTORIAL.notify();
  }
  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2000);
  }

  function goPage(page) {
    if (!window.MCDU_PAGES[page]) page = 'MENU';
    state.page = page;
    afterChange();
  }
  function cyclePage(dir) {
    const groups = window.MCDU_PAGE_GROUPS || {};
    let list = null;
    for (const k in groups) {
      if (groups[k].indexOf(state.page) >= 0) { list = groups[k]; break; }
    }
    if (!list || list.length < 2) return;
    let i = list.indexOf(state.page);
    i = (i + dir + list.length) % list.length;
    state.page = list[i];
    afterChange();
  }

  function setError(msg) {
    state.scratchpad = msg;
    state.padError = true;
    state.msgLight = true;
    render();
  }

  function pushChar(ch) {
    if (state.padError) { state.scratchpad = ''; state.padError = false; }
    state.scratchpad += ch;
    if (state.scratchpad.length > 24) state.scratchpad = state.scratchpad.slice(-24);
    afterChange();
  }

  function markModified() {
    state.modified = true;
    state.executed = false;
  }

  function execute() {
    if (state.padError) { setError('INVALID ENTRY'); return; }
    if (!state.modified) { toast('NO MODIFICATION'); return; }
    state.modified = false;
    state.executed = true;
    state.data.messages.push('ACTIVATE/EXEC at ' + new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    toast('EXEC → ACT\n修改已生效');
    afterChange();
  }

  // 字段写入映射：页面 -> { 'L1': [dataPath, validator] ... }
  const FIELD_MAP = {
    'RTE': {
      L1: ['origin', 'icao'], R1: ['dest', 'icao'], L2: ['fltNo', 'fltNo'], R2: ['coRoute', 'generic'],
      L3: ['route1', 'generic'], R3: ['runway', 'generic']
    },
    'POS': { L1: ['origin', 'icao'], R1: ['gate', 'generic'], L2: ['irsPos', 'latlon'] },
    'PERF INIT': {
      L1: ['gw', 'weight'], R1: ['blockFuel', 'weight'], L2: ['zfw', 'weight'],
      R2: ['reserves', 'weight'], L3: ['ci', 'ci'], R3: ['crzAlt', 'alt'], L4: ['crzCg', 'generic']
    },
    'TAKEOFF': { L1: ['flap', 'generic'], R1: ['toCG', 'generic'], L2: ['v1', 'vspeed'], R2: ['vr', 'vspeed'], L3: ['v2', 'vspeed'] },
    'N1 LIMIT': { L1: ['oat', 'generic'] },
    'CLB': { L1: ['crzAlt', 'alt'] },
    'CRZ': { L1: ['crzAlt', 'alt'] },
    'APPROACH': { R1: ['runway', 'generic'], L2: ['vref', 'vspeed'] },
    'DIR INTC': { L1: ['directTo', 'generic'], R1: ['directTo', 'generic'] }
  };

  function pressLSK(side, idx) {
    const id = side + (idx + 1);
    const def = window.MCDU_PAGES[state.page];
    const rows = def.rows(state);
    const row = rows[idx] || {};
    const cell = row[side === 'L' ? 'l' : 'r'] || {};
    const val = state.scratchpad.trim().toUpperCase();

    // 特殊：ERASE
    if (state.modified && cell.key === 'ERASE') {
      state.modified = false; state.executed = false;
      state.scratchpad = ''; toast('ERASE\n修改已放弃'); afterChange(); return;
    }
    // 特殊：DELETE 模式
    if (val === 'DELETE') {
      const map = FIELD_MAP[state.page];
      if (map && map[id]) {
        state.data[map[id][0]] = '';
        state.scratchpad = ''; markModified();
        toast('已删除 ' + id + ' 字段'); afterChange(); return;
      }
    }
    // 特殊：COPY GPS
    if (cell.key === 'COPY GPS') {
      state.data.irsPos = 'N4035.2/W07345.6';
      state.scratchpad = ''; toast('GPS POS → SET IRS POS'); afterChange(); return;
    }
    // 特殊：ACTIVATE
    if (cell.key === 'ACTIVATE>') {
      if (state.data.origin && state.data.dest) {
        markModified(); toast('ROUTE ACTIVATED\n按 EXEC 生效'); afterChange(); return;
      }
    }
    // DEPARTURES：选择 SID / 跑道 -> 置 MOD，EXEC 灯亮
    if (state.page === 'DEPARTURES' && cell.key) {
      if (/^ABV\d+D$/.test(cell.key)) {
        state.data.sid = cell.key; state.scratchpad = ''; markModified();
        toast('已选 SID ' + cell.key + '\n按 EXEC 生效'); afterChange(); return;
      }
      if (/^RW\d+[LRC]?$/.test(cell.key)) {
        state.data.runway = cell.key; state.scratchpad = ''; markModified();
        toast('跑道 ' + cell.key + '\n按 EXEC 生效'); afterChange(); return;
      }
    }
    // 导航提示（带 > 或 prompt key 且无数据目标）
    if (cell.key && window.MCDU_PAGES[cell.key]) {
      state.scratchpad = ''; goPage(cell.key); return;
    }
    if (cell.key && window.MCDU_FUNCTION_PAGE && window.MCDU_FUNCTION_PAGE[cell.key]) {
      state.scratchpad = ''; goPage(window.MCDU_FUNCTION_PAGE[cell.key]); return;
    }

    const map = FIELD_MAP[state.page];
    const spec = map && map[id];
    if (spec) {
      const [path, vname] = spec;
      if (val) {
        const ok = VALIDATORS[vname] ? VALIDATORS[vname](val) : VALIDATORS.generic(val);
        if (!ok) { setError('INVALID ENTRY'); return; }
        state.data[path] = val;
        state.scratchpad = '';
        markModified();
        if (state.page === 'RTE' && (path === 'origin' || path === 'dest')) {
          state.data.route1 = '';
        }
        afterChange();
        return;
      } else {
        // scratchpad 空 -> 把字段值取回 scratchpad
        const cur = state.data[path];
        if (cur) { state.scratchpad = cur; afterChange(); }
        return;
      }
    }
    // 通用：无映射，若有提示则翻页/无动作
    if (val && cell.lbl) { /* 忽略无效字段 */ }
  }

  function pressFunction(label) {
    if (label === 'EXEC') { execute(); return; }
    if (label === 'DEL') {
      state.scratchpad = 'DELETE'; state.padError = false; state.msgLight = true; afterChange(); return;
    }
    if (label === 'CLR') {
      if (state.scratchpad) { state.scratchpad = ''; state.padError = false; }
      state.msgLight = false;
      afterChange(); return;
    }
    if (label === 'PREV PAGE') { cyclePage(-1); return; }
    if (label === 'NEXT PAGE') { cyclePage(1); return; }
    if (label === 'INDEX') { goPage('MENU'); return; }
    if (label === 'FUEL') { goPage('PERF INIT'); return; }
    if (label === 'NAV RAD') { goPage('NAV DATA'); return; }
    if (label === 'DIR INTC') { goPage('DIR INTC'); return; }
    if (label === 'PROG') { goPage('PROG'); return; }
    if (label === 'DEP ARR') { goPage('DEPARTURES'); return; }
    if (label === 'APR') { goPage('APPROACH'); return; }
    const page = window.MCDU_FUNCTION_PAGE && window.MCDU_FUNCTION_PAGE[label];
    if (page) { goPage(page); return; }
  }

  function pressPrimary(ch) { pushChar(ch); }

  // 生成透明热区按钮
  function makeHot(parent, opt) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'hot';
    b.style.left = opt.x + '%';
    b.style.top = opt.y + '%';
    if (opt.w) b.style.width = opt.w + '%';
    if (opt.h) b.style.height = opt.h + '%';
    if (opt.aria) b.setAttribute('aria-label', opt.aria);
    parent.appendChild(b);
    return b;
  }

  function buildFixedKeys() {
    const fg = $('funcKeys');
    fg.innerHTML = '';
    FUNC_KEYS.forEach((k) => {
      const b = makeHot(fg, { x: k.x, y: k.y, w: 10.6, h: 5.0, aria: k.label });
      b.addEventListener('click', () => pressFunction(k.label));
    });
    $('execKey').addEventListener('click', () => pressFunction('EXEC'));
  }

  function buildKeypad() {
    const np = $('numPad');
    np.innerHTML = '';
    NUM_KEYS.forEach((k) => {
      const b = makeHot(np, { x: k.x, y: k.y, w: 9.3, h: 6.0, aria: k.label || k.v });
      b.addEventListener('click', () => pushChar(k.v));
    });
    const lp = $('letterPad');
    lp.innerHTML = '';
    LETTER_KEYS.forEach((k) => {
      const b = makeHot(lp, { x: k.x, y: k.y, w: 9.6, h: 6.0, aria: k.label || k.v });
      if (k.action) b.addEventListener('click', () => pressFunction(k.v));
      else b.addEventListener('click', () => pushChar(k.char != null ? k.char : k.v));
    });
  }

  function buildLSK() {
    const left = $('lskLeft'), right = $('lskRight');
    left.innerHTML = ''; right.innerHTML = '';
    LSK_Y.forEach((y, i) => {
      const bl = makeHot(left, { x: LSK_X_L, y: y, w: 8.4, h: 4.2, aria: 'L' + (i + 1) });
      bl.dataset.side = 'L'; bl.dataset.index = i;
      const br = makeHot(right, { x: LSK_X_R, y: y, w: 8.4, h: 4.2, aria: 'R' + (i + 1) });
      br.dataset.side = 'R'; br.dataset.index = i;
    });
    document.querySelectorAll('#lskLeft .hot, #lskRight .hot').forEach((b) => {
      b.onclick = () => pressLSK(b.dataset.side, Number(b.dataset.index));
    });
  }

  function renderRows() {
    const def = window.MCDU_PAGES[state.page];
    const rows = def.rows(state);
    let titleHtml = decorate(def.title(state));
    if (def.pageNo) titleHtml += '<span class="page-no">' + def.pageNo + '</span>';
    $('screenTitle').innerHTML = titleHtml;
    $('rows').innerHTML = rows.map((r) => {
      const f = (c) => {
        c = c || {};
        const lblCls = c.cls === 'prompt' ? 'lbl prompt' : 'lbl';
        const lbl = c.lbl ? '<span class="' + lblCls + '">' + decorate(c.lbl) + '</span>' : '';
        let val = '';
        if (c.val) {
          let vcls = c.cls || '';
          if (c.cls === 'prompt') vcls = 'small';
          if (c.key === 'ERASE') vcls = 'amber';
          // c.val 可能是 box() 生成的 HTML（含 <span>），此类不转义直接渲染；纯文本才 decorate
          const html = /<[a-z]/i.test(c.val);
          val = '<span class="val ' + vcls + '">' + (html ? c.val : decorate(c.val)) + '</span>';
        }
        return '<span class="field">' + lbl + val + '</span>';
      };
      return '<div class="row">' + f(r.l) + f(r.r) + '</div>';
    }).join('')
      + (def.footer ? '<div class="row footer"><span class="field">' + decorate(def.footer) + '</span></div>' : '');
  }

  function render() {
    renderRows();
    const def = window.MCDU_PAGES[state.page];
    $('scratchpad').textContent = state.scratchpad || (def && def.prompt ? def.prompt : '');
    $('scratchpad').className = 'scratchpad' + (state.padError ? ' error' : '');
    const led = $('execLed');
    if (led) led.classList.toggle('on', state.modified);
  }

  function externalKey(e) {
    const k = e.key;
    if (k === 'Backspace') { e.preventDefault(); pressFunction('DEL'); return; }
    if (k === 'Escape' || k === 'Delete') { e.preventDefault(); pressFunction('CLR'); return; }
    if (k === 'Enter') { e.preventDefault(); pressFunction('EXEC'); return; }
    if (k === ' ') { e.preventDefault(); pushChar(' '); return; }
    if (/^[a-zA-Z0-9]$/.test(k)) { pushChar(k.toUpperCase()); return; }
    if (k === '.') { pushChar('.'); return; }
    if (k === '/') { pushChar('/'); return; }
    if (k === '-') { pushChar('-'); return; }
    const map = { F1: ['L', 1], F2: ['L', 2], F3: ['L', 3], F4: ['L', 4], F5: ['L', 5], F6: ['L', 6], F7: ['R', 1], F8: ['R', 2], F9: ['R', 3], F10: ['R', 4], F11: ['R', 5], F12: ['R', 6] };
    if (map[k]) { e.preventDefault(); pressLSK(map[k][0], map[k][1]); }
  }

  $('resetBtn').addEventListener('click', () => {
    state = createState(); afterChange(); toast('已重置');
  });
  $('helpBtn').addEventListener('click', () => window.B737_TUTORIAL && window.B737_TUTORIAL.showTutorial());
  $('glossaryBtn').addEventListener('click', () => window.B737_TUTORIAL && window.B737_TUTORIAL.showGlossary());
  document.addEventListener('keydown', externalKey);

  buildFixedKeys();
  buildKeypad();
  buildLSK();
  render();

  window.B737_APP = {
    pressKey: pressPrimary, pressLSK, pressFunction, goPage, getState: () => state, render, toast
  };
  if (window.B737_TUTORIAL) window.B737_TUTORIAL.init(() => state, () => {
    const d = window.MCDU_PAGES[state.page];
    return d && d.note ? d.note : '';
  });

})();
