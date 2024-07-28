// src/components/Dashboard.js

import React, { useState, useEffect } from 'react';
import supabase from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import '../assets/styles/Dashboard.css';
import DashboardPassword from './DashboardPassword';

export default function Dashboard() {
  const [isDownloading, setIsDownloading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState([]);
  const [isVerified, setIsVerified] = useState(false); // State to track password verification
  const navigate = useNavigate();

  useEffect(() => {
    if (isVerified) {
      const fetchData = async () => {
        let query = supabase
          .from('attendance_new')
          .select('*');

        const { data, error } = await query.order('timestamp', { ascending: true });

        if (error) {
          console.error('Error fetching data:', error.message);
          console.error('Error details:', error);
        } else {
          setData(data);
        }
      };

      fetchData();
    }
  }, [isVerified]);

  const downloadCSV = async () => {
    if (!startDate || !endDate) {
      alert('Please select a start date and an end date before downloading.');
      return;
    }

    setIsDownloading(true);
    try {
      let query = supabase
        .from('attendance_new')
        .select('*')
        .gte('timestamp', `${startDate}T00:00:00`)
        .lte('timestamp', `${endDate}T23:59:59`);

      const { data, error } = await query.order('timestamp', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        const headers = Object.keys(data[0]).join(',');
        const csvData = data.map(row =>
          Object.values(row).map(value =>
            typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
          ).join(',')
        );
        const csvContent = [headers, ...csvData].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          const fileName = `attendance_${startDate}_to_${endDate}.csv`;
          link.setAttribute('download', fileName);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        alert(`No data available for the selected criteria`);
      }
    } catch (error) {
      console.error('Error downloading CSV:', error.message);
      console.error('Error details:', error);
      alert('Failed to download CSV. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const goToAttendance = () => {
    navigate('/');
  };

  if (!isVerified) {
    return <DashboardPassword onPasswordVerified={() => setIsVerified(true)} />;
  }

  return (
    <div className="dashboard-container">
      <main className="dashboard-main">
        <h1 className="dashboard-title">Dashboard</h1>
        <div className="dashboard-controls">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="dashboard-input"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="dashboard-input"
          />
          <button
            onClick={downloadCSV}
            disabled={isDownloading || !startDate || !endDate}
            className="dashboard-button"
          >
            {isDownloading ? 'Downloading...' : 'Download CSV'}
          </button>
          <button
            onClick={goToAttendance}
            className="dashboard-button"
          >
            Go to Attendance
          </button>
        </div>
        <div className="dashboard-table-container">
          <table className="dashboard-table">
            <thead>
              <tr>
                <th className="dashboard-th">Admission Number</th>
                <th className="dashboard-th">Name</th>
                <th className="dashboard-th">Class Section</th>
                <th className="dashboard-th">Group</th>
                <th className="dashboard-th">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan="5" className="dashboard-td">No data available</td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row.adm_no}>
                    <td className="dashboard-td">{row.adm_no}</td>
                    <td className="dashboard-td">{row.name}</td>
                    <td className="dashboard-td">{row.class_sec}</td>
                    <td className="dashboard-td">{row.group}</td>
                    <td className="dashboard-td">{new Date(row.timestamp).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
