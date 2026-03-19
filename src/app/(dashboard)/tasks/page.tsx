'use client';

import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { SearchBar } from '@/shared/ui/SearchBar';
import { TaskAssignmentWizard } from '@/features/task/ui/TaskAssignmentWizard';
import { useTaskManagement, type TaskPriority, type TaskStatus } from '@/features/task/model/useTaskManagement';
import { CalendarDays, CheckCircle2, ClipboardList, Plus, Timer, TrendingUp } from 'lucide-react';
import { RoleGuard } from '@/shared/ui/RoleGuard';
import { routes } from '@/constants/routes';

const statusPills: TaskStatus[] = ['To Do', 'In Progress', 'Completed'];
const priorityPills: TaskPriority[] = ['Low', 'Medium', 'High', 'Critical'];

export default function TasksPage() {
  const {
    tasks,
    stats,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    employees,
    isAssignmentOpen,
    openAssignment,
    closeAssignment,
    assignTask,
    updateTaskStatus,
    canAssignTasks,
    canUpdateTask,
    assignerRole,
    isLoading,
    isAssigning,
    isUpdating,
  } = useTaskManagement({ mode: 'admin' });

  const statCards = [
    { label: 'To Do', value: stats.todo, icon: ClipboardList, bg: 'bg-slate-100', color: 'text-slate-700' },
    { label: 'In Progress', value: stats.inProgress, icon: Timer, bg: 'bg-amber-50', color: 'text-amber-700' },
    { label: 'Completed', value: stats.completed, icon: CheckCircle2, bg: 'bg-emerald-50', color: 'text-emerald-700' },
    { label: 'High Priority', value: stats.highPriority, icon: TrendingUp, bg: 'bg-red-50', color: 'text-red-700' }
  ];

  return (
    <RoleGuard allowedRoles={['SUPER_ADMIN', 'HR_ADMIN', 'MANAGER']} redirectTo={routes.tasksMe}>
      <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Task Assignment</h2>
          <p className="text-sm text-slate-500">Assign tasks within your role scope and track live progress from the backend.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
          <SearchBar
            placeholder="Search by task, assignee, or department"
            className="w-full sm:w-72"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

          {canAssignTasks && (
            <Button onClick={openAssignment}>
              <Plus className="h-4 w-4" />
              Assign Task
            </Button>
          )}
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <div className="flex items-center gap-4">
                <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.bg}`}>
                  <Icon className={`h-5 w-5 ${item.color}`} />
                </div>
                <div>
                  <p className="text-3xl font-semibold text-slate-900">{item.value}</p>
                  <p className="text-sm text-slate-500">{item.label}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </section>

      <Card noPadding>
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Assigned Tasks</h3>
            <p className="text-xs text-slate-500">Track To Do, In Progress, and Completed states with due date and priority.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1">
              <button
                type="button"
                onClick={() => setStatusFilter('All')}
                className={[
                  'rounded-lg px-2.5 py-1 text-xs font-semibold transition',
                  statusFilter === 'All' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                ].join(' ')}
              >
                All
              </button>
              {statusPills.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={[
                    'rounded-lg px-2.5 py-1 text-xs font-semibold transition',
                    statusFilter === status ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'
                  ].join(' ')}
                >
                  {status}
                </button>
              ))}
            </div>
            <select
              value={priorityFilter}
              onChange={(event) => setPriorityFilter(event.target.value as 'All' | TaskPriority)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-700 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            >
              <option value="All">All Priorities</option>
              {priorityPills.map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Task</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Assignee</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Assigned By</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Due Date</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {!isLoading && tasks.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-sm text-slate-500 sm:px-6" colSpan={7}>No tasks found for the current scope.</td>
                </tr>
              )}
              {tasks.map((task) => {
                const canUpdate = canUpdateTask(task);

                return (
                  <tr key={task.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 sm:px-6">
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-sm text-slate-700">{task.assignedToName}</p>
                      <p className="text-xs text-slate-500">{task.assignedToDepartment}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{task.assignedByRole}</td>
                    <td className="px-4 py-4">
                      <div className="inline-flex items-center gap-1.5 text-slate-600">
                        <CalendarDays className="h-3.5 w-3.5" />
                        <span>{task.dueDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={task.priority === 'Critical' ? 'danger' : task.priority === 'High' ? 'warning' : 'soft'}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={task.status === 'Completed' ? 'success' : task.status === 'In Progress' ? 'warning' : 'default'}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-[18rem] flex-wrap gap-2">
                        {statusPills.map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={!canUpdate || isUpdating}
                            onClick={() => void updateTaskStatus(task.id, status)}
                            className={[
                              'rounded-full px-2.5 py-1 text-xs font-semibold transition ring-1',
                              task.status === status
                                ? 'bg-brand-50 text-brand-700 ring-brand-200'
                                : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50',
                              !canUpdate && 'cursor-not-allowed opacity-40'
                            ].filter(Boolean).join(' ')}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <TaskAssignmentWizard
        open={isAssignmentOpen}
        employees={employees}
        assignedByRole={assignerRole}
        isSubmitting={isAssigning}
        onClose={closeAssignment}
        onSubmit={async (form) => {
          await assignTask(form);
        }}
      />
      </div>
    </RoleGuard>
  );
}
