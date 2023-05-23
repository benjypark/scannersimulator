import * as React from "react";
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';

function JobSchedule(props, ref) {
    const [loop, setLoop] = React.useState(false)
    const [loopHours, setLoopHours] = React.useState(0)
    const [scheduleEnabled, setScheduleEnabled] = React.useState(false)
    const [startTime, setStartTime] = React.useState('')
    const [repeatInterval, setRepeatInterval] = React.useState('')
    const [dayOfWeek, setDayOfWeek] = React.useState('')
    
    const handleLoop = (event) => {
      setLoop(event.target.checked);
    };

    const handleScheduleEnabled = (event) => {
      setScheduleEnabled(event.target.checked);
    };

    const handleRepeatInterval = (event) => {
      setRepeatInterval(event.target.value);
    };

    const handleStartTime = (event) => {
      setStartTime(event.target.value);
    };

    const handleDayOfWeek = (event) => {
      setDayOfWeek(event.target.value);
    };

    React.useImperativeHandle(ref, () => ({
      getState: () => ({
        loop,
        loopHours,
        scheduleEnabled,
        repeatInterval,
        startTime,
        dayOfWeek
        })
    }));
  
    return (
      <div>
        <FormGroup sx={{ ml: 2, mr: 2, display:'flex', flexDirection: 'row' }}>
          <FormControlLabel control={<Switch 
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { 
                color: 'primary.text2',},
            }} value={loop} onChange={handleLoop}/>} label="Loop" />
            { (loop) &&
            <TextField
            required
            disabled={!loop}
            id="loopHours"
            value={loopHours}
            onChange = {(e) => {
              setLoopHours(e.target.value);
            }}
            label="Hours"
            variant="standard"
            color="secondary"
            size="small"
            inputProps={{ type: 'number', min: -1, max: 72 }}
            sx={{ ml: 1, width: 50 }}
          />
          }
         </FormGroup>
         <FormGroup sx={{ ml: 2, mr: 2, display:'flex', flexDirection: 'row' }}>
          <FormControlLabel control={<Switch 
            sx={{
              '& .MuiSwitch-switchBase.Mui-checked': { 
                color: 'primary.text2',},
            }} value={scheduleEnabled} onChange={handleScheduleEnabled}/>} label="Schedule job (under development)" />
         </FormGroup>
         { (scheduleEnabled) &&
         <FormGroup sx={{ ml: 2, mr: 2, display:'flex', flexDirection: 'row' }}>
          <FormControl sx={{ ml: 6, mt: 1, minWidth: 120 }}>
              <InputLabel size="small">Repeat</InputLabel>
                <Select
                  size="small"
                  id="job-options-study-repeat-interval-select"
                  value={repeatInterval}
                  label="Run"
                  onChange={handleRepeatInterval}
                >
                  <MenuItem value={'daily'}>Daily</MenuItem>
                  <MenuItem value={'weekly'}>Weekly</MenuItem>
                </Select>
              </FormControl>
              <FormControl sx={{ ml: 2, mt: 1, minWidth: 120 }}>
                <InputLabel size="small">Time</InputLabel>
                <Select
                  size="small"
                  id="job-options-job-start-time"
                  value={startTime}
                  label="Time"
                  onChange={handleStartTime}
                >
                  <MenuItem value={'00:00'}>00:00</MenuItem>
                  <MenuItem value={'01:00'}>01:00</MenuItem>
                  <MenuItem value={'02:00'}>02:00</MenuItem>
                  <MenuItem value={'03:00'}>03:00</MenuItem>
                  <MenuItem value={'04:00'}>04:00</MenuItem>
                  <MenuItem value={'05:00'}>05:00</MenuItem>
                  <MenuItem value={'06:00'}>06:00</MenuItem>
                  <MenuItem value={'07:00'}>07:00</MenuItem>
                  <MenuItem value={'08:00'}>08:00</MenuItem>
                  <MenuItem value={'09:00'}>09:00</MenuItem>
                  <MenuItem value={'10:00'}>10:00</MenuItem>
                  <MenuItem value={'11:00'}>11:00</MenuItem>
                  <MenuItem value={'12:00'}>12:00</MenuItem>
                  <MenuItem value={'13:00'}>13:00</MenuItem>
                  <MenuItem value={'14:00'}>14:00</MenuItem>
                  <MenuItem value={'15:00'}>15:00</MenuItem>
                  <MenuItem value={'16:00'}>16:00</MenuItem>
                  <MenuItem value={'17:00'}>17:00</MenuItem>
                  <MenuItem value={'18:00'}>18:00</MenuItem>
                  <MenuItem value={'19:00'}>19:00</MenuItem>
                  <MenuItem value={'20:00'}>20:00</MenuItem>
                  <MenuItem value={'21:00'}>21:00</MenuItem>
                  <MenuItem value={'22:00'}>22:00</MenuItem>
                  <MenuItem value={'23:00'}>23:00</MenuItem>
                </Select>
              </FormControl>
              { (repeatInterval === 'weekly') &&
              <FormControl sx={{ ml: 2, mt: 1, minWidth: 120 }}>
                <InputLabel size="small">Day</InputLabel>
                <Select
                  size="small"
                  id="job-options-job-interval-day"
                  value={dayOfWeek}
                  label="Day"
                  onChange={handleDayOfWeek}
                >
                  <MenuItem value={'monday'}>Monday</MenuItem>
                  <MenuItem value={'tuesday'}>Tuesday</MenuItem>
                  <MenuItem value={'wednesday'}>Wednesday</MenuItem>
                  <MenuItem value={'thursday'}>Thursday</MenuItem>
                  <MenuItem value={'friday'}>Friday</MenuItem>
                  <MenuItem value={'saturday'}>Saturday</MenuItem>
                  <MenuItem value={'sunday'}>Sunday</MenuItem>
                </Select>
              </FormControl>
            }
            </FormGroup>
          }
      </div>
    );
  };

  export default React.forwardRef(JobSchedule);