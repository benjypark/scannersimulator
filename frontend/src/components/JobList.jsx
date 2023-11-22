import * as React from "react";
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Collapse from '@mui/material/Collapse';
import Typography from '@mui/material/Typography';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import StopIcon from '@mui/icons-material/Stop';
import EastIcon from '@mui/icons-material/East';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

import { BASE_URL } from '../constants';

export default function JobList( {socket, postId, setPostId} ) {
    const [jobs, setJobs] = React.useState([]);
    const [status, setStatus] = React.useState({});
    const [messages, setMessages] = React.useState({});
    const [expanded, setExpanded] = React.useState({});

    const getJobs = () => {
        fetch(`${BASE_URL}/api/jobs`,{
        'methods':'GET',
        headers : {
            'Content-Type':'application/json'
        }
        })
        .then((response) => response.json())
        .then((response) => setJobs(response))
        .catch(error => console.log(error))
    }

    const handleExpandJob = (job_id) => {
        setExpanded({...expanded, [job_id]: !expanded[job_id]});
    }

    const handleStartJob = (job) => {
        fetch(`${BASE_URL}/api/startjob/` + job.id, { method: 'POST' })
        .then(response => setPostId( response.success ));
    }

    const handlePauseJob = (job) => {
        fetch(`${BASE_URL}/api/pausejob/` + job.id, { method: 'POST' })
        .then(response => setPostId( response.success ));
    }

    const handleStopJob = (job) => {
        fetch(`${BASE_URL}/api/stopjob/` + job.id, { method: 'POST' })
        .then(response => setPostId( response.success ));
    }

    const handleRemoveJob = (job) => {
        console.log("remove ", job);
        const newList = jobs.filter((jobOrig) => jobOrig.id !== job.id);
        setJobs(newList);

        fetch(`${BASE_URL}/api/removejob/` + job.id, { method: 'DELETE' })
        .then(response => setPostId( response.success ));
    }

    React.useEffect(() => {
        socket.on("data", (data) => {
            setStatus((prevStatus) => {
                return {...prevStatus, [data.job_id]: data.status};
            });
            setMessages((prevMessages) => {
                return {...prevMessages, [data.job_id]: data.msg};
            });
        });
    }, [socket]);

    React.useEffect(() => {
        getJobs()
    }, [postId]);

    const ExpandMore = styled((props) => {
        const { expand, ...other } = props;
        return <IconButton {...other} />;
      })(({ theme, expand }) => ({
        transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
        marginLeft: 'auto',
        transition: theme.transitions.create('transform', {
          duration: theme.transitions.duration.shortest,
        }),
      }));

    const Jobs = () => {
        return (
        jobs.map((job, index) => (
        <Card sx={{ width: 550, m: 3, display: 'flex', border:1, bgcolor: 'primary.bright', color: 'primary.dark'}}>
        <Box>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, mr: 2, pl: 1, pb: 1 }}>
                { status[job.id] === 1 ? <CircularProgress color="secondary" /> :
                  status[job.id] === 2 ? <CircularProgress color="warning" /> :
                  status[job.id] === 4 ? <CircularProgress color="secondary" variant="determinate" value={100} /> :
                    <CircularProgress color="lightgray" variant="determinate" value={100} /> }
                </Box>
                <Box>
                <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography component="div" variant="h5">
                        {job.name}
                    </Typography>
                    <Typography  variant="subtitle1" color="primary.text1" component="div">
                        {job.modality_aetitle} <EastIcon fontSize="x-small"/> {job.dicomnode_aetitle}
                    </Typography >
                </CardContent>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', ml: 2, mr: 2, pl: 1, pb: 1 }}>
                    <IconButton onClick={() => handleStartJob(job)}>
                        <PlayArrowIcon sx={{ color: 'primary.dark', height: 38, width: 38 }} />
                    </IconButton>
                    <IconButton onClick={() => handlePauseJob(job)}>
                        <PauseIcon sx={{ color: 'primary.dark', height: 38, width: 38 }} />
                    </IconButton>
                    <IconButton onClick={() => handleStopJob(job)}>
                        <StopIcon sx={{ color: 'primary.dark', height: 38, width: 38 }} />
                    </IconButton>
                    <IconButton onClick={() => handleRemoveJob(job)}>
                        <DeleteIcon sx={{ color: 'primary.lightgray' }} />
                    </IconButton>
                    <ExpandMore
                        expand={expanded[job.id]}
                        onClick={() => handleExpandJob(job.id)}>
                        <ExpandMoreIcon />
                    </ExpandMore>
                </Box>
            </Box>
            <Box sx={{ ml: 1, mr: 1, align: 'center' }}>
                <Collapse in={expanded[job.id]} timeout="auto" unmountOnExit>
                    <Box sx={{ 
                        bgcolor: 'primary.bright',
                        color: 'primary.dark',
                        border: '0px',
                        pb: 2,
                        pl: 1,
                        pr: 1,
                        width: '95%'}}> 
                        <Typography sx={{ mb: 1 }} align="left" fontSize="small" color="secondary" component="div">
                            <b>Options</b>
                        </Typography>
                        <Typography align="left" fontSize="small" color="gray" component="div">
                            <p><b>Replace UID: </b>{job.option_replace_uid ? 'Yes' : 'No'}</p>
                            <p><b>Replace PHI: </b>{job.option_replace_phi ? 'Yes' : 'No'}</p>
                            <p><b>Study interval: </b>{job.option_study_interval} mins</p>
                            <p><b>Series interval: </b>{job.option_series_interval} mins</p>
                            <p><b>Loop: </b>{job.schedule_loop ? 'Yes, for ' + job.schedule_loop_hours + ' hours': 'No'}</p>
                            <p><b>Schedule: </b>{job.schedule_enabled ? 'Yes, ' + job.schedule_repeat_interval + ' starting at ' + job.schedule_start_time : 'No'}</p>
                        </Typography>    
                    </Box>
                    <Box sx={{ 
                        bgcolor: 'primary.bright',
                        color: 'primary.dark',
                        border: '0px',
                        pb: 2,
                        pl: 1,
                        pr: 1,
                        width: '95%'}}> 
                        <Typography sx={{ mb: 1 }} align="left" fontSize="small" color="secondary" component="div">
                            <b>Log</b>
                        </Typography>
                        <Box sx={{ 
                        bgcolor: 'primary.lightestgray',
                        color: 'primary.dark',
                        border: '0px',
                        borderColor: 'primary.dark',
                        p: 1,
                        borderRadius: 2,
                        width: '100%'}}> 
                        <Typography sx={{ ml: 1 }} align="left" fontSize="small" color="gray" component="div">
                            {messages[job.id]}
                        </Typography>    
                        </Box>
                    </Box>

                </Collapse>
            </Box>
        </Box>
        </Card>
        )))
    }

    return (
        <div align="center">
        <Jobs />
        </div>
    );
}