import Head from 'next/head';
import { Buffer } from 'buffer';
import { notFound } from 'next/navigation';
import ClientTaskContent from '../../components/ClientTaskContent';
import { getTask } from '@/app/lib/task';  // Import from your lib folder

// Utility function to decode the encoded string (format: "taskId:password")
function decode(encodedString) {
  const decoded = Buffer.from(encodedString, 'base64').toString();
  const [taskId, password] = decoded.split(':');
  const trimmedPassword = password.slice(0, -1); // Remove last character
  
  return { taskId, password: trimmedPassword };
}


export const revalidate = 43200;

// Generates no static paths initially.
export async function generateStaticParams() {
  return [];
}

export default async function TaskPage({ params }) {
  const resolvedParams = await params;
  const { encoded } = resolvedParams;
  let taskId, decodedPassword;

  try {
    ({ taskId, password: decodedPassword } = decode(encoded));
  } catch {
    notFound();
  }

  // Fetch task using the local function
  let taskRecord = null;
  try {
    taskRecord = await getTask(taskId);
  } catch (err) {
    console.error('Error fetching task:', err);
    notFound();
  }

  if (!taskRecord) {
    notFound();
  }

  // Extract only the plain data (fields)
  const task = taskRecord.fields;
  
  const password = decodedPassword || 'defaultPassword';

  return (
    <>
      <Head>
        <title>{task.title || 'Task'}</title>
      </Head>
      <ClientTaskContent task={task} taskId={taskId} password={password} />
    </>
  );
}
