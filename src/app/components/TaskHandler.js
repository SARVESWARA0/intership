// components/TaskHandler.js
'use client';

import { useState, useEffect } from 'react';
import useTaskStore from '@/store/taskStore';
import { useRouter } from 'next/navigation';

export default function TaskHandler({ email }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const assignment = useTaskStore((state) => state.getAssignment(email));
  const setAssignment = useTaskStore((state) => state.setAssignment);

  useEffect(() => {
    const checkAssignment = async () => {
      try {
        setLoading(true);
        
        // If we already have this assignment in the store
        if (assignment && email) {
          console.log('Using cached assignment');
          router.push(`/tasks/${assignment.encoded}`);
          return;
        }
        
        // Otherwise, fetch from API
        const response = await fetch('/api/check-task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email }),
        });
        
        const data = await response.json();
        
        if (data.exists && data.encoded) {
          // Store this for future use
          setAssignment(email, data.taskId || '', data.key || '', data.encoded);
          
          // Redirect to the task page
          router.push(`/tasks/${data.encoded}`);
        } else {
          setError('No task assigned for this email');
        }
      } catch (err) {
        console.error('Error checking task assignment:', err);
        setError('Failed to check task assignment');
      } finally {
        setLoading(false);
      }
    };
    
    if (email) {
      checkAssignment();
    }
  }, [email, assignment, router, setAssignment]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  
  return null; // This component is for logic only, not rendering
}