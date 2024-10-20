import React from "react";
import 'react-chatbot-kit/build/main.css';
import "./Options.css";

const GenerateSchedule = (props) => {
  const generateSchedule = [
    {
      text: "Create A Schedule",
      handler: props.actionProvider.handleJavascriptQuiz,
      id: 1,
    },
  ];

  const buttonsMarkup = options.map((option) => (
    <button key={option.id} onClick={option.handler} className="option-button">
      {option.text}
    </button>
  ));

  return <div className="options-container">{buttonsMarkup}</div>;
};

export default Options;