import * as React from "react";
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Modal from '@mui/material/Modal';
import Grid from '@mui/material/Grid';

import StudyList from "./StudyList";
import ScuList from "./ScuList";
import ScpList from "./ScpList";
import JobOptions from "./JobOptions";
import JobSchedule from "./JobSchedule";
import { BASE_URL } from '../constants';

const modalJobStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 900,
  bgcolor: 'primary.bright',
  color: 'primary.dark',
  border: '1px solid primary.dark',
  boxShadow: 12,
  pt: 2,
  px: 4,
  pb: 3,
};

function BoxTemplate(props) {
  const { sx, ...other } = props;
  return (
    <Box
      sx={{
        bgcolor: 'primary.bright',
        color: 'primary.dark',
        border: '1px solid',
        borderColor: 'primary.dark',
        p: 1,
        m: 1,
        borderRadius: 2,
        fontSize: '0.875rem',
        fontWeight: '700',
        ...sx,
      }}
      {...other}
    />
  );
}

export default function JobModal({ socket, postId, setPostId }) { 
  const [openDialog, setOpenDialog] = React.useState(false);
  const [messages, setMessages] = React.useState({});
  
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  React.useEffect(() => {
    setOpenDialog(false)
  }, [postId]);

  React.useEffect(() => {
    socket.on("data", (data) => {
      if (data.job_id)
        setMessages({...messages, 
          [data.job_id]: data.msg + " " + data.uid});
        console.log(messages)
    });
  }, [socket, messages]);

  const scannerStateRef = React.useRef();
  const destinationStateRef = React.useRef();  
  const studyStateRef = React.useRef();
  const optionStateRef = React.useRef(); 
  const scheduleStateRef = React.useRef(); 

  const handleAddJob = () => {
    console.log("handleAddJob called!");
    const scanner_id = scannerStateRef.current.getState();
    const destination_id = destinationStateRef.current.getState();
    const study_ids = studyStateRef.current.getState();
    const options = optionStateRef.current.getState();
    const schedule = scheduleStateRef.current.getState();

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        arg_scanner_id: scanner_id, 
        arg_destination_id: destination_id,
        arg_study_ids: study_ids,
        arg_options: options,
        arg_schedule: schedule
       })
    };
    fetch(`${BASE_URL}/api/addjob`, requestOptions)
      .then(response => response.json())
      .then(response => setPostId( response.success ));
  };

  return (
    <div>
      <Button 
        variant="contained" 
        color="secondary" 
        size="large" 
        sx={{
          m: 2,
          width: 150, 
          textTransform: 'none'
        }} 
        onClick={handleOpenDialog}>New job</Button>
      <Modal
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="parent-modal-title"
        aria-describedby="parent-modal-description"
      >
        <Box sx={{ ...modalJobStyle, width: 1200, height: 800 }}>
          <h2 id="parent-modal-title">Add a job</h2>
          <p id="parent-modal-description">
            Choose a scanner, destination, studies to send.
          </p>

          <Grid container>
            <Grid item xs={3}>
              <Grid item xs={12}><BoxTemplate sx={{maxHeight: 200, overflow: 'auto'}}>Choose sender (SCU)<ScuList modalJobStyle={modalJobStyle} ref={scannerStateRef} /></BoxTemplate></Grid>
              <Grid item xs={12}><BoxTemplate sx={{maxHeight: 200, overflow: 'auto'}}>Choose destination (SCP)<ScpList modalJobStyle={modalJobStyle} ref={destinationStateRef} /></BoxTemplate></Grid>
            </Grid>
            <Grid item xs={9}>
              <Grid item xs={12}><BoxTemplate><StudyList ref={studyStateRef} /></BoxTemplate></Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid item xs={12}><BoxTemplate>Options<JobOptions ref={optionStateRef} /></BoxTemplate></Grid>
            </Grid>
            <Grid item xs={6}>
              <Grid item xs={12}><BoxTemplate>Schedule<JobSchedule ref={scheduleStateRef} /></BoxTemplate></Grid>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" justifyContent="center">
                <Button 
                  variant="contained" 
                  color="secondary" 
                  sx={{
                    width: 150,
                    textTransform: 'none',
                    m: 1,
                  }} 
                  size="medium"
                  onClick={handleAddJob}>Add job</Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </div>
  );
}