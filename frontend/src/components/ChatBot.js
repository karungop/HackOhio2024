import React from 'react';
import Chatbot from "react-chatbot-kit";
import config from "../chatConfigs/chatConfigs";
import MessageParser from "../newBot/MessageParser";
import ActionProvider from "../newBot/ActionProvider";


const BasicChatbot = () => {
  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="w-full max-w-2xl h-5/6 bg-white rounded-lg shadow-lg overflow-hidden">
        <Chatbot
          config={config}
          messageParser={MessageParser}
          actionProvider={ActionProvider}
        />
      </div>
    </div>
  );
};

export default BasicChatbot;