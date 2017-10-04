'use strict'

import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
} from 'react-native'
import { List, ListItem } from 'react-native-elements'
import { firebaseDb } from '../utils/firebase'

export default class SinglesScoreList extends Component {

  constructor(props) {
    super(props)

    this.state = {
      loading: false,
      data: [],
    }
  }

  componentDidMount() {
    this._loadScores()
  }

  _loadScores = () => {
    this.setState({ loading: true })

    const ref = firebaseDb.ref('singles').orderByChild('score').limitToFirst(50)
    ref.off()
    ref.on('value',
      snapshot => {
        if (snapshot.numChildren() === 0) {
          this.setState({
            loading: false,
          })
        }

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
          })
        })
      },
      error => {
        this.setState({
          data: [],
          loading: false,
        })
      }
    )
  }

  _onRefresh = () => {
    this._loadScores()
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

  _renderItem = ({ item, index }) => {
    let playTime = ''
    if (item.playTimeHour > 0) playTime += item.playTimeHour + 'h '
    playTime += item.playTimeMin + 'm '
    playTime += item.playTimeSec + 's'

    return (
      <ListItem
        title={ `#${ index + 1 } ${ item.name }` }
        subtitle={ `${ playTime }` }
        rightTitle={ item.score.toString() }
        rightTitleStyle={{ fontSize: 20, color: 'gray' }}
        rightIcon={{ style: { display: 'none' } }}
        containerStyle={{ borderBottomWidth: 0 }}
      />
    )
  }

  render() {
    return (
      <View>
        <List containerStyle={{ marginTop: 0, height: '100%' }}>
          <FlatList
            automaticallyAdjustContentInsets={ false }
            data={ this.state.data }
            renderItem={ this._renderItem }
            keyExtractor={ item => item.key }
            ItemSeparatorComponent={ this._renderSeparator }
            onRefresh={ this._onRefresh }
            refreshing={ this.state.loading }
          />
        </List>
      </View>
    )
  }
}
