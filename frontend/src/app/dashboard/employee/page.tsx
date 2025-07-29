'use client';

import { useEffect, useState } from 'react';
import axios from '@/app/lib/api';

export default function EmployeeDashboard() {
  const [assignedAssets, setAssignedAssets] = useState<any[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [supportRequests, setSupportRequests] = useState<any[]>([]);
  const [subject, setSubject] = useState('');
  const [issue, setIssue] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const fetchDashboard = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await axios.get('/dashboard/employee', {
        headers: { Authorization: `Bearer ${token}` },
      });

      setAssignedAssets(res.data.assignedAssets || []);
      setSupportRequests(res.data.supportRequests || []);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setLoadError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboard();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post(
        '/support-requests',
        {
          subject,
          issue,
          priority,
          asset_id: selectedAssetId,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccessMsg('Support request submitted successfully!');
      setErrorMsg('');
      setSubject('');
      setIssue('');
      setPriority('Medium');
      fetchDashboard();
    } catch (error) {
      console.error(error);
      setSuccessMsg('');
      setErrorMsg('Failed to submit support request.');
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-8 animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/3" />
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-100 h-40 rounded shadow" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6">
        <p className="text-red-600 font-semibold">{loadError}</p>
        <button
          onClick={fetchDashboard}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">💼 Employee Dashboard</h1>
        <button
          onClick={fetchDashboard}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
        >
          🔄 Refresh
        </button>
      </div>

      {/* Assigned Assets */}
        {/* Assigned Assets */}
      <div className="bg-white p-6 rounded shadow border border-gray-400">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">🖥️ Assigned Assets</h2>

        {assignedAssets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignedAssets.map((asset) => (
              <div
                key={asset.id}
                className="border border-gray-300 rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition duration-150"
              >
                <ul className="text-sm text-gray-700 space-y-1">
                  {asset.asset_type && (
                    <li>
                      <strong>Asset Type:</strong> {asset.asset_type}
                    </li>
                  )}
                  {asset.serial_number && (
                    <li>
                      <strong>Serial #:</strong> {asset.serial_number}
                    </li>
                  )}
                  <li>
                    <strong>Model:</strong> {asset.model || 'N/A'}
                  </li>
                  {asset.created_at && (
                    <li>
                      <strong>Assigned On:</strong>{' '}
                      {new Date(asset.created_at).toLocaleDateString()}
                    </li>
                  )}
                </ul>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 mt-2">No assets assigned.</p>
        )}
      </div>


      {/* Support Request Form */}
      <div className="bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">🛠️ Send a Support Request</h2>

        {assignedAssets.length > 0 ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Linked Asset</label>
              <select
                value={selectedAssetId}
                onChange={(e) => setSelectedAssetId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">-- Select an asset --</option>
                {assignedAssets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.device_name} ({asset.model})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
              <textarea
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={4}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Submit Request
            </button>

            {successMsg && <p className="text-green-600 mt-2">{successMsg}</p>}
            {errorMsg && <p className="text-red-600 mt-2">{errorMsg}</p>}
          </form>
        ) : (
          <p className="text-gray-500">No assets assigned.</p>
        )}
      </div>

      {/* My Support Requests */}
      <div className="bg-white p-6 rounded shadow border border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">📋 My Support Requests</h2>

        {supportRequests.length > 0 ? (
          <ul className="space-y-6">
            {supportRequests.map((req: any) => (
              <li
                key={req.id}
                className="border-l-4 border-blue-500 bg-gray-50 p-4 rounded shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="mb-1">
                  <span className="text-sm font-semibold text-gray-600">Subject:</span>{' '}
                  <span className="text-gray-900 font-medium">{req.subject}</span>
                </div>
                <div className="mb-1">
                  <span className="text-sm font-semibold text-gray-600">Priority:</span>{' '}
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-sm font-semibold ${req.priority === 'Critical'
                        ? 'bg-red-100 text-red-800'
                        : req.priority === 'High'
                          ? 'bg-orange-100 text-orange-800'
                          : req.priority === 'Medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                      }`}
                  >
                    {req.priority}
                  </span>
                </div>
                <div className="mb-1">
                  <span className="text-sm font-semibold text-gray-600">Status:</span>{' '}
                  <span className="capitalize text-gray-800 font-medium">{req.status}</span>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600">Submitted:</span>{' '}
                  <span className="text-gray-700 text-sm">{new Date(req.created_at).toLocaleString()}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">You have not submitted any support requests yet.</p>
        )}
      </div>
    </div>
  );

}
