// store/taskStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useTaskStore = create(
  persist(
    (set, get) => ({
      // Store task assignments by email
      assignments: {},
      
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
      
      // Clear a specific assignment
      clearAssignment: (email) => 
        set((state) => {
          const newAssignments = { ...state.assignments };
          delete newAssignments[email];
          return { assignments: newAssignments };
        }),
      
      // Clear all assignments
      clearAllAssignments: () => set({ assignments: {} }),
    }),
    {
      name: 'task-assignment-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTaskStore;