const SensorImage = ({ sensorId }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLatestImage = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:3001/api/sensors/${sensorId}/latest-image`
        );
        if (!response.ok) throw new Error("Failed to fetch image");
        const data = await response.json();
        setImageUrl(data.imageUrl); // Assuming the API returns an object with an imageUrl field
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestImage();
  }, [sensorId]); // Re-run the effect if sensorId changes

  if (loading) return <CircularProgress size={24} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!imageUrl) return null; // Render nothing if there's no image URL

  return (
    <img
      src={imageUrl}
      alt={`Sensor ${sensorId}`}
      style={{ maxWidth: "100%", maxHeight: "200px" }}
    />
  );
};
