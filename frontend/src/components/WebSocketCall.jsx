import { useEffect, useState } from "react";
import { Button, TextField } from '@mui/material';

export default function WebSocketCall({ socket }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  const handleText = (e) => {
    const inputMessage = e.target.value;
    setMessage(inputMessage);
  };

  const handleSubmit = () => {
    console.log("handleSubmit called! - ", message);
    if (!message) {
      return;
    }
    
    socket.emit("data", message);
    setMessage("");
  };

  useEffect(() => {
    socket.on("data", (data) => {
      setMessages([...messages, data.data]);
    });
  }, [socket, messages]);

  return (
    <div>
      <h2>WebSocket Communication</h2>
      <TextField id="outlined-basic" label="Message" variant="outlined" value={message} onChange={handleText} />
      <Button variant="contained" onClick={handleSubmit}>Send</Button>
      <ul>
        {messages.map((message, ind) => {
          return <li key={ind}>{message}</li>;
        })}
      </ul>
    </div>
  );
}