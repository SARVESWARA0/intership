"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Head from 'next/head';
import useTaskStore from '../app/store/taskStore';

export default function Home() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [alertType, setAlertType] = useState('');
  const router = useRouter();
  
  // Get the store functions.
  const getAssignment = useTaskStore((state) => state.getAssignment);
  const setAssignment = useTaskStore((state) => state.setAssignment);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Checking email...');
    setAlertType('info');

    // Check if the assignment exists in our persisted store.
    const cachedAssignment = getAssignment(email);
    if (cachedAssignment) {
      console.log('Using cached assignment data');
      router.push(`/task/${encodeURIComponent(cachedAssignment.encoded)}`);
      return;
    }
    
    // Otherwise, fetch from API.
    try {
      const res = await fetch('/api/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.exists) {
        // Save the fetched assignment (tasks and encoded string) in Zustand.
        setAssignment(email, data.tasks, data.encoded);
        router.push(`/task/${encodeURIComponent(data.encoded)}`);
      } else {
        setMessage('Email is not registered or already completed.');
        setAlertType('danger');
      }
    } catch (error) {
      console.error(error);
      setMessage('An error occurred. Please try again later.');
      setAlertType('danger');
    }
  };

  return (
    <>
      <Head>
        <title>GenAI Internship Platform</title>
      </Head>
      <div className="bg-light min-vh-100 d-flex align-items-center">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6">
              <div className="card shadow-sm">
                <div className="card-body">
                  <h3 className="card-title text-center">GenAI Internship Platform</h3>
                  <p className="card-text text-center">
                    Enter your email to validate your registration.
                  </p>
                  <form onSubmit={handleSubmit}>
                    <div className="form-group">
                      <label htmlFor="email">Email address</label>
                      <input
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Enter email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">
                      Submit
                    </button>
                  </form>
                  {message && (
                    <div className={`alert alert-${alertType} mt-3`} role="alert">
                      {message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
