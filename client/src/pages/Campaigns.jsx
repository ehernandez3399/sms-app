// client/src/pages/Campaigns.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Campaigns() {
  const { businessId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const API_URL = process.env.REACT_APP_API_URL;

  // Fetch all jobs for this business
  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/businesses/${businessId}/jobs`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch campaigns');
        const data = await res.json();
        setJobs(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [API_URL, businessId, token]);

  // Update the send date/time of a single job
  const updateDate = async (jobId, isoString) => {
    try {
      const res = await fetch(
        `${API_URL}/businesses/${businessId}/jobs/${jobId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ schedule: { sendAt: isoString } })
        }
      );
      if (!res.ok) throw new Error('Update failed');
      // Update local state
      setJobs(js =>
        js.map(j =>
          j._id === jobId
            ? { ...j, schedule: { ...j.schedule, sendAt: isoString } }
            : j
        )
      );
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete a campaign
  const deleteJob = async jobId => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) return;
    try {
      const res = await fetch(
        `${API_URL}/businesses/${businessId}/jobs/${jobId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      if (!res.ok) throw new Error('Delete failed');
      setJobs(js => js.filter(j => j._id !== jobId));
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-6">Loading campaigns…</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-4">
      <button
        onClick={() => navigate(-1)}
        className="text-gray-600 hover:text-gray-800"
      >
        ← Back
      </button>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <Link
          to={`/businesses/${businessId}/campaigns/new`}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + New Campaign
        </Link>
      </div>

      {jobs.length === 0 ? (
        <p>No campaigns yet.</p>
      ) : (
        <table className="w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-2 py-1 text-left">Message</th>
              <th className="border px-2 py-1 text-left">Send Date &amp; Time</th>
              <th className="border px-2 py-1 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map(job => {
              // format for <input type="datetime-local">
              const dt = job.schedule?.sendAt
                ? new Date(job.schedule.sendAt).toISOString().slice(0, 16)
                : '';

              return (
                <tr key={job._id}>
                  <td className="border px-2 py-1">{job.message}</td>
                  <td className="border px-2 py-1">
                    <input
                      type="datetime-local"
                      value={dt}
                      onChange={e =>
                        updateDate(
                          job._id,
                          new Date(e.target.value).toISOString()
                        )
                      }
                      className="border px-1 py-0.5 rounded"
                    />
                  </td>
                  <td className="border px-2 py-1 space-x-2">
                    <Link
                      to={`/businesses/${businessId}/campaigns/${job._id}/edit`}
                      className="text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteJob(job._id)}
                      className="text-red-600 hover:underline"
                    >
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
