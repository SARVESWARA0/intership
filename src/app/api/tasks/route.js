import Airtable from 'airtable';
import { NextResponse } from 'next/server';

// Define the helper function locally (do not export it)
async function getTask(taskId) {
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is not configured');
  }
  try {
    const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app1LJNvLgSJaHCgU');
    const tasks = await new Promise((resolve, reject) => {
      base('Task')
        .select({
          filterByFormula: `{taskId} = '${taskId}'`,
          maxRecords: 1,
        })
        .firstPage((err, records) => {
          if (err) {
            console.error('Airtable error:', err);
            reject(err);
          } else {
            resolve(records);
          }
        });
    });
    return tasks.length > 0 ? tasks[0] : null;
  } catch (error) {
    console.error('Airtable fetch error:', error);
    throw error;
  }
}

// Handle POST request (this is the only export)
export async function POST(request) {
  try {
    const { taskId } = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const task = await getTask(taskId);

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    console.log('Task fetched:', task.fields);
    return NextResponse.json({ fields: task.fields });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
