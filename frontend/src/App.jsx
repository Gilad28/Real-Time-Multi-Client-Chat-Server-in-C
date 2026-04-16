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

    socket.on('new-message', handleIncomingMessage);

    return () => {
      socket.off('new-message', handleIncomingMessage);
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

  // seperate chatrooms and public rooms also finds the active chat name to display in the UI
  const directAndGroupChats = conversations.filter((conv) => !conv.isPublicRoom);
  const publicRooms = conversations.filter((conv) => conv.isPublicRoom);
  const activeConversation = conversations.find((conv) => conv._id === activeId);
  const activeChatName = activeConversation?.groupName || (activeId ? 'Direct Message' : 'None');

  if (!inChat) {
    return (
      <div className="join-screen">
        <h1>{isSigningUp ? 'Sign Up' : 'Login'}</h1>
        <form onSubmit={handleJoin}>
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
        </form>

        <p
          onClick={() => setIsSigningUp(!isSigningUp)}
          style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
          >
            {isSigningUp ? 'Login' : 'Sign Up'}
          </p>
        </div>
    )
  }

  return (
    <div className="chat-room">

      
      <div className="sidebar">
        <h3>Chats</h3>
        <button onClick={startChat} style={{background: '#28a745', color: 'white'}}>
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

      <div className="messages">
        {!activeId ? (
          <div className="no-chat">Select a conversation to start chatting</div>
        ) : messages.length === 0 ? (
          <div className="no-chat">No messages yet</div>
        ) : (
          messages.map((msg, index) => (
            <div key={index} className="message">
              <strong>{msg.senderId?.username || "Unknown"}: </strong>
              {msg.text}
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