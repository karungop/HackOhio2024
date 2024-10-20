import os
import json
import pandas as pd
import re
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from openai import OpenAI
from werkzeug.utils import secure_filename

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# Setup file upload path
UPLOAD_FOLDER = './uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Make sure the upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

# Load the course data from the JSON file
with open('cse_courses.json') as f:
    courses = json.load(f)

# Convert to a DataFrame for easier manipulation
df = pd.DataFrame(courses)

conversation_history = [{"role": "system", "content": "You are a helpful academic advisor."}]

# Clean and process the data
df['title'] = df['title'].str.strip()
df['description'] = df['description'].str.strip()
df['prerequisites'] = df['prerequisites'].str.strip()
df['credits'] = df['units'].str.extract('(\d+)').astype(int)  # Extract credit hours

# Initialize the TF-IDF Vectorizer
vectorizer = TfidfVectorizer()
vectorizer.fit(df['title'].tolist() + df['description'].tolist())  # Fit on titles and descriptions

# OpenAI API setup with your API key
client = OpenAI(api_key='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')  # Ensure to use your actual API key


# Function to query OpenAI API for file analysis
def analyze_file_with_openai(file_path):
    # Send the file to OpenAI for analysis (using OpenAI API or embeddings)
    with open(file_path, 'rb') as f:
        response = client.files.create(file=f)
        # Assuming you're using OpenAI's file-based API, adjust as needed
    return response

# File upload endpoint
@app.route('/upload', methods=['POST'])
def upload_file():
    # Check if the request has a file
    if 'file' not in request.files:
        return jsonify({"error": "No file part in the request"}), 400
    
    file = request.files['file']
    
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        # Now send the file to OpenAI for analysis
        openai_response = analyze_file_with_openai(file_path)

        # Return the analysis result
        return jsonify({"response": openai_response}), 200
    
    return jsonify({"error": "File upload failed"}), 500


# Function to query OpenAI API for personalized responses
def query_openai(messages):
    response = client.chat.completions.create(
        model="gpt-4",
        messages=messages
    )
    return response.choices[0].message.content

# Function to get course information based on user input
def get_course_info(course_number):
    course_info = df[df['number'] == course_number].iloc[0]
    return {
        "title": course_info['title'],
        "description": course_info['description'],
        "credits": course_info['credits'],
        "prerequisites": course_info['prerequisites'],
        "number": course_info['number']  # Include number for matching
    }

# Function to extract course number from user input
def extract_course_number(input_text):
    match = re.search(r'(CSE)\s*(\d{4})', input_text.upper())
    if match:
        return f"{match.group(1)} {match.group(2)}"
    return None

# Function to find the best matching course based on user input
def find_best_matching_course(user_input):
    # Transform the user input into a vector
    user_vector = vectorizer.transform([user_input])
    
    # Calculate cosine similarity
    vectors = vectorizer.transform(df['title'].tolist() + df['description'].tolist())
    cosine_similarities = cosine_similarity(user_vector, vectors)
    
    # Get the best matching index
    best_match_index = np.argmax(cosine_similarities[0])
    
    # Retrieve course information
    if best_match_index < len(df):
        matched_course_number = df.iloc[best_match_index]['number']
        return get_course_info(matched_course_number)
    else:
        return None

# API endpoint for the chatbot
@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json.get('message')
    print(f"Received message: {user_input}")  # Debug statement
    
    # Initialize conversation history
    
    # Try to extract a course number from the input
    course_number = extract_course_number(user_input)
    
    if course_number:
            # If a course number is found, get the course information
            course_info = get_course_info(course_number)
            prompt = (
                f"{user_input} Here are the details about {course_info['title']} (CSE {course_number}): "
                f"{course_info['description']} This course is worth {course_info['credits']} credits. "
                f"The prerequisites are: {course_info['prerequisites']}."
                f"Answer ONLY the following prompt, in 1-2 sentences and don't include anything the following prompt didn't ask for. You are an AI academic advisor, so answer in a nice way like an academic advisor"
            )
    else:
        # If no course number is found, find the best matching course
        matched_course_info = find_best_matching_course(user_input)
        if matched_course_info:
            prompt = (
                f"{user_input} Based on your interest, I recommend {matched_course_info['title']} (CSE {matched_course_info['number']}): "
                f"{matched_course_info['description']} This course is worth {matched_course_info['credits']} credits. "
                f"The prerequisites are: {matched_course_info['prerequisites']}."
                f"Answer ONLY the following prompt, in 1-2 sentences and don't include anything the following prompt didn't ask for. You are an AI academic advisor, so answer in a nice way like an academic advisor"
            )
        else:
            prompt = "I'm sorry, but I couldn't find any relevant courses based on your query."
    



    # Append user message to conversation history
    conversation_history.append({"role": "user", "content": user_input})
    
    # Append prompt to conversation history
    conversation_history.append({"role": "user", "content": prompt})

    # Query OpenAI for a response
    response = query_openai(conversation_history)

    conversation_history.append({"role": "assistant", "content": response})
    
    # Create the response
    response_json = jsonify({"response": response})
    return response_json



# Start the Flask app
if __name__ == '__main__':
    app.run(debug=True)
