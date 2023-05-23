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

function ScuList(props, ref) {
    const { modalJobStyle, ...other } = props;
    const [open, setOpen] = React.useState(false);
    const [scanner_name, setScannerName] = React.useState('');
    const [scanner_aetitle, setScannerAETitle] = React.useState('');
    const [postId, setPostId] = React.useState('');
    const [postResult, setPostResult] = React.useState('')
    const [scanners, setScanners] = React.useState([]);
    const [selectedScannerId, setSelectedScannerId] = React.useState(0);
  
    const handleOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };
  
    React.useImperativeHandle(ref, () => ({
      getState: () => ({
        selectedScannerId
        })
    }));
  
    const getScanners = () => {
      fetch('http://qascanner.circlecvi.com:5000/api/scanners',{
        'methods':'GET',
        headers : {
          'Content-Type':'application/json'
        }
      })
        .then((response) => response.json())
        .then((response) => setScanners(response))
        .catch(error => console.log(error))
    }
   
    const handleAddScanner = () => {
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ arg_scanner_name: scanner_name, arg_scanner_aetitle: scanner_aetitle })
      };
      fetch('http://qascanner.circlecvi.com:5000/api/addscanner', requestOptions)
        .then(response => response.json())
        .then(response => setPostId( response.success ));
    };
  
    const handleRemoveScanner = (scanner) => {
      console.log("remove ", scanner);
      const newList = scanners.filter((scannerOrig) => scannerOrig.id !== scanner.id);
      setScanners(newList);
  
      fetch('http://qascanner.circlecvi.com:5000/api/removescanner/' + scanner.id, { method: 'POST' })
        .then(response => setPostId( response.success ));
    }
  
    const handleListItemClick = (event, id) => {
      setSelectedScannerId(id);
    };
  
    const ScannerList = () => {
      return (
        scanners.map((scanner, index) => (
        <ListItem 
          disablePadding
          secondaryAction={
            <IconButton 
              edge="end" aria-label="delete"
              onClick={() => handleRemoveScanner(scanner)}>
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
            selected={selectedScannerId === scanner.id}
            onClick={(event) => handleListItemClick(event, scanner.id)}>
              <ListItemText 
                secondary={scanner.name} 
                primary={scanner.aetitle} />
          </ListItemButton>
        </ListItem>
      )))
    }
  
    React.useEffect(() => {
      setPostResult(postId)
      getScanners()
      setOpen(false)
    }, [postId]);
  
    return (
      <React.Fragment>
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'primary.bright', color: 'primary.dark' }}>
          <List>
            <ScannerList/>
          </List>
        </Box>
        <Button 
          variant="outlined" 
          color="secondary" 
          size="small" 
          style={{textTransform: 'none'}} 
          onClick={handleOpen}>Add Scanner</Button>
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="child-modal-title"
          aria-describedby="child-modal-description"
        >
          <Box sx={{ ...modalJobStyle, width: 260, height: 280 }}>
            <h2 id="child-modal-title">New Sender (SCU)</h2>
            <div>
              <TextField
                required
                id="scanner_name"
                value={scanner_name}
                onChange = {(e) => {
                  setScannerName(e.target.value);
                }}
                label="Name"
                defaultValue=""
                variant="standard"
                color="secondary"
              />
              <TextField
                required
                id="scanner_aetitle"
                value={scanner_aetitle}
                onChange = {(e) => {
                  setScannerAETitle(e.target.value);
                }}              
                label="AE Title"
                defaultValue=""
                variant="standard"
                color="secondary"
              />
            </div>
            <Button sx={{mt:2, mb:2}}  variant="outlined" color="secondary" size="small" style={{textTransform: 'none'}} onClick={handleAddScanner}>Add</Button>
            <Button sx={{mt:2, ml:2, mb:2}}  variant="outlined" color="secondary" size="small" style={{textTransform: 'none'}} onClick={handleClose}>Close</Button>
            <div>
              {postResult}
            </div>
          </Box>
        </Modal>
      </React.Fragment>
    );
  };

  export default React.forwardRef(ScuList);