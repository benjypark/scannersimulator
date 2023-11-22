import * as React from "react";
import { DataGrid } from '@mui/x-data-grid';
import Button from '@mui/material/Button';

import { BASE_URL } from '../constants';

function StudyList(props, ref) {

    const [studies, setStudies] = React.useState([])
    const [selectedStudyIds, setSelectedStudyIds] = React.useState([]);
    const [postId, setPostId] = React.useState('');

    React.useImperativeHandle(ref, () => ({
      getState: () => ({
        selectedStudyIds
        })
    }));

    const handleDeleteSelectedRows = () => {
      
      const payload = {
        selectedStudyIds: selectedStudyIds,
      };

      // Perform the deletion logic here using the selectedStudyIds
      fetch(`${BASE_URL}/api/removestudies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload) 
      })
      .then(response => setPostId( response.success ));

      const updatedStudies = studies.filter((study) => !selectedStudyIds.includes(study.id));
      // Assuming studies is an array of objects with an "id" property
  
      // Update the state with the updated studies
      setStudies(updatedStudies);
  
      // Clear the selection
      setSelectedStudyIds([]);
    };
  
    const studyCols = 
    [
      {
        field: 'patient_name',
        headerName: 'Patient Name',
        headerClassName: 'header',
        width: 200,
      },
      {
        field: 'study_desc',
        headerName: 'Study Desc',
        headerClassName: 'header',
        width: 250,
      },
      {
        field: 'study_date',
        headerName: 'Study Date',
        headerClassName: 'header',
      },
      {
        field: 'modality',
        headerName: 'Modality',
        headerClassName: 'header',
      },
      {
        field: 'filesize',
        type: 'number',
        headerName: 'Size (MB)',
        headerClassName: 'header',
        width: 100,
      },
    ];
  
    React.useEffect(() => {
      fetch(`${BASE_URL}/api/studies`)
        .then((response) => response.json())
        .then((response) => setStudies(response))
    }, [])
    
    return (
      <div style={{ width: '100%' }}>
        {Object.keys(studies).length > 0 ? (
          <>
          <DataGrid
            rows={studies}
            columns={studyCols}
            initialState={{
              pagination: {
                paginationModel: { page: 0, pageSize: 5 },
              },
            }}
            pageSizeOptions={[5, 10]}
            checkboxSelection
            onRowSelectionModelChange={(selection) => {
              setSelectedStudyIds(selection);
            }}
            sx={{
              width: '100%',
              color: 'primary.dark',
              border: 0,
              "& .MuiCheckbox-root.Mui-checked": {
                color: "primary.text1",
              },
              // '& .header': {
              //   backgroundColor: 'rgba(255, 7, 0, 0.55)',
              // },
            }}
          />
          {selectedStudyIds.length > 0 && (
            <Button 
              variant="outlined" 
              color="secondary" 
              size="small" 
              style={{textTransform: 'none'}} 
              onClick={handleDeleteSelectedRows}>Delete selected studies</Button>
          )}
          </>
          ) :
          <p align="center">No studies exist yet.</p>}
      </div>
    );
}; 

export default React.forwardRef(StudyList);