import { useState, useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import './App.css'

function App() {
  const [name, setName] = useState('')
  const [inChat, setInChat] = useState(false)
  
  const [text, setText] = useState('')
  const [messages, setMessages] = useState([])

  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [isSigningUp, setIsSigningUp] = useState(false);
  const [username, setUsername] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const socketRef = useRef(null);

  const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // socket connection and listners
  useEffect(() => {
    if (!inChat) return;

    const socket = io(SOCKET_URL, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [inChat, SOCKET_URL]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !activeId) return;

    socket.emit('join-conversation', activeId);

    return () => {
      socket.emit('leave-conversation', activeId);
    };
  }, [activeId]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleIncomingMessage = (message) => {
      if (!message?.conversationId) return;
      if (String(message.conversationId) !== String(activeId)) return;

      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      });
    };

    // set messages to current messages minus the deleted message
    const handleMessageDeleted = ({ conversationId, messageId }) => {
      if (!conversationId || !messageId) return;
      if (String(conversationId) !== String(activeId)) return;

      setMessages((prev) => prev.filter((msg) => String(msg._id) !== String(messageId)));
    };

    // remove the deleted convo.
    const handleConversationDeleted = ({ conversationId }) => {
      if (!conversationId) return;

      setConversations((prev) => prev.filter((conv) => String(conv._id) !== String(conversationId)));

      if (String(activeId) === String(conversationId)) {
        setActiveId(null);
        setMessages([]);
      }
    };

    socket.on('new-message', handleIncomingMessage);
    // tell the socket to listern for the deleted message
    socket.on('message-deleted', handleMessageDeleted);
    // same here but with convo.
    socket.on('conversation-deleted', handleConversationDeleted);

    return () => {
      socket.off('new-message', handleIncomingMessage);
      socket.off('message-deleted', handleMessageDeleted);
      socket.off('conversation-deleted', handleConversationDeleted);
    };
  }, [activeId, inChat]);


  useEffect(() => {
    if(inChat) {
      fetch('/api/message/conversations', {
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => setConversations(data))
      .catch(error => console.error('Error fetching conversations:', error))
    }
  }, [inChat])

  useEffect(() => {
    if (activeId) {
      fetch(`/api/message/${activeId}/messages`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => setMessages(data));
    }
  }, [activeId]);

  //rename chat implementation
// Add this with your other handle functions
async function renameChat() 
{
  if (!activeId) return;

  const newName = prompt("Enter new group name:");
  if (!newName) return;

  try {
    const response = await fetch(`/api/message/${activeId}/rename`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ groupName: newName })
    });

    if (response.ok) {
      // Update the local state so you don't have to refresh
      setConversations(prev => 
        prev.map(conv => 
          conv._id === activeId ? { ...conv, groupName: newName } : conv
        )
      );
    } else {
      const errorData = await response.json();
      alert(errorData.message || "Failed to rename chat");
    }
  } catch (error) {
    console.error("Error renaming chat:", error);
  }
}


  //starts a new chat
  async function startChat()
  {

    const emailToMessage = prompt("Enter email:");
    if (!emailToMessage) return;

    const response = await fetch('/api/message/directMessages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: emailToMessage })
    })

    const newConv = await response.json();

    if(response.ok) {
      setConversations([...conversations, newConv]);
      setActiveId(newConv._id);
    }else{
      console.error('Error:', newConv.message);
    }
  }

  // creates a group chat multiuser
  async function createGroupChat() {
    const rawEmails = prompt("Enter emails (comma separated):");
    if (!rawEmails) return;

    const emails = rawEmails
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);

    if (emails.length === 0) return;

    const groupNameInput = prompt("Enter group name (optional):") || "";

    const response = await fetch("/api/message/groupMessages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emails, groupname: groupNameInput }),
    });

    const newConv = await response.json();
    if (response.ok) {
      setConversations((prev) => [newConv, ...prev]);
      setActiveId(newConv._id);
    } else {
      alert(newConv.message || "Failed to create group chat");
    }
  }

  // join the chatroom
  // mioght need to change on the backend
  async function handleJoin(e) {
    e.preventDefault()

    const endpoint = isSigningUp ? '/api/auth/signup' : '/api/auth/login';

    const bodyData = isSigningUp ? { username, email, password } : { email, password };



    try 
    {
      const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyData)
      });

    const data = await response.json()

    if (response.ok) {
      setInChat(true);
      setName(data.username || data.email);
      setCurrentUser(data);
    } else {
      console.error('Login failed:', data.message);
      alert(data.message);
    }
  } 
  catch (error) {
    console.error("Network error or server is down:", error);
  }
};

  // send a message to the chatroom, again backend might need to play a role here.
  async function handleSend(e) {
    e.preventDefault()

    if(!activeId){
      console.error("No conversation selected");
       return;
    }

    const response = await fetch(`/api/message/${activeId}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ text })
    })

    if (response.ok) {
      const message = await response.json()
      setMessages((prev) => {
        const exists = prev.some((msg) => msg._id === message._id);
        if (exists) return prev;
        return [...prev, message];
      })
      setText('')
    }
  }


  // delete a group chat
  async function handleDeleteGroupChat() {
    if (!activeId || activeConversation?.isPublicRoom) return;

    const isGroup = !!activeConversation?.isGroupChat;
    const confirmed = window.confirm(
      isGroup
        ? 'Do you want to delete this groupchat?'
        : 'Do you want to delete this dm?'
    );
    if (!confirmed) return;

    // send delete request to backend
    try {
      const response = await fetch(`/api/message/${activeId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      // set active chat to null and delete convo.
      if (response.ok) {
        setConversations((prev) => prev.filter((conv) => conv._id !== activeId));
        setActiveId(null);
        setMessages([]);
      } else {
        console.error('Error deleting chat:', error);
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
    }
  }


  // deletes a single message in a chat from you.
  async function handleDeleteMessage(messageId) {
    if (!activeId || !messageId) return;


    // send delete request to backend
    try {
      const response = await fetch(`/api/message/${activeId}/messages/${messageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();

      // if successful delete message from current chat window
      if (response.ok) {
        setMessages((prev) => prev.filter((msg) => String(msg._id) !== String(messageId)));
      } else {
        console.error('Error deleting message:', data.message);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  }

  // seperate chatrooms and public rooms also finds the active chat name to display in the UI
  const directAndGroupChats = conversations.filter((conv) => !conv.isPublicRoom);
  const publicRooms = conversations.filter((conv) => conv.isPublicRoom);
  const activeConversation = conversations.find((conv) => conv._id === activeId);
  const activeChatName = activeConversation?.groupName || (activeId ? 'Direct Message' : 'None');

  // added message timestamp formatting function
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';

    // parsing the timestamp
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';

    //grabbing the current time
    const now = new Date();
    const isToday = now.toDateString() === date.toDateString();

    //  show time only if not today.
    if (isToday) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }

    return date.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (!inChat) {
    return (
      <div className="join-screen">
        <form onSubmit={handleJoin}>
          <h1 style={{ margin: 0, textAlign: "center" }}>
            {isSigningUp ? "Sign Up" : "Login"}
          </h1>
          {isSigningUp && (
            <input
            type = "text"
            placeholder = "Enter username"
            value = {username}
            onChange = {(e) => setUsername(e.target.value)}
            required
          />
        )}


          <input
          type = "email"
          placeholder = "Enter email"
          value = {email}
          onChange = {(e) => setEmail(e.target.value)}
          required
          />
          <input
          type = "password"
          placeholder = "Enter password"
          value = {password}
          onChange = {(e) => setPassword(e.target.value)}
          required
          />
          <button type="submit">{isSigningUp ? 'Sign Up' : 'Login'}</button>

          <p
            onClick={() => setIsSigningUp(!isSigningUp)}
            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline', margin: 0, textAlign: 'center' }}
          >
            {isSigningUp ? 'Login' : 'Sign Up'}
          </p>
        </form>
        </div>
    )
  }

  return (
    <div className="chat-room">

      
      <div className="sidebar">
        <h3 style={{ color: "#000" }}>Chats</h3>
        <button onClick={createGroupChat} style={{background: '#28a745', color: 'white'}}>
            + New Group Chat
        </button>
        <button onClick={startChat} style={{background: '#000', color: 'white'}}>
            + New DM
        </button>

        {directAndGroupChats.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'gray' }}>No chats yet</p>
        ) : (
          directAndGroupChats.map(conv => (
            <button
              key={conv._id}
              onClick={() => setActiveId(conv._id)}
              className={activeId === conv._id ? 'active-chat' : ''}
            >
              {conv.groupName || "Direct Message"}
            </button>
          ))
        )}

        <div className="sidebar-public-section">

          <p className="sidebar-section-title">Public Rooms</p>
          {publicRooms.length === 0 ? (
            <p style={{ fontSize: '12px', color: 'gray' }}>No public rooms</p>
          ) : (
            publicRooms.map((room) => (
              <button
                key={room._id}
                onClick={() => setActiveId(room._id)}
                className={activeId === room._id ? 'active-chat' : ''}
              >
                {room.groupName}
              </button>
            ))
          )}
        </div>
      </div>

      <div className="main-content">

        <h2>Welcome, {name}</h2>
        <p className="current-chatroom">Current chatroom: <strong>{activeChatName}</strong></p>

        {activeId && (
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <button 
              onClick={renameChat} 
              style={{ 
                padding: '4px 8px', 
                fontSize: '12px', 
                backgroundColor: '#6c757d', 
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer' 
              }}
            >
              Rename
            </button>

            {!activeConversation?.isPublicRoom && (
              <button
                onClick={handleDeleteGroupChat}
                style={{
                  padding: '4px 8px',
                  fontSize: '12px',
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete Chat
              </button>
            )}
          </div>
        )}
        <div className="messages">
          {!activeId ? (
            
            <div className="no-chat">Select a conversation to start chatting</div>
          ) : messages.length === 0 ? (
            <div className="no-chat">No messages yet</div>
          ) : (
            
            messages.map((msg, index) => (
              <div key={msg._id || index} className="message">
                <strong>{msg.senderId?.username || "Unknown"}: </strong>
                {msg.text}
                
                {currentUser?._id && String(msg.senderId?._id) === String(currentUser._id) && (
                  <button
                    onClick={() => handleDeleteMessage(msg._id)}
                    style={{
                      marginLeft: '8px',
                      padding: '2px 6px',
                      fontSize: '11px',
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                )}

                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                  {formatMessageTime(msg.createdAt)}
                </div>

              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type message"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  )
}

export default App