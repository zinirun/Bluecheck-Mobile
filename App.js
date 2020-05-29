
import { WebView } from 'react-native-webview';
import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Modal,
  TouchableOpacity
} from 'react-native';
import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';

const PUSH_REGISTRATION_ENDPOINT = 'http://533e1794c03d.ngrok.io/token';
const MESSAGE_ENPOINT = 'http://533e1794c03d.ngrok.io/message';


export default class App extends React.Component {
  state = {
    notification: null,
    messageText: ''
  }

  componentDidMount() {
    this.registerForPushNotificationsAsync();
  }
  registerForPushNotificationsAsync = async () => {
    const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    if (status !== 'granted') {
      return;
    }
    let token = await Notifications.getExpoPushTokenAsync();
    
    return fetch(PUSH_REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: {
          value: token,
        },
        user: {
          username: 'warly', //임의값
          name: 'Dan Ward'  //임의값
        },
      }),
    });
    this.notificationSubscription = Notifications.addListener(this.handleNotification);
    

  }
  handleNotification = (notification) => {
    this.setState({ notification });
  }
  handleChangeText = (text) => {
    this.setState({ messageText: text });
  }
  sendMessage = async () => {
    fetch(MESSAGE_ENPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: this.state.messageText,
      }),
    });
    this.setState({ messageText: '' });
  }
  render() {
    return (
      <View style={styles.container}>
        <TextInput
          value={this.state.messageText}
          onChangeText={this.handleChangeText}
          style={styles.textInput}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={this.sendMessage}
        >
          <Text style={styles.buttonText}>Send</Text>
        </TouchableOpacity>
        {this.state.notification ?
          this.renderNotification()
        : null}
      </View>
    );
  }

  // render() {
  //   const { tokenValue } = this.state;

  //   return <WebView source={{ uri: 'http://133.186.150.88:3000/' }} style={{ marginTop: 20 }} />;
  // }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#474747',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    height: 50,
    width: 300,
    borderColor: '#f6f6f6',
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 10
  },
  button: {
    padding: 10
  },
  buttonText: {
    fontSize: 18,
    color: '#fff'
  },
  label: {
    fontSize: 18
  }
});