export function getLatestSensorAssignments(sensors) {
  // Create an object to store the latest assignment for each sensor_id
  const latestAssignments = {};

  // Iterate through the sensors array
  for (const sensor of sensors) {
    const { sensor_id, type_id, mac_address, assignment_timestamp } = sensor;

    // Check if the current sensor has a later assignment_timestamp
    if (
      !latestAssignments[sensor_id] ||
      assignment_timestamp > latestAssignments[sensor_id].assignment_timestamp
    ) {
      latestAssignments[sensor_id] = { sensor_id, type_id, mac_address, assignment_timestamp };
    }
  }

  // Convert the object back to an array
  return Object.values(latestAssignments);
}



