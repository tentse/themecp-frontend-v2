import React, { useContext, useEffect, useState } from 'react'
import './ImportExport.css'
import { UserContestHistory } from '../../context/ProfileContext/ContestHistoryContext'
import { ProfileContext } from '../../context/ProfileContext/ProfileContext'
import Cookies from 'js-cookie';

const ImportExport = () => {
    const [user_contest, setContestHistory] = useState([]);
    const [get_username, setUsername] = useState([]);
    const [jsonData, setJsonData] = useState(null);
    const [uploading, setUploading] = useState(false);
    const contest_history = useContext(UserContestHistory);
    const user = useContext(ProfileContext);
    useEffect(() => {
        const temp = [...contest_history.user_contest];
        temp.sort((a,b) => a.contest_no - b.contest_no);
        setContestHistory(() => temp);
        setUsername(() => user.user_profile);
    },[contest_history, user])

    const columnsToIgnore = ["email", "id", "contest_no", "handle", "createdAt", "updatedAt"];

    const convertToCSV = (data, ignoreColumns) => {
        const allKeys = Object.keys(data[0]); // Get all keys from the first object
        const filteredKeys = allKeys.filter((key) => !ignoreColumns.includes(key)); // Filter out ignored keys
    
        // Generate headers
        const headers = filteredKeys.join(",");
    
        // Generate rows, ignoring specific columns
        const rows = data.map((row) =>
        filteredKeys
            .map((key) => `"${row[key]}"`) // Include only non-ignored keys
            .join(",")
        );
    
        return [headers, ...rows].join("\n"); // Combine headers and rows
    };

    const downloadCSV = () => {
        const csvData = convertToCSV(user_contest, columnsToIgnore); // Convert array to CSV string
        const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" }); // Create a Blob
        const link = document.createElement("a"); // Create a download link
    
        link.href = URL.createObjectURL(blob);
        link.download = "data.csv"; // File name
        link.click(); // Trigger download
    
        URL.revokeObjectURL(link.href); // Cleanup the URL object
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0]; // Get the uploaded file
        if (file && file.type === "application/json") {
          const reader = new FileReader();
          // Callback to handle file reading
          
          reader.onload = (e) => {
            try {
              const parsedData = JSON.parse(e.target.result); // Parse JSON data
              setJsonData(parsedData); // Save parsed data to state
            } catch (error) {
              // console.error("Invalid JSON file:", error);
              alert("The uploaded file is not valid JSON.");
            }
          };
    
          reader.readAsText(file); // Read file as text
        } else {
          alert("Please upload a valid JSON file.");
        }
    };

    const uploadData = async () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formatDate = `${year}-${month}-${day}`;
      const limit = JSON.parse(localStorage.getItem('auth')) || {auth: formatDate, key: 0};
      if (limit.auth === formatDate) {
        if (limit.key >= 5) {
          alert('You have reach maximum dialy upload limit');
          return;
        }
        else {
          limit.key += 1;
        }
      } else {
        limit.auth = formatDate;
        limit.key = 0;
      }
      localStorage.setItem('auth', JSON.stringify(limit));
      const response = window.confirm('Have you read the instruction carefully.\nDO NOT CHANGE PAGES UNTIL PROCESS IS FINISHED.');
      if (!response) {
        return;
      }
      // console.log(get_username);
      if (jsonData !== null && get_username.length !== 0) {
        setUploading(true);
        const api = await fetch('https://themecp.up.railway.app/api/deleteData', {
          method:'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Cookies.get('token')}`,
          }
        })

        for (let item of jsonData) {
          let data = {};
          data.user_email = get_username.email;
          data.handle = get_username.codeforces_handle;
          data.topic = item.topic;
          data.date = item.date;
          data.level = item.contest_level;
          data.R1 = item.R1;
          data.R2 = item.R2;
          data.R3 = item.R3;
          data.R4 = item.R4;
          data.id1 = item.contestId1;
          data.id2 = item.contestId2;
          data.id3 = item.contestId3;
          data.id4 = item.contestId4;
          data.index1 = item.index1;
          data.index2 = item.index2;
          data.index3 = item.index3;
          data.index4= item.index4;
          data.T1 = item.T1;
          data.T2 = item.T2;
          data.T3 = item.T3;
          data.T4 = item.T4;
          const api_call = await fetch('https://themecp.up.railway.app/api/addContestData', {
            method:'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${Cookies.get('token')}`,
            },
            body: JSON.stringify(data),
          }).then(res => {
            if (res.ok) {
            } else {
              alert('Error occured please read the instruction carefully.\nContact @10zin on discord');
            }
          });
        }
        setUploading(false);
        alert('Done');
      }
      else {
        alert('Try again uploading correct file');
      }
    }


  return (
    <div className='importExport-container'>
        <div className='import-div'>
            <span style={{fontSize:'27px'}}>Import Data</span> <br />
            <span style={{color:'Red'}}>Read this before proceeding <a href='https://docs.google.com/document/d/1YlY2BgTCDX_7h8Bo_2J3To2MlFTr4uy23J-myaYjWiQ/edit?usp=sharing'>Link</a></span> <br />
            <input disabled={uploading} className='input-file' type="file" accept=".json" onChange={handleFileUpload} />
            <br />
            <button disabled={uploading} className='upload-button' onClick={uploadData}>Upload</button>
            {uploading ? ' Uploading....':''}
        </div>
        <div className='export-div'>
            <span style={{fontSize:'28px'}}>Export Data</span><br />
            <button disabled={uploading} onClick={downloadCSV} className='download-button'>Download</button>
        </div>
    </div>
  )
}

export default ImportExport
