import { create } from 'zustand';
import type { OrchestratedTask, SubTask, Department } from '../types/index';

interface OrchestratorStore {
  orchestrations: OrchestratedTask[];
  
  // CRUD Operations
  addOrchestration: (task: OrchestratedTask) => void;
  updateOrchestration: (id: string, updates: Partial<OrchestratedTask>) => void;
  deleteOrchestration: (id: string) => void;
  getOrchestration: (id: string) => OrchestratedTask | undefined;
  
  // Sub-Task Management
  addSubTask: (orchestration_id: string, subTask: SubTask) => void;
  updateSubTask: (orchestration_id: string, subTaskId: string, updates: Partial<SubTask>) => void;
  getSubTasks: (orchestration_id: string) => SubTask[];
  completeSubTask: (orchestration_id: string, subTaskId: string, output: string) => void;
  
  // Orchestration Lifecycle
  startOrchestration: (id: string, orchestrator_id: string, orchestrator_name: string) => void;
  finishOrchestration: (id: string, aggregated_result: string) => void;
  failOrchestration: (id: string, reason: string) => void;
  
  // Progress Tracking
  updateProgress: (id: string) => void;
  getProgress: (id: string) => number;
  
  // Querying
  getPendingOrchestrations: () => OrchestratedTask[];
  getActiveOrchestrations: () => OrchestratedTask[];
  getCompletedOrchestrations: () => OrchestratedTask[];
}

export const useOrchestratorStore = create<OrchestratorStore>((set, get) => ({
  orchestrations: [],

  // ===== CRUD =====
  addOrchestration: (task) =>
    set((state) => ({
      orchestrations: [...state.orchestrations, task],
    })),

  updateOrchestration: (id, updates) =>
    set((state) => ({
      orchestrations: state.orchestrations.map((t) =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t
      ),
    })),

  deleteOrchestration: (id) =>
    set((state) => ({
      orchestrations: state.orchestrations.filter((t) => t.id !== id),
    })),

  getOrchestration: (id) => get().orchestrations.find((t) => t.id === id),

  // ===== SUB-TASK MANAGEMENT =====
  addSubTask: (orchestration_id, subTask) =>
    set((state) => ({
      orchestrations: state.orchestrations.map((t) =>
        t.id === orchestration_id
          ? { ...t, sub_tasks: [...t.sub_tasks, subTask] }
          : t
      ),
    })),

  updateSubTask: (orchestration_id, subTaskId, updates) =>
    set((state) => ({
      orchestrations: state.orchestrations.map((t) =>
        t.id === orchestration_id
          ? {
              ...t,
              sub_tasks: t.sub_tasks.map((st) =>
                st.id === subTaskId ? { ...st, ...updates } : st
              ),
            }
          : t
      ),
    })),

  getSubTasks: (orchestration_id) =>
    get().orchestrations.find((t) => t.id === orchestration_id)?.sub_tasks || [],

  completeSubTask: (orchestration_id, subTaskId, output) => {
    set((state) => ({
      orchestrations: state.orchestrations.map((t) =>
        t.id === orchestration_id
          ? {
              ...t,
              sub_tasks: t.sub_tasks.map((st) =>
                st.id === subTaskId
                  ? {
                      ...st,
                      status: 'done',
                      actual_output: output,
                      output_at: new Date().toISOString(),
                    }
                  : st
              ),
            }
          : t
      ),
    }));
    get().updateProgress(orchestration_id);
  },

  // ===== ORCHESTRATION LIFECYCLE =====
  startOrchestration: (id, orchestrator_id, orchestrator_name) =>
    set((state) => ({
      orchestrations: state.orchestrations.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'planning',
              orchestrator_id,
              orchestrator_name,
              updated_at: new Date().toISOString(),
            }
          : t
      ),
    })),

  finishOrchestration: (id, aggregated_result) =>
    set((state) => ({
      orchestrations: state.orchestrations.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'completed',
              aggregated_result,
              completed_at: new Date().toISOString(),
              progress: 100,
              updated_at: new Date().toISOString(),
            }
          : t
      ),
    })),

  failOrchestration: (id, reason) =>
    set((state) => ({
      orchestrations: state.orchestrations.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'failed',
              aggregated_result: `❌ Orchestration başarısız: ${reason}`,
              completed_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          : t
      ),
    })),

  // ===== PROGRESS TRACKING =====
  updateProgress: (id) =>
    set((state) => ({
      orchestrations: state.orchestrations.map((t) => {
        if (t.id !== id) return t;

        const subTasks = t.sub_tasks;
        if (subTasks.length === 0) return t;

        const completedCount = subTasks.filter((st) => st.status === 'done').length;
        const runningCount = subTasks.filter((st) => st.status === 'running').length;

        let newProgress = (completedCount / subTasks.length) * 100;

        // Partial credit for running tasks
        if (runningCount > 0) {
          const avgRunningProgress = subTasks
            .filter((st) => st.status === 'running')
            .reduce((sum, st) => sum + st.progress, 0) / runningCount;
          newProgress += (runningCount / subTasks.length) * (avgRunningProgress / 100) * 100;
        }

        return {
          ...t,
          progress: Math.min(Math.round(newProgress), 99), // Cap at 99 until fully done
          updated_at: new Date().toISOString(),
        };
      }),
    })),

  getProgress: (id) => {
    const task = get().orchestrations.find((t) => t.id === id);
    return task?.progress || 0;
  },

  // ===== QUERYING =====
  getPendingOrchestrations: () =>
    get().orchestrations.filter((t) => t.status === 'awaiting'),

  getActiveOrchestrations: () =>
    get().orchestrations.filter((t) => ['planning', 'executing', 'aggregating'].includes(t.status)),

  getCompletedOrchestrations: () =>
    get().orchestrations.filter((t) => ['completed', 'failed'].includes(t.status)),
}));
