import React, { useState, useEffect } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import Heatmap from "../heatmap";

const Readings = () => {
  const [readingsData, setReadingsData] = useState([]);
  const [readingData, setReadingData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overlayImage, setOverlayImage] = useState(null);
  const [thermalContent, setThermalContent] = useState(null);

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const handleRowClick = async (params) => {
    setReadingData(params.row);
    setOverlayImage(null);
    setThermalContent(null);

    if (params.row.data_type_id === 3) {
      try {
        const response = await fetch(
          `http://192.168.4.1:3001/get-thermal/${params.row.id}`
          //`localhost:3001/get-thermal/${params.row.id}`
        );

        if (response.ok) {
          const fileContent = await response.text();

          // Replace escaped newlines with actual newline characters
          const normalizedContent = fileContent.replace(/\\n/g, "\n");

          // Step 1: Split the content by line breaks
          const rows = normalizedContent.trim().split(/\r?\n/);
          console.log("got " + rows.length + " rows");
          console.log(rows);

          // Step 2 and 3: Transform rows into the desired format
          const data = [];
          rows.forEach((row, rowIndex) => {
            const numbers = row.split(/\s+/).map(Number);
            numbers.forEach((number, colIndex) => {
              data.push({
                x: colIndex,
                y: rowIndex,
                value: number,
              });
            });
          });

          console.log(data);
          setThermalContent(data);
        } else {
          console.error("Server responded with status:", response.status);
        }
      } catch (err) {
        console.error("Error fetching the image:", err);
      }
    } else if (params.row.data_type_id === 2) {
      try {
        const response = await fetch(
          `http://192.168.4.1:3001/get-image/${params.row.id}`
        );
        const data = await response.json();
        setOverlayImage(data.image);
      } catch (err) {
        console.error("Error fetching the image:", err);
      }
    }
  };

  function getDataTypeLabel(dataTypeId) {
    switch (dataTypeId) {
      case 1:
        return "Motion Sensor Event";
      case 2:
        return "Image Event";
      case 3:
        return "Thermal Sensor Event";
      default:
        return "Selected Sensor Reading Data";
    }
  }

  function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toISOString().replace("T", " ").substring(0, 19);
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("http://192.168.4.1:3001/api/readings");
        //const response = await fetch("http://localhost:3001/api/readings");
        const data = await response.json();
        setReadingsData(data);
        setLoading(false);
      } catch (err) {
        setError(err);
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const columns = [
    { field: "id", headerName: "ID" },
    {
      field: "sensor_id",
      headerName: "Sensor ID",
      cellClassName: "name-column--cell",
    },
    {
      field: "time_write",
      headerName: "Time Write",
      valueGetter: (params) => formatTimestamp(params.row.time_write),
      headerAlign: "left",
      align: "left",
      flex: 1,
    },
    {
      field: "time_read",
      headerName: "Time Read",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "data_type_id",
      headerName: "Data Type ID",
    },
    {
      field: "data_id",
      headerName: "Data ID",
      flex: 1,
    },
  ];

  let sensorDataTitle = getDataTypeLabel(readingData.data_type_id);

  return (
    <Box
      m="20px"
      height="85%"
      sx={{ display: "flex", flexDirection: "column" }}
    >
      <Header title="SENSOR READINGS" subtitle="Data from the Sensors" />
      <Box m="10px" sx={{ display: "flex", flexDirection: "row" }}>
        <Box
          m="10px"
          height="60vh"
          sx={{
            border: 2,
            flex: 3,
            "& .MuiDataGrid-root": {
              border: "none",
            },
            "& .MuiDataGrid-cell": {
              borderBottom: "none",
            },
            "& .name-column--cell": {
              color: colors.greenAccent[300],
            },
            "& .MuiDataGrid-columnHeaders": {
              backgroundColor: colors.blueAccent[700],
              borderBottom: "none",
            },
            "& .MuiDataGrid-virtualScroller": {
              backgroundColor: colors.primary[400],
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: "none",
              backgroundColor: colors.blueAccent[700],
            },
            "& .MuiCheckbox-root": {
              color: `${colors.greenAccent[200]} !important`,
            },
          }}
        >
          <DataGrid
            checkboxSelection
            rows={readingsData}
            columns={columns}
            onRowClick={handleRowClick}
          />
        </Box>
        <Box
          sx={{
            m: "10",
            flex: 1,
          }}
        >
          <h3>{sensorDataTitle}</h3>

          {readingsData && (
            <Table size="small">
              <TableBody>
                <TableRow>
                  <TableCell style={{ fontWeight: "bold" }}>ID</TableCell>
                  <TableCell>{readingData.id}</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    Sensor ID
                  </TableCell>
                  <TableCell
                    className={readingData.sensor_id ? "name-column--cell" : ""}
                  >
                    {readingData.sensor_id}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontWeight: "bold" }}>
                    Time Write
                  </TableCell>
                  <TableCell>
                    {new Date(
                      readingData.time_write * 1000
                    ).toLocaleDateString()}{" "}
                    {new Date(
                      readingData.time_write * 1000
                    ).toLocaleTimeString()}
                  </TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>
                    Time Read
                  </TableCell>
                  <TableCell>{readingData.time_read}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ fontWeight: "bold" }}>
                    Data Type ID
                  </TableCell>
                  <TableCell>{readingData.data_type_id}</TableCell>
                  <TableCell style={{ fontWeight: "bold" }}>Data ID</TableCell>
                  <TableCell>{readingData.data_id}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}

          {thermalContent && <Heatmap data={thermalContent} />}

          {overlayImage && (
            <img src={`data:image/jpeg;base64,${overlayImage}`} alt="Overlay" />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Readings;
