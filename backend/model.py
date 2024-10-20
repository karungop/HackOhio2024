import os
import json
import pandas as pd
import re
from openai import OpenAI

# Load the course data from the JSON file
with open('cse_courses.json') as f:
    courses = json.load(f)

# Convert to a DataFrame for easier manipulation
df = pd.DataFrame(courses)

# Clean and process the data
df['title'] = df['title'].str.strip()
df['description'] = df['description'].str.strip()
df['prerequisites'] = df['prerequisites'].str.strip()
df['credits'] = df['units'].str.extract('(\d+)').astype(int)  # Extract credit hours

# OpenAI API setup with the new client instantiation
client = OpenAI(api_key='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')

# Function to query OpenAI API for personalized responses
def query_openai(messages):
    response = client.chat.completions.create(
        model="gpt-4",  # or gpt-3.5-turbo
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
        "prerequisites": course_info['prerequisites']
    }

# Function to extract course number from user input
def extract_course_number(input_text):
    match = re.search(r'(CSE)\s*(\d{4})', input_text.upper())
    if match:
        return f"{match.group(1)} {match.group(2)}"
    return None

# Function to handle the chatbot flow
def chatbot():
    print("Welcome to the CSE Academic Advisor Chatbot! Ask me about any CSE courses or general academic questions.")
    
    # Initialize conversation history
    conversation_history = [{"role": "system", "content": "You are a helpful academic advisor."}]
    
    while True:
        user_input = input("\nYou: ")
        
        # Exit condition
        if user_input.lower() in ['exit', 'quit', 'q']:
            print("Goodbye! Have a great day!")
            break
        
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
            # If no course number is found, just use the user input
            prompt = user_input
        
        # Append user message to conversation history
        conversation_history.append({"role": "user", "content": prompt})
        
        # Query OpenAI for a response
        response = query_openai(conversation_history)
        
        # Append AI response to conversation history
        conversation_history.append({"role": "assistant", "content": response})
        
        # Print the chatbot's response
        print(f"AdvisorAI: {response}")

# Start the chatbot in the terminal
if __name__ == '__main__':
    chatbot()
