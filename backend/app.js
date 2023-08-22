// Setting up the Express server
const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

// Welcome message
app.get('/', (req, res) => {
  res.send('Welcome to the Train API!');
});

// Implement the /trains route
app.get('/trains', async (req, res) => {
  try {
    // Use the provided auth API to get the access token
    const tokenResponse = await axios.post('http://20.244.56.144/train/auth', {
      // Provide your company details here
    });

    const accessToken = tokenResponse.data.access_token;

    // Use the access token to get train details
    const trainsResponse = await axios.get('http://20.244.56.144/train/trains', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    // Process and sort the train data
    const currentTime = new Date();
    const next12Hours = new Date(currentTime.getTime() + 12 * 60 * 60 * 1000);

    const filteredTrains = trainsResponse.data.filter(train => {
      const departureTime = new Date(
        0,
        0,
        0,
        train.departureTime.Hours,
        train.departureTime.Minutes,
        train.departureTime.Seconds
      );
      return departureTime > currentTime && departureTime < next12Hours;
    });

    // Sort the filtered trains based on price in ascending order
    filteredTrains.sort((a, b) => {
      const priceA = a.price.sleeper + a.price.AC;
      const priceB = b.price.sleeper + b.price.AC;
      return priceA - priceB;
    });

    res.status(200).json(filteredTrains);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Implement the /register route for company registration
app.post('/register', async (req, res) => {
  try {
    const registrationDetails = {
      companyName: "Train central",
      ownerName: "Ram",
      rollNo: "1",
      ownerEmail: "ram@abc.edu",
      accessCode: "FKDLig"
    };

    // Make a POST request to register the company
    const registrationResponse = await axios.post('http://20.244.56.144/train/register', registrationDetails);

    const { clientID, clientSecret } = registrationResponse.data;

    res.status(200).json({
      companyName: registrationDetails.companyName,
      clientID,
      clientSecret
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Registration failed.');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
