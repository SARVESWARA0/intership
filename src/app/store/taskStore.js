// store/taskStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useTaskStore = create(
  persist(
    (set, get) => ({
      // Store task assignments by email
      assignments: {},
      
      // Store full task data by taskId
      tasks: {},
      
      // Store task progress by taskId
      taskProgress: {},
      
      // Add or update an assignment
      setAssignment: (email, taskId, key, encoded) => 
        set((state) => ({
          assignments: {
            ...state.assignments,
            [email]: { taskId, key, encoded, timestamp: Date.now() }
          }
        })),
      
      // Get assignment by email
      getAssignment: (email) => {
        const state = get();
        return state.assignments[email] || null;
      },
      
      // Store full task data
      setTask: (taskId, taskData) => 
        set((state) => ({
          tasks: {
            ...state.tasks,
            [taskId]: { data: taskData, timestamp: Date.now() }
          }
        })),
      
      // Get task by taskId
      getTask: (taskId) => {
        const state = get();
        return state.tasks[taskId]?.data || null;
      },
      
      // Set progress for a task
      setTaskProgress: (taskId, progress) => 
        set((state) => ({
          taskProgress: {
            ...state.taskProgress,
            [taskId]: progress
          }
        })),
      
      // Get progress for a task
      getTaskProgress: (taskId) => {
        const state = get();
        return state.taskProgress[taskId] || 0;
      },
      
      // Check if task exists and is not stale (optional: add expiry logic)
      hasValidTask: (taskId, maxAge = 86400000) => { // Default: 24 hours
        const state = get();
        const taskEntry = state.tasks[taskId];
        if (!taskEntry) return false;
        
        // Check if task is stale
        const now = Date.now();
        return (now - taskEntry.timestamp) < maxAge;
      },
      
      // Clear a specific assignment
      clearAssignment: (email) => 
        set((state) => {
          const newAssignments = { ...state.assignments };
          delete newAssignments[email];
          return { assignments: newAssignments };
        }),
      
      // Clear a specific task
      clearTask: (taskId) => 
        set((state) => {
          const newTasks = { ...state.tasks };
          delete newTasks[taskId];
          return { tasks: newTasks };
        }),
      
      // Clear progress for a specific task
      clearTaskProgress: (taskId) => 
        set((state) => {
          const newTaskProgress = { ...state.taskProgress };
          delete newTaskProgress[taskId];
          return { taskProgress: newTaskProgress };
        }),
      
      // Clear all assignments
      clearAllAssignments: () => set({ assignments: {} }),
      
      // Clear all tasks
      clearAllTasks: () => set({ tasks: {} }),
      
      // Clear all task progress
      clearAllTaskProgress: () => set({ taskProgress: {} }),
      
      // Clear everything
      clearAll: () => set({ assignments: {}, tasks: {}, taskProgress: {} }),
    }),
    {
      name: 'task-assignment-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTaskStore;