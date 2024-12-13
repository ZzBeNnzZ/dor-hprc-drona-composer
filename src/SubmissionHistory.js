import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { tableCustomStyles } from '../static/custom/css/tablestyle.jsx';

const SubmissionHistory = ({ isExpanded }) => {
  const [jobHistory, setJobHistory] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (isExpanded) {
      const currentDate = new Date();
      const defaultEndDate = currentDate.toISOString().split('T')[0];
      currentDate.setDate(currentDate.getDate() - 30);
      const defaultStartDate = currentDate.toISOString().split('T')[0];
      
      setStartDate(defaultStartDate);
      setEndDate(defaultEndDate);
      
      fetchJobHistory();
    }
  }, [isExpanded]);

  const fetchJobHistory = async () => {
    try {
      const response = await fetch(`${document.dashboard_url}/jobs/composer/history`);
      const data = await response.json();
      setJobHistory(data);
    } catch (error) {
      console.error('Failed to fetch job history:', error);
    }
  };


const columns = [
    {
      name: 'ID',
      selector: row => row.job_id || 'N/A',
      sortable: true,
      width: '100px',
    },
    {
      name: 'Name',
      selector: row => row.job_name || 'N/A',
      sortable: true,
      width: '200px',
      cell: row => {
        const name = row.job_name || 'N/A';
        return (
          <div className="text-truncate" style={{ maxWidth: '180px' }}>
            <span title={name}>{name}</span>
          </div>
        );
      },
    },
    {
      name: 'Location',
      selector: row => row.location || 'N/A',
      sortable: true,
      width: '300px',
      cell: row => {
        const location = row.location || 'N/A';
        const diskName = location.split('/');
        const displayedName = diskName.length > 3 ? diskName.slice(-3).join('/') : location;
        return (
          <div className="text-truncate" style={{ maxWidth: '280px' }}>
            <a 
              target="_blank" 
              style={{ color: '#003C71', fontWeight: 'bold', textDecoration: 'underline' }} 
              href={document.file_app_url + row.location}
              title={location}
            >
              {displayedName}
            </a>
          </div>
        );
      },
    },
    {
      name: 'Environment',
      selector: row => row.environment || 'N/A',
      sortable: true,
      width: '150px',
      cell: row => {
        const environment = row.environment || 'N/A';
        return (
          <div className="text-truncate" style={{ maxWidth: '130px' }}>
            <span title={environment}>{environment}</span>
          </div>
        );
      },
    },
    {
      name: 'Date',
      selector: row => row.timestamp || 'N/A',
      sortable: true,
      width: '150px',
      cell: row => {
        if (!row.timestamp) return 'N/A';
        const date = new Date(row.timestamp);
        const datePart = date.toISOString().split('T')[0];
        const timePart = date.toTimeString().split(' ')[0];
        return (
          <div>
            <div>{datePart}</div>
            <div className="text-muted">{timePart}</div>
          </div>
        );
      },
    },
    {
      name: 'Actions',
      cell: row => (
        <div style={{ minWidth: "115px" }} className="d-flex gap-2">
          <button
            type="button"
            className="btn btn-sm btn-primary maroon-button"
            onClick={() => handleView(row)}
	      style={{ marginRight: '4px' }}
            title="View job details"
          >
            View
          </button>
          <button
            type="button"
            className="btn btn-sm btn-primary maroon-button"
            onClick={() => handleRerun(row)}
	      style={{ marginLeft: '4px' }}
            title="Rerun this job"
          >
            Rerun
          </button>
        </div>
      ),
      ignoreRowClick: true,
    },
  ];



  const handleRerun = async (job) => {
    try {
      const response = await fetch(`${document.dashboard_url}/jobs/composer/rerun/${job.id}`, {
        method: 'POST'
      });
      const result = await response.text();
    } catch (error) {
      console.error('Failed to rerun job:', error);
    }
  };

  if (!isExpanded) return null;

  // Initialize the tabel with the most recent jobs first
  const sortedJobHistory = [...jobHistory].sort((a, b) => {
    if (!a.timestamp) return 1;
    if (!b.timestamp) return -1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  return (
    <div className="mt-4">
      <div className="date-inputs mb-3">
        <label htmlFor="startDate">From</label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mx-2"
        />
        <label htmlFor="endDate">To</label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mx-2"
        />
        <button 
          className="btn btn-primary maroon-button"
          onClick={fetchJobHistory}
        >
         Filter 
        </button>
      </div>

      <DataTable
        columns={columns}
        data={sortedJobHistory}
        customStyles={tableCustomStyles}
	responsive
	pagination
        noDataComponent="No jobs have been submitted yet."
	    sortIcon={
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="currentColor"
      style={{ marginLeft: '4px' }}
    >
      <path d="M6 9L2 5h8L6 9z"/>
    </svg>
  }
      />
    </div>
  );
};

export default SubmissionHistory;
