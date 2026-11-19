(function () {
  const CHAPTERS = [
    { id: 'basic', name: '基础操作' },
    { id: 'init', name: '初始化' },
    { id: 'fpln', name: '飞行计划' },
    { id: 'prog', name: '进度' },
    { id: 'perf', name: '性能' },
    { id: 'tune', name: '无线电' },
    { id: 'nav', name: '导航/直飞' },
    { id: 'data', name: '数据/消息' },
    { id: 'finish', name: '执行与完成' }
  ];

  const STEPS = [
    // 基础操作
    { chapter: 'basic', title: 'B1. MCDU 是什么', text: 'ATR 72-600 使用 Thales FMS 220。MCDU 是飞行员与 FMS 交互的界面：顶部是标题区，中间是 6 组行选择键（LSK）对应的数据行，底部是暂存区 SCRATCH。FMS220 手册把页面分为 INITIALIZATION、FLIGHT PLAN、PROGRESS、DIRECT-TO、PERFORMANCE、TUNE、MESSAGE、MARK、DATA、STATUS 十大类。', hint: '', manual: true, check: () => true },
    { chapter: 'basic', title: 'B2. 暂存区输入', text: '所有数据先输入暂存区，再按对应的 LSK 写入字段。这是 FMS220 手册“Data entry / Clearing data”章节的核心规则：先在 SCRATCH 形成候选值，LSK 只是搬运或执行。按一个数字键试试。', hint: '按数字键 1', check: (s) => s.scratchpad.length > 0 },
    { chapter: 'basic', title: 'B3. CLR 清除', text: 'CLR 每按一次删除暂存区最后一个字符；暂存区为空时，CLR + LSK 可以清空对应字段。手册里这叫 Clearing data。', hint: '按 CLR', check: (s) => s.scratchpad === '' },
    { chapter: 'basic', title: 'B4. LSK 双向操作', text: '暂存区有内容时按 LSK = 写入字段；暂存区为空时按 LSK = 把字段内容取回暂存区。这个双向逻辑在真实 FMS220 上完全一致。', hint: '先输 LFPO，再按 1L，再按 1L 取回', manual: true, check: () => true },
    { chapter: 'basic', title: 'B5. 字符属性与颜色', text: 'FMS220 手册第 3.1.4/3.1.5 节定义了颜色和字符属性：白色通常是页面提示或标签，绿色是已生效数据，琥珀色是需要确认或限制值，红色/反显是错误或警告；大字体通常表示人工输入，小字体表示 FMS 计算值。本练习器用绿/琥珀/红近似。', hint: '', manual: true, check: () => true },
    { chapter: 'basic', title: 'B6. 翻页与 EXEC', text: 'PREV/NEXT 在同类页面组内循环。EXEC 在真实飞机上用于激活临时飞行计划（Temporary FPLN）或确认修改；本练习器里它做数据完整性检查并写入 MESSAGE。', hint: '按 NEXT / PREV 试试', manual: true, check: () => true },

    // 初始化
    { chapter: 'init', title: 'I1. POWER ON 页面', text: '按 MENU 后选 1L（INIT）进入 POWER ON / IDENT 类页面。真实流程第一步是检查机型、发动机和导航数据库有效期，对应手册 INITIALIZATION 部分。', hint: 'MENU → 1L', check: (s) => s.page === 'INIT_POW' },
    { chapter: 'init', title: 'I2. 检查 NAV DB 有效期', text: '在 POWER ON 页查看 NAV DB 与 EXP DATE。手册要求确认当前数据库版本与到期日期；过期数据不能用于导航。', hint: '输入 2512/26 → 1L 到 EXP DATE', check: (s) => !!s.data.dbExp },
    { chapter: 'init', title: 'I3. POS INIT 位置初始化', text: '按 5L 进入 POS INIT。IRS 需要初始位置，通常把 GPS POS 复制到 REF POS，再执行 ALIGN IRS。手册INITIALIZATION 明确包含 POS INIT / UNITS / DATUM / GEO DATUM。', hint: '按 5L 进入 POS INIT', check: (s) => s.page === 'POS_INIT' },
    { chapter: 'init', title: 'I4. 复制 GPS 位置', text: '按 2R（COPY GPS>）把 GPS POS 写入 REF POS。真实飞机上飞行员核对停机位坐标后确认。', hint: '按 2R', check: (s) => !!s.data.refPos },
    { chapter: 'init', title: 'I5. ALIGN IRS', text: '按 3L 执行 ALIGN IRS。IRS 对准后 FMS 才具备可靠的惯性位置基准。', hint: '按 3L', check: (s) => s.data.messages.some((m) => m.indexOf('IRS ALIGN') >= 0) },
    { chapter: 'init', title: 'I6. UNITS 单位设置', text: '用 PREV/NEXT 或菜单进入 UNITS 页，可设置距离、速度、高度和温度单位。真实 FMS220 允许按运营人标准配置。', hint: '切到 UNITS 页面', check: (s) => s.page === 'UNITS' },
    { chapter: 'init', title: 'I7. DATUM / GEO DATUM', text: 'DATUM 页设置导航基准面和地理基准，通常为 WGS84。多数情况下不需要改动，但手册把它列在初始化章节。', hint: '切到 DATUM 页面', check: (s) => s.page === 'DATUM' },
    { chapter: 'init', title: 'I8. FPLN INIT 1/2', text: '进入 FPLN INIT 第一页。FROM/TO 定义城市对，FLT NBR 是航班号，COST INDEX 权衡时间与燃油，CRZ FL 是巡航高度层。这些字段和真实 ATR 的 FPLN INIT 对应。', hint: '进入 INIT 页面', check: (s) => s.page === 'INIT' },
    { chapter: 'init', title: 'I9. 输入 FROM/TO', text: '输入 LFPO 按 1L，再输入 LFPG 按 1R。ICAO 必须是四个字母；FMS 会从导航数据库检索机场。', hint: 'LFPO→1L，LFPG→1R', check: (s) => s.data.from === 'LFPO' && s.data.to === 'LFPG' },
    { chapter: 'init', title: 'I10. 航班号与成本指数', text: '输入 AF1234 按 2L；输入成本指数 25 按 3L。CI 越大越偏向省时，越小越偏向省油，真实运行中由签派给定。', hint: 'AF1234→2L，25→3L', check: (s) => !!s.data.fltNo && !!s.data.costIdx },
    { chapter: 'init', title: 'I11. 巡航高度层', text: '输入 240 按 3R，代表 FL240。真实 FMS220 的 CRZ FL 字段通常显示为 FLxxx。', hint: '240→3R', check: (s) => s.data.crzFl === '240' },
    { chapter: 'init', title: 'I12. INIT 2/2', text: '按 5R 进入 INIT 第二页，输入 ZFW（零燃油重量）和导航数据库标识。手册里 INITIALIZATION 还包括重量与基准数据。', hint: '5R → 280→1L', check: (s) => s.page === 'INIT2' && !!s.data.zfw },

    // 飞行计划
    { chapter: 'fpln', title: 'F1. ROUTE SEL 航路选择', text: 'ROUTE SEL 允许输入 CO RTE（公司航路）、FROM/TO、ALTN（备降）和 ALTN RTE。真实 FMS220 中 CO RTE 可一次调出整条公司航路。', hint: '进入 ROUTE_SEL 页面', check: (s) => s.page === 'ROUTE_SEL' },
    { chapter: 'fpln', title: 'F2. 公司航路与备降', text: '输入公司航路标识（如 AF1234/A）按 1L；输入备降机场 LFPB 按 3L。若公司航路数据库不可用，就要逐项输入。', hint: 'AF1234A→1L，LFPB→3L', check: (s) => !!s.data.coRte && !!s.data.altn },
    { chapter: 'fpln', title: 'F3. F-PLN 页面', text: 'F-PLN 是飞行计划主页面。手册 FLIGHT PLAN 章节包含 FPLN、FPLN INIT、ROUTE SEL、SEC INIT、SEC FPLN、LTRL REV、VERT REV、DEPARTURE、ARRIVAL、AIRWAY、HOLDING 等页面。', hint: '进入 FPLN 页面', check: (s) => s.page === 'FPLN' },
    { chapter: 'fpln', title: 'F4. 输入航路点', text: '在暂存区输入航路点 DCT，按 1L 添加到飞行计划。真实 FMS 会检查导航数据库中的航路点并计算航段。', hint: 'DCT→1L', check: (s) => s.data.fpln.length >= 1 },
    { chapter: 'fpln', title: 'F5. DEPARTURE 离场', text: '按 5R 进入 DEPARTURE。输入 SID（如 AGN）和离场跑道（如 26L）。手册要求核对 SID、TRANS 和跑道与放行一致。', hint: '5R → AGN→1L', check: (s) => s.page === 'DEPART' && !!s.data.sid },
    { chapter: 'fpln', title: 'F6. ARRIVAL 进场', text: '按 6R 进入 ARRIVAL。输入 STAR、进近类型和着陆跑道。真实 FMS220 的进场页会把程序与航路点自动衔接。', hint: '6R → GAI→1L', check: (s) => s.page === 'ARRIV' && !!s.data.star },
    { chapter: 'fpln', title: 'F7. HOLD 等待航线', text: '按 6R 进入 HOLD。输入等待点、入航向、时间/距离和速度。手册把 HOLD 定义为位置更新或记忆冻结位置的功能。', hint: '6R → DCT→1L', check: (s) => !!s.data.holdWp },
    { chapter: 'fpln', title: 'F8. LTRL REV 横向修订', text: 'LTRL REV 提供临时飞行计划修改：DIRECT TO、DTO ABEAM、OFFSET、OVERFLY。修改通常先进入 Temporary FPLN，按 EXEC 后才激活。', hint: '进入 LTRL_REV 页面', check: (s) => s.page === 'LTRL_REV' },
    { chapter: 'fpln', title: 'F9. VERT REV 垂直修订', text: 'VERT REV 输入高度/速度限制。手册 VERT REV 页面用于给航路点添加约束，FMS 再计算垂直剖面。', hint: '进入 VERT_REV 页面', check: (s) => s.page === 'VERT_REV' },
    { chapter: 'fpln', title: 'F10. AIRWAY 航路', text: 'AIRWAY 页输入航路名，FMS 会把后续航路点沿该航路展开。', hint: '进入 AIRWAY 页面', check: (s) => s.page === 'AIRWAY' },
    { chapter: 'fpln', title: 'F11. WIND 页面', text: 'WIND 页输入某高度层的风向/风速和温度。手册把它列在 FLIGHT PLAN 下，用于性能预测。', hint: '进入 WIND 页面', check: (s) => s.page === 'WIND' },
    { chapter: 'fpln', title: 'F12. SECONDARY FPLN', text: '备用飞行计划用于对比或备份当前计划。按 COPY ACTIVE 可把当前 FPLN 复制到备用计划。', hint: '进入 FPLN_SEC 并按 4L', check: (s) => !!s.data.secFpln },

    // 进度
    { chapter: 'prog', title: 'P1. PROGRESS 1/3', text: 'PROGRESS 页面显示导航与位置管理信息。真实 FMS220 有 PROG 1/3、2/3、3/3；本练习器用 1/2、2/2、3/3 模拟。第一页显示 FROM/TO、CRZ FL、下一航路点和剩余距离。', hint: '按 PROG 键', check: (s) => s.page === 'PROG1' },
    { chapter: 'prog', title: 'P2. PROGRESS 2/3', text: '第二页输入巡航风、温度和真空速。这些数据会反馈到燃油/时间预测。', hint: '6R → 270/10→1L', check: (s) => s.data.wind === '270/10' },
    { chapter: 'prog', title: 'P3. PROGRESS 3/3', text: '第三页显示导航源状态：BCP NAV、GPS NAV、PRAIM 和 VNAV。手册中 PROGRESS 还包括 BCP NAV、GPS NAV、PRAIM 1/2 和 VNAV 1/2 子页。', hint: '6R 进入 PROG3', check: (s) => s.page === 'PROG3' },

    // 性能
    { chapter: 'perf', title: 'PE1. PERF INIT', text: 'PERFORMANCE 章节第一页是 PERF INIT：输入全重 GR WT、燃油 FUEL、零燃油重量 ZFW、重心和巡航高度/成本指数。FMS 用这些值计算性能预测。', hint: '按 PERF 键', check: (s) => s.page === 'PERF' },
    { chapter: 'perf', title: 'PE2. 全重与燃油', text: '输入 GR WT=280 按 1L，BLOCK FUEL=45 按 2L。真实运行中 GW 由 ZFW+FUEL 计算，飞行员核对而不是随手改。', hint: '280→1L，45→2L', check: (s) => !!s.data.grWt && !!s.data.blockFuel },
    { chapter: 'perf', title: 'PE3. WEIGHT 页面', text: 'WEIGHT 页集中显示 GR WT、ZFW、FUEL 和 CG。手册把 WEIGHT 单独列为 PERFORMANCE 子页。', hint: '5R 进入 WEIGHT', check: (s) => s.page === 'PERF_WEIGHT' },
    { chapter: 'perf', title: 'PE4. TAKE OFF 页面', text: 'TAKE OFF 页输入 V1、VR、V2、FLAPS/THS、FLEX TEMP、THR RED/ACC。V1 是决断速度，VR 是抬轮速度，V2 是起飞安全速度；这些值来自性能计算或 QRH。', hint: '进入 PERF_TO', check: (s) => s.page === 'PERF_TO' },
    { chapter: 'perf', title: 'PE5. 输入起飞速度', text: '输入 V1=135 按 1L，VR=140 按 2L，V2=145 按 3L。错误格式会触发 FORMAT ERROR。', hint: '135/140/145', check: (s) => !!(s.data.perf.v1 && s.data.perf.vr && s.data.perf.v2) },
    { chapter: 'perf', title: 'PE6. FLEX 与减推力', text: '输入 FLEX TEMP=45 按 4L。真实 ATR 使用假设温度法降低起飞推力，以延长发动机寿命。', hint: '45→4L', check: (s) => !!s.data.perf.flex },
    { chapter: 'perf', title: 'PE7. CRUISE 页面', text: 'CRUISE 页确认 CRZ FL、CI、CRZ SPD、WIND 和 TEMP。手册 PERFORMANCE 章节把 CRUISE 作为独立页面。', hint: '6R 进入 CRUISE', check: (s) => s.page === 'PERF_CR' },
    { chapter: 'perf', title: 'PE8. APPROACH 页面', text: 'APPROACH 页输入 VAPP、襟翼和复飞高度。VAPP 是最终进近目标速度，MISSED APPR FL 是复飞高度。', hint: '6R → VAPP=125→1L', check: (s) => s.page === 'PERF_AP' },
    { chapter: 'perf', title: 'PE9. SEC PERF', text: '备用性能页可以复制当前性能数据，用于备降或性能对比。手册中对应 SEC PERF。', hint: '6R → 2L COPY PERF', check: (s) => !!s.data.secPerf },
    { chapter: 'perf', title: 'PE10. FUEL PRED', text: '燃油预测页显示 BLOCK FUEL、TRIP FUEL、RESERVES 和 EXTRA。真实 FMS 会结合航路和风计算预计剩余燃油。', hint: '进入 FUEL 页面', check: (s) => s.page === 'FUEL' },

    // 无线电
    { chapter: 'tune', title: 'T1. TUNE / NAV FRQ', text: 'TUNE 章节管理无线电导航。真实 FMS220 的页面名是 NAV FRQ、NEAREST 和 DESELECTED NAVAIDS。本练习器用 RAD 页面模拟 NAV FRQ。', hint: 'MENU → 5L', check: (s) => s.page === 'RAD' },
    { chapter: 'tune', title: 'T2. 调谐 VOR/ILS', text: '输入 113.85 按 1L 调谐 VOR1；输入 109.30 按 3L 调谐 ILS1。频率格式必须是 XXX.XX。', hint: '113.85→1L，109.30→3L', check: (s) => !!s.data.rad.vor1 && !!s.data.rad.ils1 },
    { chapter: 'tune', title: 'T3. NEAREST', text: 'NEAREST 页列出最近导航台及其距离。手册把它列为 TUNE 子页，用于快速识别可用台。', hint: '5L 进入 NEAREST', check: (s) => s.page === 'NEAREST' },
    { chapter: 'tune', title: 'T4. DESELECTED NAVAIDS', text: 'DESELECTED 页列出被抑制的导航台。真实运行中可临时排除有故障或不可靠的台。', hint: '5R 进入 DESELECTED', check: (s) => s.page === 'DESELECTED' },

    // 导航/直飞
    { chapter: 'nav', title: 'N1. VNAV 1/2', text: 'VNAV 页面属于 PROGRESS 章节。第一页输入高度限制、速度限制和顶风温度，FMS 据此计算垂直剖面。', hint: '按 VNAV 键', check: (s) => s.page === 'VNAV' },
    { chapter: 'nav', title: 'N2. VNAV 2/2', text: '第二页输入 QNH 和过渡高度。手册中 VNAV 2/2 还包含进近环境数据。', hint: '6R → 1013→1L', check: (s) => s.data.vnav.qnh === '1013' },
    { chapter: 'nav', title: 'N3. MARK 位置更新', text: 'MARK 页用于当前位置标记和位置更新。手册 MARK 章节包含 MARK 页面和位置更新确认。输入航路点后按 CONFIRM UPDATE。', hint: 'MENU → 4R → 输入 DCT → 3L', check: (s) => s.data.messages.some((m) => m.indexOf('POS UPDATED') >= 0) },
    { chapter: 'nav', title: 'N4. DIRECT TO', text: 'DIRECT TO 页从当前位置直飞指定点。手册对应 DIRECT-TO 章节，另有 DTO LIST、DTO ABEAM、MOVING WPT。', hint: '按 DTO 键', check: (s) => s.page === 'DTO' },
    { chapter: 'nav', title: 'N5. DTO LIST / ABEAM', text: 'DTO LIST 可以从列表选择航路点；DTO ABEAM 直飞到航路点正旁位置。按 5L/4L 可进入。', hint: '进入 DTO_LIST 或 DTO_ABEAM', check: (s) => s.page === 'DTO_LIST' || s.page === 'DTO_ABEAM' },
    { chapter: 'nav', title: 'N6. 执行直飞', text: '输入目标点后按 6L（EXEC DTO）。真实 FMS 会先生成 Temporary 修改，按 EXEC 后激活。', hint: 'DCT→1L，6L', check: (s) => s.data.messages.some((m) => m.indexOf('DIRECT TO') >= 0) },

    // 数据与消息
    { chapter: 'data', title: 'D1. DATA MENU', text: 'DATA 章节包含 DATABASE、NAV DATA、NEW DATA、DATA LIST、PILOT DATA 和标准数据。真实 FMS220 的 DATA 子页很多，本练习器做了简化。', hint: '按 DATA 键', check: (s) => s.page === 'DATA' },
    { chapter: 'data', title: 'D2. DATABASE / NAV DATA', text: 'DATABASE 页查看导航数据库标识和有效期；NAV DATA 页检查数据状态。每次飞行前都要核对有效期。', hint: '进入 DATABASE 或 NAV_DATA', check: (s) => s.page === 'DATABASE' || s.page === 'NAV_DATA' },
    { chapter: 'data', title: 'D3. PILOT / STD DATA', text: 'PILOT DATA 存放飞行员自定义航路点/航路，STD DATA 存放标准数据。手册还列出 CO-ROUTE、STD APT/NAVAID/WPT 等页面。', hint: '进入 PILOT_DATA 或 STD_DATA', check: (s) => s.page === 'PILOT_DATA' || s.page === 'STD_DATA' },
    { chapter: 'data', title: 'D4. MESSAGE 页面', text: 'MESSAGE 页显示 FMS 提示和告警。手册 MESSAGE 章节定义为 Alert display and management。错误输入、EXEC 检查都会写消息。', hint: '按 MSG 键', check: (s) => s.page === 'MSG' },
    { chapter: 'data', title: 'D5. 清空消息', text: '按 6L（CLEAR MSG）清空消息记录。真实飞机上消息通常按 FIFO 管理，新消息会覆盖旧消息。', hint: '按 6L', check: (s) => s.data.messages.length === 0 },
    { chapter: 'data', title: 'D6. STATUS 页面', text: 'STATUS 页用于 FMS 输入检查和维护信息。手册里 STATUS 还包括 FUEL FLOW、SENSOR STS、FMS BITE、DISCRETES 等子页。', hint: '进入 STATUS 页面', check: (s) => s.page === 'STATUS' },
    { chapter: 'data', title: 'D7. BRT 亮度', text: 'BRT 键切换日间/夜间配色。真实 MCDU 有亮度调节和字符颜色/属性显示，本练习器用绿/琥珀两套配色模拟。', hint: '按 BRT 键', check: (s) => s.night === true },

    // 执行与完成
    { chapter: 'finish', title: 'Z1. EXEC 数据检查', text: '按 EXEC 键执行飞行计划。练习器会检查 FROM、TO 和 V 速度是否完整；缺项会写入 MESSAGE，完整则显示 FLIGHT PLAN ACTIVE。', hint: '按 EXEC 键', check: (s) => s.data.messages.some((m) => m.indexOf('FLIGHT PLAN ACTIVE') >= 0) },
    { chapter: 'finish', title: 'Z2. 自由练习', text: '所有页面都可以自由点选，章节按钮可随时跳转。试试输入错误格式触发 FORMAT ERROR，或按 NEXT/PREV 在同一类页面间循环。', hint: '', manual: true, check: () => true }
  ];

  let getState = null;
  let getPageNote = null;
  let index = 0;
  let completed = new Set();
  let open = true;
  let mode = 'tutorial';

  const $ = (id) => document.getElementById(id);

  function chapterOf(i) { return STEPS[i].chapter; }
  function firstIndexOf(chapter) {
    const i = STEPS.findIndex((s) => s.chapter === chapter);
    return i < 0 ? 0 : i;
  }
  function chapterDone(chapter) {
    return STEPS.every((s, i) => s.chapter !== chapter || completed.has(i));
  }

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
    const s = getState ? getState() : { scratchpad: '', page: 'MENU', data: {} };
    const step = STEPS[index];
    renderChapters();
    $('tutorialTitle').textContent = step.title;
    $('tutorialText').innerHTML = step.text + (step.hint ? `<div class="page-note">提示：${step.hint}</div>` : '');
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
    if (!step.manual && step.check(s)) {
      if (!completed.has(index)) { completed.add(index); render(); }
    }
  }

  function renderGlossary() {
    const input = $('termSearch');
    const q = (input ? input.value : '').trim().toLowerCase();
    const G = window.MCDU_GLOSSARY || {};
    const items = Object.keys(G).filter((k) => {
      if (!q) return true;
      const t = G[k];
      return (k + ' ' + t.full + ' ' + t.zh + ' ' + t.desc).toLowerCase().includes(q);
    });
    $('termList').innerHTML = items.map((k) => {
      const t = G[k];
      return `<div class="term-item">
        <div class="term-abbr">${k}</div>
        <div class="term-full">${t.full}</div>
        <div class="term-zh">${t.zh}</div>
        <div class="term-desc">${t.desc}</div>
      </div>`;
    }).join('') || '<div class="page-note">没有匹配术语</div>';
  }

  function setMode(nextMode) {
    mode = nextMode;
    $('viewTutorial').classList.toggle('hidden', mode !== 'tutorial');
    $('viewGlossary').classList.toggle('hidden', mode !== 'glossary');
    $('tabTutorial').classList.toggle('active', mode === 'tutorial');
    $('tabGlossary').classList.toggle('active', mode === 'glossary');
    if (mode === 'glossary') renderGlossary();
  }

  function init(stateGetter, pageNoteGetter) {
    getState = stateGetter;
    getPageNote = pageNoteGetter;

    $('prevStep').addEventListener('click', () => { if (index > 0) { index -= 1; render(); } });
    $('nextStep').addEventListener('click', () => { if (index < STEPS.length - 1) index += 1; render(); });
    $('skipStep').addEventListener('click', () => {
      completed.add(index);
      if (index < STEPS.length - 1) index += 1;
      render();
    });
    $('closeTutorial').addEventListener('click', () => { open = false; render(); });
    $('tabTutorial').addEventListener('click', () => setMode('tutorial'));
    $('tabGlossary').addEventListener('click', () => setMode('glossary'));
    const search = $('termSearch');
    if (search) search.addEventListener('input', renderGlossary);

    setMode('tutorial');
    render();
  }

  function notify() { if (getState) checkCurrent(getState()); }
  function toggle() { open = !open; render(); }
  function showTutorial() { open = true; setMode('tutorial'); render(); }
  function showGlossary() { open = true; setMode('glossary'); render(); }
  function isOpen() { return open; }

  window.MCDU_TUTORIAL = { init, notify, toggle, showTutorial, showGlossary, isOpen, STEPS, CHAPTERS };
})();
