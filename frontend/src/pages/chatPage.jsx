import React, { useState, useRef, useEffect } from 'react';
import './../styles/chat.css';
import { IoSend } from 'react-icons/io5';
import { FaSpinner } from 'react-icons/fa';
import { chatWithAI } from './../redux/slices/taxSlice'
import { useDispatch, useSelector } from 'react-redux';

function ChatPage() {
    const dispatch = useDispatch();
    const { messagesChat } = useSelector((state) => state.tax);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'assistant',
            text: 'Hello! I am your tax assistant. How can I help you today?',
            timestamp: new Date().toLocaleTimeString()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        if (messagesChat && typeof messagesChat === 'string' && messagesChat.trim() !== '') {
            setIsLoading(false);

            const formattedText = messagesChat
                .split(/(\*\*Step \d+:|\*\*|\-\-\- ###)/)
                .map((part, index) => {
                    if (part.startsWith('Step') || part.startsWith('---')) {
                        return `\n${part}`;
                    }
                    return part;
                })
                .join('')
                .trim();

            setMessages(prev => [...prev, {
                id: prev.length + 1,
                sender: "assistant",
                text: formattedText,
                timestamp: new Date().toLocaleTimeString()
            }]);
        }
    }, [messagesChat]);

    // Modify the message display component to render formatted text
    const renderFormattedText = (text) => {
        return text.split('\n').map((line, index) => (
            <React.Fragment key={index}>
                {line.startsWith('**Step') || line.startsWith('---') ? (
                    <strong className="message-header">{line}</strong>
                ) : (
                    <span>{line}</span>
                )}
                <br />
            </React.Fragment>
        ));
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || isLoading) return;

        const newMessage = {
            id: messages.length + 1,
            sender: 'user',
            text: inputMessage,
            timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, newMessage]);
        setInputMessage('');
        setIsLoading(true);

        dispatch(chatWithAI({
            messages: [{
                text: newMessage.text,
                sender: 'user'
            }]
        }));
    };

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <div className="content">
            <h2>Tax Assistant</h2>
            <div className='chat-container' ref={chatContainerRef}>
                <div className='chat-list'>
                    {messages.map((message) => (
                        <div
                            key={message.id}
                            className={`chat-item ${message.sender === 'user' ? 'user-message' : 'bot-message'}`}
                        >
                            <div className='chat-item-header'>
                                <h4>{message.sender === 'user' ? 'You' : 'Tax Assistant'}</h4>
                                <p>{message.timestamp}</p>
                            </div>
                            <div className="message-content">
                                {message.sender === 'assistant'
                                    ? renderFormattedText(message.text)
                                    : message.text
                                }
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="chat-item bot-message loading-message">
                            <div className="loading-indicator">
                                <FaSpinner className="spinner" />
                                <span>Tax Assistant is thinking...</span>
                            </div>
                        </div>
                    )}
                </div>
                <form onSubmit={handleSendMessage} className='chat-input-container'>
                    <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className='chat-input'
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className={`send-button ${isLoading ? 'disabled' : ''}`}
                        disabled={isLoading}
                    >
                        {isLoading ? <FaSpinner className="spinner" /> : <IoSend />}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ChatPage;