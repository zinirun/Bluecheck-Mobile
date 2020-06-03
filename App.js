
import { WebView } from 'react-native-webview';
import React from 'react';
import {
  Vibration
} from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

// Server URL 설정
const webUrl = 'http://133.186.150.88:3000/';
const PUSH_REGISTRATION_ENDPOINT = webUrl + 'token';

export default class App extends React.Component {
  state = {
    notification: null,
    messageText: ''
  }
  tokenValue = '';
  registerForPushNotificationsAsync = async () => {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        alert('푸시 알림이 기능이 해제됩니다');
        return;
      }
      token = await Notifications.getExpoPushTokenAsync();
      console.log(token);
      this.tokenValue = token;
      this.setState({ expoPushToken: token });
    } else {
      alert('푸시 알림은 기기에서만 이용가능합니다.');
    }

    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('default', {
        name: 'default',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }

    //node 서버로 토큰 전송
    return fetch(PUSH_REGISTRATION_ENDPOINT,{
      method:'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: this.tokenValue
      })
    })
  };

  componentDidMount(){
    this.registerForPushNotificationsAsync();
     this._notificationSubscription = Notifications.addListener(this._handleNotification);
  }

  _handleNotification = notification => {
    Vibration.vibrate();
    console.log(notification);
    this.setState({notification: notification});
  }

  render() {
    return <WebView 
    source={{ uri: webUrl }} 
    style={{ marginTop:20 }} 
    />;
  } 
}