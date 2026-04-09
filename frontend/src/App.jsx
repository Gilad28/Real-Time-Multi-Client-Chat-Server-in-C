import { useState, useEffect } from 'react'
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
      setMessages([...messages, message])
      setText('')
    }
  }

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

      <h2>Welcome, {name}</h2>
      <div className="sidebar">
        {conversations.map(conv => (
          <button key={conv._id} onClick={() => setActiveId(conv._id)}>
            {conv.groupName || "Direct Message"}
          </button>
        ))}
      </div>
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
  )
}

export default App