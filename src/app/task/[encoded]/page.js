"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Head from 'next/head';
import ClientTaskContent from '../../components/ClientTaskContent';
import useTaskStore from '../../store/taskStore';
import { getTask } from '@/app/lib/task';
import { Buffer } from 'buffer';

// Robust decode function: expects a base64 string in the format "taskId:password"
function decode(encodedString) {
  const decoded = Buffer.from(encodedString, 'base64').toString();
  const [taskId, password = ""] = decoded.split(':');
  const trimmedPassword = password ? password.slice(0, -1) : "";
  return { taskId, password: trimmedPassword };
}

export default function TaskPage() {
  const router = useRouter();
  const { encoded } = useParams();
  const assignments = useTaskStore((state) => state.assignments);
  
  const [tasks, setTasks] = useState(null);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Ref to ensure fallback fetch runs only once.
  const didFetchRef = useRef(false);
  // Ref to mark that we successfully loaded cached data.
  const hasLoadedCacheRef = useRef(false);

  useEffect(() => {
    if (!encoded) return;
    // If tasks are already set, skip further processing.
    if (tasks !== null) return;
    
    // Decode the URL parameter.
    const encodedDecoded = decodeURIComponent(encoded);
    
    // Check for a cached assignment in the store.
    let foundAssignment = null;
    for (const email in assignments) {
      if (assignments[email].encoded === encodedDecoded) {
        foundAssignment = assignments[email];
        break;
      }
    }
    
    if (foundAssignment && foundAssignment.tasks) {
      console.log("Using cached assignment data");
      hasLoadedCacheRef.current = true;
      setTasks(foundAssignment.tasks);
      try {
        const { password: cachedPassword } = decode(encodedDecoded);
        setPassword(cachedPassword);
      } catch (error) {
        setPassword('');
      }
      setLoading(false);
      return; // Exit effect – do not fetch fallback.
    }
    
    // If we already loaded cache, skip fetching.
    if (hasLoadedCacheRef.current) return;
    
    // Fallback: If no cached assignment was found, fetch only once.
    if (didFetchRef.current) return;
    didFetchRef.current = true;
    
    let decodedValues;
    try {
      decodedValues = decode(encodedDecoded);
    } catch (error) {
      console.error("Decoding error:", error);
      router.push('/');
      return;
    }
    const { taskId, password: decodedPassword } = decodedValues;
    setPassword(decodedPassword);
    
    async function loadTask() {
      try {
        const taskRecords = await getTask(taskId);
        if (!taskRecords || taskRecords.length === 0) {
          console.error('Task not found');
          router.push('/');
          return;
        }
        // Use the first record's fields and wrap it in an array.
        const taskData = taskRecords[0].fields;
        setTasks([taskData]);
      } catch (err) {
        console.error("Error fetching task:", err);
        router.push('/');
        return;
      }
      setLoading(false);
    }
    loadTask();
  }, [encoded, assignments, router, tasks]);

  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <>
      <Head>
        <title>Task Page</title>
      </Head>
      <ClientTaskContent tasks={tasks} password={password} />
    </>
  );
}
