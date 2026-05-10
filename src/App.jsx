import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Check,
  ClipboardList,
  Code2,
  Download,
  FileText,
  Gauge,
  Home,
  Layers,
  ListChecks,
  Plus,
  Rocket,
  Sparkles,
  Trash2,
} from "lucide-react";

const STORAGE_KEY = "axdx-harness-workshop-builder-v1";

const defaultState = {
  problem: {
    topic: "AI Syllabus Planner",
    situation: "강의계획서와 공지가 여러 곳에 흩어져 있어 과제·시험 일정을 놓치기 쉽다.",
    user: "학부 4학년 예비졸업생",
    pain: "강의마다 일정 형식이 달라 수동으로 확인하고 캘린더에 옮기는 데 시간이 든다.",
    currentAlternative: "강의계획서 PDF, LMS 공지, 카카오톡 공지를 직접 확인하고 노션/캘린더에 수동 기록한다.",
    idea: "강의계획서에서 과제·시험 일정을 추출하고 마감일 기준으로 우선순위를 보여주는 서비스",
    mvp: "과제명 입력, 일정 목록, 완료 처리, KPI 계산",
    metric: "과제 완료율 = 완료 과제 수 / 전체 과제 수",
    outOfScope: "실제 LMS 연동, 회원가입, 복잡한 알림 시스템, 결제 기능",
  },
  persona: {
    name: "김민준",
    age: "22",
    major: "경영정보학",
    grade: "4학년",
    routine: "하루 평균 3개 강의를 듣고 아르바이트를 병행한다.",
    tools: "카카오톡, 구글 캘린더, 노션, LMS",
    goal: "마감일을 놓치지 않고 졸업요건을 안정적으로 관리한다.",
    pain: "공지와 강의계획서가 흩어져 있어 일정 누락이 잦다.",
    before: "공지 내용을 스크린샷으로 저장하고 노션에 직접 옮긴다.",
    after: "AI가 일정을 추출하고 우선순위를 정리해준다.",
    avoid: "복잡한 설정, 앱 설치, 회원가입",
  },
  journey: [
    { id: 1, stage: "수업 시작 전", action: "강의계획서 다운로드", emotion: "무감각", pain: "파일 위치를 잊어버림", opportunity: "PDF 자동 분석" },
    { id: 2, stage: "강의계획서 확인", action: "과제 목록 수동 확인", emotion: "귀찮음", pain: "강의마다 형식이 다름", opportunity: "일정 자동 추출" },
    { id: 3, stage: "마감일 입력", action: "캘린더에 하나씩 입력", emotion: "짜증", pain: "반복 작업과 누락", opportunity: "우선순위 자동 추천" },
  ],
  prd: {
    value: "흩어진 학사 일정을 하나의 실행 가능한 과제 목록으로 바꾼다.",
    scenario: "사용자가 강의계획서 내용을 입력하면 과제 후보를 확인하고 저장한다.",
    mvpFeatures: "1. 과제 입력\n2. 과제 목록 표시\n3. 완료 처리\n4. 완료율 계산",
    data: "tasks, events, users",
    risks: "AI 추출 오류, 날짜 형식 불일치, 사용자의 초기 입력 부담",
    expansion: "PDF 업로드, 캘린더 연동, 알림, 팀 프로젝트 일정 공유",
  },
  ac: [
    { id: "AC-01", feature: "일정 입력", given: "과제명을 입력한 상태", when: "저장 버튼을 클릭하면", then: "목록에 과제가 추가된다", priority: "High" },
    { id: "AC-02", feature: "일정 입력", given: "과제명이 비어 있는 상태", when: "저장 버튼을 확인하면", then: "버튼이 비활성화된다", priority: "High" },
    { id: "AC-03", feature: "일정 입력", given: "공백만 입력한 상태", when: "저장 버튼을 확인하면", then: "버튼이 비활성화된다", priority: "High" },
    { id: "AC-04", feature: "일정 입력", given: "과제명이 101자인 상태", when: "입력창을 확인하면", then: "오류 메시지가 표시된다", priority: "Medium" },
  ],
  tests: [
    { id: 1, type: "정상", behavior: "과제 저장", input: "MIS 과제", expected: "목록에 추가됨" },
    { id: 2, type: "엣지", behavior: "공백 입력 차단", input: "   ", expected: "저장 버튼 비활성화" },
    { id: 3, type: "실패", behavior: "없는 과제 완료 처리", input: "missing-id", expected: "에러 반환" },
  ],
  harness: {
    projectGoal: "4주 안에 AI Syllabus Planner 프로토타입 구현",
    guides: "AGENTS.md, docs/PRD.md, docs/acceptance_criteria.md를 먼저 읽는다.",
    tools: "React, TypeScript, Tailwind, Vitest, Testing Library",
    sensors: "npm test, npm run build, lint, 브라우저 콘솔 확인",
    permissions: "요구사항 삭제 금지, 테스트 수정 금지, any 사용 금지, 외부 API 키 하드코딩 금지",
    feedbackLoops: "테스트 실패 → 원인 기록 → 하네스 규칙 업데이트 → 재발 방지",
  },
  kpi: [
    { id: 1, name: "Task Completion Rate", formula: "완료 과제 수 / 전체 과제 수", target: "70%" },
    { id: 2, name: "Due Date Input Rate", formula: "마감일 있는 과제 수 / 전체 과제 수", target: "60%" },
    { id: 3, name: "AI Accuracy", formula: "수정 없이 저장된 일정 수 / AI 추출 일정 수", target: "85%" },
  ],
  experiment: {
    hypothesis: "마감일 입력 유도 문구를 보여주면 마감일 입력률이 증가한다.",
    control: "과제명 입력창만 표시",
    variant: "과제명 아래 마감일 입력 유도 문구 표시",
    metric: "Due Date Input Rate",
    success: "Variant가 Control 대비 15% 이상 높다.",
    collection: "task_created 이벤트에 due_date_present: boolean 속성을 추가한다.",
  },
};

const steps = [
  { id: "overview", label: "Overview", icon: Home },
  { id: "problem", label: "Problem", icon: BookOpen },
  { id: "persona", label: "Persona", icon: Sparkles },
  { id: "journey", label: "Journey", icon: Layers },
  { id: "prd", label: "PRD", icon: FileText },
  { id: "ac", label: "AC", icon: ListChecks },
  { id: "tests", label: "Tests", icon: ClipboardList },
  { id: "harness", label: "Harness", icon: Code2 },
  { id: "kpi", label: "KPI", icon: Gauge },
  { id: "experiment", label: "Experiment", icon: Rocket },
  { id: "export", label: "Export", icon: Download },
];

function safeLoad() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    return defaultState;
  }
}

function Field({ label, value, onChange, textarea = false, placeholder = "" }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold text-slate-700">{label}</span>
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
        />
      )}
    </label>
  );
}

function Section({ title, description, children, actions }) {
  return (
    <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h2>
          {description && <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{description}</p>}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function Card({ title, children }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-3 text-base font-bold text-slate-900">{title}</h3>
      <div className="text-sm leading-6 text-slate-600">{children}</div>
    </div>
  );
}

function SmallButton({ children, onClick, variant = "default", type = "button" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition";
  const styles = {
    default: "bg-slate-950 text-white hover:bg-slate-800",
    ghost: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    danger: "border border-rose-200 bg-white text-rose-600 hover:bg-rose-50",
  };
  return (
    <button type={type} onClick={onClick} className={`${base} ${styles[variant]}`}>
      {children}
    </button>
  );
}

function TextAreaPreview({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        <SmallButton variant="ghost" onClick={() => navigator.clipboard?.writeText(value)}>
          복사
        </SmallButton>
      </div>
      <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-white p-4 text-xs leading-6 text-slate-700 ring-1 ring-slate-200">
        {value}
      </pre>
    </div>
  );
}

function TableEditor({ rows, columns, onChange, onAdd, onRemove }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="px-4 py-3 font-bold">{column.label}</th>
              ))}
              <th className="w-16 px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {rows.map((row, rowIndex) => (
              <tr key={row.id ?? rowIndex}>
                {columns.map((column) => (
                  <td key={column.key} className="px-3 py-3 align-top">
                    <input
                      value={row[column.key] ?? ""}
                      onChange={(event) => onChange(rowIndex, column.key, event.target.value)}
                      className="min-w-[150px] rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                    />
                  </td>
                ))}
                <td className="px-3 py-3 align-top">
                  <button
                    type="button"
                    onClick={() => onRemove(rowIndex)}
                    className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                    aria-label="행 삭제"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-slate-50 p-3">
        <SmallButton variant="ghost" onClick={onAdd}>
          <Plus size={16} /> 행 추가
        </SmallButton>
      </div>
    </div>
  );
}

function buildDocuments(data) {
  const problemMd = `# Problem Definition\n\n## 1. 주제\n${data.problem.topic}\n\n## 2. 문제 상황\n${data.problem.situation}\n\n## 3. 핵심 사용자\n${data.problem.user}\n\n## 4. 사용자가 겪는 불편\n${data.problem.pain}\n\n## 5. 현재 대안과 한계\n${data.problem.currentAlternative}\n\n## 6. 서비스 아이디어\n${data.problem.idea}\n\n## 7. 4주 안에 구현 가능한 최소 기능\n${data.problem.mvp}\n\n## 8. 데이터로 검증할 수 있는 지표\n${data.problem.metric}\n\n## 9. 구현 범위에서 제외할 것\n${data.problem.outOfScope}\n`;

  const personaMd = `# Persona\n\n- 이름: ${data.persona.name}\n- 나이: ${data.persona.age}\n- 전공: ${data.persona.major}\n- 학년: ${data.persona.grade}\n\n## 하루 일과\n${data.persona.routine}\n\n## 자주 사용하는 도구\n${data.persona.tools}\n\n## 목표\n${data.persona.goal}\n\n## Pain Point\n${data.persona.pain}\n\n## 서비스 사용 전 행동\n${data.persona.before}\n\n## 서비스 사용 후 기대 변화\n${data.persona.after}\n\n## 절대 원하지 않는 것\n${data.persona.avoid}\n`;

  const journeyMd = `# User Journey Map\n\n| 단계 | 사용자 행동 | 감정 | Pain Point | 서비스 기회 |\n|---|---|---|---|---|\n${data.journey.map((row) => `| ${row.stage} | ${row.action} | ${row.emotion} | ${row.pain} | ${row.opportunity} |`).join("\n")}\n`;

  const prdMd = `# PRD\n\n## 문제정의\n${data.problem.situation}\n\n## 목표 사용자\n${data.problem.user}\n\n## 핵심 가치 제안\n${data.prd.value}\n\n## 핵심 시나리오\n${data.prd.scenario}\n\n## MVP 기능 범위\n${data.prd.mvpFeatures}\n\n## 제외할 기능\n${data.problem.outOfScope}\n\n## 주요 데이터\n${data.prd.data}\n\n## KPI\n${data.kpi.map((item) => `- ${item.name}: ${item.formula} / 목표 ${item.target}`).join("\n")}\n\n## 리스크\n${data.prd.risks}\n\n## 향후 확장 방향\n${data.prd.expansion}\n`;

  const acMd = `# Acceptance Criteria\n\n| ID | 기능 | Given | When | Then | 우선순위 |\n|---|---|---|---|---|---|\n${data.ac.map((row) => `| ${row.id} | ${row.feature} | ${row.given} | ${row.when} | ${row.then} | ${row.priority} |`).join("\n")}\n`;

  const testCasesMd = `# Test Cases\n\n| ID | 유형 | 보호할 동작 | 입력 | 기대 결과 |\n|---|---|---|---|---|\n${data.tests.map((row, index) => `| TC-${String(index + 1).padStart(2, "0")} | ${row.type} | ${row.behavior} | ${row.input} | ${row.expected} |`).join("\n")}\n`;

  const agentsMd = `# AGENTS.md\n\n## Project Goal [Guides]\n${data.harness.projectGoal}\n\n## Source of Truth\n- 요구사항: docs/PRD.md\n- 기준: docs/acceptance_criteria.md\n- 우선순위: docs/test_cases.md High 항목\n\n## Guides\n${data.harness.guides}\n\n## Tools\n${data.harness.tools}\n\n## Sensors\n${data.harness.sensors}\n\n## Permissions\n${data.harness.permissions}\n\n## Feedback Loops\n${data.harness.feedbackLoops}\n\n## Rules\n- 기능 구현 전 테스트 먼저 작성\n- 테스트 실패 시 원인부터 설명\n- 요구사항 임의 삭제 금지\n- TypeScript any 사용 금지\n`;

  const kpiMd = `# KPI\n\n| KPI | 계산식 | 목표 |\n|---|---|---|\n${data.kpi.map((row) => `| ${row.name} | ${row.formula} | ${row.target} |`).join("\n")}\n`;

  const experimentMd = `# Experiment Plan\n\n## 1. 실험 가설\n${data.experiment.hypothesis}\n\n## 2. 실험군과 대조군\n- Control: ${data.experiment.control}\n- Variant: ${data.experiment.variant}\n\n## 3. 주요 지표\n${data.experiment.metric}\n\n## 4. 성공 기준\n${data.experiment.success}\n\n## 5. 데이터 수집\n${data.experiment.collection}\n`;

  return {
    "docs/problem.md": problemMd,
    "docs/persona.md": personaMd,
    "docs/journey.md": journeyMd,
    "docs/PRD.md": prdMd,
    "docs/acceptance_criteria.md": acMd,
    "docs/test_cases.md": testCasesMd,
    "AGENTS.md": agentsMd,
    "docs/kpi.md": kpiMd,
    "docs/experiment_plan.md": experimentMd,
  };
}

function downloadText(filename, text) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.replaceAll("/", "_");
  anchor.click();
  URL.revokeObjectURL(url);
}

function progressFor(data) {
  const blocks = [
    data.problem.situation,
    data.persona.name,
    data.journey.length,
    data.prd.value,
    data.ac.length,
    data.tests.length,
    data.harness.projectGoal,
    data.kpi.length,
    data.experiment.hypothesis,
  ];
  const done = blocks.filter(Boolean).length;
  return Math.round((done / blocks.length) * 100);
}

export default function AXDXHarnessWorkshopBuilder() {
  const [active, setActive] = useState("overview");
  const [data, setData] = useState(defaultState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setData(safeLoad());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, hydrated]);

  const docs = useMemo(() => buildDocuments(data), [data]);
  const progress = progressFor(data);
  const activeIndex = steps.findIndex((step) => step.id === active);

  const update = (section, key, value) => {
    setData((prev) => ({ ...prev, [section]: { ...prev[section], [key]: value } }));
  };

  const updateRow = (section, rowIndex, key, value) => {
    setData((prev) => ({
      ...prev,
      [section]: prev[section].map((row, index) => (index === rowIndex ? { ...row, [key]: value } : row)),
    }));
  };

  const addRow = (section, row) => {
    setData((prev) => ({ ...prev, [section]: [...prev[section], row] }));
  };

  const removeRow = (section, rowIndex) => {
    setData((prev) => ({ ...prev, [section]: prev[section].filter((_, index) => index !== rowIndex) }));
  };

  const next = () => setActive(steps[Math.min(activeIndex + 1, steps.length - 1)].id);
  const previous = () => setActive(steps[Math.max(activeIndex - 1, 0)].id);

  return (
    <div className="min-h-screen bg-white text-slate-900" style={{ fontFamily: "'Noto Sans KR', 'Inter', system-ui, sans-serif" }}>
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-5 md:px-6 lg:px-8">
        <aside className="sticky top-5 hidden h-[calc(100vh-2.5rem)] w-72 shrink-0 flex-col rounded-[2rem] border border-slate-200 bg-white p-4 shadow-sm lg:flex">
          <div className="mb-6 rounded-3xl bg-slate-950 p-5 text-white">
            <div className="mb-4 inline-flex rounded-2xl bg-white/10 p-3">
              <Sparkles size={24} />
            </div>
            <h1 className="text-xl font-black leading-tight">AX/DX Harness Workshop Builder</h1>
            <p className="mt-2 text-sm leading-6 text-slate-300">문제정의에서 AGENTS.md와 실험 설계까지 한 번에 작성합니다.</p>
          </div>

          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>완성도</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-slate-950 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <nav className="space-y-1 overflow-auto pr-1">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const selected = active === step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActive(step.id)}
                  className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                    selected ? "bg-slate-950 text-white" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  <span className={`flex h-7 w-7 items-center justify-center rounded-xl ${selected ? "bg-white/10" : "bg-slate-100"}`}>
                    <Icon size={16} />
                  </span>
                  <span className="flex-1">{step.label}</span>
                  <span className="text-xs opacity-60">{String(index + 1).padStart(2, "0")}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-slate-400">Workshop App MVP</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">AXDX 바이브 코딩 X 하네스 엔지니어링 실습 앱</h1>
                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">강의 슬라이드를 참조하며, 참가자가 직접 입력하고 산출물을 내려받는 웹 앱을 도구로 사용하세요.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <SmallButton variant="ghost" onClick={previous}>이전</SmallButton>
                <SmallButton onClick={next}>다음 <ArrowRight size={16} /></SmallButton>
              </div>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActive(step.id)}
                  className={`whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold ${active === step.id ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}
                >
                  {step.label}
                </button>
              ))}
            </div>
          </header>

          {active === "overview" && (
            <Section title="워크숍 앱 개요" description="문제정의 → 페르소나 → 여정지도 → PRD → Acceptance Criteria → 테스트 → 하네스 → KPI → 실험 설계 순서로 진행합니다.">
              <div className="grid gap-4 md:grid-cols-3">
                <Card title="1. 작성 흐름">
                  참가자는 각 화면에서 최소 입력값을 채웁니다. 모든 입력은 브라우저 localStorage에 자동 저장됩니다.
                </Card>
                <Card title="2. 하네스 생성">
                  Guides, Tools, Sensors, Permissions, Feedback Loops를 입력하면 AGENTS.md가 자동 생성됩니다.
                </Card>
                <Card title="3. 산출물 Export">
                  problem.md, PRD.md, acceptance_criteria.md, test_cases.md, AGENTS.md, kpi.md, experiment_plan.md를 복사하거나 다운로드합니다.
                </Card>
              </div>
              <div className="mt-6 rounded-3xl bg-slate-50 p-5 ring-1 ring-slate-200">
                <h3 className="font-bold text-slate-900">운영 원칙</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">설명은 짧게, 실습은 바로, 실패는 함께 디버깅합니다. 이 앱은 참가자가 직접 결과물을 만드는 작업대입니다.</p>
              </div>
            </Section>
          )}

          {active === "problem" && (
            <Section title="문제정의" description="좋은 아이디어보다 검증 가능한 문제를 먼저 고릅니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="주제" value={data.problem.topic} onChange={(v) => update("problem", "topic", v)} />
                <Field label="핵심 사용자" value={data.problem.user} onChange={(v) => update("problem", "user", v)} />
                <Field textarea label="문제 상황" value={data.problem.situation} onChange={(v) => update("problem", "situation", v)} />
                <Field textarea label="사용자가 겪는 불편" value={data.problem.pain} onChange={(v) => update("problem", "pain", v)} />
                <Field textarea label="현재 대안과 한계" value={data.problem.currentAlternative} onChange={(v) => update("problem", "currentAlternative", v)} />
                <Field textarea label="서비스 아이디어" value={data.problem.idea} onChange={(v) => update("problem", "idea", v)} />
                <Field textarea label="4주 안에 구현 가능한 최소 기능" value={data.problem.mvp} onChange={(v) => update("problem", "mvp", v)} />
                <Field textarea label="데이터로 검증할 수 있는 지표" value={data.problem.metric} onChange={(v) => update("problem", "metric", v)} />
                <div className="md:col-span-2">
                  <Field textarea label="구현 범위에서 제외할 것" value={data.problem.outOfScope} onChange={(v) => update("problem", "outOfScope", v)} />
                </div>
              </div>
            </Section>
          )}

          {active === "persona" && (
            <Section title="Persona" description="핵심 사용자 1명을 구체적으로 정의합니다.">
              <div className="grid gap-4 md:grid-cols-4">
                <Field label="이름" value={data.persona.name} onChange={(v) => update("persona", "name", v)} />
                <Field label="나이" value={data.persona.age} onChange={(v) => update("persona", "age", v)} />
                <Field label="전공" value={data.persona.major} onChange={(v) => update("persona", "major", v)} />
                <Field label="학년" value={data.persona.grade} onChange={(v) => update("persona", "grade", v)} />
                <div className="md:col-span-2"><Field textarea label="하루 일과" value={data.persona.routine} onChange={(v) => update("persona", "routine", v)} /></div>
                <div className="md:col-span-2"><Field textarea label="자주 사용하는 도구" value={data.persona.tools} onChange={(v) => update("persona", "tools", v)} /></div>
                <div className="md:col-span-2"><Field textarea label="목표" value={data.persona.goal} onChange={(v) => update("persona", "goal", v)} /></div>
                <div className="md:col-span-2"><Field textarea label="Pain Point" value={data.persona.pain} onChange={(v) => update("persona", "pain", v)} /></div>
                <div className="md:col-span-2"><Field textarea label="서비스 사용 전 행동" value={data.persona.before} onChange={(v) => update("persona", "before", v)} /></div>
                <div className="md:col-span-2"><Field textarea label="서비스 사용 후 기대 변화" value={data.persona.after} onChange={(v) => update("persona", "after", v)} /></div>
                <div className="md:col-span-4"><Field textarea label="절대 원하지 않는 것" value={data.persona.avoid} onChange={(v) => update("persona", "avoid", v)} /></div>
              </div>
            </Section>
          )}

          {active === "journey" && (
            <Section title="User Journey Map" description="감정, Pain Point, 서비스 개입 순간이 보여야 합니다.">
              <TableEditor
                rows={data.journey}
                columns={[
                  { key: "stage", label: "단계" },
                  { key: "action", label: "사용자 행동" },
                  { key: "emotion", label: "감정" },
                  { key: "pain", label: "Pain Point" },
                  { key: "opportunity", label: "서비스 기회" },
                ]}
                onChange={(i, k, v) => updateRow("journey", i, k, v)}
                onAdd={() => addRow("journey", { id: Date.now(), stage: "", action: "", emotion: "", pain: "", opportunity: "" })}
                onRemove={(i) => removeRow("journey", i)}
              />
            </Section>
          )}

          {active === "prd" && (
            <Section title="PRD" description="아이디어를 제품 문서로 바꾸는 최소 구조입니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field textarea label="핵심 가치 제안" value={data.prd.value} onChange={(v) => update("prd", "value", v)} />
                <Field textarea label="핵심 시나리오" value={data.prd.scenario} onChange={(v) => update("prd", "scenario", v)} />
                <Field textarea label="MVP 기능 범위" value={data.prd.mvpFeatures} onChange={(v) => update("prd", "mvpFeatures", v)} />
                <Field textarea label="주요 데이터" value={data.prd.data} onChange={(v) => update("prd", "data", v)} />
                <Field textarea label="리스크" value={data.prd.risks} onChange={(v) => update("prd", "risks", v)} />
                <Field textarea label="향후 확장 방향" value={data.prd.expansion} onChange={(v) => update("prd", "expansion", v)} />
              </div>
            </Section>
          )}

          {active === "ac" && (
            <Section title="Acceptance Criteria" description="모호한 요구사항을 Given-When-Then 문장으로 바꿉니다.">
              <TableEditor
                rows={data.ac}
                columns={[
                  { key: "id", label: "ID" },
                  { key: "feature", label: "기능" },
                  { key: "given", label: "Given" },
                  { key: "when", label: "When" },
                  { key: "then", label: "Then" },
                  { key: "priority", label: "우선순위" },
                ]}
                onChange={(i, k, v) => updateRow("ac", i, k, v)}
                onAdd={() => addRow("ac", { id: `AC-${String(data.ac.length + 1).padStart(2, "0")}`, feature: "", given: "", when: "", then: "", priority: "High" })}
                onRemove={(i) => removeRow("ac", i)}
              />
            </Section>
          )}

          {active === "tests" && (
            <Section title="Test Cases" description="정상, 엣지, 실패 케이스를 모두 포함합니다.">
              <TableEditor
                rows={data.tests}
                columns={[
                  { key: "type", label: "유형" },
                  { key: "behavior", label: "보호할 동작" },
                  { key: "input", label: "입력" },
                  { key: "expected", label: "기대 결과" },
                ]}
                onChange={(i, k, v) => updateRow("tests", i, k, v)}
                onAdd={() => addRow("tests", { id: Date.now(), type: "정상", behavior: "", input: "", expected: "" })}
                onRemove={(i) => removeRow("tests", i)}
              />
            </Section>
          )}

          {active === "harness" && (
            <Section title="Harness 설계" description="AI 에이전트가 작업 범위를 벗어나지 못하도록 실행 환경을 정의합니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field textarea label="Project Goal" value={data.harness.projectGoal} onChange={(v) => update("harness", "projectGoal", v)} />
                <Field textarea label="Guides" value={data.harness.guides} onChange={(v) => update("harness", "guides", v)} />
                <Field textarea label="Tools" value={data.harness.tools} onChange={(v) => update("harness", "tools", v)} />
                <Field textarea label="Sensors" value={data.harness.sensors} onChange={(v) => update("harness", "sensors", v)} />
                <Field textarea label="Permissions" value={data.harness.permissions} onChange={(v) => update("harness", "permissions", v)} />
                <Field textarea label="Feedback Loops" value={data.harness.feedbackLoops} onChange={(v) => update("harness", "feedbackLoops", v)} />
              </div>
              <div className="mt-6">
                <TextAreaPreview title="AGENTS.md 미리보기" value={docs["AGENTS.md"]} />
              </div>
            </Section>
          )}

          {active === "kpi" && (
            <Section title="KPI" description="좋아졌다는 말을 계산 가능한 숫자로 바꿉니다.">
              <TableEditor
                rows={data.kpi}
                columns={[
                  { key: "name", label: "KPI" },
                  { key: "formula", label: "계산식" },
                  { key: "target", label: "목표" },
                ]}
                onChange={(i, k, v) => updateRow("kpi", i, k, v)}
                onAdd={() => addRow("kpi", { id: Date.now(), name: "", formula: "", target: "" })}
                onRemove={(i) => removeRow("kpi", i)}
              />
            </Section>
          )}

          {active === "experiment" && (
            <Section title="Experiment Plan" description="배포 후 무엇을 바꿔 검증할지 정의합니다.">
              <div className="grid gap-4 md:grid-cols-2">
                <Field textarea label="실험 가설" value={data.experiment.hypothesis} onChange={(v) => update("experiment", "hypothesis", v)} />
                <Field textarea label="주요 지표" value={data.experiment.metric} onChange={(v) => update("experiment", "metric", v)} />
                <Field textarea label="Control" value={data.experiment.control} onChange={(v) => update("experiment", "control", v)} />
                <Field textarea label="Variant" value={data.experiment.variant} onChange={(v) => update("experiment", "variant", v)} />
                <Field textarea label="성공 기준" value={data.experiment.success} onChange={(v) => update("experiment", "success", v)} />
                <Field textarea label="데이터 수집" value={data.experiment.collection} onChange={(v) => update("experiment", "collection", v)} />
              </div>
            </Section>
          )}

          {active === "export" && (
            <Section
              title="Export"
              description="워크숍 산출물을 Markdown 문서로 복사하거나 다운로드합니다. GitHub 레포에 그대로 넣을 수 있는 구조입니다."
              actions={
                <SmallButton
                  onClick={() => {
                    const all = Object.entries(docs).map(([name, text]) => `---\n${name}\n---\n\n${text}`).join("\n\n");
                    downloadText("axdx_workshop_outputs.md", all);
                  }}
                >
                  <Download size={16} /> 전체 다운로드
                </SmallButton>
              }
            >
              <div className="grid gap-4">
                {Object.entries(docs).map(([name, text]) => (
                  <TextAreaPreview key={name} title={name} value={text} />
                ))}
              </div>
            </Section>
          )}
        </main>
      </div>
    </div>
  );
}
