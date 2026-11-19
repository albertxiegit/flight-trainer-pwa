(function () {
  'use strict';

  const box = (v) => `<span class="box">${v || '□'}</span>`;
  const dash = '-----';

  // 每个页面 return 6 行：{ l:{lbl,val,cls,key,action}, r:{...} }
  // key = 行选键提示（<TEXT），action = 特殊动作标识
  const PAGES = {
    DEPARTURES: {
      title: (s) => ((s.data.origin || 'ZSHC') + ' DEPART'),
      full: 'ZSHC DEPART', zh: '离场程序', desc: 'SID 离场程序与跑道选择（参考真机 CDU）',
      note: 'DEP/ARR 页选择离场程序（SID）与跑道。选中后 EXEC 灯亮，按 EXEC 生效。参考：博客图 ABV91D / RW06。',
      pageNo: '1/6',
      rows: (s) => [
        { l: { lbl: 'SIDS', val: 'ACT FPLN', cls: 'prompt' }, r: { lbl: 'RWYS', val: '', cls: 'prompt' } },
        { l: { val: 'ABV01D', cls: '', key: 'ABV01D' }, r: { val: 'RW06', cls: '', key: 'RW06' } },
        { l: { val: 'ABV11D', cls: '', key: 'ABV11D' }, r: { val: 'RW07', cls: '', key: 'RW07' } },
        { l: { val: 'ABV81D', cls: '', key: 'ABV81D' }, r: { val: 'RW24', cls: '', key: 'RW24' } },
        { l: { val: 'ABV91D', cls: '', key: 'ABV91D' }, r: { val: 'RW25', cls: '', key: 'RW25' } },
        { l: { val: 'ABV92D', cls: '', key: 'ABV92D' }, r: { val: '', cls: '' } }
      ],
      footer: '<DEP/ARR  IDX            FPLN>',
      prompt: '[KEY NOT ACTIVE]'
    },
    RTE: {
      title: (s) => (s.modified ? 'MOD ' : '') + 'RTE 1',
      full: 'ROUTE', zh: '航路', desc: '起飞机场、目的地、航班号与航路输入',
      note: 'RTE 页输入起降机场与航路。对激活航路修改后出现 MOD，按 EXEC 生效。',
      rows: (s) => [
        { l: { lbl: '', val: box(s.data.origin || ''), cls: 'val', key: s.data.origin ? '' : 'ORIGIN' }, r: { lbl: '', val: box(s.data.dest || ''), cls: 'val', key: s.data.dest ? '' : 'DEST' } },
        { l: { lbl: '', val: box(s.data.fltNo || ''), cls: 'val', key: 'FLT NO' }, r: { lbl: '', val: dash, cls: 'val small', key: 'CO ROUTE' } },
        { l: { lbl: '', val: s.data.origin ? 'DCT' : '', cls: 'val small', key: '' }, r: { lbl: '', val: s.data.runway ? s.data.runway : '', cls: 'val small', key: 'RUNWAY' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: s.data.route1 || '', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: s.data.origin && s.data.dest ? 'ACTIVATE>' : '' }, r: { lbl: '', val: s.data.modified ? 'ERASE' : '', cls: 'val amber', key: s.data.modified ? 'ERASE' : '' } }
      ]
    },
    LEGS: {
      title: (s) => (s.modified ? 'MOD ' : 'ACT ') + 'RTE 1 LEGS',
      full: 'RTE LEGS', zh: '航段', desc: '逐段航路点、航迹、距离、速度与高度限制',
      note: 'LEGS 显示航路点序列。空白 DISCO 表示航路不连续，输入航路点可闭合。DIR INTC 从这里直飞或切入。',
      rows: (s) => {
        const legs = s.data.legs && s.data.legs.length ? s.data.legs : [];
        const base = [
          { l: { lbl: '', val: s.data.origin ? s.data.origin : '', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
          { l: { lbl: '', val: 'DCT', cls: 'val small', key: '' }, r: { lbl: '', val: legs[0] || box(''), cls: legs[0] ? 'val' : '', key: legs[0] ? '' : 'via' } },
          { l: { lbl: '', val: legs[1] || 'DISCO', cls: legs[1] ? 'val small' : 'val amber', key: '' }, r: { lbl: '', val: legs[2] || '', cls: 'val small', key: '' } },
          { l: { lbl: '', val: legs[3] || '', cls: 'val small', key: '' }, r: { lbl: '', val: legs[4] || '', cls: 'val small', key: '' } },
          { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
          { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: s.data.dest || '', cls: 'val small', key: '' } }
        ];
        return base;
      }
    },
    'INIT REF': {
      title: () => 'INIT/REF INDEX',
      full: 'INIT/REF INDEX', zh: '初始/参考索引', desc: 'IDENT、POS、PERF、TAKEOFF、APPROACH、NAV DATA 入口',
      note: 'INIT REF 是初始化与参考页面的入口。FCOM：IDENT/POS/PERF/TAKEOFF/APPROACH 在左侧，NAV DATA 在 1R。',
      rows: () => [
        { l: { lbl: '<IDENT', val: '', cls: 'prompt', key: 'IDENT' }, r: { lbl: '<NAV DATA', val: '', cls: 'prompt', key: 'NAV DATA' } },
        { l: { lbl: '<POS INIT', val: '', cls: 'prompt', key: 'POS INIT' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '<PERF INIT', val: '', cls: 'prompt', key: 'PERF INIT' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '<TAKEOFF', val: '', cls: 'prompt', key: 'TAKEOFF' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '<APPROACH', val: '', cls: 'prompt', key: 'APPROACH' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    IDENT: {
      title: () => 'IDENT',
      full: 'IDENT', zh: '识别', desc: '机型、发动机、导航数据库有效期',
      note: '航前确认 FMC 机型/发动机与导航数据库当前有效。2R 为 ACTIVE 日期段。',
      rows: (s) => [
        { l: { lbl: 'B737-800', val: '', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: 'ENG', val: 'CFM56-7B', cls: 'val small', key: '' }, r: { lbl: 'ACTIVE', val: s.data.navDate || '2605/2611', cls: 'val small', key: 'NAV DATE' } },
        { l: { lbl: 'NAV DATA', val: 'Boeing', cls: 'val small', key: '' }, r: { lbl: '', val: '----/----', cls: 'val small', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    POS: {
      title: () => 'POS INIT',
      full: 'POS INIT', zh: '位置初始化', desc: '用 GPS 位置设置 IRS 初始位置',
      note: '把 GPS POS 通过行选键送入 SET IRS POS，完成惯导对准初始化。',
      rows: (s) => [
        { l: { lbl: 'REF AIRPORT', val: s.data.origin || box(''), cls: 'val', key: 'REF AIRPORT' }, r: { lbl: 'GATE', val: dash, cls: 'val small', key: 'GATE' } },
        { l: { lbl: 'IRS', val: s.data.irsPos || box(''), cls: 'coord', key: 'SET IRS POS' }, r: { lbl: '', val: 'GPS N4035.2/W07345.6', cls: 'coord', key: 'COPY GPS' } },
        { l: { lbl: 'LAST', val: 'N4035.1/W07345.5', cls: 'coord', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    'PERF INIT': {
      title: () => 'PERF INIT',
      full: 'PERF INIT', zh: '性能初始化', desc: '重量、燃油、成本指数、巡航高度、储备',
      note: '没有这些性能数据，VNAV 无法接通。方框为必填，虚线为可选/系统填充。',
      rows: (s) => [
        { l: { lbl: 'GW', val: box(s.data.gw || ''), cls: 'val', key: 'GW' }, r: { lbl: 'FUEL', val: s.data.blockFuel ? s.data.blockFuel : dash, cls: 'val small', key: 'FUEL' } },
        { l: { lbl: 'ZFW', val: box(s.data.zfw || ''), cls: 'val', key: 'ZFW' }, r: { lbl: 'RESERVES', val: box(s.data.reserves || ''), cls: 'val', key: 'RESERVES' } },
        { l: { lbl: 'COST INDEX', val: box(s.data.ci || ''), cls: 'val', key: 'COST INDEX' }, r: { lbl: 'CRZ ALT', val: box(s.data.crzAlt || ''), cls: 'val', key: 'CRZ ALT' } },
        { l: { lbl: 'CRZ CG', val: dash, cls: 'val small', key: 'CRZ CG' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    TAKEOFF: {
      title: () => 'TAKEOFF REF',
      full: 'TAKEOFF REF', zh: '起飞参考', desc: '襟翼、CG、V1/VR/V2',
      note: '起飞前核实 flap 位置与 V 速度。可由 FMC 计算或人工输入。',
      rows: (s) => [
        { l: { lbl: 'FLAP', val: box(s.data.flap || ''), cls: 'val', key: 'FLAP' }, r: { lbl: 'CG', val: box(s.data.toCG || ''), cls: 'val', key: 'CG' } },
        { l: { lbl: 'V1', val: box(s.data.v1 || ''), cls: 'val', key: 'V1' }, r: { lbl: 'VR', val: box(s.data.vr || ''), cls: 'val', key: 'VR' } },
        { l: { lbl: 'V2', val: box(s.data.v2 || ''), cls: 'val', key: 'V2' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    'N1 LIMIT': {
      title: () => 'N1 LIMIT',
      full: 'N1 LIMIT', zh: 'N1 推力限制', desc: 'TOGA/TO-1/TO-2/CLB 推力与假设温度',
      note: '选择全额定或减推力起飞。SEL/OAT 输入假设温度实现减推力。',
      rows: (s) => [
        { l: { lbl: 'SEL/OAT', val: box(s.data.oat || ''), cls: 'val', key: 'SEL/OAT' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '<TOGA', val: '100.0%', cls: 'val small', key: 'TOGA' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '<TO-1', val: '94.2%', cls: 'val small', key: 'TO-1' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '<TO-2', val: '89.6%', cls: 'val small', key: 'TO-2' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '<CLB', val: '92.8%', cls: 'val small', key: 'CLB' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    CLB: {
      title: () => 'ACT RTE 1 CLB',
      full: 'CLB', zh: '爬升', desc: '巡航高度、爬升速度、过渡高度、速度限制',
      note: 'VNAV 爬升页。ECON 速度由成本指数计算，或输入选定速度。',
      rows: (s) => [
        { l: { lbl: 'CRZ ALT', val: s.data.crzAlt || box(''), cls: 'val', key: 'CRZ ALT' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: 'ECON', val: 'ECON CLB', cls: 'val small', key: 'ECON' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: 'TRANS ALT', val: '10000', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '250 / 10000', val: '', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    CRZ: {
      title: () => 'ACT RTE 1 CRZ',
      full: 'CRZ', zh: '巡航', desc: '巡航高度/速度、风向温度、最佳高度、步进爬升',
      note: 'VNAV 巡航页。CI 与 ECON 决定经济巡航速度。',
      rows: (s) => [
        { l: { lbl: 'CRZ ALT', val: s.data.crzAlt || box(''), cls: 'val', key: 'CRZ ALT' }, r: { lbl: 'CI', val: s.data.ci || dash, cls: 'val small', key: '' } },
        { l: { lbl: 'ECON', val: 'M0.78', cls: 'val small', key: 'ECON' }, r: { lbl: 'OPT', val: 'FL350', cls: 'val small', key: 'OPT' } },
        { l: { lbl: 'WIND', val: '250/40', cls: 'val small', key: '' }, r: { lbl: 'SAT', val: '-55°C', cls: 'val small', key: '' } },
        { l: { lbl: 'STEP', val: dash, cls: 'val small', key: 'STEP' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    DES: {
      title: () => 'ACT RTE 1 DES',
      full: 'DES', zh: '下降', desc: '下降速度、下降点、风与限制',
      note: 'VNAV 下降页。DES NOW 可提前开始下降。',
      rows: (s) => [
        { l: { lbl: 'ECON', val: '280K', cls: 'val small', key: 'ECON' }, r: { lbl: 'DES NOW', val: '', cls: '', key: 'DES NOW' } },
        { l: { lbl: 'WIND', val: '230/25', cls: 'val small', key: '' }, r: { lbl: 'SAT', val: '-40°C', cls: 'val small', key: '' } },
        { l: { lbl: 'T/D', val: '80 NM', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '250 / 10000', val: '', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    PROG: {
      title: () => 'PROGRESS',
      full: 'PROGRESS', zh: '飞行进度', desc: '下一航路点距离/ETA、目的地燃油与预计',
      note: '巡航中查看的实时进度页。显示距离、ETA、剩余燃油等预测数据。',
      rows: (s) => [
        { l: { lbl: 'NEXT WPT', val: 'KINGS', cls: 'val small', key: '' }, r: { lbl: 'DET', val: '42.5 NM', cls: 'val small', key: '' } },
        { l: { lbl: 'ETA', val: '1435Z', cls: 'val small', key: '' }, r: { lbl: 'FUEL', val: s.data.blockFuel || '22.4', cls: 'val small', key: '' } },
        { l: { lbl: 'DEST', val: s.data.dest || '----', cls: 'val small', key: '' }, r: { lbl: 'ETA', val: '1648Z', cls: 'val small', key: '' } },
        { l: { lbl: 'FUEL REM', val: '8.6', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    'DIR INTC': {
      title: () => 'DIR/INTC',
      full: 'DIRECT/INTERCEPT', zh: '直飞/切入', desc: '直飞航路点或切入航段',
      note: 'ATC 给 direct 时使用。输入后生成 MOD，需 EXEC 生效。',
      rows: (s) => [
        { l: { lbl: 'DIRECT TO', val: box(s.data.directTo || ''), cls: 'val', key: 'DIRECT TO' }, r: { lbl: 'INTC LEG TO', val: box(''), cls: 'val', key: 'INTC LEG TO' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    'DEP ARR': {
      title: () => 'DEP/ARR INDEX',
      full: 'DEP/ARR', zh: '离场/进场', desc: 'SID、STAR、进近与跑道选择',
      note: '选择后自动进入 RTE 与 LEGS。',
      rows: (s) => [
        { l: { lbl: '<DEPARTURES', val: s.data.origin || '', cls: 'prompt', key: 'DEPARTURES' }, r: { lbl: '<ARRIVALS', val: s.data.dest || '', cls: 'prompt', key: 'ARRIVALS' } },
        { l: { lbl: '<APPROACH', val: '', cls: 'prompt', key: 'APPROACH' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '<RUNWAY', val: s.data.runway || '', cls: 'prompt', key: 'RUNWAY' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    'APPROACH': {
      title: () => 'APPROACH REF',
      full: 'APPROACH REF', zh: '进近参考', desc: '进近跑道、进近类型与着陆重量',
      note: '进近参考页显示所选进近与跑道，以及基于重量的进近速度参考。',
      rows: (s) => [
        { l: { lbl: 'G/P', val: 'ILS 27L', cls: 'val small', key: 'G/P' }, r: { lbl: 'RWY', val: s.data.runway || box(''), cls: 'val', key: 'RWY' } },
        { l: { lbl: 'VREF', val: box(s.data.vref || ''), cls: 'val', key: 'VREF' }, r: { lbl: 'FLAP', val: '30', cls: 'val small', key: '' } },
        { l: { lbl: 'GW', val: s.data.gw || dash, cls: 'val small', key: '' }, r: { lbl: 'CG', val: dash, cls: 'val small', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    HOLD: {
      title: () => 'HOLD AT',
      full: 'HOLD', zh: '等待', desc: '等待点、向台航迹、转弯方向、腿长',
      note: '建立等待航线。HOLD 页 6L 是 NEXT HOLD 而非 ERASE。',
      rows: () => [
        { l: { lbl: 'HOLD AT', val: box(''), cls: 'val', key: 'HOLD AT' }, r: { lbl: 'INBD CRS', val: box(''), cls: 'val', key: 'INBD CRS' } },
        { l: { lbl: 'TURN', val: 'RIGHT', cls: 'val small', key: 'TURN' }, r: { lbl: 'LEG TIME', val: '01:30', cls: 'val small', key: 'LEG TIME' } },
        { l: { lbl: 'HOLD SPEED', val: '230', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: 'NEXT HOLD', val: '', cls: 'prompt', key: 'NEXT HOLD' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    FIX: {
      title: () => 'FIX',
      full: 'FIX', zh: '定位点', desc: '在导航显示建立参考圈/径向线',
      note: 'FIX 页仅用于情景意识，不改变航路。',
      rows: () => [
        { l: { lbl: 'FIX', val: box(''), cls: 'val', key: 'FIX' }, r: { lbl: 'RADIUS', val: '30', cls: 'val small', key: 'RADIUS' } },
        { l: { lbl: 'BRG', val: '090°', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    },
    MENU: {
      title: () => 'FMC MENU',
      full: 'FMC MENU', zh: 'FMC 菜单', desc: 'FMC 功能主菜单',
      note: '从菜单可直接进入各功能页面。部分页面（如 INIT REF）只有菜单入口。',
      rows: () => [
        { l: { lbl: '<INIT REF', val: '', cls: 'prompt', key: 'INIT REF' }, r: { lbl: '<RTE', val: '', cls: 'prompt', key: 'RTE' } },
        { l: { lbl: '<CLB', val: '', cls: 'prompt', key: 'CLB' }, r: { lbl: '<CRZ', val: '', cls: 'prompt', key: 'CRZ' } },
        { l: { lbl: '<DES', val: '', cls: 'prompt', key: 'DES' }, r: { lbl: '<PROG', val: '', cls: 'prompt', key: 'PROG' } },
        { l: { lbl: '<N1 LIMIT', val: '', cls: 'prompt', key: 'N1 LIMIT' }, r: { lbl: '<FIX', val: '', cls: 'prompt', key: 'FIX' } },
        { l: { lbl: '<LEGS', val: '', cls: 'prompt', key: 'LEGS' }, r: { lbl: '<DEP ARR', val: '', cls: 'prompt', key: 'DEP ARR' } },
        { l: { lbl: '<DIR INTC', val: '', cls: 'prompt', key: 'DIR INTC' }, r: { lbl: '<HOLD', val: '', cls: 'prompt', key: 'HOLD' } }
      ]
    },
    'NAV DATA': {
      title: () => 'NAV DATA',
      full: 'NAV DATA', zh: '导航数据', desc: '导航数据库有效与航路点查询',
      note: '1R 从 INIT/REF INDEX 进入。可核对数据库周期。',
      rows: (s) => [
        { l: { lbl: 'ACTIVE', val: s.data.navDate || '2605/2611', cls: 'val small', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: 'IDENT', val: box(''), cls: 'val', key: 'IDENT' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } },
        { l: { lbl: '', val: '', cls: '', key: '' }, r: { lbl: '', val: '', cls: '', key: '' } }
      ]
    }
  };

  const PAGE_GROUPS = {
    INIT: ['INIT REF', 'IDENT', 'POS', 'PERF INIT', 'TAKEOFF', 'APPROACH', 'NAV DATA'],
    RTE: ['RTE', 'LEGS', 'DEP ARR', 'HOLD', 'DIR INTC'],
    VNAV: ['CLB', 'CRZ', 'DES'],
    PROG: ['PROG'],
    N1: ['N1 LIMIT'],
    FIX: ['FIX'],
    MENU: ['MENU']
  };

  const FUNCTION_PAGE = {
    'RTE': 'RTE', 'FPLN': 'RTE', 'LEGS': 'LEGS', 'HOLD': 'HOLD', 'DEP ARR': 'DEPARTURES',
    'N1 LIMIT': 'N1 LIMIT', 'FIX': 'FIX', 'CLB': 'CLB', 'CRZ': 'CRZ',
    'DES': 'DES', 'MENU': 'MENU', 'INIT REF': 'INIT REF', 'DIR INTC': 'DIR INTC',
    'VNAV': 'CLB', 'LNAV': 'LEGS', 'VOR': 'NAV DATA', 'NDB': 'NAV DATA',
    'ILS': 'APPROACH', 'DISPLAY': 'MENU', 'ALT': 'CRZ', 'APPROACH': 'APPROACH'
  };

  window.MCDU_PAGES = PAGES;
  window.MCDU_PAGE_GROUPS = PAGE_GROUPS;
  window.MCDU_FUNCTION_PAGE = FUNCTION_PAGE;
})();
