import React, { useState, useEffect } from "react";
import { Box } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import ExpandableTable from "../../components/ExpandableTable";
import ThermalSensorImage from "./ThermalSensorImage";
import { getLatestSensorAssignments } from "../../utilities/sensorUtil";

const Pods = () => {
  const [rooms, setPods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPods = async () => {
      setLoading(true);
      try {
        //const response = await fetch("http://192.168.4.1:3001/api/pods");
        const response = await fetch("http://localhost:3001/api/pods");
        const data = await response.json();
        
        // console.log("  *****   data  *** ");
        // 	      console.log(data);
        // console.log("  *****  end data *** ");

        // Transform the data to include a unique id for each room
        const podsArray = Object.entries(data).map(([key, value]) => ({
          id: key, // Use the original key ('pod_2', 'pod_3', etc.) as a unique id
          ...value,
        }));

        const updatedPodsArray = podsArray.map(pod => ({
          ...pod,
          sensors: getLatestSensorAssignments(pod.sensors),
        }));

         console.log("  *****  updated array *** ");
         console.log(updatedPodsArray);
         
         console.log("  *****  end updated array *** ");
         
	     
	      // Assuming the API returns an array of room objects
        setPods(Object.values(updatedPodsArray));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPods();
  }, []);

  const columns = [
    // { headerName: "Arrow", field: "arrow", width: "1em" }, // This is for the expand/collapse arrow
    { headerName: "Location", field: "location", width: 3 },
    { headerName: "Description", field: "description", width: 8 },
    // ... other columns with width as needed
  ];

  const renderRowDetail = (room) => {
    console.log('Room:', room);

    return (
      <div>
        {room.sensors.map((sensor) => {
          console.log('Sensor:', sensor);
          return <ThermalSensorImage key={sensor.sensor_id} sensorId={sensor.sensor_id} />;
        })}
      </div>
    );
  };

  return (
    <Box
      sx={{
        padding: (theme) => theme.spacing(2), // Add padding inside the Box
        width: "100%", // Set the width you desire for the Box
        maxWidth: "calc(100% - 32px)", // Max width with margin considered
        margin: "auto", // Center the Box if it's smaller than the viewport width
      }}
    >
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error}</Alert>}
      {!loading && !error && (
        <>
	  {console.log('Rooms:', rooms)}
	  <ExpandableTable
            columns={columns}
            data={rooms}
            renderRowDetail={renderRowDetail}
          />
        </>
      )}
    </Box>
  );
};
export default Pods;
