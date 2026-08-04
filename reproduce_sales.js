const http = require('http');
const loginData = JSON.stringify({ email: 'admin@seed.local', password: 'Pass1234' });
const loginReq = http.request(
  {
    hostname: 'localhost',
    port: 3001,
    path: '/api/v1/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(loginData),
    },
  },
  (res) => {
    let body = '';
    res.on('data', (chunk) => (body += chunk));
    res.on('end', () => {
      console.log('LOGIN STATUS', res.statusCode);
      console.log('LOGIN BODY', body);
      let token;
      try {
        token = JSON.parse(body).accessToken;
      } catch (err) {
        console.error('LOGIN JSON ERR', err);
        return;
      }
      if (!token) {
        console.error('NO TOKEN RECEIVED');
        return;
      }
      const salesReq = http.request(
        {
          hostname: 'localhost',
          port: 3001,
          path: '/api/v1/sales',
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        (res2) => {
          let body2 = '';
          res2.on('data', (chunk) => (body2 += chunk));
          res2.on('end', () => {
            console.log('SALES STATUS', res2.statusCode);
            console.log('SALES BODY', body2);
          });
        },
      );
      salesReq.on('error', (err) => console.error('SALES REQ ERR', err));
      salesReq.end();
    });
  },
);
loginReq.on('error', (err) => console.error('LOGIN REQ ERR', err));
loginReq.write(loginData);
loginReq.end();
