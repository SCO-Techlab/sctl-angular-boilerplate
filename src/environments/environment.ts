export const environment = {
  name: 'development',
  production: false,
  apiUrl: `http://localhost:3000/api/v1`,
  socketUrl: `ws://localhost:3005`,
  httpsEnabled: false,
};

environment.apiUrl = !environment.httpsEnabled
  ? environment.apiUrl
  : environment.apiUrl.replace('http', 'https');

  environment.socketUrl = !environment.httpsEnabled
  ? environment.socketUrl
  : environment.socketUrl.replace('ws', 'wss');