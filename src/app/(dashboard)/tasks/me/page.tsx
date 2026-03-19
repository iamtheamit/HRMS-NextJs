'use client';

import { useMemo } from 'react';
import { CalendarDays, CheckCircle2, ClipboardList, Timer, TrendingUp } from 'lucide-react';
import { Card } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { useTaskManagement, type TaskPriority, type TaskStatus } from '@/features/task/model/useTaskManagement';
import { RoleGuard } from '@/shared/ui/RoleGuard';

const statusVariant: Record<TaskStatus, 'default' | 'warning' | 'success'> = {
  'To Do': 'default',
  'In Progress': 'warning',
  Completed: 'success',
};

const priorityVariant: Record<TaskPriority, 'soft' | 'warning' | 'danger'> = {
  Low: 'soft',
  Medium: 'soft',
  High: 'warning',
  Critical: 'danger',
};

export default function TasksSelfPage() {
  const {
    tasks,
    stats,
    updateTaskStatus,
    isLoading,
    isUpdating,
  } = useTaskManagement({ mode: 'self' });

  const completionRate = useMemo(() => {
    if (!tasks.length) return 0;
    return Math.round((tasks.filter((task) => task.status === 'Completed').length / tasks.length) * 100);
  }, [tasks]);

  return (
    <RoleGuard allowedRoles={['EMPLOYEE']}>
      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">My Tasks</h2>
          <p className="text-sm text-slate-500">Focus on your assigned work and update progress in real time.</p>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <div className="flex items-center gap-3">
              <ClipboardList className="h-4 w-4 text-slate-600" />
              <div>
                <p className="text-xs text-slate-500">To Do</p>
                <p className="text-xl font-semibold text-slate-900">{stats.todo}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <Timer className="h-4 w-4 text-amber-600" />
              <div>
                <p className="text-xs text-slate-500">In Progress</p>
                <p className="text-xl font-semibold text-slate-900">{stats.inProgress}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <div>
                <p className="text-xs text-slate-500">Completed</p>
                <p className="text-xl font-semibold text-slate-900">{stats.completed}</p>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-4 w-4 text-brand-600" />
              <div>
                <p className="text-xs text-slate-500">Completion</p>
                <p className="text-xl font-semibold text-slate-900">{completionRate}%</p>
              </div>
            </div>
          </Card>
        </section>

        <Card noPadding>
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h3 className="text-sm font-semibold text-slate-900">Assigned Tasks</h3>
            <p className="text-xs text-slate-500">Update status as you complete your work items.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 sm:px-6">Task</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Due Date</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!isLoading && tasks.length === 0 && (
                  <tr>
                    <td className="px-5 py-6 text-sm text-slate-500 sm:px-6" colSpan={5}>No tasks assigned currently.</td>
                  </tr>
                )}
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4 sm:px-6">
                      <p className="font-medium text-slate-900">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500">{task.description}</p>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {task.dueDate}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={priorityVariant[task.priority]}>{task.priority}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[task.status]}>{task.status}</Badge>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex min-w-[16rem] flex-wrap gap-2">
                        {(['To Do', 'In Progress', 'Completed'] as TaskStatus[]).map((status) => (
                          <button
                            key={status}
                            type="button"
                            disabled={isUpdating}
                            onClick={() => void updateTaskStatus(task.id, status)}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition ${task.status === status ? 'bg-brand-50 text-brand-700 ring-brand-200' : 'bg-white text-slate-500 ring-slate-200 hover:bg-slate-50'}`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </RoleGuard>
  );
}
