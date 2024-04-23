import { useState, useEffect } from "react";
import FullCalendar, { formatDate } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { Box, Typography, RadioGroup, FormControlLabel, Radio } from "@mui/material";
import Header from "../../components/Header";

const CalendarView = () => {
  const [currentEvents, setCurrentEvents] = useState([]);
  const [selectedSensor, setSelectedSensor] = useState('Sensor1');
  const [currentDate, setCurrentDate] = useState(new Date());  // Default to today's date
  const [sensors, setSensors] = useState([]); // Define state for sensors

  useEffect(() => {
    async function init() {
      const sensorIds = await fetchSensorIds();
      setSensors(sensorIds);  // Update state with fetched sensor IDs
      if (sensorIds.length > 0) {
        setSelectedSensor(sensorIds[0]);  // Optionally set the first sensor as selected
      }
    }

    init();
  }, []);

  useEffect(() => {
    if (selectedSensor && currentDate) {
      fetchSensorData(selectedSensor, currentDate);
    }
  }, [selectedSensor, currentDate, fetchSensorData]);

  async function fetchSensorIds() {
    try {
      const response = await fetch('http://192.168.4.1:3001/api/sensors', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch sensor IDs');
      }
  
      const sensors = await response.json();
      
      // Assuming sensors is an array of objects with sensor_id as a key
      const sensorIds = sensors.map(sensor => sensor.sensor_id);
  
      return sensorIds;
    } catch (error) {
      console.error('Error fetching sensor IDs:', error);
      // Handle the error appropriately, possibly returning an empty array or a default value
      return [];
    }
  }
  
  const fetchSensorData = useCallback(async (sensorId, date) => {
    const startDate = new Date(date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 1);
  
    try {
      const response = await fetch(`http://192.168.4.1:3001/api/predictions?sensorId=${sensorId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch sensor data');
      }
  
      const data = await response.json();
      const events = data.map(entry => {
        const status = parsePredictionResult(entry.prediction_result);
        const color = status === 'occupied' ? 'red' : status === 'available' ? 'white' : 'transparent';
        
        return ({
        start: new Date(entry.prediction_time).toISOString(),
        end: new Date(new Date(entry.prediction_time).getTime() + 60000).toISOString(),
        display: 'background',
        backgroundColor: entry.status === 'occupied' ? 'red' : 'white'
      })});
  
      setCurrentEvents(events);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
    }
  }, []); // Empty dependency array ensures it's created once
  
  // Adjust this function based on how prediction_result is structured and stored
  function parsePredictionResult(predictionResult) {
    // Example: If prediction_result is a JSON string with a `status` field
    try {
      const result = JSON.parse(predictionResult);
      let ret = "no result data";
      if (result.result === 0)
        ret = "available";
      if (result.result === 1)
        ret = "occupied";
      return ret;

    } catch (error) {
      console.error('Error parsing prediction result:', error);
      return 'no data'; // Default fallback
    }
  }
  
  const fetchMockSensorData = (sensor) => {
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Start at midnight
  
    const mockData = [];
    for (let i = 0; i < 24 * 60; i++) { // 24 hours * 60 minutes
      const timestamp = new Date(startDate.getTime() + i * 60000); // Increment by one minute
      let status;
      
      // Define power outage period
      const powerOutageStart = new Date(startDate.getTime()).setHours(19, 13, 0, 0);
      const powerOutageEnd = new Date(startDate.getTime()).setHours(19, 30, 0, 0);
      
      // Check if current time is within the power outage
      if (timestamp >= powerOutageStart && timestamp <= powerOutageEnd) {
        status = 'no data';
      } else {
        const hour = timestamp.getHours();
        const min = timestamp.getMinutes();
        // Set status based on the time of the day
        if (hour >= 9 && hour < 17) { // 9 AM to 5 PM
          status = Math.random() < 0.3 ? 'occupied' : 'available'; // 30% chance of being occupied
        } else { // Outside of work hours
          status = Math.random() < 0.05 ? 'occupied' : 'available'; // 5% chance of being occupied
        }

        if (hour >=12 && hour < 13) {
          status = 'occupied';
        }

        if (hour === 12 && min>= 30 && min <= 33) {
          status = 'available';
        }
      }
      
      mockData.push({ timestamp: timestamp.toISOString(), status });
    }
  
    // Map mock data to events for FullCalendar
    const events = mockData.map(data => {
      const color = data.status === 'occupied' ? 'red' : data.status === 'available' ? 'white' : 'transparent';
      return {
        start: data.timestamp,
        end: new Date(new Date(data.timestamp).getTime() + 60000).toISOString(), // 1 minute later
        display: 'background', // Use background events to create thin lines
        backgroundColor: color
      };
    });
  
    setCurrentEvents(events);
  };
  
  
// Custom rendering function for events
const renderEventContent = (eventInfo) => {
  return (
    <div style={{
      width: '50%', // Set the width to 50% of the parent container
      marginLeft: '25%', // Set left margin to 25% to center the bar within the container
      height: '1px', // Set a small height for the bar, making it a thin line
      backgroundColor: eventInfo.backgroundColor, // Use the event's background color
      position: 'absolute', // Position absolutely within the parent container
      top: '50%', // Align at the center of the time slot vertically
      transform: 'translateY(-50%)' // Ensure the line is centered by adjusting for its own height
    }} />
  );
};


  const handleSensorChange = (event) => {
    setSelectedSensor(event.target.value);
  };

  return (
    <>
      <style>
        {`
          .fc-timegrid-slot, .fc-timegrid-slot-label {
            height: 4px !important;
          }

          .fc-timegrid-slot {
            line-height: 4px !important;
          }
        `}
      </style>
    <Box m="20px">
      <Header title="Historic Data" subtitle="Sensor Data Visualization" />

      <Box display="flex" justifyContent="space-between">
        {/* Sensor Selection Sidebar */}
        <Box flex="1 1 20%" p="15px" borderRadius="4px" sx={{ border: '1px solid #ccc' }}>
          <Typography variant="h5">Sensors</Typography>
          <RadioGroup value={selectedSensor} onChange={handleSensorChange}>
            {sensors.map(sensor => (
              <FormControlLabel key={sensor} value={sensor} control={<Radio />} label={sensor} />
            ))}
          </RadioGroup>
        </Box>

        {/* FullCalendar for displaying sensor data */}
        <Box flex="1 1 75%" ml="15px">
          <FullCalendar
            height="75vh"
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            initialView="timeGridDay"
            datesSet={(dateInfo) => {
              setCurrentDate(dateInfo.start);
            }}
            slotMinTime="00:00:00" // Start at midnight to allow viewing all 24 hours
            slotMaxTime="24:00:00" // End at the close of the 24th hour
            slotDuration="00:01:00"
            scrollTime="09:00:00" // Scroll to 9 AM by default

            editable={false}
            selectable={false}
            events={currentEvents}
            eventContent={renderEventContent} // Add this line
          />
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default CalendarView;
