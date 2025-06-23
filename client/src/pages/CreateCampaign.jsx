// src/pages/CreateCampaign.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const JOB_TYPES = [
  { value: 'one-time-event', label: 'One-Time' },
  { value: 'daily-recurring', label: 'Daily Recurring' },
  { value: 'weekly-recurring', label: 'Weekly Recurring' },
  { value: 'biweekly-recurring', label: 'Bi-Weekly Recurring' },
  { value: 'monthly-recurring', label: 'Monthly Recurring' },
  { value: 'tag-based-broadcast', label: 'Tag-Based Broadcast' },
  { value: 'date-anniversary', label: 'Date Anniversary' },
  { value: 'inactivity-followup', label: 'Inactivity Follow-Up' },
  { value: 'first-time-welcome', label: 'First-Time Welcome' }
];

export default function CreateCampaign() {
  const { businessId } = useParams();
  const { token } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [allSelected, setAllSelected] = useState(true);
  const [selected, setSelected] = useState([]);

  const [type, setType] = useState('one-time-event');
  const [message, setMessage] = useState('');
  const [schedule, setSchedule] = useState({
    sendAt: '',
    repeatEvery: '',
    repeatOn: '',
    inactiveForDays: '',
    tag: ''
  });

  // Fetch customers on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_API_URL}/businesses/${businessId}/customers`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to load customers');
        const data = await res.json();
        setCustomers(data);
        setSelected(data.map(c => c._id)); // default to all
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [businessId, token]);

  const toggleAll = () => {
    if (allSelected) {
      setSelected([]);
    } else {
      setSelected(customers.map(c => c._id));
    }
    setAllSelected(!allSelected);
  };

  const toggleSelect = id => {
    setSelected(sel =>
      sel.includes(id) ? sel.filter(x => x !== id) : [...sel, id]
    );
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!selected.length) {
      setError('Please select at least one customer or “All”.');
      return;
    }
    setError('');
    // Build schedule part
    const sched = {};
    if (['one-time-event'].includes(type)) {
      sched.sendAt = schedule.sendAt;
    }
    if (['daily-recurring','weekly-recurring','biweekly-recurring','monthly-recurring'].includes(type)) {
      sched.sendAt = schedule.sendAt;
      sched.repeatEvery = schedule.repeatEvery;
      if (type === 'weekly-recurring') {
        sched.repeatOn = schedule.repeatOn.split(',').map(s => s.trim());
      }
    }
    if (type === 'tag-based-broadcast') {
      sched.sendAt = schedule.sendAt;
      sched.tag = schedule.tag;
    }
    if (type === 'inactivity-followup') {
      sched.inactiveForDays = Number(schedule.inactiveForDays);
    }
    // date-anniversary and first-time-welcome need no schedule props

    try {
      for (const custId of selected) {
        await fetch(
          `${process.env.REACT_APP_API_URL}/customers/${custId}/jobs`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              customerId: custId,
              businessId,
              type,
              message,
              schedule: sched
            })
          }
        );
      }
      navigate(`/businesses/${businessId}/jobs`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="p-6">Loading customers…</div>;
  if (error)   return <div className="p-6 text-red-600">Error: {error}</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New SMS Campaign</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Job Type */}
        <label className="block">
          <span>Type</span>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          >
            {JOB_TYPES.map(j => (
              <option key={j.value} value={j.value}>{j.label}</option>
            ))}
          </select>
        </label>

        {/* Message */}
        <label className="block">
          <span>Message</span>
          <textarea
            required
            rows={4}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full border p-2 rounded mt-1"
          />
        </label>

        {/* Schedule Fields */}
        {(type === 'one-time-event' ||
          type.startsWith('daily') ||
          type.startsWith('weekly') ||
          type.startsWith('biweekly') ||
          type.startsWith('monthly') ||
          type === 'tag-based-broadcast') && (
          <label className="block">
            <span>Send At</span>
            <input
              type="datetime-local"
              required
              value={schedule.sendAt}
              onChange={e =>
                setSchedule(s => ({ ...s, sendAt: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </label>
        )}

        {['daily-recurring','weekly-recurring','biweekly-recurring','monthly-recurring'].includes(type) && (
          <label className="block">
            <span>Repeat Every</span>
            <input
              placeholder="e.g. 1 day, 1 week, 2 weeks, 1 month"
              required
              value={schedule.repeatEvery}
              onChange={e =>
                setSchedule(s => ({ ...s, repeatEvery: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </label>
        )}

        {type === 'weekly-recurring' && (
          <label className="block">
            <span>Repeat On (comma-separated weekdays)</span>
            <input
              placeholder="Monday,Friday"
              value={schedule.repeatOn}
              onChange={e =>
                setSchedule(s => ({ ...s, repeatOn: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </label>
        )}

        {type === 'tag-based-broadcast' && (
          <label className="block">
            <span>Tag</span>
            <input
              placeholder="e.g. vip,new-user"
              required
              value={schedule.tag}
              onChange={e =>
                setSchedule(s => ({ ...s, tag: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </label>
        )}

        {type === 'inactivity-followup' && (
          <label className="block">
            <span>Inactive For Days</span>
            <input
              type="number"
              placeholder="30"
              required
              value={schedule.inactiveForDays}
              onChange={e =>
                setSchedule(s => ({ ...s, inactiveForDays: e.target.value }))
              }
              className="w-full border p-2 rounded mt-1"
            />
          </label>
        )}

        {/* Customer Selection */}
        <div className="space-x-2">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              className="mr-2"
            />
            Send to All Customers
          </label>
        </div>

        {!allSelected && (
          <div className="grid grid-cols-2 gap-2 max-h-64 overflow-auto border p-2 rounded">
            {customers.map(c => (
              <label
                key={c._id}
                className="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(c._id)}
                  onChange={() => toggleSelect(c._id)}
                />
                <span>
                  {c.firstName} {c.lastName} (
                  {c.phoneNumber || c.email})
                </span>
              </label>
            ))}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="mt-4 w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
        >
          Create Campaign
        </button>
      </form>
    </div>
  );
}
