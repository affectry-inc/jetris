'use strict'

import React, { Component } from 'react'
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  NavigatorIOS,
} from 'react-native'
import Store from 'react-native-simple-store'

class Settings extends Component {

  constructor(props) {
    super(props)

    this.state = {
      name: ''
    }
  }

  componentDidMount = () => {
    Store.get('settings')
    .then(res => {
      this.setState({
        name: res && res.name ? res.name : 'No name'
      })
      Store.delete('settings')
    })
  }

  _setName = (name) => {
    this.setState({
      name: name
    })

    Store.update('settings', {
      name: name
    })
  }

  render() {
    return (
      <View style={{ flex: 1, marginTop: 65, marginBottom: 50, padding: 20 }}>
        <Text style={{ marginTop: 30 }}>Your name</Text>
        <TextInput
          style={{ height: 40, borderColor: 'silver', borderBottomWidth: 0.5, paddingLeft: 5 }}
          onChangeText={(text) => this._setName(text)}
          value={this.state.name}
        />
      </View>
    )
  }
}

export default class SettingsTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <NavigatorIOS
        style={{ flex: 1 }}
        initialRoute={{
          title: 'Settings',
          component: Settings,
        }}
      />
    )
  }
}
