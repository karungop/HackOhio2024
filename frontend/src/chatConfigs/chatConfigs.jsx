import { createChatBotMessage } from "react-chatbot-kit";
import '../components/main.css';

const config = {
    botName: "Academic Advisor",
    initialMessages: [createChatBotMessage("Hello I am your personal AI academic advisor,")/*look in OLD to find out how to use widgets*/],
    

};

export default config;