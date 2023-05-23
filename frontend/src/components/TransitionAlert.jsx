import * as React from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';

export default function TransitionAlert({ socket }) {
    const [open, setOpen] = React.useState(false);
    const [messages, setMessages] = React.useState([]);
    
    React.useEffect(() => {
      socket.on("data", (data) => {
        if (!data.job_id)
          setOpen(true)
          setMessages([...messages, data.msg + " " + data.uid]);
      });
    }, [socket, messages]);
  
    return (
      <Box sx={{ width: '100%' }}>
        <Collapse in={open}>
          <Alert
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setOpen(false);
                }}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
            sx={{ mb: 2 }}
          >
            {messages.at(-1)}
          </Alert>
        </Collapse>
      </Box>
    );
  }