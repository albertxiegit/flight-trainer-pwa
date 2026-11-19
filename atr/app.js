(function () {
  const $ = (id) => document.getElementById(id);
  const STORE_KEY = 'atrMcduStateV1';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function decorate(text) {
    const G = window.MCDU_GLOSSARY || {};
    const keys = Object.keys(G).sort((a, b) => b.length - a.length);
    if (!keys.length) return esc(text);
    const re = new RegExp('(' + keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')', 'g');
    return esc(text).replace(re, (m) => {
      const t = G[m];
      return `<abbr class="abbr" data-term="${m}" title="${esc(t.full)} — ${esc(t.zh)}">${m}</abbr>`;
    });
  }

  const PAGE_ORDER = ['MENU', 'INIT_POW', 'FPLN', 'PROG1', 'PERF', 'RAD', 'VNAV', 'DTO', 'DATA', 'MSG'];

  // 热区绝对坐标（百分比，基于贴图 911x1080），由边缘矩形检测得到键帽中心
  // LSK：左右各6，白条中心 y；按键中心 x
  const LSK_X_L = 5.73, LSK_X_R = 95.57;
  const LSK_Y = [17.87, 24.35, 30.56, 36.85, 43.06, 49.35];
  // 功能键第一排 + EXEC
  const FUNC_KEYS = [
    { label: 'MENU', x: 9.5, y: 65.41 }, { label: 'PREV', x: 18.11, y: 65.41 },
    { label: 'NEXT', x: 26.49, y: 65.41 }, { label: 'RMS', x: 36.56, y: 65.41 },
    { label: 'FPLN', x: 47.28, y: 65.41 }, { label: 'DTO', x: 57.61, y: 65.41 },
    { label: 'PERF', x: 68.41, y: 65.41 }, { label: 'MSG', x: 78.73, y: 65.41 },
    { label: 'EXEC', x: 91.19, y: 65.41 }
  ];
  // 键盘每行键帽中心 x（10 列），逐行检测，因各行实际间距不同
  const KB_X = [
    [9.24, 17.8, 26.34, 36.66, 47.04, 57.52, 68.36, 78.51, 86.94, 93.0],
    [9.31, 17.78, 26.34, 36.36, 45.74, 54.88, 63.8, 73.05, 82.05, 91.2],
    [9.31, 17.8, 26.4, 36.58, 45.75, 54.88, 63.8, 73.14, 82.05, 91.35],
    [9.42, 17.84, 26.4, 36.33, 45.53, 54.91, 64.0, 73.02, 82.31, 91.36],
    [null, 18.13, 26.62, 36.61, 45.66, 54.83, 63.97, 72.89, 82.11, null]
  ];
  const KB_Y = [71.2, 77.18, 82.95, 88.7, 94.57];
  // 每个键：{label, col, row} -> 中心 = KB_X[col-1], KB_Y[row-1]
  const KEY_GRID = [
    { label: '1', col: 1, row: 1 }, { label: '2', col: 2, row: 1 }, { label: '3', col: 3, row: 1 },
    { label: ' ', col: 4, row: 1, blank: true },
    { label: 'PROG', col: 5, row: 1 }, { label: 'DATA', col: 6, row: 1 },
    { label: 'VNAV', col: 7, row: 1 }, { label: 'MRK', col: 8, row: 1 },
    { label: 'BRT', col: 9, row: 1 }, { label: 'HLT', col: 10, row: 1 },
    { label: '4', col: 1, row: 2 }, { label: '5', col: 2, row: 2 }, { label: '6', col: 3, row: 2 },
    { label: 'A', col: 4, row: 2 }, { label: 'B', col: 5, row: 2 },
    { label: 'C', col: 6, row: 2 }, { label: 'D', col: 7, row: 2 },
    { label: 'E', col: 8, row: 2 }, { label: 'F', col: 9, row: 2 },
    { label: 'G', col: 10, row: 2 },
    { label: '7', col: 1, row: 3 }, { label: '8', col: 2, row: 3 }, { label: '9', col: 3, row: 3 },
    { label: 'H', col: 4, row: 3 }, { label: 'I', col: 5, row: 3 },
    { label: 'J', col: 6, row: 3 }, { label: 'K', col: 7, row: 3 },
    { label: 'L', col: 8, row: 3 }, { label: 'M', col: 9, row: 3 },
    { label: 'N', col: 10, row: 3 },
    { label: '.', col: 1, row: 4 }, { label: '0', col: 2, row: 4 }, { label: '+/-', col: 3, row: 4 },
    { label: 'O', col: 4, row: 4 }, { label: 'P', col: 5, row: 4 },
    { label: 'Q', col: 6, row: 4 }, { label: 'R', col: 7, row: 4 },
    { label: 'S', col: 8, row: 4 }, { label: 'T', col: 9, row: 4 },
    { label: 'U', col: 10, row: 4 },
    { label: '/', col: 2, row: 5 }, { label: 'SP', col: 3, row: 5 },
    { label: 'V', col: 4, row: 5 }, { label: 'W', col: 5, row: 5 },
    { label: 'X', col: 6, row: 5 }, { label: 'Y', col: 7, row: 5 },
    { label: 'Z', col: 8, row: 5 }, { label: 'CLR', col: 9, row: 5 }
  ];

  const NUM = (min, max, digits = 3) => (v) => new RegExp(`^\\d{1,${digits}}$`).test(v) && +v >= min && +v <= max;
  const FREQ = (v) => /^\d{3}\.\d{2}$/.test(v);
  const ICAO = (v) => /^[A-Z]{4}$/.test(v);

  const VALIDATORS = {
    from: ICAO, to: ICAO,
    fltNo: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    costIdx: NUM(0, 999, 3),
    crzFl: (v) => /^\d{2,3}$/.test(v) && +v >= 100 && +v <= 410,
    route: (v) => /^[A-Z0-9/ .-]{2,24}$/.test(v),
    zfw: NUM(200, 999, 3),
    zfwcg: (v) => /^\d{1,2}\.\d$/.test(v),
    blockFuel: NUM(0, 999, 3),
    tripFuel: NUM(0, 999, 3),
    reserves: NUM(0, 999, 3),
    extra: NUM(0, 999, 3),
    navDb: (v) => /^[A-Z0-9/]{2,10}$/.test(v),
    sid: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    star: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    depRwy: (v) => /^\d{2}[LRC]?$/.test(v) || /^[A-Z]\d{2}$/.test(v),
    arrRwy: (v) => /^\d{2}[LRC]?$/.test(v) || /^[A-Z]\d{2}$/.test(v),
    trans: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    offset: NUM(0, 99, 2),
    appr: (v) => /^[A-Z0-9]{2,6}$/.test(v),
    via: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    holdWp: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    holdCrs: NUM(0, 359, 3),
    holdTime: NUM(1, 30, 2),
    holdDist: NUM(1, 30, 2),
    holdSpd: NUM(100, 300, 3),
    dtoWp: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    'perf.v1': NUM(80, 250, 3),
    'perf.vr': NUM(80, 250, 3),
    'perf.v2': NUM(80, 250, 3),
    'perf.flaps': (v) => /^(\d{1,2}|FULL)$/.test(v),
    'perf.ths': NUM(0, 20, 2),
    'perf.flex': NUM(30, 70, 2),
    'perf.thrRed': (v) => /^\d{3}\/\d{3}$/.test(v),
    'clb.spd': NUM(100, 350, 3),
    'clb.thrRed': (v) => /^(FL)?\d{2,3}$/.test(v),
    'clb.accHt': NUM(0, 9999, 4),
    'crz.spd': NUM(200, 350, 3),
    'des.spd': NUM(100, 350, 3),
    'des.transFl': (v) => /^(FL)?\d{2,3}$/.test(v),
    'des.wind': (v) => /^\d{3}\/\d{2}$/.test(v),
    'appr.vapp': NUM(100, 200, 3),
    'appr.flaps': (v) => /^(\d{1,2}|FULL)$/.test(v),
    'appr.missedFl': (v) => /^(FL)?\d{2,3}$/.test(v),
    'ga.spd': NUM(100, 250, 3),
    'ga.flaps': (v) => /^(\d{1,2}|FULL)$/.test(v),
    wind: (v) => /^\d{3}\/\d{2}$/.test(v),
    sat: (v) => /^-?\d{2}$/.test(v),
    tas: NUM(100, 500, 3),
    eta: (v) => /^\d{2}:\d{2}$/.test(v),
    gpsPos: (v) => /^[A-Z0-9/ .-]{2,24}$/.test(v),
    gpsTime: (v) => /^\d{2}:\d{2}Z$/.test(v),
    'rad.vor1': FREQ, 'rad.vor2': FREQ, 'rad.ils1': FREQ, 'rad.ils2': FREQ,
    'rad.adf1': (v) => /^\d{2,4}$/.test(v), 'rad.adf2': (v) => /^\d{2,4}$/.test(v),
    'rad.course1': NUM(0, 359, 3), 'rad.course2': NUM(0, 359, 3),
    'vnav.altCstr': (v) => /^(FL)?\d{2,3}$/.test(v),
    'vnav.spdCstr': NUM(100, 350, 3),
    'vnav.oat': (v) => /^-?\d{2}$/.test(v),
    'vnav.qnh': (v) => /^\d{4}$/.test(v),
    'vnav.transFl': (v) => /^(FL)?\d{2,3}$/.test(v),
    'vnav.appEnv': (v) => /^[A-Z0-9]{1,8}$/.test(v),
    dbExp: (v) => /^\d{4}\/\d{2}$/.test(v),
    refPos: (v) => /^[A-Z0-9/ .-]{2,24}$/.test(v),
    'units.dist': (v) => /^[A-Z]{2,4}$/.test(v),
    'units.spd': (v) => /^[A-Z]{2,4}$/.test(v),
    'units.alt': (v) => /^[A-Z]{2,4}$/.test(v),
    'units.temp': (v) => /^[CF]$/.test(v),
    datum: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    geoDatum: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    coRte: (v) => /^[A-Z0-9]{2,9}$/.test(v),
    altn: ICAO,
    altnRte: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    airway: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    windFl: (v) => /^(FL)?\d{2,3}$/.test(v),
    grWt: NUM(200, 999, 3),
    markWp: (v) => /^[A-Z0-9]{2,8}$/.test(v),
    dtoBrg: NUM(0, 359, 3),
    dtoDist: NUM(0, 999, 3)
  };

  const FUNCTION_ACTIONS = {
    MENU: () => goPage('MENU'),
    FPLN: () => goPage(isInGroup('FPLN') ? state.page : 'INIT'),
    PROG: () => goPage('PROG1'),
    PERF: () => goPage(isInGroup('PERF') ? state.page : 'PERF'),
    DATA: () => goPage('DATA'),
    PREV: () => cyclePage(-1),
    NEXT: () => cyclePage(1),
    DTO: () => goPage('DTO'),
    VNAV: () => goPage(isInGroup('VNAV') ? state.page : 'VNAV'),
    MSG: () => goPage('MSG'),
    EXEC: () => execute(),
    RMS: () => goPage('RMS'),
    MRK: () => goPage('MARK_PAGE'),
    BRT: () => toggleBrightness(),
    HLT: () => {}
  };

  let state = loadState() || createState();
  let toastTimer = null;

  function createState() {
    return {
      page: 'MENU', scratchpad: '', padError: false, night: false,
      data: {
        from: '', to: '', fltNo: '', costIdx: '', crzFl: '', route: '',
        zfw: '', zfwcg: '', blockFuel: '', tripFuel: '', reserves: '', extra: '', navDb: '', dbExp: '',
        refPos: '', datum: '', geoDatum: '', coRte: '', altn: '', altnRte: '', grWt: '',
        units: { dist: 'NM', spd: 'KT', alt: 'FT', temp: 'C' },
        fpln: [], secFpln: null,
        sid: '', star: '', depRwy: '', arrRwy: '', trans: '', offset: '', appr: '', via: '',
        holdWp: '', holdCrs: '', holdTime: '', holdDist: '', holdSpd: '',
        airway: '', windFl: '', navMode: 'BCP', tempPlan: false, secPerf: false,
        wind: '', sat: '', tas: '', eta: '', gpsPos: '', gpsTime: '',
        markWp: '', dtoBrg: '', dtoDist: '',
        perf: { v1: '', vr: '', v2: '', flaps: '', ths: '', flex: '', thrRed: '' },
        clb: { spd: '', thrRed: '', accHt: '' },
        crz: { spd: '' },
        des: { spd: '', transFl: '', wind: '' },
        appr: { vapp: '', flaps: '', missedFl: '' },
        ga: { spd: '', flaps: '' },
        rad: { vor1: '', vor2: '', ils1: '', ils2: '', adf1: '', adf2: '', course1: '', course2: '' },
        vnav: { altCstr: '', spdCstr: '', oat: '', qnh: '', transFl: '', appEnv: '' },
        dtoWp: '',
        messages: ['WELCOME TO ATR FMS 220 TRAINER']
      }
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.data) return null;
      const fresh = createState();
      fresh.page = parsed.page || fresh.page;
      fresh.night = !!parsed.night;
      Object.keys(fresh.data).forEach((k) => {
        if (parsed.data[k] != null) {
          if (typeof fresh.data[k] === 'object' && !Array.isArray(fresh.data[k])) {
            fresh.data[k] = Object.assign({}, fresh.data[k], parsed.data[k]);
          } else fresh.data[k] = parsed.data[k];
        }
      });
      return fresh;
    } catch (e) { return null; }
  }

  function saveState() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }

  function getField(path) {
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), state.data);
  }

  function setField(path, value) {
    const parts = path.split('.');
    const last = parts.pop();
    const obj = parts.reduce((o, k) => (o[k] = o[k] || {}, o[k]), state.data);
    obj[last] = value;
  }

  function addMessage(msg) {
    state.data.messages.push(msg);
    if (state.data.messages.length > 30) state.data.messages.shift();
  }

  function isInGroup(name) {
    const groups = window.MCDU_PAGE_GROUPS || {};
    return !!(groups[name] && groups[name].indexOf(state.page) >= 0);
  }

  function afterChange() {
    saveState();
    render();
    if (window.MCDU_TUTORIAL) window.MCDU_TUTORIAL.notify();
  }

  function goPage(page) {
    if (!window.MCDU_PAGES[page]) page = 'MENU';
    state.page = page;
    afterChange();
  }

  function cyclePage(dir) {
    const groups = window.MCDU_PAGE_GROUPS || {};
    let list = null;
    Object.keys(groups).forEach((k) => {
      if (!list && groups[k].indexOf(state.page) >= 0) list = groups[k];
    });
    if (!list) list = PAGE_ORDER;
    const i = Math.max(0, list.indexOf(state.page));
    const next = list[(i + dir + list.length) % list.length];
    goPage(next);
  }

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 1800);
  }

  function setError(msg) {
    state.scratchpad = msg;
    state.padError = true;
    addMessage(msg);
    toast(msg);
  }

  function toggleBrightness() {
    state.night = !state.night;
    document.body.classList.toggle('night', state.night);
    toast(state.night ? '夜间模式' : '日间模式');
    afterChange();
  }

  function execute() {
    const checks = [];
    if (!state.data.from) checks.push('FROM MISSING');
    if (!state.data.to) checks.push('TO MISSING');
    if (!state.data.perf.v1 || !state.data.perf.vr || !state.data.perf.v2) checks.push('PERF INCOMPLETE');
    if (checks.length) {
      checks.forEach(addMessage);
      setError(checks[0]);
      afterChange();
    } else {
      addMessage('FLIGHT PLAN ACTIVE');
      toast('飞行计划已激活');
      afterChange();
    }
  }

  function pressKey(k) {
    if (FUNCTION_ACTIONS[k]) { FUNCTION_ACTIONS[k](); return; }
    if (k === 'CLR') {
      state.scratchpad = state.padError ? '' : state.scratchpad.slice(0, -1);
      state.padError = false;
      afterChange();
      return;
    }
    if (k === 'SP') {
      state.scratchpad += ' ';
      state.padError = false;
      afterChange();
      return;
    }
    if (/^[A-Z]$/.test(k) || /^[0-9]$/.test(k) || k === '.' || k === '/' || k === '+/-') {
      if (state.padError) { state.scratchpad = ''; state.padError = false; }
      state.scratchpad += (k === '+/-' ? '-' : k);
      if (state.scratchpad.length > 28) state.scratchpad = state.scratchpad.slice(-28);
      afterChange();
    }
  }

  function handleSpecialLSK(side, idx) {
    const value = state.scratchpad.trim().toUpperCase();

    if (state.page === 'FPLN' && side === 'L' && idx === 1 && value && !state.padError) {
      if (/^[A-Z0-9]{2,8}$/.test(value)) {
        state.data.fpln.push(value);
        state.scratchpad = '';
        toast(`已添加 ${value}`);
        afterChange();
      } else setError('FORMAT ERROR');
      return true;
    }

    if (state.page === 'FPLN_SEC' && side === 'L' && idx === 4) {
      state.data.secFpln = { from: state.data.from, to: state.data.to, fpln: state.data.fpln.slice() };
      toast('已复制当前飞行计划');
      afterChange();
      return true;
    }

    if (state.page === 'MSG' && side === 'L' && idx === 6) {
      state.data.messages = [];
      toast('消息已清空');
      afterChange();
      return true;
    }
    return false;
  }

  function pressLSK(side, idx) {
    const pageDef = window.MCDU_PAGES[state.page];
    const rows = pageDef.rows(state);
    const r = rows[idx] || {};
    const key = side === 'L' ? r.lKey : r.rKey;
    const action = side === 'L' ? r.lAction : r.rAction;

    if (action) {
      if (action === 'COPY_FPLN' || action === 'CLEAR_MSG' || action === 'EXEC_DTO') {
        if (handleSpecialLSK('L', action === 'COPY_FPLN' ? 4 : (action === 'CLEAR_MSG' ? 6 : 1))) return;
      }
      if (action === 'EXEC_DTO') {
        if (!state.data.dtoWp) { setError('ENTER WP'); afterChange(); return; }
        addMessage(`DIRECT TO ${state.data.dtoWp}`);
        toast(`直飞 ${state.data.dtoWp}`);
        afterChange();
        return;
      }
      if (action === 'COPY_GPS') {
        if (!state.data.gpsPos) { setError('NO GPS POS'); afterChange(); return; }
        state.data.refPos = state.data.gpsPos;
        addMessage('REF POS = GPS POS');
        toast('已复制 GPS 位置');
        afterChange();
        return;
      }
      if (action === 'ALIGN_IRS') {
        addMessage('IRS ALIGN REQUESTED');
        toast('IRS 对齐已请求');
        afterChange();
        return;
      }
      if (action === 'COPY_PERF') {
        state.data.secPerf = true;
        addMessage('SEC PERF COPIED');
        toast('已复制性能数据');
        afterChange();
        return;
      }
      if (action === 'CONFIRM_MARK') {
        if (!state.data.markWp) { setError('ENTER WP'); afterChange(); return; }
        addMessage(`POS UPDATED AT ${state.data.markWp}`);
        toast(`位置更新：${state.data.markWp}`);
        afterChange();
        return;
      }
      goPage(action);
      return;
    }

    if (handleSpecialLSK(side, idx)) return;
    if (!key) { toast('该 LSK 无定义'); return; }

    if (!state.scratchpad || state.padError) {
      const v = getField(key);
      state.scratchpad = (v == null || v === '') ? '' : String(v);
      state.padError = false;
      afterChange();
      return;
    }

    const value = state.scratchpad.trim().toUpperCase();
    const validator = VALIDATORS[key];
    if (validator && !validator(value)) {
      setError('FORMAT ERROR');
      afterChange();
      return;
    }

    setField(key, value);
    state.scratchpad = '';
    state.padError = false;
    addMessage(`${key.toUpperCase()} = ${value}`);
    toast('已输入');
    afterChange();
  }

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

  function buildKeys() {
    // 功能键（含 EXEC）
    const fn = $('funcKeys');
    fn.innerHTML = '';
    FUNC_KEYS.forEach((k) => {
      const b = makeHot(fn, { x: k.x, y: k.y, w: 8.8, h: 4.6, aria: k.label });
      b.addEventListener('click', () => pressKey(k.label));
    });
    // 数字/字母键盘
    const kb = $('keyboard');
    kb.innerHTML = '';
    KEY_GRID.forEach((k) => {
      const x = KB_X[k.row - 1][k.col - 1], y = KB_Y[k.row - 1];
      if (x == null) return;
      const b = makeHot(kb, { x, y, w: 8.6, h: 5.4, aria: k.blank ? 'spare key' : k.label });
      if (k.blank) { b.disabled = true; return; }
      b.addEventListener('click', () => pressKey(k.label));
    });
    // LSK 左右各6（固定热区）
    const left = $('lskLeft'), right = $('lskRight');
    left.innerHTML = ''; right.innerHTML = '';
    LSK_Y.forEach((y, i) => {
      const bl = makeHot(left, { x: LSK_X_L, y: y, w: 8, h: 4.2, aria: 'L' + (i + 1) });
      bl.dataset.side = 'L'; bl.dataset.index = i;
      const br = makeHot(right, { x: LSK_X_R, y: y, w: 8, h: 4.2, aria: 'R' + (i + 1) });
      br.dataset.side = 'R'; br.dataset.index = i;
    });
    document.querySelectorAll('#lskLeft .hot, #lskRight .hot').forEach((b) => {
      b.addEventListener('click', () => pressLSK(b.dataset.side, Number(b.dataset.index)));
    });
  }

  function renderRows() {
    const def = window.MCDU_PAGES[state.page];
    const rows = def.rows(state);
    $('screenTitle').innerHTML = decorate(def.title(state));
    $('rows').innerHTML = rows.map((r) => {
      const lClass = `${r.lClass || ''} ${r.lValue && r.lClass === 'editable' ? 'editable' : ''}`.trim();
      const rClass = `${r.rClass || ''} ${r.rValue && r.rClass === 'editable' ? 'editable' : ''}`.trim();
      return `
        <div class="row">
          <span class="label">${decorate(r.lLabel || '')}</span>
          <span class="value ${lClass}">${decorate(r.lValue || '')}</span>
          <span class="value ${rClass}">${decorate(r.rValue || '')}</span>
          <span class="label">${decorate(r.rLabel || '')}</span>
        </div>`;
    }).join('');

  }

  function render() {
    renderRows();
    const sp = $('scratchpad');
    sp.textContent = state.scratchpad;
    sp.className = 'scratchpad' + (state.padError ? ' error' : '');
    $('statusLine').textContent = state.data.from && state.data.to
      ? `${state.data.from} → ${state.data.to} · ${state.page}`
      : state.page;
    $('footerPrompt').textContent = state.page === 'MENU' ? 'INIT>' : (state.page === 'INIT' ? 'FPLN>' : 'MENU>');
    document.body.classList.toggle('night', state.night);
  }

  function getState() { return state; }
  function getPageNote() {
    const def = window.MCDU_PAGES[state.page];
    return def && def.note ? def.note : '';
  }

  $('resetBtn').addEventListener('click', () => {
    state = createState();
    afterChange();
    toast('已重置');
  });

  $('helpBtn').addEventListener('click', () => window.MCDU_TUTORIAL.showTutorial());
  $('glossaryBtn').addEventListener('click', () => window.MCDU_TUTORIAL.showGlossary());

  $('screen').addEventListener('click', (e) => {
    const abbr = e.target.closest('.abbr');
    if (!abbr) return;
    const term = abbr.dataset.term;
    const t = (window.MCDU_GLOSSARY || {})[term];
    if (t) toast(`${term} = ${t.full}\n${t.zh}：${t.desc}`);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Backspace') { e.preventDefault(); pressKey('CLR'); return; }
    if (/^[a-zA-Z0-9]$/.test(e.key)) { pressKey(e.key.toUpperCase()); return; }
    if (e.key === '.') pressKey('.');
    if (e.key === '/') pressKey('/');
    const map = { F1: ['L', 1], F2: ['L', 2], F3: ['L', 3], F4: ['L', 4], F5: ['L', 5], F6: ['L', 6], F7: ['R', 1], F8: ['R', 2], F9: ['R', 3], F10: ['R', 4], F11: ['R', 5], F12: ['R', 6] };
    if (map[e.key]) pressLSK(map[e.key][0], map[e.key][1]);
  });

  buildKeys();
  render();

  window.MCDU_TUTORIAL.init(getState, getPageNote);

  window.MCDU_APP = { pressKey, pressLSK, goPage, getState, render, toast };

})();
