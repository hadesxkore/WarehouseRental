import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../firebase';
import { useParams } from 'react-router-dom';

import Navbar from './Navbar';

const ChatPage = () => {
    const [conversations, setConversations] = useState([]);

    useEffect(() => {
        const loadConversations = async () => {
            try {
                const conversationsSnapshot = await firestore.collection('conversations').get();
                const conversationsData = await Promise.all(conversationsSnapshot.docs.map(async doc => {
                    const messagesSnapshot = await firestore.collection('conversations').doc(doc.id).collection('messages').orderBy('timestamp', 'desc').limit(1).get();
                    const latestMessageData = messagesSnapshot.docs.map(messageDoc => messageDoc.data())[0]; // Get the latest message
                    const senderData = await firestore.collection('users').doc(latestMessageData.senderId).get();
                    const profileImage = senderData.exists ? senderData.data().profileImage : null;
                    return { id: doc.id, ...doc.data(), latestMessage: latestMessageData, profileImage: profileImage }; // Include the latest message and profile image in conversation data
                }));
                setConversations(conversationsData);
            } catch (error) {
                console.error('Error loading conversations:', error);
            }
        };
    
        loadConversations();
    }, []);
    
    return (
        <div>
            <Navbar />
            <div className="flex h-screen overflow-hidden">
                {/* Sidebar with chat records */}
                <div className="w-1/4 bg-gray-200 px-4 py-6">
                    <h2 className="text-lg font-semibold mb-4">Chat Records</h2>
                    <div className="overflow-y-auto">
                        {conversations.map(conversation => (
                            <div key={conversation.id}>
                                <div className="py-2 px-4 bg-white shadow-md rounded-lg mb-2 hover:bg-gray-100 transition duration-300">
                                    <Link to={`/conversation/${conversation.id}`} className="block hover:text-blue-700">
                                        <div className="flex items-center">
                                            {conversation.profileImage && <img src={conversation.profileImage} alt="Profile" className="h-8 w-8 rounded-full mr-2" />}
                                            <p className="text-lg font-bold">{conversation.latestMessage?.senderName || 'Unknown'}</p>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Main chat area */}
                <div className="flex flex-col flex-grow bg-gray-100">
                    <div className="px-4 py-6">
                        {/* Main chat content */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatPage;