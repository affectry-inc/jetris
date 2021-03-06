'use strict'

import React, { Component } from 'react'
import {
  View,
  StyleSheet,
  FlatList,
  AlertIOS,
} from 'react-native'
import { List, ListItem } from 'react-native-elements'
import Store from 'react-native-simple-store'
import { BattleStatus } from '../Consts'
import { firebaseDb } from '../utils/firebase'

export default class BattlesList extends Component {

  constructor(props) {
    super(props)

    this.state = {
      data: [],
      loading: false,
    }
  }

  componentDidMount() {
    this._loadBattles()
  }

  _loadBattles = () => {
    this.setState({ loading: true })

    const now = new Date()
    const minDate = now.setMinutes(now.getMinutes() - 3)
    const ref = firebaseDb.ref('waitings').orderByChild('sentAt').startAt(minDate)
    ref.off()
    ref.on('value',
      snapshot => {
        if (snapshot.numChildren() === 0) {
          this.setState({
            loading: false,
          })
        }

        let list = []
        snapshot.forEach(childSnapshot => {
          const val = childSnapshot.val()
          list.push({
            key: childSnapshot.key,
            ...val
          })

          this.setState({
            data: list,
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

  _askName = (key) => {
    Store.get('settings')
    .then(res => {
      const defName = res && res.name ? res.name : 'No name'
      AlertIOS.prompt(
        'Challenge',
        'Send a challenge with this name?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Send', onPress: name => { this.props.challenge(key, name) }
          },
        ],
        'plain-text',
        defName
      )
    })
  }

  _onRefresh = () => {
    this._loadBattles()
  }

  _onSelectCell = (key) => {
    this._askName(key)
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
    let status, statusColor
    switch (item.status) {
      case BattleStatus[0]:
        status = 'Waiting'
        statusColor = 'deepskyblue'
        break
      case BattleStatus[5]:
        status = 'In Battle'
        statusColor = 'orangered'
        break
      case BattleStatus[9]:
        status = 'Finished'
        statusColor = 'lightgray'
        break
      default:
        break
    }

    return (
      <ListItem
        title={ `${ item.player1.name }` }
        subtitle={ `${ item.sentAtStr }` }
        rightTitle={ status }
        rightTitleStyle={{ fontSize: 20, color: statusColor }}
        containerStyle={{ borderBottomWidth: 0 }}
        onPress={ () => { this._onSelectCell(item.key) }}
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
