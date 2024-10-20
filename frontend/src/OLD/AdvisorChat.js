import React, { useState } from 'react';
import axios from 'axios';

const AdvisorChat = () => {
    const [query, setQuery] = useState('');
    const [responses, setResponses] = useState([]);

    const handleQuery = async () => {
        const result = await axios.post('/api/advisor', { query });
        setResponses(result.data.courses);
        setQuery('');
    };

    return (
        <div className="advisor-chat">
            <h1>AI Academic Advisor</h1>
            <input 
                type="text" 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder="Ask about courses..."
            />
            <button onClick={handleQuery}>Ask</button>
            <div>
                {responses.map((course, index) => (
                    <div key={index} className="course-response">
                        <h2>{course.title}</h2>
                        <p>{course.description}</p>
                        <p><strong>Prerequisites:</strong> {course.prerequisites}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdvisorChat;
