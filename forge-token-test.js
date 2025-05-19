// forge-token-test.js
const axios = require('axios');

const CLIENT_ID = 'fUKdP0SsZplJ23vDayN3QQzTDv0mVSelOueGfGc76jrb3SxT';
const CLIENT_SECRET = 'MN4qgnI7lW9etWuhrtsZMQff1uaIu55a7G00a7K7R9VJx76LqMUoWROiQl8GDsEx';

(async () => {
  try {
    // Test v1 classique
    try {
      const response = await axios.post(
        'https://developer.api.autodesk.com/authentication/v1/authenticate',
        new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          grant_type: 'client_credentials',
          scope: 'data:read data:write data:create bucket:create bucket:read',
        }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );
      console.log('Réponse v1 :', response.data);
      return;
    } catch (errV1) {
      console.error('Erreur v1 :', errV1.response?.data || errV1.message || errV1);
      // Test v2 classique
      try {
        const response = await axios.post(
          'https://developer.api.autodesk.com/authentication/v2/token',
          new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            grant_type: 'client_credentials',
            scope: 'data:read data:write data:create bucket:create bucket:read',
          }),
          { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );
        console.log('Réponse v2 :', response.data);
        return;
      } catch (errV2) {
        console.error('Erreur v2 :', errV2.response?.data || errV2.message || errV2);
        // Test v2 avec scope openid (doc officielle)
        try {
          const response = await axios.post(
            'https://developer.api.autodesk.com/authentication/v2/token',
            new URLSearchParams({
              client_id: CLIENT_ID,
              client_secret: CLIENT_SECRET,
              grant_type: 'client_credentials',
              scope: 'openid',
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          );
          console.log('Réponse v2 (openid) :', response.data);
          return;
        } catch (errOpenId) {
          console.error('Erreur v2 (openid) :', errOpenId.response?.data || errOpenId.message || errOpenId);
        }
      }
    }
  } catch (err) {
    console.error('Erreur inattendue :', err);
  }
})(); 