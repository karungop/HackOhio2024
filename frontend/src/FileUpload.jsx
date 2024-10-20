import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
//import { Configuration, OpenAIApi } from 'openai';

const FileUpload = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploadedFiles(acceptedFiles);
    },
  });


// Function to upload the file to Flask backend
const handleUpload = async () => {
  const formData = new FormData(); // Create FormData object
  formData.append('file', uploadedFiles[0]); // Append the file to the form data

  try {
    const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log(response.data); // Handle the response from Flask
  } catch (error) {
    console.error('Error uploading the file:', error);
  }
};  

//TO DO : Customize and Style this Drag and Drop to Upload box as you want
  return (
    <div className="drag-drop-container" {...getRootProps()}>
    <input {...getInputProps()} />
    <p>Drag and drop your transcript here or click to browse.</p>
    <ul>
      {uploadedFiles.map((file) => (
        <li key={file.name}>{file.name}</li>
      ))}
    </ul>
    <button onClick={handleUpload}>Upload File</button>
  </div>
  );
};
export default FileUpload;

