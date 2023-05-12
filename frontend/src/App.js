import "./App.css";
import HttpCall from "./components/HttpCall";
import WebSocketCall from "./components/WebSocketCall";
import { io } from "socket.io-client";

import * as React from 'react';

import { Button, Card, CardHeader, CardContent, CardActions, Typography, IconButton, Collapse, styled } from '@mui/material';
import { Close, PlayArrow, ExpandMore } from '@mui/icons-material';

function App() {
  const [socketInstance, setSocketInstance] = React.useState("");
  const [socketLoading, setSocketLoading] = React.useState(true);

  const [wsButtonStatus, setWsButtonStatus] = React.useState(false);
  
  const [{items}, setItems] = React.useState({ items: [] });
  const [itemExpanded, setItemExpanded] = React.useState(false);
  
    const addItem = () => {
    items.push(<Card variant="outlined">{card}</Card>);
    setItems({ items: [...items] });
  };

  const handlePush = () => {
    fetch('http://localhost:5000/push', {
      method: 'POST', 
      mode: 'cors', 
      body: 'taskId1'})
  };

  const handleClick = () => {
    if (wsButtonStatus === false) {
      setWsButtonStatus(true);
    } else {
      setWsButtonStatus(false);
    }
  };

  const handleClose = () => {
    items.splice(0, 1);
    setItems({ items: [...items] });
  };

  const ExpandMoreStyle = styled((props) => {
    const { expand, ...other } = props;
    return <IconButton {...other} />;
  })(({ theme, expand }) => ({
    transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  }));

  const handleItemExpandClick = () => {
    setItemExpanded(!itemExpanded);
  };

  const card = (
    <Card>
      <CardHeader
        action={
          <IconButton aria-label="Remove" onClick={handleClose}>
            <Close />
          </IconButton>
        }
        title="Scanner 1"
        subheader="IP, AETitle"
      />
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          Scanner 1
        </Typography>        
        <Typography sx={{ mb: 1.5 }} color="text.secondary">
          AETitle: ABCD
        </Typography>
        <Typography variant="body2">
          Currently sending: STUDY1
        </Typography>
      </CardContent>
      <CardActions>
        <IconButton aria-label="Push" onClick={handlePush}>
          <PlayArrow sx={{ height: 38, width: 38 }} />
        </IconButton>
        <ExpandMoreStyle
          expand={itemExpanded}
          onClick={handleItemExpandClick}
          aria-expanded={itemExpanded}
          aria-label="show more"
        >
          <ExpandMore />
        </ExpandMoreStyle>
      </CardActions>
      <Collapse in={itemExpanded} timeout="auto" unmountOnExit>
        <CardContent>
          <Typography paragraph>Method:</Typography>
          <Typography paragraph>
            Heat 1/2 cup of the broth in a pot until simmering, add saffron and set
            aside for 10 minutes.
          </Typography>
          <Typography paragraph>
            Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over
            medium-high heat. Add chicken, shrimp and chorizo, and cook, stirring
            occasionally until lightly browned, 6 to 8 minutes. Transfer shrimp to a
            large plate and set aside, leaving chicken and chorizo in the pan. Add
            pimentón, bay leaves, garlic, tomatoes, onion, salt and pepper, and cook,
            stirring often until thickened and fragrant, about 10 minutes. Add
            saffron broth and remaining 4 1/2 cups chicken broth; bring to a boil.
          </Typography>
          <Typography paragraph>
            Add rice and stir very gently to distribute. Top with artichokes and
            peppers, and cook without stirring, until most of the liquid is absorbed,
            15 to 18 minutes. Reduce heat to medium-low, add reserved shrimp and
            mussels, tucking them down into the rice, and cook again without
            stirring, until mussels have opened and rice is just tender, 5 to 7
            minutes more. (Discard any mussels that don&apos;t open.)
          </Typography>
          <Typography>
            Set aside off of the heat to let rest for 10 minutes, and then serve.
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  );

  React.useEffect(() => {
    if (wsButtonStatus === true) {
      const socket = io("localhost:5000");

      setSocketInstance(socket);

      socket.on("connect", (data) => {
        console.log(data);
      });

      setSocketLoading(false);

      socket.on("disconnect", (data) => {
        console.log(data);
      });

      return function cleanup() {
        socket.disconnect();
      };
    }
  }, [wsButtonStatus]);

  React.useEffect(() => { 
    setItemExpanded(itemExpanded)
   }, [itemExpanded])

  return (
    <div className="App">
      <h1>Virtual Scanner</h1>
      <div>
        <Button variant="contained" onClick={addItem}>Add scanner</Button>
        {items}
      </div>
      <div className="line">
        <HttpCall />
      </div>
      {!wsButtonStatus ? (
        <Button variant="contained" onClick={handleClick}>Show websocket status</Button>
        ) : (
        <>
          <Button variant="contained" onClick={handleClick}>Hide websocket status</Button>
          <div className="line">
            {!socketLoading && <WebSocketCall socket={socketInstance} />}
          </div>
        </>
      )}
    </div>
  );
}

export default App;

//<button onClick={handleClick}>Hide websocket status</button>