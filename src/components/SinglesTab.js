'use strict'

import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  NavigatorIOS,
  FlatList,
} from 'react-native'
import PlayField from './PlayField'
import { List, ListItem, SearchBar, Icon } from 'react-native-elements'
import { firebaseDb } from '../utils/firebase'

class SinglesScoreList extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      data: [],
      refreshing: false
    }
  }

  componentDidMount() {
    this._loadScores()
  }

  _loadScores = () => {
    this.setState({ loading: true })

    const ref = firebaseDb.ref('singles')
    ref.orderByChild('score').limitToFirst(50).once('value')
    .then(snapshot => {
      let scores = []
      snapshot.forEach(childSnapshot => {
        const val = childSnapshot.val()
        scores.unshift({
          key: childSnapshot.key,
          ...val
        })

        this.setState({
          data: scores,
          loading: false,
          refreshing: false
        })
      })
    })
  }

  _onRefresh = () => {
    this.setState(
      {
        refreshing: true
      },
      () => {
        this._loadScores()
      }
    )
  }

  _renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: '95%',
          backgroundColor: 'lightgray',
          marginLeft:'5%'
        }}
      />
    )
  }

  _onStart = () => {
    this.props.navigator.push({
      title: 'Single Play',
      component: PlayField,
    })
  }

  render() {
    return (
      <View style={{ flex: 1, marginTop: 65, marginBottom: 50 }}>
        <Icon
          raised
          reverse
          color='red'
          containerStyle={{ position: 'absolute', bottom: 30, right: 30, zIndex: 100 }}
          name='gamepad'
          onPress={ this._onStart }
        />
        <List containerStyle={{ marginTop: 0, borderTopWidth: 0, borderBottomWidth: 0 }}>
          <FlatList
            data={ this.state.data }
            renderItem={({ item, index }) => (
              <ListItem
                title={ `#${ index + 1 } ${ item.name }` }
                subtitle={ item.playedAt }
                rightTitle={ item.score.toString() }
                rightTitleStyle={{ fontSize: 20, color: 'gray' }}
                rightIcon={{ style: { display: 'none' } }}
                containerStyle={{ borderBottomWidth: 0 }}
              />
            )}
            keyExtractor={ item => item.key }
            ItemSeparatorComponent={ this._renderSeparator }
            onRefresh={ this._onRefresh }
            refreshing={ this.state.refreshing }
          />
        </List>
      </View>
    )
  }
}

export default class SinglesTab extends Component {
  constructor(props) {
    super(props)
    this.state = {
    }
  }

  render() {
    return (
      <NavigatorIOS
        style={ styles.container }
        initialRoute={{
          title: 'Jetris',
          component: SinglesScoreList,
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
