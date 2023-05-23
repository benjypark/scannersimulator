import * as React from 'react';
import { Stack, CssBaseline, Box, Button } from '@mui/material';
import { Circle } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

import io from "socket.io-client";

import "./App.css";
import JobModal from "./components/JobModal";
import JobList from "./components/JobList";
import TransitionAlert from "./components/TransitionAlert";

const theme = createTheme({
  palette: {
    // Torqoise: #025464
    // Orange: #E57C23
    // Yellow: #E8AA42
    // Bright pink: #F8F1F1
    '&.Mui-selected': {
      bgcolor: 'primary.dark',
      color: 'primary.text2',
    },
    background: {
      default: '#F8F1F1',
    },
    primary: {
      main: '#F8F1F1',
      bright: '#F8F1F1',
      dark: '#025464',
      text1: '#E57C23',
      text2: '#E8AA42',
      gray: '#999',
      lightgray: '#CCC',
      lightestgray: '#E6E6E6',
    },
    secondary: {
      main: '#025464',
    },
    lightgray: {
      main: '#DDD',
    },
  },
});

function App() {
  const [socket, setSocket] = React.useState("");
  const [socketLoading, setSocketLoading] = React.useState(true);
  const [postId, setPostId] = React.useState('');
  const [scpSettings, setScpSettings] = React.useState({});
  const [scpSettingsAetitle, setScpSettingsAetitle] = React.useState('');
  const [scpSettingsPort, setScpSettingsPort] = React.useState();
  const [openConfigDialog, setOpenConfigDialog] = React.useState(false);

  const onConfigureClicked = () => {
    setOpenConfigDialog(true);
  };

  const handleCloseConfigDialog = () => {
    setOpenConfigDialog(false);
  };
  
  const handleApplyConfiguration = () => {
  };
  
  const ScpSettings = () => {
    fetch(
      'http://qascanner.circlecvi.com:5000/api/scpsettings', {
        'methods':'GET', headers : { 'Content-Type':'application/json'}})
    .then((response) => response.json())
    .then((response) => setScpSettings(response))
    .catch(error => console.log(error));
  }

  React.useEffect(() => {
    ScpSettings();

    const socket = io("qascanner.circlecvi.com:5000");
    setSocket(socket);
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
  }, []);

  return (
    <div className="App">
      <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          p: 2,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 2,
          gridTemplateRows: 'auto',
          gridTemplateAreas: 
          `"header header header"
          "main main main"
          "footer footer footer"`, }}>
        <Box 
          sx={{ gridArea: 'header', color: 'primary.dark', bgcolor: 'primary.bright' }}
          display = "flex"
          justifyContent = "space-between">
          <Stack spacing={2} direction="row" justifyContent="flex-start" alignItems="center">
            <Circle fontSize="small" color="success" />
            <Button variant="text" color="secondary" size="small" sx={{textTransform: 'none'}}>
              <Box sx={{ fontFamily: 'default' }}>AETitle </Box>
              <Box sx={{ fontWeight: 'bold', fontFamily: 'Monospace', mx: 1 }}>{scpSettings.aetitle}</Box> 
              <Box sx={{ fontFamily: 'default' }}>listening on port </Box>
              <Box sx={{ fontWeight: 'bold', fontFamily: 'Monospace', mx: 1 }}>{scpSettings.port}</Box> 
            </Button>
          </Stack>
          <Stack spacing={2} direction="row" justifyContent="flex-end">
            <Button variant="outlined" color="secondary" size="small" style={{textTransform: 'none'}} onClick={onConfigureClicked}>Configuration</Button>
            <Dialog open={openConfigDialog} onClose={handleCloseConfigDialog}>
              <DialogTitle>Configuration</DialogTitle>
              <DialogContent>
                <DialogContentText
                  sx={{ m: 1 }}>
                </DialogContentText>
                <TextField
                  required
                  id="scpSettingsAetitle"
                  value={scpSettings.aetitle}
                  onChange = {(e) => {
                    setScpSettingsAetitle(e.target.value);
                  }}
                  label="AE Title"
                  defaultValue=""
                  variant="standard"
                  color="secondary"
                  size="small"
                  disabled
                  sx={{ m: 1, width: 150 }}
                />
                <TextField
                  required
                  id="scpSettingsPort"
                  value={scpSettings.port}
                  onChange = {(e) => {
                    setScpSettingsPort(e.target.value);
                  }}
                  label="Port"
                  defaultValue=""
                  variant="standard"
                  color="secondary"
                  size="small"
                  disabled
                  sx={{ m: 1, width: 100 }}
                />
              </DialogContent>
              <DialogActions>
                <Button disabled sx={{mt:2, mb:2}} variant="outlined" color="secondary" size="small" style={{textTransform: 'none'}} onClick={handleApplyConfiguration}>Apply</Button>
                <Button disabled sx={{mt:2, ml:2, mb:2}} variant="outlined" color="secondary" size="small" style={{textTransform: 'none'}} onClick={handleCloseConfigDialog}>Close</Button>
              </DialogActions>
            </Dialog>
          </Stack>
        </Box>
        <Box sx={{ gridArea: 'main', color: 'primary.dark', bgcolor: 'primary.bright', borderRadius: '16px' }}>
          <h4>Scanner Simulator</h4>
          {!socketLoading && <JobList postId={postId} setPostId={setPostId} socket={socket} />}
          {!socketLoading && <JobModal postId={postId} setPostId={setPostId} socket={socket} />}
        </Box>
        <Box sx={{ p:2, align: 'center', gridArea: 'footer',  color: 'primary.dark', bgcolor: 'primary.bright' }}>
          <Box display="flex" justifyContent="center">
            {!socketLoading && <TransitionAlert socket={socket} />}
          </Box>
          <Box>
            { <p>{scpSettings.label}</p> }
          </Box>
        </Box>
      </Box>
      </ThemeProvider>
    </div>
  );
}

export default App;