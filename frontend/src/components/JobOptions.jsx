import * as React from "react";
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';

function JobOptions(props, ref) {
    const [replaceUid, setReplaceUid] = React.useState(false)
    const [replacePhi, setReplacePhi] = React.useState(false)
    const [studyInterval, setStudyInterval] = React.useState(0)
    const [seriesInterval, setSeriesInterval] = React.useState(0)
    const [jobName, setJobName] = React.useState('');
    
    const handleReplaceUid = (event) => {
      console.log(event.target.checked);
      setReplaceUid(event.target.checked);
    };
    
    const handleReplacePhi = (event) => {
      console.log(event.target.checked);
      setReplacePhi(event.target.checked);
    };

    const handleStudyInterval = (event) => {
      console.log(event.target.value);
      setStudyInterval(event.target.value);
    };
  
    const handleSeriesInterval = (event) => {
      console.log(event.target.value);
      setSeriesInterval(event.target.value);
    };
  
    React.useImperativeHandle(ref, () => ({
      getState: () => ({
        jobName,
        replaceUid,
        replacePhi,
        studyInterval,
        seriesInterval
        })
    }));
  
    return (
      <div>
        <Box sx={{ ml: 2, mr: 2, display:'flex', flexDirection: 'row' }}>
          <TextField
            required
            id="jobName"
            value={jobName}
            onChange = {(e) => {
              setJobName(e.target.value);
            }}
            label="Job name (or description)"
            defaultValue=""
            variant="standard"
            color="secondary"
            size="small"
            sx={{ minWidth: 200 }}
          />
          <FormControl sx={{ ml: 4, mr: 2, minWidth: 120 }}>
            <InputLabel size="small">Study Interval</InputLabel>
              <Select
                size="small"
                id="job-options-study-interval-select"
                value={studyInterval}
                label="Study Interval"
                onChange={handleStudyInterval}
              >
                <MenuItem value={0}>0 min</MenuItem>
                <MenuItem value={1}>1 mins</MenuItem>
                <MenuItem value={5}>5 mins</MenuItem>
                <MenuItem value={10}>10 mins</MenuItem>
                <MenuItem value={20}>20 mins</MenuItem>
                <MenuItem value={30}>30 mins</MenuItem>
                <MenuItem value={60}>1 hr</MenuItem>
                <MenuItem value={120}>2 hr</MenuItem>
              </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel size="small">Series Interval</InputLabel>
              <Select
                size="small"
                id="job-options-series-interval-select"
                value={seriesInterval}
                label="Series Interval"
                onChange={handleSeriesInterval}
              >
                <MenuItem value={0}>0 min</MenuItem>
                <MenuItem value={1}>1 mins</MenuItem>
                <MenuItem value={5}>5 mins</MenuItem>
                <MenuItem value={10}>10 mins</MenuItem>
                <MenuItem value={20}>20 mins</MenuItem>
                <MenuItem value={30}>30 mins</MenuItem>
              </Select>
            </FormControl>
        </Box>
        <Box sx={{ m: 2, display:'flex', flexDirection: 'row' }}>
        <FormGroup sx={{ display:'flex', flexDirection: 'row' }}>
            <FormControlLabel control={<Switch 
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { 
                  color: 'primary.text2',
                },
              }} value={replaceUid} onChange={handleReplaceUid}/>} label="Replace Study/Series/SOP Instance UIDs" />
             <FormControlLabel control={<Switch 
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': { 
                  color: 'primary.text2',
                },
              }} value={replacePhi} onChange={handleReplacePhi}/>} label="Replace PHI" />
           </FormGroup>
        </Box>
      </div>
    );
  };

  export default React.forwardRef(JobOptions);