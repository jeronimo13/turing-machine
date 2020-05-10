import React, {useEffect, useState} from 'react'
import './App.css'

function App() {
  const [alphabet, setAlphabet] = useState<string>(' ')

  const [pointer, setPointer] = useState(0)
  const [qPos, setQPos] = useState(0)

  const initItems = []
  const total = 31
  const shift = Math.floor(total / 2)
  for (let i = 0; i < total; i++) {
    initItems[i] = {label: i - shift, value: ' '}
  }

  const [items, setItems] = useState<IItem[]>(initItems)

  useEffect(() => {
    setAlphabet(
      items
        .map((v) => v.value)
        .filter(onlyUnique)
        .join('')
    )
  }, [items])

  const handleKeyDown = (e: any) => {
    if (e.key === 'ArrowLeft') {
      setPointer((prevState) => prevState - 1)
    }

    if (e.key === 'ArrowRight') {
      setPointer((prevState) => prevState + 1)
    }
    if (e.code === 'Space') {
      //next move
      //read current pointer value
      const pointerValue = items[pointer + 15].value
      //get command for current pointer value
      const state = states.get(pointerValue)
      if (state) {
        //change current pointer value
        let instruction = state[qPos]
        if (!instruction) {
          instruction = {
            newValue: items[pointer + 15].value,
            nextState: qPos,
            move: '>',
          }
        }
        items[pointer + 15].value = instruction.newValue
        setItems([...items])

        //move pointer
        if (instruction.move === '>') {
          setPointer((prevState) => prevState + 1)
        }

        if (instruction.move === '<') {
          setPointer((prevState) => prevState - 1)
        }

        //change qPos
        setQPos(instruction.nextState)

        if (instruction.nextState === -1) {
          alert('Stopped')
          setQPos(0)
        }
      }
    }
  }
  let map = new Map<string, Array<IState | null>>()
  map.set(' ', [null, null])

  const [states, setStates] = useState(map)

  // populate states
  useEffect(() => {
    let length: number
    alphabet.split('').map((char) => {
      const values = states.get(char)
      if (values) {
        length = values.length
      } else {
        states.set(
          char,
          Array.from({length: length || 1}, (v, i) => null)
        )
      }
      return true
    })
    setStates(new Map(states))
  }, [alphabet])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <div className="App">
      <header className="App-header">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}>
          <Tape
            values={items}
            pointer={pointer}
            onClick={(itemNumber) => {
              const promptValue = prompt('Enter value')
              if (promptValue) {
                items[itemNumber + 15].value = promptValue
                setItems([...items])
              } else {
                items[itemNumber + 15].value = ' '
                setItems([...items])
              }
            }}
          />
          <div style={{display: 'flex', justifyContent: 'start'}}>
            Alphabet:{' '}
            <input
              value={alphabet}
              onChange={(v) => setAlphabet(v.target.value)}
            />
          </div>

          <div style={{display: 'flex', justifyContent: 'start'}}>
            <States
              qPos={qPos}
              states={states}
              removeHandler={() => {
                // setStates(
                //   states.filter((state, index) => index !== states.length - 1)
                // )
              }}
              addHandler={() => {
                Array.from(states.keys()).map((char) => {
                  const arr = states.get(char)!
                  arr.push(null)
                  states.set(char, arr)
                })
                setStates(new Map(states))
              }}
              cellHandler={(char, qPos) => {
                const v = prompt('Enter value')
                if (v) {
                  const instructions = v.split('')
                  const newInstruction = {
                    newValue: instructions[0],
                    move: instructions[1] as Move,
                    nextState: Number.parseInt(instructions.slice(2).join('')),
                  }
                  const newArr = states.get(char)
                  if (newArr) {
                    newArr[qPos] = newInstruction
                    states.set(char, newArr)
                    setStates(new Map(states))
                  }
                } else {
                  const newArr = states.get(char)
                  if (newArr) {
                    newArr[qPos] = null
                    states.set(char, newArr)
                    setStates(new Map(states))
                  }
                }
              }}
            />
          </div>
        </div>
      </header>
    </div>
  )
}

type Move = '<' | '>' | '.'

interface IState {
  newValue: string
  move: Move
  nextState: number
}

const stateToString = (state: IState | null): string => {
  if (state) {
    return (
      (state.newValue === ' ' ? '_' : state.newValue) +
      state.move +
      state.nextState
    )
  } else {
    return ' '
  }
}

type IStates = Map<string, Array<IState | null>>
const States = ({
  states,
  qPos,
  removeHandler,
  addHandler,
  cellHandler,
}: {
  qPos: number
  states: IStates
  removeHandler: () => void
  addHandler: () => void
  cellHandler: (char: string, qPos: number) => void
}) => {
  return (
    <div
      style={{
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'start',
      }}>
      <div style={{width: 200}}>
        {/*<button onClick={() => removeHandler()}>Remove state</button>*/}
        <button onClick={addHandler}>Add state</button>
      </div>
      <table style={{backgroundColor: 'white', color: 'black'}}>
        <thead>
          <tr>
            <td></td>
            {states
              .get(Array.from(states.keys())[0])!
              .map((value: any, i: number) => (
                <td key={i}>
                  Q{i}
                  {qPos === i && '*'}
                </td>
              ))}
          </tr>
        </thead>
        <tbody>
          {Array.from(states.keys()).map((char, i) => {
            return (
              <tr key={i}>
                <td key={char}>{char === ' ' ? '_' : char}</td>
                {states.get(char)!.map((state, j) => (
                  <td
                    key={j}
                    onClick={() => {
                      cellHandler(char, j)
                    }}>
                    {stateToString(state)}
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface IItem {
  label: number
  value: string
}

function onlyUnique(value: any, index: any, self: any) {
  return self.indexOf(value) === index
}

const Tape = ({
  values,
  pointer,
  onClick,
}: {
  values: Array<IItem>
  pointer: number
  onClick: (itemNumber: number) => void
}) => {
  return (
    <div style={{display: 'flex'}}>
      {values.map((i) => (
        <Item
          value={i.value}
          key={i.label}
          label={i.label}
          isSelected={i.label === pointer}
          onClick={() => {
            onClick(i.label)
          }}
        />
      ))}
    </div>
  )
}

const Item = ({
  value,
  label,
  isSelected,
  onClick,
}: {
  value?: string
  label: number
  isSelected: boolean
  onClick: (e: any) => void
}) => {
  return (
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <div style={{fontSize: 18}}>{label}</div>
      <div
        style={{
          display: 'flex',
          border: '1px solid black ',
          width: 30,
          height: 50,
          backgroundColor: 'white',
          color: 'black',
          justifyContent: 'center',
          alignItems: 'center',
        }}
        onClick={onClick}>
        {value === ' ' ? '_' : value}
      </div>
      {isSelected && <div>▲</div>}
    </div>
  )
}

export default App
