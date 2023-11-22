import * as React from "react";
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

import { BASE_URL } from '../constants';

function ScpList(props, ref) {
    const { modalJobStyle, ...other } = props;
    const [postId, setPostId] = React.useState('');
    const [postResult, setPostResult] = React.useState('')
    const [destinations, setDestinations] = React.useState([]);
    const [dest_name, setDestName] = React.useState('');
    const [dest_aetitle, setDestAETitle] = React.useState('');
    const [dest_port, setDestPort] = React.useState(104);
    const [selectedDestinationId, setSelectedDestinationId] = React.useState(0);
    const [open, setOpen] = React.useState(false);
  
    const handleOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };
  
    React.useImperativeHandle(ref, () => ({
      getState: () => ({
        selectedDestinationId
        })
    }));
  
    const handleListItemClick = (event, id) => {
      setSelectedDestinationId(id);
    };
  
    const getDestinations = () => {
      fetch(`${BASE_URL}/api/destinations`,{
        'methods':'GET',
        headers : {
          'Content-Type':'application/json'
        }
      })
        .then((response) => response.json())
        .then((response) => setDestinations(response))
        .catch(error => console.log(error))
    }
  
    const handleAddDestination = () => {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arg_dest_name: dest_name, arg_dest_aetitle: dest_aetitle, arg_dest_port: dest_port })
      };
      fetch(`${BASE_URL}/api/adddestination`, requestOptions)
        .then(response => response.json())
        .then(response => setPostId( response.success ));
    };
  
    const handleRemoveDestination = (destination) => {
      console.log("remove ", destination);
      const newList = destinations.filter((destinationOrig) => destinationOrig.id !== destination.id);
      setDestinations(newList);
  
      fetch(`${BASE_URL}/api/removedestination/` + destination.id, { method: 'POST' })
        .then(response => setPostId( response.success ));
    }
  
    const DestinationList = () => {
      return (
        destinations.map((destination, index) => (
        <ListItem 
          disablePadding
          secondaryAction={
            <IconButton 
              edge="end" aria-label="delete"
              onClick={() => handleRemoveDestination(destination)}>
              <DeleteIcon sx={{ color: 'primary.lightgray' }} />
            </IconButton>
          }>
          <ListItemButton 
            sx={{
              '&.Mui-selected': {
                borderColor: 'primary.text1',
                border: 1,
                borderRadius: 2,
                bgcolor: 'primary.bright',
                color: 'primary.text1',
            }}}
            selected={selectedDestinationId === destination.id}
            onClick={(event) => handleListItemClick(event, destination.id)}>
              <ListItemText 
                primary={destination.aetitle}
                secondary={destination.name + ':' + destination.port} />
          </ListItemButton>
        </ListItem>
      )))
    }
  
    React.useEffect(() => {
      setPostResult(postId)
      getDestinations()
      setOpen(false)
    }, [postId]);
  
    return (
      <React.Fragment>
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'primary.bright', color: 'primary.dark' }}>
          <List>
            <DestinationList/>
          </List>
        </Box>
  
        <Button variant="outlined" color="secondary" size="small" style={{textTransform: 'none'}} onClick={handleOpen}>Add a remote DICOM node</Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="child-modal-title"
          aria-describedby="child-modal-description"
        >
          <Box sx={{ ...modalJobStyle, width: 260, height: 330 }}>
            <h2 id="child-modal-title">New destination (SCP)</h2>
            <div>
              <TextField
                required
                id="dest_name"
                value={dest_name}
                onChange = {(e) => {
                  setDestName(e.target.value);
                }}
                label="Hostname"
                defaultValue=""
                variant="standard"
                color="secondary"
              />
              <TextField
                required
                id="dest_aetitle"
                value={dest_aetitle}
                onChange = {(e) => {
                  setDestAETitle(e.target.value);
                }}              
                label="AE Title"
                defaultValue=""
                variant="standard"
                color="secondary"
              />
              <TextField
                required
                id="dest_port"
                value={dest_port}
                onChange = {(e) => {
                  setDestPort(e.target.value);
                }}
                label="Port"
                defaultValue=""
                variant="standard"
                color="secondary"
              />
            </div>
            <Button sx={{mt:2, mb:2}} variant="outlined" color="secondary" size="small" style={{textTransform: 'none'}} onClick={handleAddDestination}>Add</Button>
            <Button sx={{mt:2, ml:2, mb:2}} variant="outlined" color="secondary" size="small" style={{textTransform: 'none'}} onClick={handleClose}>Close</Button>
            {/* <p>
            {postResult}
            </p> */}
          </Box>
        </Modal>
      </React.Fragment>
    );
};

export default React.forwardRef(ScpList);