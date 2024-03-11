import React from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import NoMeetingRoomIcon from "@mui/icons-material/NoMeetingRoom";
import ProgressCircle from "./ProgressCircle";

const PodBox = ({ name, location, status, lastMotion, thermal }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const isOccupied = status === "occupied";
  // Choose icon based on the status
  const icon = isOccupied ? NoMeetingRoomIcon : MeetingRoomIcon;

  return (
    <Box width="100%" m="0 30px">
      <Box display="flex" justifyContent="space-between">
        <Box>
          {icon}
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{ color: colors.grey[100] }}
          >
            {name}
          </Typography>
        </Box>
        <Box>
          <ProgressCircle progress={lastMotion} />
        </Box>
      </Box>
      <Box display="flex" justifyContent="space-between" mt="2px">
        <Typography variant="h5" sx={{ color: colors.greenAccent[500] }}>
          {location}
        </Typography>
        <Typography
          variant="h5"
          fontStyle="italic"
          sx={{ color: colors.greenAccent[600] }}
        >
          {thermal}
        </Typography>
      </Box>
    </Box>
  );
};

export default PodBox;
