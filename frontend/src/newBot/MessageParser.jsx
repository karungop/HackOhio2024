// in MessageParser.js
import '../components/main.css';
import axios from 'axios';


/*
import { Configuration, OpenAIApi } from "openai";
*/

class MessageParser {
    /*
    intialize OPEN AI Key here

    const [apiKey] = useState("YOUR_OPENAI_API_KEY"); // Store your API key securely
    const openai = new OpenAIApi(new Configuration({ apiKey }));
    */ 
    constructor (actionProvider)
    {
        this.actionProvider = actionProvider;
    }

    async parse(message)
    {

        console.log(message);
        const response = await this.sendMessageToBackend(message);
        this.actionProvider.addMessageToState(response.data);
        
        /*
        try {
         const response = await openai.createChatCompletion({
           model: "gpt-4", // You can choose the model you prefer
           messages: [{ role: "user", content: prompt }],
         });
         return response.data.choices[0].message.content; // Get the response text ////////////Importatn line
       } catch (error) {
         console.error("Error fetching OpenAI response:", error);
         return "Sorry, I couldn't process that request.";
       }
        */
        this.actionProvider.getResponce(response.data);
    }

    async sendMessageToBackend(message) {
      try {
        const response = await axios.post('http://127.0.0.1:5000/api/string', { message });
        return response; // Return the server response
      } catch (error) {
        console.error('Error sending message to backend:', error);
        if (error.response) {
          console.error('Server responded with an error:', error.response.data);
          console.error('Status code:', error.response.status);
          console.error('Status text:', error.response.statusText);
          return { data: 'Error occurred while sending message.3' };
      }
      // `error.request` exists if the request was made but no response was received (network issues, timeout, etc.)
      else if (error.request) {
          console.error('No response received:', error.request);
          return { data: 'Error occurred while sending message.2' };
      }
      // `error.message` contains a message explaining what went wrong (general errors like network issues, CORS, etc.)
      else {
          console.error('Error:', error.message);
          return { data: 'Error occurred while sending message.1' };
      }
        // Handle error appropriately
        return { data: 'Error occurred while sending message.' };
      }
    }
}
export default MessageParser;