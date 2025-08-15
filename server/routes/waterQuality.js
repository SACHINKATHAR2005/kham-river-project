router.get('/latest/:stationId', async (req, res) => {
  try {
    const latestReading = await WaterQuality.findOne({ 
      stationId: req.params.stationId 
    })
    .sort({ timestamp: -1 })
    .populate('stationId');

    if (!latestReading) {
      return res.status(404).json({
        success: false,
        message: 'No readings found for this station'
      });
    }

    return res.json({
      success: true,
      data: latestReading
    });
  } catch (error) {
    console.error('Error fetching latest reading:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching latest reading'
    });
  }
});