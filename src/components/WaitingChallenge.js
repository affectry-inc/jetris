'use strict'

import React, { Component, PureComponent } from 'react'
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native'

export default class WaitingChallenge extends Component {
  render() {
    return (
      <View style={ styles.container }>
        <Text>{ this.props.screenProps.waitingMessage }</Text>
        <ActivityIndicator size='large' />
      </View>
    )
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    justifyContent: 'space-around',
    alignItems: 'center',
  }
})
