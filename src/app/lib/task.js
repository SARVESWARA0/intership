import Airtable from 'airtable';
import { NextResponse } from 'next/server';

// Fetch task from Airtable
export async function getTask(taskId) {
  

  try {
    console.log('Fetching from Airtable with taskId:', taskId);

    const base = new Airtable({ apiKey:'patMNwpxZNZleZ51R.2e63c3eaedcf9dfa42de31401d823dcdb910d95543ee77e9a20e71dc9e12e2b5' }).base('app1LJNvLgSJaHCgU');

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
   console.log('tasks1:', tasks);
    return tasks;
  } catch (error) {
    console.error('Airtable fetch error:', error);
    throw error;
  }
}

// Handle POST request
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
    
    return NextResponse.json({ task: task.fields });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
