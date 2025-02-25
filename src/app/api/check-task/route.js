// app/api/check-task/route.js
import Airtable from 'airtable';

// Initialize Airtable with your API key and base ID
const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base('app1LJNvLgSJaHCgU');

// Helper: Generate an 8-character alphanumeric string
function generateRandomKey(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper: Encode the taskId and key using Base64
function encode(taskId, password) {
  const combined = `${taskId}:${password}`;
  return Buffer.from(combined).toString('base64');
}

export async function POST(request) {
  try {
    // Parse request body
    const { email } = await request.json();
    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // STEP 1: Look up the candidate by email
    const candidateRecords = await new Promise((resolve, reject) => {
      base('Candidate')
        .select({
          filterByFormula: `{email} = '${email}'`,
          maxRecords: 1,
        })
        .firstPage((err, records) => {
          if (err) {
            reject(err);
          } else {
            resolve(records);
          }
        });
    });

    if (!candidateRecords || candidateRecords.length === 0) {
      // Candidate not found
      return new Response(
        JSON.stringify({ exists: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Candidate record exists
    const candidateRecord = candidateRecords[0];
    const candidateRecordId = candidateRecord.id;
    const candidateStatus = candidateRecord.get('status');

    // Validate only if status is "registered" or "assigned"
    if (candidateStatus !== 'registered' && candidateStatus !== 'assigned') {
      // For example, if status is "completed" or any other, return exists false.
      return new Response(
        JSON.stringify({ exists: false }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let taskId, key;

    if (candidateStatus === 'registered') {
      // STEP 2a: For a registered candidate, fetch tasks and select one randomly
      const tasks = await new Promise((resolve, reject) => {
        base('Task')
          .select({ view: 'Grid view' })
          .firstPage((err, records) => {
            if (err) {
              reject(err);
            } else {
              resolve(records);
            }
          });
      });

      if (!tasks || tasks.length === 0) {
        return new Response(
          JSON.stringify({ error: 'No tasks available' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }

      const randomIndex = Math.floor(Math.random() * tasks.length);
      const randomTask = tasks[randomIndex];
      taskId = randomTask.get('taskId'); // Assumes your field is named "taskId"
      key = generateRandomKey(8);

      // STEP 3a: Update the candidate record with the new taskId, key and update status to "assigned"
      await new Promise((resolve, reject) => {
        base('Candidate').update(
          [
            {
              id: candidateRecordId,
              fields: {
                taskId: taskId,
                key: key,
                status: 'assigned',
              },
            },
          ],
          (err, records) => {
            if (err) {
              reject(err);
            } else {
              resolve(records);
            }
          }
        );
      });
    } else if (candidateStatus === 'assigned') {
      // STEP 2b: For an assigned candidate, simply fetch the stored taskId and key
      taskId = candidateRecord.get('taskId');
      key = candidateRecord.get('key');
      if (!taskId || !key) {
        return new Response(
          JSON.stringify({ error: 'Assigned candidate missing task details' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // STEP 4: Encode the taskId and key
    const encoded = encode(taskId, key);

    // Return the encoded string and task details
    return new Response(
      JSON.stringify({ 
        exists: true, 
        encoded,
        taskId,
        key
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error(err);
    return new Response(
      JSON.stringify({ error: 'Error processing request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}