export const MinoColors = {
  0: 'white',
  1: 'cyan',
  2: 'lime',
  3: 'magenta',
  4: 'blue',
  5: 'orange',
  6: 'yellow',
  7: 'purple',
}

export const DefaultVals =[
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
]

export const DefaultMinos = [
  [[], []], // 0
  [[4,5,6,7], [4,4,4,4]], // 1
  [[4,5,5,6], [4,4,3,3]], // 2
  [[4,5,5,6], [3,3,4,4]], // 3
  [[4,5,6,6], [3,3,3,4]], // 4
  [[4,5,6,6], [4,4,4,3]], // 5
  [[4,4,5,5], [3,4,4,3]], // 6
  [[4,5,5,6], [4,4,3,4]]  // 7
]

export const DefaultNextMinos = [
  [[], []], // 0
  [[0,1,2,3], [1,1,1,1]], // 1
  [[0,1,1,2], [1,1,0,0]], // 2
  [[0,1,1,2], [0,0,1,1]], // 3
  [[0,1,2,2], [0,0,0,1]], // 4
  [[0,1,2,2], [1,1,1,0]], // 5
  [[1,1,2,2], [0,1,1,0]], // 6
  [[0,1,1,2], [1,1,0,1]]  // 7
]

export const BattleStatus = {
  0: '0_ready',
  5: '5_inBattle',
  9: '9_finished',
}
