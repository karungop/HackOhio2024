import React, { useState } from 'react';
import axios from 'axios';
import { useDropzone } from 'react-dropzone';
import './App.css';
//import FileUpload from './FileUpload';

function App() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;  // Avoid sending empty messages

    // Add user message to the conversation
    const newMessage = { role: 'user', content: message };
    setConversation([...conversation, newMessage]);

    try {
      const res = await axios.post('http://127.0.0.1:5000/chat', { message });
      const aiMessage = { role: 'assistant', content: res.data.response };

      // Add AI's response to the conversation
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching the AI response', error);
    }

    // Clear the input field
    setMessage('');
  };

  
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


  return (
    <div className="chat-container">
      <h1>AI Academic Advisor</h1>
      <div className="chat-box">
        <div className="chat-history">
          {conversation.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <p>{msg.content}</p>
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="chat-input">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask about a course..."
            rows="3"
            className="message-input"
          />
          <button type="submit" className="send-button">Send</button>
        </form>
      </div>

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

    </div>
  );
}

export default App;