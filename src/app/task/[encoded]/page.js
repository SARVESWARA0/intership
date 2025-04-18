'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Buffer } from 'buffer';

import ClientTaskContent from '../../components/ClientTaskContent';
import useTaskStore from '@/app/store/taskStore';

// Utility function to decode the encoded string (format: "taskId:password")
function decode(encodedString) {
  try {
    const decoded = Buffer.from(encodedString, 'base64').toString();
    const [taskId, password] = decoded.split(':');
    const trimmedPassword = password?.slice(0, -1) || 'defaultPassword'; // Remove last character, provide default

    return { taskId, password: trimmedPassword };
  } catch (error) {
    console.error('Failed to decode:', error);
    return { taskId: null, password: 'defaultPassword' };
  }
}

export default function TaskPage() {
  const params = useParams();
  const router = useRouter();
  const { encoded } = params || {};
  const [isLoading, setIsLoading] = useState(true);
  const [taskData, setTaskData] = useState(null);
  const [error, setError] = useState(null);

  // Retrieve login flag and task functions from Zustand store
  const { isLoggedIn, getTask, setTask,tasks, hasValidTask, getAssignment, setAssignment } = useTaskStore();

  // Use useLayoutEffect to check if the user is logged in.
  // If not, immediately redirect to the login page.
  useEffect(() => {
    if (!isLoggedIn && Object.keys(tasks).length>0) {
      router.push('/');
    }
  }, [isLoggedIn,router,tasks]);

  useEffect(() => {
    let isMounted = true;

    async function loadTask() {
      if (!encoded) {
        setIsLoading(false);
        setError('No task identifier provided');
        return;
      }

      setIsLoading(true);

      try {
        // Decode the URL parameter
        const { taskId, password: decodedPassword } = decode(encoded);

        if (!taskId) {
          throw new Error('Invalid task identifier');
        }

        // For demo purposes we'll use a dummy email
        const dummyEmail = 'user@example.com';
        const cachedAssignment = getAssignment(dummyEmail);

        if (cachedAssignment && cachedAssignment.taskId === taskId) {
          console.log('Using cached assignment data');
        }

        // Check if we already have this task in store and it's not stale
        let task = null;

        if (hasValidTask(taskId)) {
          // Use cached task data
          task = getTask(taskId);
          console.log('Using cached task data');

          if (isMounted) {
            setTaskData({
              task,
              taskId,
              password: decodedPassword
            });
            setIsLoading(false);
          }
        } else {
          // Only fetch from API if not in store
          console.log('Fetching task from API');
          const res = await fetch('/api/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId })
          });

          if (!res.ok) {
            throw new Error(`Failed to fetch task: ${res.status}`);
          }

          const data = await res.json();

          task = data.fields || data.task?.fields || data;

          if (!task) {
            throw new Error('Invalid task data structure received from API');
          }

          // Store the fetched task in our store for future use
          setTask(taskId, task);

          // Store the assignment for this user
          setAssignment(dummyEmail, taskId, 'someKey', encoded);

          if (isMounted) {
            setTaskData({
              task,
              taskId,
              password: decodedPassword
            });
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error('Error loading task:', err);
        if (isMounted) {
          setError(err.message);
          setIsLoading(false);
        }
      }
    }

    loadTask();

    return () => {
      isMounted = false;
    };
  }, [encoded, getTask, setTask, hasValidTask, getAssignment, setAssignment]);

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  if (isLoading) {
    return <div className="text-center p-5">Loading task...</div>;
  }

  if (!taskData || !taskData.task) {
    console.error('Task data missing:', taskData);
    return (
      <div className="text-center p-5">
        <h1>Task Not Found</h1>
        <p>We couldn&apos;t find the requested task. Please check the URL and try again.</p>
      </div>
    );
  }

  return (
    <ClientTaskContent 
      task={taskData.task} 
      taskId={taskData.taskId} 
      password={taskData.password || 'defaultPassword'} 
    />
  );
}
