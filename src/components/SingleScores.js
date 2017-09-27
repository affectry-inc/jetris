'use strict'

import React, { Component } from 'react'
import {
  View,
  Button,
  StyleSheet,
  NavigatorIOS,
} from 'react-native'
import PlayField from './PlayField'

class SingleScores extends Component {
  _onStart = () => {
    this.props.navigator.push({
      title: 'Battle',
      component: PlayField,
    })
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Button
          onPress={ this._onStart }
          color='#48BBEC'
          title='START'
        />
      </View>
    )
  }
}

export default class PlayTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <NavigatorIOS
        style={styles.container}
        initialRoute={{
          title: 'Jetris',
          component: ReadyView,
        }}
      />
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
})
