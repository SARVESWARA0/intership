import Head from 'next/head';
import { Buffer } from 'buffer';
import { notFound } from 'next/navigation';
import ClientTaskContent from '../../components/ClientTaskContent';
import { getTask } from '../../api/tasks/[taskId]/route'; // Adjust path if needed

// Utility function to decode the encoded string (format: "taskId:password")
function decode(encodedString) {
  const decoded = Buffer.from(encodedString, 'base64').toString();
  const [taskId, password] = decoded.split(':');
  return { taskId, password };
}

// ISR: Revalidate at most once every 60 seconds.
export const revalidate = 60;

// Generates no static paths initially.
export async function generateStaticParams() {
  return [];
}

export default async function TaskPage({ params }) {
  // Await the params object as recommended by Next.js.
  const resolvedParams = await params;
  const { encoded } = resolvedParams;
  let taskId, decodedPassword;

  try {
    ({ taskId, password: decodedPassword } = decode(encoded));
  } catch (err) {
    notFound();
  }

  let task = null;
  try {
    task = await getTask(taskId);
  } catch (err) {
    console.error('Error fetching task:', err);
    notFound();
  }

  if (!task) {
    notFound();
  }

  const password = decodedPassword || 'defaultPassword';

  return (
    <>
      <Head>
        <title>{task.fields.title || 'Task'}</title>
      </Head>
      <ClientTaskContent task={task.fields} taskId={taskId} password={password} />
    </>
  );
}
