import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './App.css';
import { useDropzone } from 'react-dropzone';

function App() {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI Academic Advisor, and I'm excited to help you with any questions about the CSE curriculum here at OSU! Feel free to ask away!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);
  const [uploadedFiles, setUploadedFiles] = useState([]); // State for uploaded files

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { role: 'user', content: message };
    setConversation([...conversation, newMessage]);

    setMessage('');
    setLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:5000/chat', { message });
      const aiMessage = { role: 'assistant', content: res.data.response };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching the AI response', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      setUploadedFiles(acceptedFiles);
    },
  });

  const handleUpload = async () => {
    if (uploadedFiles.length === 0) return; // Prevent upload if no files

    const formData = new FormData();
    formData.append('file', uploadedFiles[0]);
    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const aiMessage = { role: 'assistant', content: response.data.response };
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error uploading the file:', error);
    }
    setUploadedFiles([]); // Clear uploaded files after upload
    setMessage('');
  };

  const uploadedFileName = uploadedFiles.length > 0 ? uploadedFiles[0].name : 'Upload your transcript here';

  return (
    <div className="chat-container">
      <h1>AdvisorAI</h1>
      <div className="chat-box">
        <div className="chat-history">
          {conversation.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <p>{msg.content}</p>
            </div>
          ))}
          {loading && (
            <div className="chat-message assistant loading">
              <span className="ellipsis"></span>
              <span className="ellipsis"></span>
              <span className="ellipsis"></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Render only the Upload File button styled like the Upload Transcript button */}
        <div className={`drag-drop-container ${isDragActive ? 'drag-active' : ''}`} {...getRootProps()}>
          <input {...getInputProps()} />
          <p>{uploadedFileName}</p>
          <div onClick={handleUpload}>
            <p></p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="chat-input">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            className="message-input"
            placeholder="Ask something..."
          />
          <button type="submit" className="send-btn">Send</button>
        </form>
      </div>
    </div>
  );
}

export default App;
