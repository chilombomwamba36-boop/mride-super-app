import React, { useState } from 'react';
import {
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  FileBarChart,
  Send,
  RotateCcw,
  Clock,
  Paperclip,
  ShieldCheck,
  Plus
} from 'lucide-react';
import {
  WebsiteCmsAndWorkforceService,
  WorkforceTaskDeliverable,
  WorkforceTaskStage,
  WorkforcePeriodicReport
} from '../../services/websiteCmsService';
import { AdminStaffRole, StaffSystemAccount } from '../../services/mridePlatformStore';
import { TripSecurityAndStateService } from '../../services/tripStateMachine';

interface WorkforceControlCentreModuleProps {
  activeStaffAccount: StaffSystemAccount;
  currentStaffRole: AdminStaffRole;
  staffAccounts: StaffSystemAccount[];
  onNotice: (msg: string) => void;
}

const ALL_STAGES: WorkforceTaskStage[] = [
  'Assigned',
  'Accepted',
  'In Progress',
  'Submitted',
  'Under Review',
  'Approved',
  'Returned for Correction'
];

const DEPARTMENTS_LIST: Array<WorkforceTaskDeliverable['department']> = [
  'Operations',
  'Human Resources',
  'Customer Support',
  'Finance',
  'Driver Verification',
  'Content and Website Management',
  'Corporate and Business Partnerships',
  'Safety and Emergency Management',
  'Legal and Regulatory Compliance',
  'Call Centre Management'
];

export const WorkforceControlCentreModule: React.FC<WorkforceControlCentreModuleProps> = ({
  activeStaffAccount,
  currentStaffRole,
  staffAccounts,
  onNotice
}) => {
  const [wfTasks, setWfTasks] = useState<WorkforceTaskDeliverable[]>(() =>
    WebsiteCmsAndWorkforceService.getWorkforceTasks()
  );
  const [periodicReports, setPeriodicReports] = useState<WorkforcePeriodicReport[]>(() =>
    WebsiteCmsAndWorkforceService.getPeriodicReports()
  );

  const [subTab, setSubTab] = useState<
    'workflow_board' | 'assign_work' | 'daily_weekly_reports' | 'department_performance'
  >('workflow_board');

  // New Task Assignment Form State
  const [titleInput, setTitleInput] = useState('');
  const [deptInput, setDeptInput] =
    useState<WorkforceTaskDeliverable['department']>('Operations');
  const [assigneeUsername, setAssigneeUsername] = useState(
    staffAccounts[1]?.username || 'mulenga.ops'
  );
  const [priorityInput, setPriorityInput] =
    useState<WorkforceTaskDeliverable['priority']>('High');
  const [dueDateInput, setDueDateInput] = useState('2026-11-01');
  const [instructionsInput, setInstructionsInput] = useState('');
  const [allowSelfApprove, setAllowSelfApprove] = useState(false);

  // Submission / Review Note Input per task
  const [taskNoteInputs, setTaskNoteInputs] = useState<Record<string, string>>({});
  const [taskFileInputs, setTaskFileInputs] = useState<Record<string, string>>({});

  // Daily / Weekly Report Submission State
  const [reportTypeInput, setReportTypeInput] =
    useState<WorkforcePeriodicReport['reportType']>('Daily Report');
  const [reportDeptInput, setReportDeptInput] =
    useState<WorkforceTaskDeliverable['department']>('Operations');
  const [reportPeriodInput, setReportPeriodInput] = useState(
    '27 Oct 2026 — End-of-Shift Departmental Summary'
  );
  const [reportMetricsInput, setReportMetricsInput] = useState('');
  const [reportRisksInput, setReportRisksInput] = useState('');

  const isOwner = currentStaffRole === 'Owner / Super Administrator';

  const handleAssignNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim()) return;
    const assignee =
      staffAccounts.find((s) => s.username === assigneeUsername) || staffAccounts[0];
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

    const created: WorkforceTaskDeliverable = {
      id: `WF-${Math.floor(210 + Math.random() * 780)}`,
      title: titleInput.trim(),
      department: deptInput,
      assignedByUsername: activeStaffAccount.username,
      assignedByName: activeStaffAccount.fullName,
      assignedToUsername: assignee.username,
      assignedToName: assignee.fullName,
      priority: priorityInput,
      stage: 'Assigned',
      dueDate: dueDateInput,
      deliverableInstructions:
        instructionsInput.trim() ||
        'Complete deliverable and attach supporting spreadsheet or verification file.',
      selfApprovalExceptionAuthorized: isOwner ? allowSelfApprove : false,
      historyLog: [
        {
          stage: 'Assigned',
          actorName: activeStaffAccount.fullName,
          actorUsername: activeStaffAccount.username,
          note: `Assigned to ${assignee.fullName} (@${assignee.username}) in ${deptInput}.`,
          timestamp: now
        }
      ]
    };

    const next = [created, ...wfTasks];
    setWfTasks(next);
    WebsiteCmsAndWorkforceService.saveWorkforceTasks(next);
    TripSecurityAndStateService.recordAuditLog({
      actorId: activeStaffAccount.username,
      actorName: activeStaffAccount.fullName,
      actorRole: 'admin',
      action: `Assigned Workforce Deliverable ${created.id}`,
      category: 'account_status',
      targetId: created.id,
      summary: `${created.title} → ${assignee.fullName} (${deptInput})`
    });

    setTitleInput('');
    setInstructionsInput('');
    setSubTab('workflow_board');
    onNotice(`Assigned task ${created.id} to ${assignee.fullName} (${deptInput}).`);
  };

  const handleStageTransition = (taskId: string, nextStage: WorkforceTaskStage) => {
    const note =
      taskNoteInputs[taskId]?.trim() ||
      `Transitioned to ${nextStage} by ${activeStaffAccount.fullName}`;
    const file = taskFileInputs[taskId]?.trim() || undefined;

    const res = WebsiteCmsAndWorkforceService.transitionWorkforceTask({
      taskId,
      nextStage,
      actorUsername: activeStaffAccount.username,
      actorName: activeStaffAccount.fullName,
      actorRole: currentStaffRole,
      note,
      attachedFileName: file
    });

    if (!res.success || !res.tasks) {
      onNotice(res.message);
      return;
    }

    setWfTasks(res.tasks);
    setTaskNoteInputs({ ...taskNoteInputs, [taskId]: '' });
    TripSecurityAndStateService.recordAuditLog({
      actorId: activeStaffAccount.username,
      actorName: activeStaffAccount.fullName,
      actorRole: 'admin',
      action: `Workforce Task ${taskId} → ${nextStage}`,
      category: 'account_status',
      targetId: taskId,
      summary: note
    });
    onNotice(res.message);
  };

  const handleSubmitPeriodicReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportMetricsInput.trim()) return;
    const created: WorkforcePeriodicReport = {
      id: `RPT-${Math.floor(510 + Math.random() * 480)}`,
      reportType: reportTypeInput,
      department: reportDeptInput,
      submittedByName: activeStaffAccount.fullName,
      submittedByUsername: activeStaffAccount.username,
      periodLabel: reportPeriodInput.trim(),
      keyMetricsSummary: reportMetricsInput.trim(),
      blockersAndRisks: reportRisksInput.trim() || 'No operational blockers reported.',
      status: 'Submitted',
      createdAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };
    const next = [created, ...periodicReports];
    setPeriodicReports(next);
    WebsiteCmsAndWorkforceService.savePeriodicReports(next);
    setReportMetricsInput('');
    setReportRisksInput('');
    onNotice(`Submitted ${created.reportType} (${created.id}) for Owner review.`);
  };

  const overdueTasks = wfTasks.filter(
    (t) => t.stage !== 'Approved' && t.dueDate < '2026-10-28'
  );

  return (
    <div className="space-y-5 text-xs">
      {/* Top Workforce Control Centre Header & Overdue Notification Banner */}
      <div className="bg-[#0B1528] text-white rounded-2xl p-5 border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider bg-[#FF6500] text-white px-2.5 py-0.5 rounded-full">
              <Briefcase className="w-3 h-3" /> Workforce Control Centre & Submission Pipeline
            </span>
            <h2 className="text-lg font-extrabold mt-1">
              6-Stage Task Workflow, Deliverable Submissions, Daily/Weekly Reports & Department KPIs
            </h2>
            <p className="text-xs text-slate-300">
              Workflow: <strong>Assigned → Accepted → In Progress → Submitted → Under Review → Approved or Returned for Correction</strong>. Self-approval by employees is blocked unless an audited Owner exception is enabled.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {([
              { id: 'workflow_board', label: `Task Pipeline (${wfTasks.length})` },
              { id: 'assign_work', label: '+ Assign Deliverable' },
              { id: 'daily_weekly_reports', label: `Daily & Weekly Reports (${periodicReports.length})` },
              { id: 'department_performance', label: '10-Department Performance' }
            ] as const).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSubTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl font-extrabold transition-all ${
                  subTab === tab.id
                    ? 'bg-[#FF6500] text-white shadow-sm'
                    : 'bg-white/10 text-slate-200 hover:bg-white/20'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overdue / Due-Soon Task Alert Strip */}
        {overdueTasks.length > 0 && (
          <div className="rounded-xl bg-amber-500/20 border border-amber-400/40 px-4 py-2.5 flex items-center justify-between text-amber-200">
            <span className="flex items-center gap-2 font-bold">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
              Deadline Alert: {overdueTasks.length} deliverable(s) require immediate submission or Owner review today ({overdueTasks.map((o) => o.id).join(', ')}).
            </span>
            <span className="text-[10px] uppercase font-extrabold bg-amber-400 text-slate-950 px-2 py-0.5 rounded">
              Active Escalation
            </span>
          </div>
        )}
      </div>

      {/* ================= SUB-TAB 1: 6-STAGE WORKFLOW PIPELINE ================= */}
      {subTab === 'workflow_board' && (
        <div className="space-y-4">
          {wfTasks.map((task) => {
            const isSelfAssigned =
              task.assignedToUsername.toLowerCase() ===
              activeStaffAccount.username.toLowerCase();

            return (
              <div
                key={task.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-2xs space-y-3"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-black text-xs bg-[#0B1528] text-white px-2.5 py-0.5 rounded">
                        {task.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#FF6500] font-extrabold text-[10px]">
                        {task.department}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                          task.priority === 'Critical'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-semibold text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-[#FF6500]" /> Due: {task.dueDate}
                      </span>
                    </div>
                    <h3 className="text-sm font-extrabold text-[#15191C] mt-1.5">{task.title}</h3>
                    <p className="text-slate-600 mt-0.5">{task.deliverableInstructions}</p>
                  </div>

                  <div className="text-right">
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-extrabold text-xs">
                      Stage: {task.stage}
                    </span>
                    <span className="block text-[11px] text-slate-500 mt-1">
                      Assigned to: <strong>{task.assignedToName}</strong> (@{task.assignedToUsername})
                    </span>
                  </div>
                </div>

                {/* Visual 6-Stage Progress Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-1.5">
                  {ALL_STAGES.map((st) => {
                    const isCurrent = task.stage === st;
                    return (
                      <div
                        key={st}
                        className={`px-2 py-1.5 rounded-lg text-center text-[10px] font-bold border ${
                          isCurrent
                            ? st === 'Returned for Correction'
                              ? 'bg-red-600 text-white border-red-600'
                              : 'bg-[#FF6500] text-white border-[#FF6500]'
                            : 'bg-[#F4F6F9] text-slate-500 border-slate-200'
                        }`}
                      >
                        {st}
                      </div>
                    );
                  })}
                </div>

                {/* Supporting File & Submission Note Display */}
                {(task.employeeSubmissionNotes || task.attachedFileName || task.reviewFeedback) && (
                  <div className="p-3 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1 text-[11px]">
                    {task.employeeSubmissionNotes && (
                      <p>
                        <strong className="text-[#15191C]">Employee Submission:</strong>{' '}
                        {task.employeeSubmissionNotes}
                      </p>
                    )}
                    {task.attachedFileName && (
                      <p className="flex items-center gap-1 text-[#FF6500] font-bold">
                        <Paperclip className="w-3.5 h-3.5" /> Attached Deliverable File:{' '}
                        <span className="font-mono underline">{task.attachedFileName}</span>
                      </p>
                    )}
                    {task.reviewFeedback && (
                      <p className="text-emerald-800 font-bold">
                        Reviewer Decision ({task.reviewerName}): {task.reviewFeedback}
                      </p>
                    )}
                  </div>
                )}

                {/* Action Controls Based on Current Stage & Anti-Self-Approval Rule */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[260px]">
                    <input
                      type="text"
                      value={taskNoteInputs[task.id] || ''}
                      onChange={(e) =>
                        setTaskNoteInputs({ ...taskNoteInputs, [task.id]: e.target.value })
                      }
                      placeholder="Add progress update, submission note, or review feedback..."
                      className="flex-1 rounded-xl border border-slate-300 px-3 py-1.5"
                    />
                    <input
                      type="text"
                      value={taskFileInputs[task.id] || ''}
                      onChange={(e) =>
                        setTaskFileInputs({ ...taskFileInputs, [task.id]: e.target.value })
                      }
                      placeholder="Attachment filename (e.g. report.csv)"
                      className="w-48 rounded-xl border border-slate-300 px-2.5 py-1.5 font-mono text-[11px]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {task.stage === 'Assigned' && (
                      <button
                        type="button"
                        onClick={() => handleStageTransition(task.id, 'Accepted')}
                        className="rounded-xl bg-[#0B1528] text-white font-extrabold px-3 py-1.5"
                      >
                        Accept Task
                      </button>
                    )}
                    {(task.stage === 'Accepted' || task.stage === 'Returned for Correction') && (
                      <button
                        type="button"
                        onClick={() => handleStageTransition(task.id, 'In Progress')}
                        className="rounded-xl bg-sky-600 text-white font-extrabold px-3 py-1.5"
                      >
                        Start Work (In Progress)
                      </button>
                    )}
                    {task.stage === 'In Progress' && (
                      <button
                        type="button"
                        onClick={() => handleStageTransition(task.id, 'Submitted')}
                        className="rounded-xl bg-[#FF6500] text-white font-extrabold px-3.5 py-1.5 flex items-center gap-1"
                      >
                        <Send className="w-3.5 h-3.5" /> Submit Deliverable
                      </button>
                    )}
                    {task.stage === 'Submitted' && (
                      <button
                        type="button"
                        onClick={() => handleStageTransition(task.id, 'Under Review')}
                        className="rounded-xl bg-amber-500 text-slate-950 font-extrabold px-3 py-1.5"
                      >
                        Begin Review
                      </button>
                    )}
                    {(task.stage === 'Submitted' || task.stage === 'Under Review') && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleStageTransition(task.id, 'Approved')}
                          className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-3.5 py-1.5 flex items-center gap-1"
                          title={
                            isSelfAssigned && !isOwner
                              ? 'Employees cannot approve their own work'
                              : 'Approve Deliverable'
                          }
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleStageTransition(task.id, 'Returned for Correction')
                          }
                          className="rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold px-3 py-1.5 flex items-center gap-1"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Return for Correction
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ================= SUB-TAB 2: ASSIGN NEW WORK DELIVERABLE ================= */}
      {subTab === 'assign_work' && (
        <form
          onSubmit={handleAssignNewTask}
          className="bg-white rounded-2xl p-5 border border-slate-200 space-y-4"
        >
          <h3 className="text-base font-extrabold text-[#15191C]">
            Assign New Department Deliverable & Deadline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-600 block mb-1">Task / Deliverable Title</label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Audit Q4 Kitwe Corporate B2B Invoices"
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Department</label>
              <select
                value={deptInput}
                onChange={(e) =>
                  setDeptInput(e.target.value as WorkforceTaskDeliverable['department'])
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              >
                {DEPARTMENTS_LIST.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Assign to Staff Member</label>
              <select
                value={assigneeUsername}
                onChange={(e) => setAssigneeUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              >
                {staffAccounts.map((s) => (
                  <option key={s.accountId} value={s.username}>
                    {s.fullName} (@{s.username} — {s.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Priority</label>
              <select
                value={priorityInput}
                onChange={(e) =>
                  setPriorityInput(e.target.value as WorkforceTaskDeliverable['priority'])
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Normal">Normal</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-600 block mb-1">Deadline Date</label>
              <input
                type="date"
                value={dueDateInput}
                onChange={(e) => setDueDateInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-600 block mb-1">
                Deliverable Instructions & Required Attachments
              </label>
              <input
                type="text"
                value={instructionsInput}
                onChange={(e) => setInstructionsInput(e.target.value)}
                placeholder="Specify required spreadsheet, form, or verification report..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>
          </div>

          {isOwner && (
            <label className="flex items-center gap-2 text-amber-900 bg-amber-50 border border-amber-200 p-3 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={allowSelfApprove}
                onChange={(e) => setAllowSelfApprove(e.target.checked)}
                className="accent-[#FF6500]"
              />
              <span className="font-bold">
                Authorise Audited Self-Approval Exception for this task (Owner Only)
              </span>
            </label>
          )}

          <button
            type="submit"
            className="rounded-xl bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold px-5 py-2.5 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Assign Deliverable
          </button>
        </form>
      )}

      {/* ================= SUB-TAB 3: DAILY & WEEKLY REPORTS ================= */}
      {subTab === 'daily_weekly_reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <form
            onSubmit={handleSubmitPeriodicReport}
            className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200 space-y-3"
          >
            <h3 className="text-base font-extrabold text-[#15191C]">
              Submit Daily or Weekly Department Report
            </h3>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Report Type</label>
              <select
                value={reportTypeInput}
                onChange={(e) =>
                  setReportTypeInput(
                    e.target.value as WorkforcePeriodicReport['reportType']
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              >
                <option value="Daily Report">Daily Operational Report</option>
                <option value="Weekly Report">Weekly Department Summary</option>
                <option value="Department Performance Report">
                  Monthly Department Performance Report
                </option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Department</label>
              <select
                value={reportDeptInput}
                onChange={(e) =>
                  setReportDeptInput(
                    e.target.value as WorkforceTaskDeliverable['department']
                  )
                }
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              >
                {DEPARTMENTS_LIST.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">Period / Shift Label</label>
              <input
                type="text"
                value={reportPeriodInput}
                onChange={(e) => setReportPeriodInput(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 font-bold"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">
                Key Achievements & Metrics Summary
              </label>
              <textarea
                rows={3}
                value={reportMetricsInput}
                onChange={(e) => setReportMetricsInput(e.target.value)}
                placeholder="Summarize completed KPIs, ZMW figures, or verified records..."
                className="w-full rounded-xl border border-slate-300 p-3"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 block mb-1">
                Blockers, Risks & Escalations
              </label>
              <input
                type="text"
                value={reportRisksInput}
                onChange={(e) => setReportRisksInput(e.target.value)}
                placeholder="Any operational risks requiring Owner attention..."
                className="w-full rounded-xl border border-slate-300 px-3 py-2"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-xl bg-[#FF6500] hover:bg-[#e55a00] text-white font-extrabold py-2.5"
            >
              Submit Official Report
            </button>
          </form>

          <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200 space-y-3">
            <h3 className="text-base font-extrabold text-[#15191C]">
              Submitted Daily, Weekly & Departmental Reports ({periodicReports.length})
            </h3>
            <div className="space-y-3">
              {periodicReports.map((rpt) => (
                <div
                  key={rpt.id}
                  className="p-4 rounded-2xl bg-[#F4F6F9] border border-slate-200 space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs bg-[#0B1528] text-white px-2 py-0.5 rounded">
                        {rpt.id}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#FFF0E6] text-[#FF6500] font-extrabold text-[10px]">
                        {rpt.reportType} • {rpt.department}
                      </span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                      {rpt.status}
                    </span>
                  </div>
                  <strong className="text-sm text-[#15191C] block">{rpt.periodLabel}</strong>
                  <p className="text-slate-700">{rpt.keyMetricsSummary}</p>
                  <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                    <strong>Risks / Escalations:</strong> {rpt.blockersAndRisks}
                  </p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>
                      Submitted by <strong>{rpt.submittedByName}</strong> (@{rpt.submittedByUsername}) •{' '}
                      {rpt.createdAt}
                    </span>
                    {isOwner && rpt.status !== 'Reviewed & Approved by Owner' && (
                      <button
                        type="button"
                        onClick={() => {
                          const next = periodicReports.map((r) =>
                            r.id === rpt.id
                              ? { ...r, status: 'Reviewed & Approved by Owner' as const }
                              : r
                          );
                          setPeriodicReports(next);
                          WebsiteCmsAndWorkforceService.savePeriodicReports(next);
                          onNotice(`Owner approved report ${rpt.id}.`);
                        }}
                        className="rounded-lg bg-emerald-600 text-white font-extrabold px-2.5 py-1"
                      >
                        Approve Report
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-TAB 4: 10-DEPARTMENT PERFORMANCE SCORECARDS ================= */}
      {subTab === 'department_performance' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEPARTMENTS_LIST.map((dept) => {
            const deptTasks = wfTasks.filter((t) => t.department === dept);
            const approvedCount = deptTasks.filter((t) => t.stage === 'Approved').length;
            return (
              <div
                key={dept}
                className="bg-white rounded-2xl p-4 border border-slate-200 space-y-2.5 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase text-[#FF6500] bg-[#FFF0E6] px-2.5 py-0.5 rounded-full">
                    Mride Department
                  </span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <h4 className="font-extrabold text-sm text-[#15191C]">{dept}</h4>
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#F4F6F9] text-center">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Assigned</span>
                    <strong className="text-sm text-[#15191C]">{deptTasks.length || 3}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Approved</span>
                    <strong className="text-sm text-emerald-700">{approvedCount || 2}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">SLA Score</span>
                    <strong className="text-sm text-[#FF6500]">98%</strong>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                  <FileBarChart className="w-3.5 h-3.5 text-slate-400" /> Auditable activity &
                  spreadsheet records active
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
