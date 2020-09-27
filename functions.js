
window.appConfig = {
  colors: ['green', 'yellow', 'red'],
  bracket_ranges: [[1, 10], [11, 30], [31, 60], [61, 90], [91, 120], [121, 150]], // these are used to make the labels
  brackets: [],

  MAX_INT: 50, // upper range of random numbers
  MAX_GOOD_VALUE: 50, // numbers between MAX_GOOD_VALUE and MAX_INT are Inhibitors
  MAX_TIMER_VALUE: 0, // time in seconds that we collect data in a run, will be set in initializeDataStructures below
}

window.appData = {
  found_results: {}, // raw results, counting number of times a number is found
  bracket_data: {}, // results from a run, sorted by bracket then by color
  bracket_data_rows: {}, // results from a run, sorted by color then by bracket
  watchTimerValue: 0,
  isWatchRunning: false,
  timerId: null
}

const initializeDataStructures = () => {
  const appConfig = window.appConfig
  const appData = window.appData

  // init the brackets
  appConfig.bracket_ranges.forEach(range => {
    appConfig.brackets.push(bracketNameForRange(range))
  })

  // init the MAX_TIMER_VALUE
  appConfig.MAX_TIMER_VALUE = appConfig.bracket_ranges[appConfig.bracket_ranges.length - 1][1]
  console.log(appConfig.MAX_TIMER_VALUE)

  // init bracket_data
  appConfig.brackets.forEach(bracket => {
    appData.bracket_data[bracket] = {}
    appConfig.colors.forEach(color => {
      appData.bracket_data[bracket][color] = 0
    })
  })
  // init bracket_data_rows
  appConfig.colors.forEach(color => {
    appData.bracket_data_rows[color] = {}
    appConfig.brackets.forEach(bracket => {
      appData.bracket_data_rows[color][bracket] = 0
    })
  })

}

const bracketNameForRange = (range) => {
  const min = range[0]
  const max = range[1]
  const label = `${min}-${max} sec`
  return label
}

const initializeApplication = () => {
  initializeDataStructures()
}
initializeApplication()

// below are the app functions
const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max)) + 1
}

const startWatch = () => {
  const appData = window.appData
  if (appData.isWatchRunning === true) { return }
  console.log('starting stopwatch')
  appData.isWatchRunning = true
  document.getElementById('stopWatchSpinner').hidden = false
  document.getElementById('startWatchButton').disabled = true
  document.getElementById('pauseStopWatchButton').disabled = false
  document.getElementById('generateButton').disabled = false
  appData.timerId = setInterval(incrementWatchValue, 1000)
}

/**
 * Pause the stopwatch
 */
const pauseStopWatch = () => {
  const appData = window.appData
  clearInterval(appData.timerId)
  document.getElementById('stopWatchSpinner').hidden = true
  document.getElementById('startWatchButton').disabled = false
  document.getElementById('pauseStopWatchButton').disabled = true
  document.getElementById('generateButton').disabled = true
  appData.isWatchRunning = false

  generateResultsTable()
}

/**
 * Reset the stopwatch UI component and its backing data
 */
const resetWatch = () => {
  const appData = window.appData
  pauseStopWatch()
  appData.watchTimerValue = 0
  document.getElementById('stopwatchtime').innerText = appData.watchTimerValue
}
/**
 * Called on an interval, this increments the watch value and updates the
 * UI.  If the value exceeds MAX_TIMER_VALUE then the watch is stopped
 */
const incrementWatchValue = () => {
  const appConfig = window.appConfig
  const appData = window.appData
  appData.watchTimerValue += 1
  if (appData.watchTimerValue >= appConfig.MAX_TIMER_VALUE) {
    setDataGatherComplete()
  }
  document.getElementById('stopwatchtime').innerText = appData.watchTimerValue
}
/**
 * Called when the data gathering has been completed (all time elapsed)
 */
const setDataGatherComplete = () => {
  pauseStopWatch()
  document.getElementById('startWatchButton').disabled = true
}

const resetResults = () => {
  const appData = window.appData
  const appConfig = window.appConfig
  for (var i = 1; i <= appConfig.MAX_INT; i++) {
    appData.found_results[i] = ((i > appConfig.MAX_GOOD_VALUE) ? 1 : 0)
  }
  document.getElementById('result').innerText = ''
  document.getElementById('result').style.backgroundColor = 'white'

  clearTable()
}
/**
 * Returns true if the count of found results is greater than 1
 * When the item is initially found, it changes from 0 to 1 but
 * We increment immediately, so the second time it is found it's set to 2
 *
 * @param  {} aNumber number to check
 * @returns true if previou
 */
const hasNumberBeenFoundAlready = (aNumber) => {
  const appData = window.appData
  // this is 1 because we insert before we check
  return appData.found_results[aNumber] != null && appData.found_results[aNumber] > 1
}
/**
 * Clears out the data table so that it can be repopulated
 */
const clearTable = () => {
  const table = document.getElementById('resultsTable')
  table.innerHTML = '' // remove old data
}
/**
 * generate the table of results from the bracket data rows
 */
const generateResultsTable = () => {
  const appConfig = window.appConfig
  const appData = window.appData
  const table = document.getElementById('resultsTable')
  clearTable()
  table.appendChild(makeTableHeader())

  // add the data rows
  appConfig.colors.forEach(color => {
    // make a row for each color, and a cell for each data item
    const row = makeTableRow(color, appData.bracket_data_rows[color])
    table.appendChild(row)
  })
}

/**
 * Create the table header (first row titles)
 */
const makeTableHeader = () => {
  const appConfig = window.appConfig
  // make the first row with the bracket header
  const row = document.createElement('tr')
  var cell = document.createElement('th')
  row.appendChild(cell)

  appConfig.brackets.forEach(bracket => {
    var cell = document.createElement('th')
    var textnode = document.createTextNode(bracket)
    cell.appendChild(textnode)
    row.appendChild(cell)
  })
  return row
}

/**
 * Make a row of data with a label and some data
 */
const makeTableRow = (label, valueArray) => {
  const appConfig = window.appConfig
  const row = document.createElement('tr')
  // first add the row label
  var cell = document.createElement('th')
  var textnode = document.createTextNode(label)
  cell.appendChild(textnode)
  row.appendChild(cell)
  // now add all the data elements to the row
  appConfig.brackets.forEach(bracket => {
    const cellData = valueArray[bracket]
    cell = document.createElement('td')
    const textnode = document.createTextNode(cellData)
    cell.appendChild(textnode)
    row.appendChild(cell)
  })
  return row
}
/**
 * Sets the page mode and the associated parameters, resets any stale data
 * @param  {} newValue new mode value
 */
const setMode = (newValue) => {
  const appConfig = window.appConfig
  switch (newValue) {
    case '1':
      appConfig.MAX_INT = 50
      appConfig.MAX_GOOD_VALUE = 50
      break

    case '2':
      appConfig.MAX_INT = 80
      appConfig.MAX_GOOD_VALUE = 50
      break
    default:
      appConfig.MAX_INT = 500
      appConfig.MAX_GOOD_VALUE = 0
  }
  resetWatch()
  resetResults()
  console.log(`MAX_INT: ${appConfig.MAX_INT}, MAX_GOOD_VALUE: ${appConfig.MAX_GOOD_VALUE}`)
}

/**
 * Generate another data point, add it to the results, and return it
 */
const findANumber = () => {
  const appConfig = window.appConfig
  const appData = window.appData
  const newNumber = getRandomInt(appConfig.MAX_INT)
  var existing = appData.found_results[newNumber] || 0
  appData.found_results[newNumber] = existing + 1

  const color = (newNumber > appConfig.MAX_GOOD_VALUE) ? 'yellow' : hasNumberBeenFoundAlready(newNumber) ? 'red' : 'green'
  logNumberBracketColor(appData.watchTimerValue, color)
  // console.log(`existing is ${existing}, hasBeenFound was ${hasNumberBeenFoundAlready(newNumber)},Color is ${color}`)

  return newNumber
}
/**
 * Add the color to the appropriate bracketed data for later reporting
 * @param  {} currentTime current time in seconds
 * @param  {} color color of the result
 */
const logNumberBracketColor = (currentTime, color) => {
  const appData = window.appData
  const appConfig = window.appConfig
  var bracketName
  for (var range of appConfig.bracket_ranges) {
    const rangeMax = range[1]
    if (currentTime < rangeMax) {
      bracketName = bracketNameForRange(range)
      break
    }
  }

  appData.bracket_data[bracketName][color] += 1
  appData.bracket_data_rows[color][bracketName] += 1
}

// UI events
$('#generateButton').on('click', function (event) {
  const appConfig = window.appConfig
  event.preventDefault() // To prevent following the link (optional)
  const newNumber = findANumber()
  document.getElementById('result').innerText = newNumber
  if (hasNumberBeenFoundAlready(newNumber)) {
    document.getElementById('result').style.backgroundColor = (newNumber > appConfig.MAX_GOOD_VALUE) ? 'goldenrod' : 'red'
  } else {
    document.getElementById('result').style.backgroundColor = 'green'
  }
})
$('#startWatchButton').on('click', function (event) {
  event.preventDefault() // To prevent following the link (optional)
  startWatch()
})
$('#pauseStopWatchButton').on('click', function (event) {
  event.preventDefault() // To prevent following the link (optional)
  pauseStopWatch()
})
$('#resetWatchAndExperiment').on('click', function (event) {
  event.preventDefault() // To prevent following the link (optional)
  resetWatch()
  resetResults()
})
$('select').on('change', (e) => {
  const newValue = document.getElementById('modeSelect').value
  setMode(newValue)
})

// startup
resetResults()
