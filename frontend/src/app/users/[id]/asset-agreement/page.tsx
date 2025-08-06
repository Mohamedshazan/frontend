'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '@/app/lib/api';

interface Asset {
    id: number;
    asset_type: string;
    brand: string;
    model: string;
    device_name: string;
    os: string;
    serial_number: string;
    location: string;
    assigned_at?: string;
    returned_at?: string;
}

interface UserInfo {
    id: number;
    name: string;
    email: string;
    role: string;
    department?: string | null;
    avatarUrl?: string | null;
}

interface AssetsResponse {
    user: UserInfo;
    assignedAssets: Asset[];
    oldAssets: Asset[];
}

export default function AssetAgreementPage() {
    const { id } = useParams();
    const router = useRouter();

    const [user, setUser] = useState<UserInfo | null>(null);
    const [assignedAssets, setAssignedAssets] = useState<Asset[]>([]);
    const [oldAssets, setOldAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [emailLoading, setEmailLoading] = useState<number | null>(null); // Track which asset is sending

    // Fetch user and asset data from API
    const fetchAssets = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await api.get<AssetsResponse>(`/users/${id}/assets-agreement`);
            setUser(res.data.user);
            setAssignedAssets(res.data.assignedAssets || []);
            setOldAssets(res.data.oldAssets || []);
        } catch (err: any) {
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                router.push('/login');
            } else {
                setError('Failed to load asset data. Please try again.');
                console.error('Error fetching assets:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    // Download PDF for specific asset
    const handleDownloadPDF = async (assetId: number, assetType: string) => {
        try {
            const response = await api.get(`/users/${id}/assets/${assetId}/agreement-pdf`, {
                responseType: 'blob',
            });

            const blob = new Blob([response.data], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = `${assetType}_agreement.pdf`;
            link.click();
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Failed to download PDF.');
        }
    };

    // Send email with PDF attachment
    const handleSendEmail = async (assetId: number) => {
        try {
            setEmailLoading(assetId);
            const res = await api.post(`/users/${id}/assets/${assetId}/send-agreement-email`);
            alert(res.data.message || 'Email sent successfully!');
        } catch (error: any) {
            console.error('Error sending email:', error);
            alert(error.response?.data?.message || 'Failed to send email.');
        } finally {
            setEmailLoading(null);
        }
    };

    // Load assets on page load
    useEffect(() => {
        if (!id) {
            setError('Invalid user ID');
            setLoading(false);
            return;
        }
        fetchAssets();
    }, [id]);

    return (
        <div className="p-6 max-w-6xl mx-auto bg-white text-gray-900 rounded shadow-md">
            <h1 className="text-3xl font-bold mb-6">Asset Agreement for User ID: {id}</h1>

            {loading ? (
                <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-center text-red-500 mb-4">
                    <p>{error}</p>
                    <button
                        onClick={fetchAssets}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    {/* User Info */}
                    {user && (
                        <section className="mb-8 p-4 border rounded bg-gray-50 shadow-sm">
                            <div className="flex items-center space-x-4">
                                {user.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt={user.name}
                                        className="w-16 h-16 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-xl">
                                        {user.name.charAt(0)}
                                    </div>
                                )}
                                <div>
                                    <h2 className="text-2xl font-semibold">{user.name}</h2>
                                    <p className="text-gray-700">{user.email}</p>
                                    <p className="text-gray-600">
                                        Role: <span className="font-medium">{user.role}</span>
                                    </p>
                                    <p className="text-gray-600">
                                        Department: <span className="font-medium">{user.department || '-'}</span>
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Assigned Assets */}
                    <section className="mb-8">
                        <h2 className="text-xl font-semibold mb-4">Assigned Assets</h2>
                        {assignedAssets.length === 0 ? (
                            <p className="text-gray-600">No currently assigned assets.</p>
                        ) : (
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border">#</th>
                                        <th className="p-2 border">Type</th>
                                        <th className="p-2 border">Brand</th>
                                        <th className="p-2 border">Model</th>
                                        <th className="p-2 border">Device Name</th>
                                        <th className="p-2 border">OS</th>
                                        <th className="p-2 border">Serial Number</th>
                                        <th className="p-2 border">Location</th>
                                        <th className="p-2 border">Assigned Date</th>
                                        <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedAssets.map((asset, index) => (
                                        <tr key={asset.id} className="text-center hover:bg-gray-50">
                                            <td className="p-2 border">{index + 1}</td>
                                            <td className="p-2 border">{asset.asset_type}</td>
                                            <td className="p-2 border">{asset.brand}</td>
                                            <td className="p-2 border">{asset.model}</td>
                                            <td className="p-2 border">{asset.device_name}</td>
                                            <td className="p-2 border">{asset.os}</td>
                                            <td className="p-2 border">{asset.serial_number}</td>
                                            <td className="p-2 border">{asset.location}</td>
                                            <td className="p-2 border">
                                                {asset.assigned_at ? new Date(asset.assigned_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-2 border">
                                                <button
                                                    onClick={() => handleDownloadPDF(asset.id, asset.asset_type)}
                                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                >
                                                    PDF
                                                </button>
                                                <button
                                                    onClick={() => handleSendEmail(asset.id)}
                                                    disabled={emailLoading === asset.id}
                                                    className={`ml-2 px-3 py-1 rounded text-white ${emailLoading === asset.id ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                >
                                                    {emailLoading === asset.id ? 'Sending...' : 'Send Email'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>

                    {/* Old Assets */}
                    <section>
                        <h2 className="text-xl font-semibold mb-4">Old Assets (Returned)</h2>
                        {oldAssets.length === 0 ? (
                            <p className="text-gray-600">No old assets found.</p>
                        ) : (
                            <table className="min-w-full border-collapse border border-gray-300 text-sm">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="p-2 border">#</th>
                                        <th className="p-2 border">Type</th>
                                        <th className="p-2 border">Brand</th>
                                        <th className="p-2 border">Model</th>
                                        <th className="p-2 border">Device Name</th>
                                        <th className="p-2 border">OS</th>
                                        <th className="p-2 border">Serial Number</th>
                                        <th className="p-2 border">Location</th>
                                        <th className="p-2 border">Returned Date</th>
                                        <th className="p-2 border">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {oldAssets.map((asset, index) => (
                                        <tr key={asset.id} className="text-center hover:bg-gray-50">
                                            <td className="p-2 border">{index + 1}</td>
                                            <td className="p-2 border">{asset.asset_type}</td>
                                            <td className="p-2 border">{asset.brand}</td>
                                            <td className="p-2 border">{asset.model}</td>
                                            <td className="p-2 border">{asset.device_name}</td>
                                            <td className="p-2 border">{asset.os}</td>
                                            <td className="p-2 border">{asset.serial_number}</td>
                                            <td className="p-2 border">{asset.location}</td>
                                            <td className="p-2 border">
                                                {asset.returned_at ? new Date(asset.returned_at).toLocaleDateString() : '-'}
                                            </td>
                                            <td className="p-2 border">
                                                <button
                                                    onClick={() => handleDownloadPDF(asset.id, asset.asset_type)}
                                                    className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                                >
                                                    PDF
                                                </button>
                                                <button
                                                    onClick={() => handleSendEmail(asset.id)}
                                                    disabled={emailLoading === asset.id}
                                                    className={`ml-2 px-3 py-1 rounded text-white ${emailLoading === asset.id ? 'bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                                                >
                                                    {emailLoading === asset.id ? 'Sending...' : 'Send Email'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </section>
                </>
            )}
        </div>
    );
}
