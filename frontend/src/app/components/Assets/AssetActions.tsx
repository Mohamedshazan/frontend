// File: components/Assets/AssetActions.tsx

import React from 'react';
import { CSVLink } from 'react-csv';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Asset, User, Filters } from './types';

type Props = {
  assets: Asset[];
  users: User[];
  filters: Filters;
};

export default function AssetActions({ assets, users, filters }: Props) {
  const exportPDF = () => {
    if (!window.confirm('Do you want to export the current asset list as a PDF?')) return;

    const doc = new jsPDF();

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString();

    const allFilters = [
      ['Status', filters.status],
      ['Asset Type', filters.asset_type],
      ['Department ID', filters.department_id],
      [
        'User',
        filters.user_id
          ? users.find(u => u.id.toString() === filters.user_id)?.name || filters.user_id
          : '',
      ],
      ['Start Date', filters.start_date],
      ['End Date', filters.end_date],
    ];

    const activeFilters = allFilters.filter(([, value]) => value && value !== '');
    const hasFilters = activeFilters.length > 0;
    const reportTitle = hasFilters ? 'Filtered Assets List' : 'All Assets List';

    doc.setFontSize(10);
    doc.text(`Exported on: ${formattedDate}`, 14, 10);

    doc.setFontSize(14);
    doc.text(reportTitle, 14, 20);

    let nextY = 30;

    if (hasFilters) {
      autoTable(doc, {
        startY: nextY,
        head: [['Filter', 'Value']],
        body: activeFilters,
      });
      nextY = (doc as any).lastAutoTable.finalY + 10;
    }

    const assetRows = assets.map(a => [
      a.id,
      a.device_name ?? '',
      a.brand ?? '',
      a.model ?? '',
      a.asset_type ?? '',
      a.status ?? '',
      a.location ?? '',
      a.department?.name || '—',
      a.user?.name || 'Unassigned',
    ]);

    autoTable(doc, {
      startY: nextY,
      head: [['ID', 'Device', 'Brand', 'Model', 'Type', 'Status', 'Location', 'Department', ' Users']],
      body: assetRows,
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setFontSize(12);
    doc.text(`Total Assets Exported: ${assets.length}`, 14, finalY);

    doc.save('assets_report.pdf');
  };

  return (
    <div className="flex justify-end space-x-4 mb-4">
      <CSVLink
        data={assets.map(a => ({
          ID: a.id,
          Device: a.device_name,
          Brand: a.brand,
          Model: a.model,
          Type: a.asset_type,
          Status: a.status,
          Location: a.location,
          Department: a.department?.name || '—',
          AssignedUser: a.user?.name || 'Unassigned',
        }))}
        filename="assets_report.csv"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Export CSV
      </CSVLink>

      <button
        onClick={exportPDF}
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        Export PDF
      </button>
    </div>
  );
}
