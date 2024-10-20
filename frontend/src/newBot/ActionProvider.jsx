import '../components/main.css';

class ActionProvider {
    constructor(createChatBotMessage, setStateFunc)
    {
        this.createChatBotMessage = createChatBotMessage;
        this.setState = setStateFunc;
    }
    getResponce = (message) =>
    {
        const output = this.createChatBotMessage(message);
        this.addMessageToState(output);
    }


    addMessageToState = (message) => {
        this.setState((prevState) => ({
          ...prevState,
          messages: [...prevState.messages, message],
        }));
      };
}

export default ActionProvider;