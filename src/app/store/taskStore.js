// store/taskStore.js
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

const useTaskStore = create(
  persist(
    (set, get) => ({
      // Store assignments by email.
      // Each assignment holds { tasks, encoded, timestamp }.
      assignments: {},
      
      // Save assignment data for an email.
      setAssignment: (email, tasks, encoded) => 
        set((state) => ({
          assignments: {
            ...state.assignments,
            [email]: { tasks, encoded, timestamp: Date.now() }
          }
        })),
      
      // Retrieve assignment for an email.
      getAssignment: (email) => {
        const state = get();
        return state.assignments[email] || null;
      },
      
      clearAssignment: (email) =>
        set((state) => {
          const newAssignments = { ...state.assignments };
          delete newAssignments[email];
          return { assignments: newAssignments };
        }),
      
      clearAllAssignments: () => set({ assignments: {} }),
    }),
    {
      name: 'task-assignment-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTaskStore;
