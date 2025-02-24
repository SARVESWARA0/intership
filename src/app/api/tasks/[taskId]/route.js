import Airtable from 'airtable';
import { NextResponse } from 'next/server';

// Helper: Fetch task from Airtable using the taskId
export async function getTask(taskId) {
  if (!process.env.AIRTABLE_API_KEY) {
    throw new Error('AIRTABLE_API_KEY is not configured');
  }

  try {
    console.log('Fetching from Airtable with taskId:', taskId);
    
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
            console.log('Airtable response:', records);
            resolve(records);
          }
        });
    });

    if (!tasks || tasks.length === 0) {
      console.log('No task found with ID:', taskId);
      return null;
    }

    return tasks[0];
  } catch (error) {
    console.error('Airtable fetch error:', error);
    throw error;
  }
}

export async function GET(request, { params }) {
  try {
    console.log('API route called with params:', params);

    if (!params.taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const task = await getTask(params.taskId);
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    console.log('Returning task:', task.fields);
    return NextResponse.json({ task: task.fields });
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}