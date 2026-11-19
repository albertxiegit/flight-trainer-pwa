(function () {
  const dash = (v, fallback = '----') => (v === '' || v == null || v === undefined) ? fallback : String(v);

  const row = (o) => Object.assign({
    lLabel: '', lValue: '', rLabel: '', rValue: '',
    lKey: null, rKey: null, lAction: null, rAction: null,
    lClass: '', rClass: ''
  }, o);

  const perfRow = (label, prefix, data, i, extraLeft) => row({
    lLabel: label, lValue: dash(data, '---'), lKey: `${prefix}.${i}`, lClass: 'editable',
    rLabel: extraLeft ? extraLeft.label : '', rValue: extraLeft ? dash(extraLeft.value, '---') : '',
    rKey: extraLeft ? extraLeft.key : null, rClass: extraLeft ? 'editable' : ''
  });

  const PAGES = {
    MENU: {
      full: 'MCDU MENU', zh: 'MCDU 菜单', desc: '各功能入口页面',
      note: '功能入口页。按左 LSK 进入对应功能，也可以直接按面板上的功能键。',
      title: () => 'ATR AVIONICS / FMS 220',
      rows: () => [
        row({ lLabel: '<FMGC INIT', lAction: 'INIT', lClass: 'editable', rLabel: 'DATA>', rAction: 'DATA', rClass: 'editable' }),
        row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable', rLabel: 'STATUS>', rAction: 'STATUS', rClass: 'editable' }),
        row({ lLabel: '<PERF', lAction: 'PERF', lClass: 'editable', rLabel: 'MESSAGE>', rAction: 'MSG', rClass: 'editable' }),
        row({ lLabel: '<PROG', lAction: 'PROG1', lClass: 'editable', rLabel: 'ATSU>', rAction: 'ATSU', rClass: 'editable' }),
        row({ lLabel: '<RAD TUNE', lAction: 'RAD', lClass: 'editable', rLabel: 'AIDS>', rAction: 'AIDS', rClass: 'editable' }),
        row({ lLabel: '<FUEL PRED', lAction: 'FUEL', lClass: 'editable', rLabel: 'VNAV>', rAction: 'VNAV', rClass: 'editable' })
      ]
    },

    INIT: {
      full: 'Flight Plan Initialization 1/2', zh: '飞行计划初始化 1/2', desc: '起点、终点、航班号、成本指数、巡航高度',
      note: '初始化第 1 页。输入 ICAO 四字码、航班号、成本指数和巡航高度层，再按对应 LSK。',
      title: () => 'FPLN INIT 1/2',
      rows: (s) => [
        row({ lLabel: 'FROM', lValue: dash(s.data.from), lKey: 'from', lClass: 'editable', rLabel: 'TO', rValue: dash(s.data.to), rKey: 'to', rClass: 'editable' }),
        row({ lLabel: 'FLT NBR', lValue: dash(s.data.fltNo, '--------'), lKey: 'fltNo', lClass: 'editable' }),
        row({ lLabel: 'COST INDEX', lValue: dash(s.data.costIdx, '---'), lKey: 'costIdx', lClass: 'editable', rLabel: 'CRZ FL', rValue: dash(s.data.crzFl, 'FL---'), rKey: 'crzFl', rClass: 'editable' }),
        row({ lLabel: 'FPLN', lValue: dash(s.data.route, '--------'), lKey: 'route', lClass: 'editable' }),
        row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable', rLabel: 'INIT 2>', rAction: 'INIT2', rClass: 'editable' }),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'PERF>', rAction: 'PERF', rClass: 'editable' })
      ]
    },

    INIT2: {
      full: 'Flight Plan Initialization 2/2', zh: '飞行计划初始化 2/2', desc: '燃油、重量与导航数据库',
      note: '初始化第 2 页。输入零燃油重量、重心、燃油与导航数据库日期。',
      title: () => 'FPLN INIT 2/2',
      rows: (s) => [
        row({ lLabel: 'ZFW', lValue: dash(s.data.zfw, '----'), lKey: 'zfw', lClass: 'editable', rLabel: 'ZFW CG', rValue: dash(s.data.zfwcg, '--.-'), rKey: 'zfwcg', rClass: 'editable' }),
        row({ lLabel: 'BLOCK FUEL', lValue: dash(s.data.blockFuel, '----'), lKey: 'blockFuel', lClass: 'editable' }),
        row({ lLabel: 'TRIP FUEL', lValue: dash(s.data.tripFuel, '----'), lKey: 'tripFuel', lClass: 'editable' }),
        row({ lLabel: 'NAV DB', lValue: dash(s.data.navDb, '--------'), lKey: 'navDb', lClass: 'editable' }),
        row({ lLabel: '<INIT 1', lAction: 'INIT', lClass: 'editable', rLabel: 'FPLN>', rAction: 'FPLN', rClass: 'editable' }),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable' })
      ]
    },

    FPLN: {
      full: 'Flight Plan', zh: '飞行计划', desc: '编辑和查看航路点',
      note: '飞行计划页。用暂存区输入航路点后按 1L 添加；1R 去离场，2R 去进场，6R 去进度。',
      title: () => 'F-PLN',
      rows: (s) => {
        const list = s.data.fpln.slice(0, 5);
        const rows = list.map((w, i) => row({
          lLabel: `${i + 1}`, lValue: w, lClass: 'editable',
          rLabel: i === 0 ? 'TO' : '', rValue: i === 0 ? dash(s.data.to) : ''
        }));
        while (rows.length < 5) rows.push(row());
        rows.push(row({
          lLabel: '<INIT', lAction: 'INIT', lClass: 'editable',
          rLabel: 'DEPART>', rAction: 'DEPART', rClass: 'editable'
        }));
        return rows;
      }
    },

    DEPART: {
      full: 'Departure', zh: '离场程序', desc: 'SID 与离场跑道',
      note: '离场页。输入 SID 名称或离场跑道后按对应 LSK。',
      title: () => 'DEPARTURE',
      rows: (s) => [
        row({ lLabel: 'SID', lValue: dash(s.data.sid, '--------'), lKey: 'sid', lClass: 'editable', rLabel: 'RWY', rValue: dash(s.data.depRwy, '--'), rKey: 'depRwy', rClass: 'editable' }),
        row({ lLabel: 'TRANS', lValue: dash(s.data.trans, '--------'), lKey: 'trans', lClass: 'editable' }),
        row({ lLabel: 'OFFSET', lValue: dash(s.data.offset, '---'), lKey: 'offset', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable', rLabel: 'ARRIV>', rAction: 'ARRIV', rClass: 'editable' })
      ]
    },

    ARRIV: {
      full: 'Arrival', zh: '进场程序', desc: 'STAR、进近与着陆跑道',
      note: '进场页。输入 STAR、进近类型和跑道。',
      title: () => 'ARRIVAL',
      rows: (s) => [
        row({ lLabel: 'STAR', lValue: dash(s.data.star, '--------'), lKey: 'star', lClass: 'editable', rLabel: 'RWY', rValue: dash(s.data.arrRwy, '--'), rKey: 'arrRwy', rClass: 'editable' }),
        row({ lLabel: 'APPR', lValue: dash(s.data.appr, '----'), lKey: 'appr', lClass: 'editable' }),
        row({ lLabel: 'VIA', lValue: dash(s.data.via, '--------'), lKey: 'via', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<DEPART', lAction: 'DEPART', lClass: 'editable', rLabel: 'HOLD>', rAction: 'HOLD', rClass: 'editable' })
      ]
    },

    HOLD: {
      full: 'Hold', zh: '等待航线', desc: '等待点、入航向与长度',
      note: '等待航线页。输入等待点、入航方向和等待时间/距离。',
      title: () => 'HOLD',
      rows: (s) => [
        row({ lLabel: 'HOLD WP', lValue: dash(s.data.holdWp, '----'), lKey: 'holdWp', lClass: 'editable', rLabel: 'INBD CRS', rValue: dash(s.data.holdCrs, '---°'), rKey: 'holdCrs', rClass: 'editable' }),
        row({ lLabel: 'TIME', lValue: dash(s.data.holdTime, '--'), lKey: 'holdTime', lClass: 'editable', rLabel: 'DIST', rValue: dash(s.data.holdDist, '--'), rKey: 'holdDist', rClass: 'editable' }),
        row({ lLabel: 'SPD', lValue: dash(s.data.holdSpd, '---'), lKey: 'holdSpd', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<ARRIV', lAction: 'ARRIV', lClass: 'editable', rLabel: 'FPLN>', rAction: 'FPLN', rClass: 'editable' })
      ]
    },

    FPLN_SEC: {
      full: 'Secondary Flight Plan', zh: '备用飞行计划', desc: '复制或比较备用计划',
      note: '备用飞行计划页（简化）。可保存当前计划为备用。',
      title: () => 'SECONDARY FPLN',
      rows: (s) => [
        row({ lLabel: 'ACTIVE', lValue: dash(s.data.from) + '/' + dash(s.data.to) }),
        row({ lLabel: 'SECONDARY', lValue: s.data.secFpln ? 'COPIED' : 'EMPTY' }),
        row(),
        row({ lLabel: '<COPY ACTIVE', lAction: 'COPY_FPLN', lClass: 'editable' }),
        row(),
        row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable' })
      ]
    },

    PROG1: {
      full: 'Progress 1/2', zh: '飞行进度 1/2', desc: '当前位置、下一航路点与剩余航段',
      note: '进度第 1 页。显示简化的航路进度与估算。',
      title: () => 'PROGRESS 1/2',
      rows: (s) => {
        const legs = Math.max(s.data.fpln.length, 1);
        return [
          row({ lLabel: 'FROM', lValue: dash(s.data.from), rLabel: 'TO', rValue: dash(s.data.to) }),
          row({ lLabel: 'CRZ FL', lValue: dash(s.data.crzFl, 'FL---'), rLabel: 'COST INDEX', rValue: dash(s.data.costIdx, '---') }),
          row({ lLabel: 'NEXT WP', lValue: s.data.fpln[0] || '----', rLabel: 'LEGS', rValue: String(legs) }),
          row({ lLabel: 'DIST', lValue: String(legs * 42) + ' NM', rLabel: 'ETE', rValue: String(legs * 6) + ' MIN' }),
          row({ lLabel: 'FUEL', lValue: dash(s.data.tripFuel, '----') + ' KG' }),
          row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable', rLabel: 'PROG 2>', rAction: 'PROG2', rClass: 'editable' })
        ];
      }
    },

    PROG2: {
      full: 'Progress 2/2', zh: '飞行进度 2/2', desc: '风向、温度与到达信息',
      note: '进度第 2 页。这里输入或查看巡航风与预计到达信息（简化）。',
      title: () => 'PROGRESS 2/2',
      rows: (s) => [
        row({ lLabel: 'WIND', lValue: dash(s.data.wind, '---/--'), lKey: 'wind', lClass: 'editable', rLabel: 'TEMP', rValue: dash(s.data.sat, '--°'), rKey: 'sat', rClass: 'editable' }),
        row({ lLabel: 'TAS', lValue: dash(s.data.tas, '---'), lKey: 'tas', lClass: 'editable' }),
        row({ lLabel: 'ETA', lValue: dash(s.data.eta, '--:--'), lKey: 'eta', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<PROG 1', lAction: 'PROG1', lClass: 'editable', rLabel: 'FUEL>', rAction: 'FUEL', rClass: 'editable' })
      ]
    },

    PERF: {
      full: 'Performance Takeoff', zh: '起飞性能', desc: 'V1/VR/V2、襟翼、配平、FLEX',
      note: '起飞性能页。依次输入 V1、VR、V2、襟翼/配平与 FLEX 温度。',
      title: () => 'PERF TO',
      rows: (s) => [
        row({ lLabel: 'V1', lValue: dash(s.data.perf.v1, '---'), lKey: 'perf.v1', lClass: 'editable' }),
        row({ lLabel: 'VR', lValue: dash(s.data.perf.vr, '---'), lKey: 'perf.vr', lClass: 'editable' }),
        row({ lLabel: 'V2', lValue: dash(s.data.perf.v2, '---'), lKey: 'perf.v2', lClass: 'editable', rLabel: 'FLAPS/THS', rValue: `${dash(s.data.perf.flaps, '--')}/${dash(s.data.perf.ths, '--')}`, rKey: 'perf.flaps', rClass: 'editable' }),
        row({ lLabel: 'FLEX TEMP', lValue: dash(s.data.perf.flex, '---°'), lKey: 'perf.flex', lClass: 'editable' }),
        row({ lLabel: 'THR RED/ACC', lValue: dash(s.data.perf.thrRed, '---/---'), lKey: 'perf.thrRed', lClass: 'editable' }),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'CLB>', rAction: 'PERF_CL', rClass: 'editable' })
      ]
    },

    PERF_CL: {
      full: 'Performance Climb', zh: '爬升性能', desc: '爬升速度与高度限制',
      note: '爬升性能页。输入爬升速度、过渡高度和减推力高度。',
      title: () => 'PERF CLB',
      rows: (s) => [
        row({ lLabel: 'CLB SPD', lValue: dash(s.data.clb.spd, '---'), lKey: 'clb.spd', lClass: 'editable' }),
        row({ lLabel: 'THR RED', lValue: dash(s.data.clb.thrRed, 'FL---'), lKey: 'clb.thrRed', lClass: 'editable' }),
        row({ lLabel: 'ACCEL HT', lValue: dash(s.data.clb.accHt, '----'), lKey: 'clb.accHt', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<TO', lAction: 'PERF', lClass: 'editable', rLabel: 'CRZ>', rAction: 'PERF_CR', rClass: 'editable' })
      ]
    },

    PERF_CR: {
      full: 'Performance Cruise', zh: '巡航性能', desc: '巡航高度、速度与风',
      note: '巡航性能页。可输入巡航高度层与巡航速度。',
      title: () => 'PERF CRZ',
      rows: (s) => [
        row({ lLabel: 'CRZ FL', lValue: dash(s.data.crzFl, 'FL---'), lKey: 'crzFl', lClass: 'editable' }),
        row({ lLabel: 'CRZ SPD', lValue: dash(s.data.crz.spd, '---'), lKey: 'crz.spd', lClass: 'editable' }),
        row({ lLabel: 'WIND', lValue: dash(s.data.wind, '---/--'), lKey: 'wind', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<CLB', lAction: 'PERF_CL', lClass: 'editable', rLabel: 'DES>', rAction: 'PERF_DE', rClass: 'editable' })
      ]
    },

    PERF_DE: {
      full: 'Performance Descent', zh: '下降性能', desc: '下降速度、过渡高度',
      note: '下降性能页。输入下降速度和过渡高度层。',
      title: () => 'PERF DES',
      rows: (s) => [
        row({ lLabel: 'DES SPD', lValue: dash(s.data.des.spd, '---'), lKey: 'des.spd', lClass: 'editable' }),
        row({ lLabel: 'TRANS FL', lValue: dash(s.data.des.transFl, 'FL---'), lKey: 'des.transFl', lClass: 'editable' }),
        row({ lLabel: 'DES WIND', lValue: dash(s.data.des.wind, '---/--'), lKey: 'des.wind', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<CRZ', lAction: 'PERF_CR', lClass: 'editable', rLabel: 'APPR>', rAction: 'PERF_AP', rClass: 'editable' })
      ]
    },

    PERF_AP: {
      full: 'Performance Approach', zh: '进近性能', desc: 'VAPP、襟翼与复飞高度',
      note: '进近性能页。输入进近速度、襟翼构型和复飞高度。',
      title: () => 'PERF APPR',
      rows: (s) => [
        row({ lLabel: 'VAPP', lValue: dash(s.data.appr.vapp, '---'), lKey: 'appr.vapp', lClass: 'editable', rLabel: 'FLAPS', rValue: dash(s.data.appr.flaps, '--'), rKey: 'appr.flaps', rClass: 'editable' }),
        row({ lLabel: 'MISSED APPR FL', lValue: dash(s.data.appr.missedFl, 'FL---'), lKey: 'appr.missedFl', lClass: 'editable' }),
        row(), row(), row(),
        row({ lLabel: '<DES', lAction: 'PERF_DE', lClass: 'editable', rLabel: 'GA>', rAction: 'PERF_GA', rClass: 'editable' })
      ]
    },

    PERF_GA: {
      full: 'Performance Go Around', zh: '复飞性能', desc: '复飞形态与速度',
      note: '复飞性能页。输入复飞速度和襟翼形态。',
      title: () => 'PERF GA',
      rows: (s) => [
        row({ lLabel: 'GA SPD', lValue: dash(s.data.ga.spd, '---'), lKey: 'ga.spd', lClass: 'editable' }),
        row({ lLabel: 'GA FLAPS', lValue: dash(s.data.ga.flaps, '--'), lKey: 'ga.flaps', lClass: 'editable' }),
        row(), row(), row(),
        row({ lLabel: '<APPR', lAction: 'PERF_AP', lClass: 'editable', rLabel: 'TO>', rAction: 'PERF', rClass: 'editable' })
      ]
    },

    FUEL: {
      full: 'Fuel Prediction', zh: '燃油预测', desc: '剩余燃油、航程与储备',
      note: '燃油预测页。输入总燃油、航段耗油和储备。',
      title: () => 'FUEL PRED',
      rows: (s) => [
        row({ lLabel: 'BLOCK FUEL', lValue: dash(s.data.blockFuel, '----'), lKey: 'blockFuel', lClass: 'editable' }),
        row({ lLabel: 'TRIP FUEL', lValue: dash(s.data.tripFuel, '----'), lKey: 'tripFuel', lClass: 'editable' }),
        row({ lLabel: 'RESERVES', lValue: dash(s.data.reserves, '----'), lKey: 'reserves', lClass: 'editable' }),
        row({ lLabel: 'EXTRA', lValue: dash(s.data.extra, '----'), lKey: 'extra', lClass: 'editable' }),
        row(),
        row({ lLabel: '<PROG', lAction: 'PROG2', lClass: 'editable', rLabel: 'INIT>', rAction: 'INIT2', rClass: 'editable' })
      ]
    },

    RAD: {
      full: 'Radio Navigation', zh: '无线电调谐', desc: 'VOR / ILS / ADF 频率调谐',
      note: '无线电调谐页。输入频率格式 XXX.XX 后按对应 LSK。',
      title: () => 'RAD NAV / TUNE',
      rows: (s) => [
        row({ lLabel: 'VOR1', lValue: dash(s.data.rad.vor1, '---.--'), lKey: 'rad.vor1', lClass: 'editable', rLabel: 'VOR2', rValue: dash(s.data.rad.vor2, '---.--'), rKey: 'rad.vor2', rClass: 'editable' }),
        row({ lLabel: 'ILS1', lValue: dash(s.data.rad.ils1, '---.--'), lKey: 'rad.ils1', lClass: 'editable', rLabel: 'ILS2', rValue: dash(s.data.rad.ils2, '---.--'), rKey: 'rad.ils2', rClass: 'editable' }),
        row({ lLabel: 'ADF1', lValue: dash(s.data.rad.adf1, '---'), lKey: 'rad.adf1', lClass: 'editable', rLabel: 'ADF2', rValue: dash(s.data.rad.adf2, '---'), rKey: 'rad.adf2', rClass: 'editable' }),
        row({ lLabel: 'CRS1', lValue: dash(s.data.rad.course1, '---°'), lKey: 'rad.course1', lClass: 'editable', rLabel: 'CRS2', rValue: dash(s.data.rad.course2, '---°'), rKey: 'rad.course2', lClass: 'editable', rClass: 'editable' }),
        row(),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'VNAV>', rAction: 'VNAV', rClass: 'editable' })
      ]
    },

    DTO: {
      full: 'Direct To', zh: '直飞', desc: '从当前位置直飞指定航路点',
      note: '直飞页。输入航路点后按 1L，或按 6L 执行直飞。',
      title: () => 'DIRECT TO',
      rows: (s) => [
        row({ lLabel: 'TO', lValue: dash(s.data.dtoWp, '----'), lKey: 'dtoWp', lClass: 'editable' }),
        row({ lLabel: 'BEARING', lValue: s.data.dtoWp ? '---°' : '----' }),
        row({ lLabel: 'DIST', lValue: s.data.dtoWp ? '--- NM' : '----' }),
        row(), row(),
        row({ lLabel: '<EXEC DTO', lAction: 'EXEC_DTO', lClass: 'editable', rLabel: 'FPLN>', rAction: 'FPLN', rClass: 'editable' })
      ]
    },

    VNAV: {
      full: 'Vertical Navigation 1/2', zh: '垂直导航 1/2', desc: '高度限制与剖面',
      note: '垂直导航第 1 页。输入高度限制和速度限制。',
      title: () => 'VNAV 1/2',
      rows: (s) => [
        row({ lLabel: 'ALT CSTR', lValue: dash(s.data.vnav.altCstr, 'FL---'), lKey: 'vnav.altCstr', lClass: 'editable' }),
        row({ lLabel: 'SPD CSTR', lValue: dash(s.data.vnav.spdCstr, '---'), lKey: 'vnav.spdCstr', lClass: 'editable' }),
        row({ lLabel: 'T/C OAT', lValue: dash(s.data.vnav.oat, '--°'), lKey: 'vnav.oat', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<RAD', lAction: 'RAD', lClass: 'editable', rLabel: 'VNAV 2>', rAction: 'VNAV2', rClass: 'editable' })
      ]
    },

    VNAV2: {
      full: 'Vertical Navigation 2/2', zh: '垂直导航 2/2', desc: '进近环境与过渡高度',
      note: '垂直导航第 2 页。可输入 QNH、过渡高度和进近环境数据。',
      title: () => 'VNAV 2/2',
      rows: (s) => [
        row({ lLabel: 'QNH', lValue: dash(s.data.vnav.qnh, '----'), lKey: 'vnav.qnh', lClass: 'editable', rLabel: 'TRANS FL', rValue: dash(s.data.vnav.transFl, 'FL---'), rKey: 'vnav.transFl', rClass: 'editable' }),
        row({ lLabel: 'APP ENV', lValue: dash(s.data.vnav.appEnv, '----'), lKey: 'vnav.appEnv', lClass: 'editable' }),
        row(), row(), row(),
        row({ lLabel: '<VNAV 1', lAction: 'VNAV', lClass: 'editable', rLabel: 'PERF>', rAction: 'PERF', rClass: 'editable' })
      ]
    },

    DATA: {
      full: 'Data', zh: '数据页', desc: '导航数据库与位置',
      note: '数据页。可查看或简化输入导航数据库、GPS 位置。',
      title: () => 'DATA',
      rows: (s) => [
        row({ lLabel: 'NAV DB', lValue: dash(s.data.navDb, '--------'), lKey: 'navDb', lClass: 'editable' }),
        row({ lLabel: 'GPS POS', lValue: dash(s.data.gpsPos, '----N ----E') , lKey: 'gpsPos', lClass: 'editable' }),
        row({ lLabel: 'GPS TIME', lValue: dash(s.data.gpsTime, '--:--Z'), lKey: 'gpsTime', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'STATUS>', rAction: 'STATUS', rClass: 'editable' })
      ]
    },

    STATUS: {
      full: 'Status', zh: '状态', desc: '当前输入与练习状态',
      note: '状态页。显示当前练习输入概要。',
      title: () => 'STATUS',
      rows: (s) => [
        row({ lLabel: 'FROM/TO', lValue: `${dash(s.data.from)}/${dash(s.data.to)}` }),
        row({ lLabel: 'FLT NBR', lValue: dash(s.data.fltNo, '--------') }),
        row({ lLabel: 'FPLN LEGS', lValue: String(s.data.fpln.length) }),
        row({ lLabel: 'V1/VR/V2', lValue: `${dash(s.data.perf.v1, '---')}/${dash(s.data.perf.vr, '---')}/${dash(s.data.perf.v2, '---')}` }),
        row({ lLabel: 'MESSAGES', lValue: String(s.data.messages.length) }),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'INIT>', rAction: 'INIT', rClass: 'editable' })
      ]
    },

    MSG: {
      full: 'Message', zh: '消息', desc: 'FMS 提示信息',
      note: '消息页。显示系统提示；按 6L 清空。',
      title: () => 'MESSAGE',
      rows: (s) => {
        const msgs = s.data.messages.slice(-5);
        const rows = msgs.map((m) => row({ lLabel: '•', lValue: m.slice(0, 24) }));
        while (rows.length < 5) rows.push(row());
        rows.push(row({ lLabel: '<CLEAR MSG', lAction: 'CLEAR_MSG', lClass: 'editable', rLabel: 'STATUS>', rAction: 'STATUS', rClass: 'editable' }));
        return rows;
      }
    },

    ATSU: {
      full: 'Air Traffic Service Unit', zh: '空中交通服务单元', desc: 'ATC/AOC 数据链（占位）',
      note: 'ATSU 页面（占位）。本练习器暂不实现数据链功能。',
      title: () => 'ATSU',
      rows: () => [
        row({ lLabel: 'ATC', lValue: 'NOT AVAILABLE' }),
        row({ lLabel: 'AOC', lValue: 'NOT AVAILABLE' }),
        row(), row(), row(),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable' })
      ]
    },

    AIDS: {
      full: 'Aircraft Integrated Data System', zh: '飞机综合数据系统', desc: '维护数据（占位）',
      note: 'AIDS 页面（占位）。',
      title: () => 'AIDS',
      rows: () => [row({ lLabel: 'AIDS', lValue: 'NOT AVAILABLE' }), row(), row(), row(), row(), row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable' })]
    },

    CFDS: {
      full: 'Centralized Fault Display System', zh: '中央故障显示系统', desc: '故障信息（占位）',
      note: 'CFDS 页面（占位）。',
      title: () => 'CFDS',
      rows: () => [row({ lLabel: 'CFDS', lValue: 'NO FAULT' }), row(), row(), row(), row(), row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable' })]
    },

    SATCOM: {
      full: 'Satellite Communications', zh: '卫星通信', desc: '卫星通信（占位）',
      note: 'SATCOM 页面（占位）。',
      title: () => 'SATCOM',
      rows: () => [row({ lLabel: 'SATCOM', lValue: 'NOT AVAILABLE' }), row(), row(), row(), row(), row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable' })]
    },

    RMS: {
      full: 'Radio Management System', zh: '无线电管理', desc: '本练习器中为占位页',
      note: 'RMS 页面（占位）。',
      title: () => 'RMS',
      rows: () => [row({ lLabel: 'RMS', lValue: 'NOT IMPLEMENTED' }), row(), row(), row(), row(), row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable' })]
    },

    MRK: {
      full: 'Marker', zh: '信标指示', desc: '本练习器中为占位页',
      note: 'MRK 页面（占位）。',
      title: () => 'MARKER',
      rows: () => [row({ lLabel: 'MARKER', lValue: '---' }), row(), row(), row(), row(), row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable' })]
    }
  };

  Object.assign(PAGES, {
    INIT_POW: {
      full: 'Power On / Identification', zh: '上电识别', desc: '机型、发动机与导航数据库有效期',
      note: '上电页面。检查数据库有效期；REAL ATR 上电后先到此页。',
      title: () => 'POWER ON',
      rows: (s) => [
        row({ lLabel: 'A/C', lValue: 'ATR 72-600' }),
        row({ lLabel: 'ENG', lValue: 'PW127XT' }),
        row({ lLabel: 'NAV DB', lValue: dash(s.data.navDb, '--------') }),
        row({ lLabel: 'EXP DATE', lValue: dash(s.data.dbExp, '----/--') }),
        row(),
        row({ lLabel: '<POS INIT', lAction: 'POS_INIT', lClass: 'editable', rLabel: 'MENU>', rAction: 'MENU', rClass: 'editable' })
      ]
    },
    POS_INIT: {
      full: 'Position Initialization', zh: '位置初始化', desc: 'GPS 位置/机场参考点与 IRS 对齐',
      note: '位置初始化页。把 GPS POS 复制到 REF POS，然后按 ALIGN IRS。',
      title: () => 'POS INIT',
      rows: (s) => [
        row({ lLabel: 'GPS POS', lValue: dash(s.data.gpsPos, 'N---- W-----'), lKey: 'gpsPos', lClass: 'editable' }),
        row({ lLabel: 'REF POS', lValue: dash(s.data.refPos, 'N---- W-----'), lKey: 'refPos', lClass: 'editable', rLabel: 'COPY GPS>', rAction: 'COPY_GPS', rClass: 'editable' }),
        row({ lLabel: 'ALIGN IRS', lAction: 'ALIGN_IRS', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'INIT>', rAction: 'INIT', rClass: 'editable' })
      ]
    },
    UNITS: {
      full: 'Units', zh: '单位设置', desc: '距离、速度、高度、温度单位',
      note: '单位设置页。真实 FMS220 有 UNITS 页面。',
      title: () => 'UNITS',
      rows: (s) => [
        row({ lLabel: 'DIST', lValue: dash(s.data.units.dist, 'NM'), lKey: 'units.dist', lClass: 'editable' }),
        row({ lLabel: 'SPEED', lValue: dash(s.data.units.spd, 'KT'), lKey: 'units.spd', lClass: 'editable' }),
        row({ lLabel: 'ALT', lValue: dash(s.data.units.alt, 'FT'), lKey: 'units.alt', lClass: 'editable' }),
        row({ lLabel: 'TEMP', lValue: dash(s.data.units.temp, 'C'), lKey: 'units.temp', lClass: 'editable' }),
        row(),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'INIT>', rAction: 'INIT', rClass: 'editable' })
      ]
    },
    DATUM: {
      full: 'Datum / Geo Datum', zh: '基准面', desc: '导航基准与地理基准',
      note: 'DATUM 页面（简化）。',
      title: () => 'DATUM',
      rows: (s) => [
        row({ lLabel: 'DATUM', lValue: dash(s.data.datum, 'WGS84'), lKey: 'datum', lClass: 'editable' }),
        row({ lLabel: 'GEO DATUM', lValue: dash(s.data.geoDatum, 'WGS84'), lKey: 'geoDatum', lClass: 'editable' }),
        row(), row(), row(),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable' })
      ]
    },
    ROUTE_SEL: {
      full: 'Route Selection', zh: '航路选择', desc: '公司航路、起降机场、备降与航班号',
      note: 'ROUTE SEL 页。CO RTE 可一次载入公司航路；也可直接设 FROM/TO/ALTN。',
      title: () => 'ROUTE SEL',
      rows: (s) => [
        row({ lLabel: 'CO RTE', lValue: dash(s.data.coRte, '---------'), lKey: 'coRte', lClass: 'editable' }),
        row({ lLabel: 'FROM', lValue: dash(s.data.from), lKey: 'from', lClass: 'editable', rLabel: 'TO', rValue: dash(s.data.to), rKey: 'to', rClass: 'editable' }),
        row({ lLabel: 'ALTN', lValue: dash(s.data.altn), lKey: 'altn', lClass: 'editable', rLabel: 'ALTN RTE', rValue: dash(s.data.altnRte, '--------'), rKey: 'altnRte', rClass: 'editable' }),
        row({ lLabel: 'FLT ID', lValue: dash(s.data.fltNo, '--------'), lKey: 'fltNo', lClass: 'editable' }),
        row(),
        row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable', rLabel: 'EXEC>', rAction: 'EXEC', rClass: 'editable' })
      ]
    },
    LTRL_REV: {
      full: 'Lateral Revision', zh: '横向修订', desc: '临时计划、直飞、偏置、飞越',
      note: '横向修订页。真实 FMS220 另有 DTO ABEAM / MOVING WPT / OFFSET / OVERFLY。',
      title: () => 'LTRL REV',
      rows: (s) => [
        row({ lLabel: 'TEMP PLAN', lValue: s.data.tempPlan ? 'ACTIVE' : 'EMPTY' }),
        row({ lLabel: '<DIRECT TO', lAction: 'DTO', lClass: 'editable' }),
        row({ lLabel: '<DTO ABEAM', lAction: 'DTO_ABEAM', lClass: 'editable' }),
        row({ lLabel: '<OFFSET', lAction: 'OFFSET', lClass: 'editable', rLabel: 'OVERFLY>', rAction: 'OVERFLY', rClass: 'editable' }),
        row(),
        row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable' })
      ]
    },
    VERT_REV: {
      full: 'Vertical Revision', zh: '垂直修订', desc: '高度/速度限制',
      note: '垂直修订页。输入高度/速度限制后按对应 LSK。',
      title: () => 'VERT REV',
      rows: (s) => [
        row({ lLabel: 'ALT CSTR', lValue: dash(s.data.vnav.altCstr, 'FL---'), lKey: 'vnav.altCstr', lClass: 'editable' }),
        row({ lLabel: 'SPD CSTR', lValue: dash(s.data.vnav.spdCstr, '---'), lKey: 'vnav.spdCstr', lClass: 'editable' }),
        row(), row(), row(),
        row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable' })
      ]
    },
    AIRWAY: {
      full: 'Airway', zh: '航路', desc: '航路输入',
      note: 'AIRWAY 页。输入航路名。',
      title: () => 'AIRWAY',
      rows: (s) => [
        row({ lLabel: 'AIRWAY', lValue: dash(s.data.airway, '--------'), lKey: 'airway', lClass: 'editable' }),
        row({ lLabel: 'FROM WPT', lValue: dash(s.data.fpln[0], '----') }),
        row(), row(), row(),
        row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable' })
      ]
    },
    WIND: {
      full: 'Wind', zh: '风', desc: '各高度层风向风速/温度',
      note: 'WIND 页。输入 FL / WIND / TEMP。',
      title: () => 'WIND',
      rows: (s) => [
        row({ lLabel: 'FL', lValue: dash(s.data.windFl, 'FL---'), lKey: 'windFl', lClass: 'editable' }),
        row({ lLabel: 'WIND', lValue: dash(s.data.wind, '---/--'), lKey: 'wind', lClass: 'editable' }),
        row({ lLabel: 'TEMP', lValue: dash(s.data.sat, '--°'), lKey: 'sat', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable', rLabel: 'PROG>', rAction: 'PROG1', rClass: 'editable' })
      ]
    },
    PROG3: {
      full: 'Progress 3/3', zh: '进度 3/3', desc: 'BCP NAV / GPS NAV / PRAIM / VNAV',
      note: '进度第 3 页。显示简化的导航源与 PRAIM 状态。',
      title: () => 'PROGRESS 3/3',
      rows: (s) => [
        row({ lLabel: 'NAV MODE', lValue: dash(s.data.navMode, 'BCP') }),
        row({ lLabel: 'GPS NAV', lValue: 'AVAILABLE' }),
        row({ lLabel: 'PRAIM', lValue: 'OK' }),
        row({ lLabel: 'VNAV', lValue: s.data.vnav.altCstr ? 'ACTIVE' : '---' }),
        row(),
        row({ lLabel: '<PROG 2', lAction: 'PROG2', lClass: 'editable', rLabel: 'FUEL>', rAction: 'FUEL', rClass: 'editable' })
      ]
    },
    PERF_INIT: {
      full: 'Performance Initialization', zh: '性能初始化', desc: '全重、燃油、零燃油重量、巡航高度',
      note: 'PERF INIT 页。输入 GW/ZFW/FUEL/CRZ FL/CI。',
      title: () => 'PERF INIT',
      rows: (s) => [
        row({ lLabel: 'GR WT', lValue: dash(s.data.grWt, '----'), lKey: 'grWt', lClass: 'editable' }),
        row({ lLabel: 'FUEL', lValue: dash(s.data.blockFuel, '----'), lKey: 'blockFuel', lClass: 'editable' }),
        row({ lLabel: 'ZFW', lValue: dash(s.data.zfw, '----'), lKey: 'zfw', lClass: 'editable', rLabel: 'ZFW CG', rValue: dash(s.data.zfwcg, '--.-'), rKey: 'zfwcg', rClass: 'editable' }),
        row({ lLabel: 'CRZ FL', lValue: dash(s.data.crzFl, 'FL---'), lKey: 'crzFl', lClass: 'editable', rLabel: 'CI', rValue: dash(s.data.costIdx, '---'), rKey: 'costIdx', rClass: 'editable' }),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'WEIGHT>', rAction: 'PERF_WEIGHT', rClass: 'editable' }),
        row({ lLabel: '<INIT', lAction: 'INIT', lClass: 'editable', rLabel: 'T/O>', rAction: 'PERF_TO', rClass: 'editable' })
      ]
    },
    PERF_WEIGHT: {
      full: 'Weight', zh: '重量', desc: 'GR WT / ZFW / FUEL / CG',
      note: 'WEIGHT 页。检查并输入重量与重心。',
      title: () => 'WEIGHT',
      rows: (s) => [
        row({ lLabel: 'GR WT', lValue: dash(s.data.grWt, '----'), lKey: 'grWt', lClass: 'editable' }),
        row({ lLabel: 'ZFW', lValue: dash(s.data.zfw, '----'), lKey: 'zfw', lClass: 'editable' }),
        row({ lLabel: 'FUEL', lValue: dash(s.data.blockFuel, '----'), lKey: 'blockFuel', lClass: 'editable' }),
        row({ lLabel: 'CG', lValue: dash(s.data.zfwcg, '--.-'), lKey: 'zfwcg', lClass: 'editable' }),
        row(),
        row({ lLabel: '<PERF INIT', lAction: 'PERF', lClass: 'editable', rLabel: 'T/O>', rAction: 'PERF_TO', rClass: 'editable' })
      ]
    },
    PERF_TO: {
      full: 'Takeoff', zh: '起飞性能', desc: 'V1/VR/V2、襟翼、配平、FLEX',
      note: 'TAKE OFF 页。输入 V1、VR、V2、FLAPS/THS、FLEX TEMP。',
      title: () => 'TAKE OFF',
      rows: (s) => [
        row({ lLabel: 'V1', lValue: dash(s.data.perf.v1, '---'), lKey: 'perf.v1', lClass: 'editable' }),
        row({ lLabel: 'VR', lValue: dash(s.data.perf.vr, '---'), lKey: 'perf.vr', lClass: 'editable' }),
        row({ lLabel: 'V2', lValue: dash(s.data.perf.v2, '---'), lKey: 'perf.v2', lClass: 'editable', rLabel: 'FLAPS/THS', rValue: `${dash(s.data.perf.flaps, '--')}/${dash(s.data.perf.ths, '--')}`, rKey: 'perf.flaps', rClass: 'editable' }),
        row({ lLabel: 'FLEX TEMP', lValue: dash(s.data.perf.flex, '---°'), lKey: 'perf.flex', lClass: 'editable' }),
        row({ lLabel: 'THR RED/ACC', lValue: dash(s.data.perf.thrRed, '---/---'), lKey: 'perf.thrRed', lClass: 'editable' }),
        row({ lLabel: '<WEIGHT', lAction: 'PERF_WEIGHT', lClass: 'editable', rLabel: 'CRZ>', rAction: 'PERF_CR', rClass: 'editable' })
      ]
    },
    PERF_CR: {
      full: 'Cruise', zh: '巡航性能', desc: 'CRZ FL / SPD / CI / WIND / TEMP',
      note: 'CRUISE 页。输入巡航高度、速度、成本指数、风与温度。',
      title: () => 'CRUISE',
      rows: (s) => [
        row({ lLabel: 'CRZ FL', lValue: dash(s.data.crzFl, 'FL---'), lKey: 'crzFl', lClass: 'editable', rLabel: 'CI', rValue: dash(s.data.costIdx, '---'), rKey: 'costIdx', rClass: 'editable' }),
        row({ lLabel: 'CRZ SPD', lValue: dash(s.data.crz.spd, '---'), lKey: 'crz.spd', lClass: 'editable' }),
        row({ lLabel: 'WIND', lValue: dash(s.data.wind, '---/--'), lKey: 'wind', lClass: 'editable' }),
        row({ lLabel: 'TEMP', lValue: dash(s.data.sat, '--°'), lKey: 'sat', lClass: 'editable' }),
        row(),
        row({ lLabel: '<T/O', lAction: 'PERF_TO', lClass: 'editable', rLabel: 'APPR>', rAction: 'PERF_AP', rClass: 'editable' })
      ]
    },
    PERF_AP: {
      full: 'Approach', zh: '进近性能', desc: 'VAPP / FLAPS / MISSED APPR FL',
      note: 'APPROACH 页。输入进近速度与复飞高度。',
      title: () => 'APPROACH',
      rows: (s) => [
        row({ lLabel: 'VAPP', lValue: dash(s.data.appr.vapp, '---'), lKey: 'appr.vapp', lClass: 'editable', rLabel: 'FLAPS', rValue: dash(s.data.appr.flaps, '--'), rKey: 'appr.flaps', rClass: 'editable' }),
        row({ lLabel: 'MISSED APPR FL', lValue: dash(s.data.appr.missedFl, 'FL---'), lKey: 'appr.missedFl', lClass: 'editable' }),
        row(), row(), row(),
        row({ lLabel: '<CRZ', lAction: 'PERF_CR', lClass: 'editable', rLabel: 'SEC>', rAction: 'PERF_SEC', rClass: 'editable' })
      ]
    },
    PERF_SEC: {
      full: 'Secondary Performance', zh: '备用性能', desc: '复制当前性能数据',
      note: 'SEC PERF 页。可把当前性能复制为备用。',
      title: () => 'SEC PERF',
      rows: (s) => [
        row({ lLabel: 'ACTIVE', lValue: s.data.secPerf ? 'COPIED' : 'EMPTY' }),
        row({ lLabel: '<COPY PERF', lAction: 'COPY_PERF', lClass: 'editable' }),
        row(), row(), row(),
        row({ lLabel: '<APPR', lAction: 'PERF_AP', lClass: 'editable', rLabel: 'INIT>', rAction: 'PERF', rClass: 'editable' })
      ]
    },
    DTO_LIST: {
      full: 'Direct To List', zh: '直飞列表', desc: '从列表选择直飞点',
      note: 'DTO LIST 页。输入航路点后按 1L 选择。',
      title: () => 'DIRECT TO LIST',
      rows: (s) => [
        row({ lLabel: 'WP', lValue: dash(s.data.dtoWp, '----'), lKey: 'dtoWp', lClass: 'editable' }),
        row({ lLabel: '1', lValue: s.data.fpln[0] || '----' }),
        row({ lLabel: '2', lValue: s.data.fpln[1] || '----' }),
        row(), row(),
        row({ lLabel: '<DTO', lAction: 'DTO', lClass: 'editable', rLabel: 'FPLN>', rAction: 'FPLN', rClass: 'editable' })
      ]
    },
    DTO_ABEAM: {
      full: 'DTO Abeam', zh: '偏旁直飞', desc: '直飞到航路点偏旁位置',
      note: 'DTO ABEAM 页（简化）。',
      title: () => 'DTO ABEAM',
      rows: (s) => [
        row({ lLabel: 'WP', lValue: dash(s.data.dtoWp, '----'), lKey: 'dtoWp', lClass: 'editable' }),
        row({ lLabel: 'BEARING', lValue: dash(s.data.dtoBrg, '---°'), lKey: 'dtoBrg', lClass: 'editable' }),
        row({ lLabel: 'DIST', lValue: dash(s.data.dtoDist, '---'), lKey: 'dtoDist', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<DTO', lAction: 'DTO', lClass: 'editable' })
      ]
    },
    NEAREST: {
      full: 'Nearest Navaids', zh: '最近导航台', desc: '最近 VOR/DME/ILS',
      note: 'NEAREST 页（简化）。',
      title: () => 'NEAREST',
      rows: () => [row({ lLabel: 'VOR', lValue: '113.85 / FNI' }), row({ lLabel: 'DME', lValue: '40 NM' }), row({ lLabel: 'ILS', lValue: '109.30 / ILS' }), row(), row(), row({ lLabel: '<TUNE', lAction: 'RAD', lClass: 'editable' })]
    },
    DESELECTED: {
      full: 'Deselected Navaids', zh: '禁用导航台', desc: '被抑制的导航台',
      note: 'DESELECTED NAVAIDS 页（简化）。',
      title: () => 'DESELECTED NAVAIDS',
      rows: () => [row({ lLabel: 'Navaid', lValue: 'NONE' }), row(), row(), row(), row(), row({ lLabel: '<TUNE', lAction: 'RAD', lClass: 'editable' })]
    },
    MARK_PAGE: {
      full: 'Mark', zh: '位置标记', desc: '当前位置标记与更新确认',
      note: 'MARK 页。输入航路点后按 CONFIRM UPDATE 更新位置。',
      title: () => 'MARK',
      rows: (s) => [
        row({ lLabel: 'PPOS', lValue: dash(s.data.gpsPos, 'N---- W-----') }),
        row({ lLabel: 'MARK WP', lValue: dash(s.data.markWp, '----'), lKey: 'markWp', lClass: 'editable' }),
        row({ lLabel: 'CONFIRM UPDATE', lAction: 'CONFIRM_MARK', lClass: 'editable' }),
        row(), row(),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'PROG>', rAction: 'PROG1', rClass: 'editable' })
      ]
    },
    DATA_MENU: {
      full: 'Data Menu', zh: '数据菜单', desc: '数据库、飞行员数据、标准数据',
      note: 'DATA MENU 页。真实 FMS220 下有很多数据子页。',
      title: () => 'DATA MENU',
      rows: () => [
        row({ lLabel: '<DATABASE', lAction: 'DATABASE', lClass: 'editable', rLabel: 'NAV DATA>', rAction: 'NAV_DATA', rClass: 'editable' }),
        row({ lLabel: '<NEW DATA', lAction: 'NEW_DATA', lClass: 'editable', rLabel: 'DATA LIST>', rAction: 'DATA_LIST', rClass: 'editable' }),
        row({ lLabel: '<PILOT DATA', lAction: 'PILOT_DATA', lClass: 'editable', rLabel: 'STD DATA>', rAction: 'STD_DATA', rClass: 'editable' }),
        row({ lLabel: '<STATUS', lAction: 'STATUS', lClass: 'editable' }),
        row(),
        row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable' })
      ]
    },
    DATABASE: {
      full: 'Database', zh: '数据库', desc: '导航数据库版本',
      note: 'DATABASE 页（简化）。',
      title: () => 'DATABASE',
      rows: (s) => [
        row({ lLabel: 'NAV DB', lValue: dash(s.data.navDb, '--------'), lKey: 'navDb', lClass: 'editable' }),
        row({ lLabel: 'EXP DATE', lValue: dash(s.data.dbExp, '----/--'), lKey: 'dbExp', lClass: 'editable' }),
        row(), row(), row(),
        row({ lLabel: '<DATA', lAction: 'DATA', lClass: 'editable' })
      ]
    },
    NAV_DATA: {
      full: 'NAV Data', zh: '导航数据', desc: '导航数据检查',
      note: 'NAV DATA 页（简化）。',
      title: () => 'NAV DATA',
      rows: (s) => [row({ lLabel: 'DB', lValue: dash(s.data.navDb, '--------') }), row({ lLabel: 'STATUS', lValue: 'VALID' }), row(), row(), row(), row({ lLabel: '<DATA', lAction: 'DATA', lClass: 'editable' })]
    },
    NEW_DATA: {
      full: 'New Data', zh: '新数据', desc: '等待装入的新数据库',
      note: 'NEW DATA 页（简化）。',
      title: () => 'NEW DATA',
      rows: () => [row({ lLabel: 'NEW DB', lValue: 'NONE' }), row(), row(), row(), row(), row({ lLabel: '<DATA', lAction: 'DATA', lClass: 'editable' })]
    },
    DATA_LIST: {
      full: 'Data List', zh: '数据列表', desc: '飞行员数据列表',
      note: 'DATA LIST 页（简化）。',
      title: () => 'DATA LIST',
      rows: (s) => [row({ lLabel: 'PILOT WPTS', lValue: String(s.data.fpln.length) }), row({ lLabel: 'ROUTES', lValue: '0' }), row(), row(), row(), row({ lLabel: '<DATA', lAction: 'DATA', lClass: 'editable' })]
    },
    PILOT_DATA: {
      full: 'Pilot Data', zh: '飞行员数据', desc: '自定义航路点/航路/机场/导航台',
      note: 'PILOT DATA 页（简化）。',
      title: () => 'PILOT DATA',
      rows: () => [row({ lLabel: 'AIRPORTS', lValue: '0' }), row({ lLabel: 'ROUTES', lValue: '0' }), row({ lLabel: 'NAVAIDS', lValue: '0' }), row({ lLabel: 'WPT', lValue: '0' }), row(), row({ lLabel: '<DATA', lAction: 'DATA', lClass: 'editable' })]
    },
    STD_DATA: {
      full: 'Standard Data', zh: '标准数据', desc: '公司航路/标准机场/导航台',
      note: 'STD DATA 页（简化）。',
      title: () => 'STD DATA',
      rows: () => [row({ lLabel: 'CO ROUTE', lValue: '0' }), row({ lLabel: 'STD APT', lValue: '0' }), row({ lLabel: 'STD NAVAID', lValue: '0' }), row({ lLabel: 'STD WPT', lValue: '0' }), row(), row({ lLabel: '<DATA', lAction: 'DATA', lClass: 'editable' })]
    }
  });

  PAGES.MENU.rows = () => [
    row({ lLabel: '<INIT', lAction: 'INIT_POW', lClass: 'editable', rLabel: 'DATA>', rAction: 'DATA', rClass: 'editable' }),
    row({ lLabel: '<FPLN', lAction: 'FPLN', lClass: 'editable', rLabel: 'STATUS>', rAction: 'STATUS', rClass: 'editable' }),
    row({ lLabel: '<PERF', lAction: 'PERF', lClass: 'editable', rLabel: 'MESSAGE>', rAction: 'MSG', rClass: 'editable' }),
    row({ lLabel: '<PROG', lAction: 'PROG1', lClass: 'editable', rLabel: 'MARK>', rAction: 'MARK_PAGE', rClass: 'editable' }),
    row({ lLabel: '<RAD TUNE', lAction: 'RAD', lClass: 'editable', rLabel: 'ATSU>', rAction: 'ATSU', rClass: 'editable' }),
    row({ lLabel: '<FUEL PRED', lAction: 'FUEL', lClass: 'editable', rLabel: 'VNAV>', rAction: 'VNAV', rClass: 'editable' })
  ];

  PAGES.FPLN.rows = (s) => {
    const list = s.data.fpln.slice(0, 5);
    const rows = list.map((w, i) => row({
      lLabel: `${i + 1}`, lValue: w, lClass: 'editable',
      rLabel: i === 0 ? 'TO' : '', rValue: i === 0 ? dash(s.data.to) : ''
    }));
    while (rows.length < 5) rows.push(row());
    rows.push(row({ lLabel: '<INIT', lAction: 'INIT', lClass: 'editable', rLabel: 'ROUTE SEL>', rAction: 'ROUTE_SEL', rClass: 'editable' }));
    rows[4].rLabel = 'DEPART>';
    rows[4].rAction = 'DEPART';
    rows[4].rClass = 'editable';
    return rows;
  };

  PAGES.DATA = Object.assign(PAGES.DATA_MENU, {
    full: 'Data Menu', zh: '数据菜单', desc: '数据库与飞行员数据入口',
    note: 'DATA MENU 页。真实 FMS220 在这里进入 DATABASE / NAV DATA / PILOT DATA 等子页。'
  });

  PAGES.RAD.title = () => 'NAV FRQ';
  PAGES.RAD.rows = (s) => [
    row({ lLabel: 'VOR1', lValue: dash(s.data.rad.vor1, '---.--'), lKey: 'rad.vor1', lClass: 'editable', rLabel: 'VOR2', rValue: dash(s.data.rad.vor2, '---.--'), rKey: 'rad.vor2', rClass: 'editable' }),
    row({ lLabel: 'ILS1', lValue: dash(s.data.rad.ils1, '---.--'), lKey: 'rad.ils1', lClass: 'editable', rLabel: 'ILS2', rValue: dash(s.data.rad.ils2, '---.--'), rKey: 'rad.ils2', rClass: 'editable' }),
    row({ lLabel: 'ADF1', lValue: dash(s.data.rad.adf1, '---'), lKey: 'rad.adf1', lClass: 'editable', rLabel: 'ADF2', rValue: dash(s.data.rad.adf2, '---'), rKey: 'rad.adf2', rClass: 'editable' }),
    row({ lLabel: 'CRS1', lValue: dash(s.data.rad.course1, '---°'), lKey: 'rad.course1', lClass: 'editable', rLabel: 'CRS2', rValue: dash(s.data.rad.course2, '---°'), rKey: 'rad.course2', rClass: 'editable' }),
    row({ lLabel: '<NEAREST', lAction: 'NEAREST', lClass: 'editable', rLabel: 'DESELECTED>', rAction: 'DESELECTED', rClass: 'editable' }),
    row({ lLabel: '<MENU', lAction: 'MENU', lClass: 'editable', rLabel: 'VNAV>', rAction: 'VNAV', rClass: 'editable' })
  ];

  PAGES.PROG2.rows = (s) => [
    row({ lLabel: 'WIND', lValue: dash(s.data.wind, '---/--'), lKey: 'wind', lClass: 'editable', rLabel: 'TEMP', rValue: dash(s.data.sat, '--°'), rKey: 'sat', rClass: 'editable' }),
    row({ lLabel: 'TAS', lValue: dash(s.data.tas, '---'), lKey: 'tas', lClass: 'editable' }),
    row({ lLabel: 'ETA', lValue: dash(s.data.eta, '--:--'), lKey: 'eta', lClass: 'editable' }),
    row(), row(),
    row({ lLabel: '<PROG 1', lAction: 'PROG1', lClass: 'editable', rLabel: 'PROG 3>', rAction: 'PROG3', rClass: 'editable' })
  ];

  PAGES.DTO.rows = (s) => [
    row({ lLabel: 'TO', lValue: dash(s.data.dtoWp, '----'), lKey: 'dtoWp', lClass: 'editable' }),
    row({ lLabel: 'BEARING', lValue: s.data.dtoWp ? '---°' : '----' }),
    row({ lLabel: 'DIST', lValue: s.data.dtoWp ? '--- NM' : '----' }),
    row({ lLabel: '<ABEAM', lAction: 'DTO_ABEAM', lClass: 'editable' }),
    row({ lLabel: '<LIST', lAction: 'DTO_LIST', lClass: 'editable' }),
    row({ lLabel: '<EXEC DTO', lAction: 'EXEC_DTO', lClass: 'editable', rLabel: 'FPLN>', rAction: 'FPLN', rClass: 'editable' })
  ];

  const PAGE_GROUPS = {
    INIT: ['INIT_POW', 'POS_INIT', 'INIT', 'INIT2', 'UNITS', 'DATUM'],
    FPLN: ['FPLN', 'ROUTE_SEL', 'DEPART', 'ARRIV', 'HOLD', 'LTRL_REV', 'VERT_REV', 'AIRWAY', 'WIND', 'FPLN_SEC'],
    PROG: ['PROG1', 'PROG2', 'PROG3'],
    PERF: ['PERF', 'PERF_WEIGHT', 'PERF_TO', 'PERF_CR', 'PERF_AP', 'PERF_SEC', 'FUEL'],
    VNAV: ['VNAV', 'VNAV2'],
    DTO: ['DTO', 'DTO_LIST', 'DTO_ABEAM'],
    TUNE: ['RAD', 'NEAREST', 'DESELECTED'],
    DATA: ['DATA', 'DATABASE', 'NAV_DATA', 'NEW_DATA', 'DATA_LIST', 'PILOT_DATA', 'STD_DATA', 'STATUS', 'MSG', 'MARK_PAGE', 'ATSU', 'AIDS', 'CFDS', 'SATCOM']
  };

  window.MCDU_PAGES = PAGES;
  window.MCDU_PAGE_GROUPS = PAGE_GROUPS;
})();
