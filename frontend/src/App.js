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
  const [loading, setLoading] = useState(false); // New loading state
  const chatEndRef = useRef(null);  // Reference to the end of the chat history

  // Scroll to the bottom when conversation updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;  // Do nothing if the message is empty
  
    // Add user message to the conversation
    const newMessage = { role: 'user', content: message };
    setConversation([...conversation, newMessage]);
  
    // Clear the input field immediately
    setMessage('');
  
    setLoading(true); // Set loading to true while fetching AI response
  
    try {
      const res = await axios.post('http://127.0.0.1:5000/chat', { message });
      const aiMessage = { role: 'assistant', content: res.data.response };
  
      // Add AI's response to the conversation
      setConversation((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error fetching the AI response', error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };  

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {  // Enter without Shift key
      e.preventDefault();
      handleSubmit(e);
    }
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
     const aiMessage = { role: 'assistant', content: response.data };


     // Add AI's response to the conversation
     setConversation((prev) => [...prev, aiMessage]);
   } catch (error) {
     console.error('Error uploading the file:', error);
   }
   setMessage('');
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
          {loading && ( // Show loading indicator when loading
            <div className="chat-message assistant loading">
              <span className="ellipsis"></span>
              <span className="ellipsis"></span>
              <span className="ellipsis"></span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleSubmit} className="chat-input">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}  // Listen for Enter key press
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