import express from 'express';
import Expo from 'expo-server-sdk';

const app = express();
const expo = new Expo();
let savedPushTokens= [];
const PORT_NUMBER = 3000;
//두개의 endpoint 필요 
//1. token을 등록하기 위한 endpoint
//2. react native app에서 메세지를 받아오기 위한 endpoint

//1. token 등록함수
const saveToken = (token) => {
    if (savedPushTokens.indexOf(token === -1)) {
      savedPushTokens.push(token);
    }
  }

  //2. react native app으로 부터 메세지 받았을 때 push notification 보내는 함수
  const handlePushTokens = (message) => {
    let notifications = [];
    for (let pushToken of savedPushTokens) {
      if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        continue;
      }
      notifications.push({
        to: pushToken,
        sound: 'default',
        title: 'Message received!',
        body: message,
        data: { message }
      })
    }
    let chunks = expo.chunkPushNotifications(notifications);
    (async () => {
        for (let chunk of chunks) {
        try {
            let receipts = await expo.sendPushNotificationsAsync(chunk);
            console.log(receipts);
        } catch (error) {
            console.error(error);
        }
        }
    })();
  }

  app.use(express.json());
  app.get('/', (req, res) => {
    res.send('Push Notification Server Running');
  });

  app.post('/token', (req, res) => {
    saveToken(req.body.token.value);
    console.log(`Received push token, ${req.body.token.value}`);
    res.redirect('http://')
    res.send(`Received push token, ${req.body.token.value}`);
  });

  // app.post('/message', (req, res) => {
  //   handlePushTokens(req.body.message);
  //   console.log(`Received message, ${req.body.message}`);
  //   res.send(`Received message, ${req.body.message}`);
  // });

  app.listen(PORT_NUMBER, () => {
    console.log(`Server Online on Port, ${PORT_NUMBER}`);
  });