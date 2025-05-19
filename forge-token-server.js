// forge-token-server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());

const CLIENT_ID = 'fUKdPOSszpIJ23vDayN3QQzTDv0mVSelOueGfGc76jrb3SxT';
const CLIENT_SECRET = 'MN4qgnI7lW9etWuhrtsZMQff1uaIu55a7G00a7K7R9VJx76LqMUoWROiQl8GDsEx';

app.get('/api/forge/token', async (req, res) => {
  const scope = req.query.scope || 'openid';
  const payload = new URLSearchParams({
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
    grant_type: 'client_credentials',
    scope,
  });
  try {
    // Essayer v2 directement avec le scope demandé
    try {
      const response = await axios.post(
        'https://developer.api.autodesk.com/authentication/v2/token',
        payload,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      return res.json({ ...response.data, endpoint: 'v2', scope });
    } catch (errV2) {
      console.error('Forge token error v2:', errV2.response?.data || errV2.message || errV2);
      // Essayer v1 si v2 échoue
      try {
        const response = await axios.post(
          'https://developer.api.autodesk.com/authentication/v1/authenticate',
          payload,
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        return res.json({ ...response.data, endpoint: 'v1', scope });
      } catch (errV1) {
        console.error('Forge token error v1:', errV1.response?.data || errV1.message || errV1);
        return res.status(500).json({
          error: 'Both v2 and v1 endpoints failed',
          details_v2: errV2.response?.data || errV2.message || errV2,
          details_v1: errV1.response?.data || errV1.message || errV1,
        });
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.toString() });
  }
});

app.listen(3001, () => console.log('Forge token server running on port 3001')); 