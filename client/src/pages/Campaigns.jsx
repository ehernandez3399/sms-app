// src/pages/Campaigns.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Campaigns() {
  const { businessId, customerId } = useParams();
  const { token } = useAuth();
  const [jobs, setJobs] = useState([]);
  const navigate = useNavigate();

  //  fetch all jobs for this business
  useEffect(() => {
    fetch(
     `http://localhost:5000/customers/${customerId}/jobs?businessId=${businessId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
      .then(res => res.json())
      .then(data => setJobs(data))
      .catch(console.error);
  }, [businessId, token]);

  // update the send date/time
  const updateDate = (jobId, isoString) => {
    fetch(
      `/customers/anyCustomerId/jobs/${jobId}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ schedule: { sendAt: isoString } })
      }
    )
      .then(res => {
        if (!res.ok) throw new Error('Update failed');
        setJobs(jobs.map(j =>
          j._id === jobId
            ? { ...j, schedule: { sendAt: isoString } }
            : j
        ));
      })
      .catch(console.error);
  };

  // delete a campaign
  const deleteJob = jobId => {
    fetch(
      `/customers/anyCustomerId/jobs/${jobId}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      }
    )
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        setJobs(jobs.filter(j => j._id !== jobId));
      })
      .catch(console.error);
  };

  return (
    <div>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h1>Existing Campaigns</h1>

      {jobs.length === 0 && <p>No campaigns yet.</p>}

      {jobs.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Message</th>
              <th>Send Date & Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => {
              const dt = new Date(job.schedule.sendAt)
                .toISOString()
                .slice(0, 16);
              return (
                <tr key={job._id}>
                  <td>{job.message}</td>
                  <td>
                    <input
                      type="datetime-local"
                      value={dt}
                      onChange={e =>
                        updateDate(
                          job._id,
                          new Date(e.target.value).toISOString()
                        )
                      }
                    />
                  </td>
                  <td>
                    <button onClick={() => deleteJob(job._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
