export const environment = {
  name: 'production',
  production: true,
  apiUrl: 'http://0.0.0.0:3000/api/v1',
  socketUrl: `ws://0.0.0.0:3005`,
  httpsEnabled: false,
};

environment.apiUrl = !environment.httpsEnabled
  ? environment.apiUrl
  : environment.apiUrl.replace('http', 'https');

  environment.socketUrl = !environment.httpsEnabled
  ? environment.socketUrl
  : environment.socketUrl.replace('ws', 'wss');