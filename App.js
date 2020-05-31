
import { WebView } from 'react-native-webview';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Modal,
  TouchableOpacity, 
  Vibration
} from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import Constants from 'expo-constants';

const PUSH_REGISTRATION_ENDPOINT = 'http://133.186.214.122:3000/token';

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
        alert('Failed to get push token for push notification!');
        return;
      }
      token = await Notifications.getExpoPushTokenAsync();
      console.log(token);
      this.tokenValue = token;
      this.setState({ expoPushToken: token });
    } else {
      alert('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('default', {
        name: 'default',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }
    console.log("출력테스트>>"+this.tokenValue);
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
    source={{ uri: 'http://133.186.214.122:3000/' }} 
    style={{ paddingTop:20}} 
    />;
  } 
}