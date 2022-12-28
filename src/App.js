import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import popSound from './Music/pop.wav'
import loseSound from './Music/lose.wav'
import winSound from './Music/win.wav'
import afterWinSound from './Music/after-win.mp3'
import afterLoseSound from './Music/after-lose.mp3'
import glowRed from './Images/glow-red.png'
import glowBlue from './Images/glow-blue.png'
import dead from './Images/dead.png'
import alive from './Images/alive.png'
import wordList from './wordList.txt'

import Navbar from './Navbar'

export default function App() {
  const [isUserWaiting, setIsUserWaiting] = useState(true)

  const handleUserClickStart = useCallback(() => {
    setIsUserWaiting(false)
  }, [])

  return (
    <Fragment>
      <Navbar />
      {isUserWaiting ? <WaitingScreen handleUserClickStart={handleUserClickStart} /> : <GameScreen />}
    </Fragment>
  )
}

function WaitingScreen({ handleUserClickStart }) {
  return (
    <section id="waiting-screen">
      <div className="container">
        <div className="wrapper">
          <div className="hero">
            <img src={alive} alt="alive" />
            <h1>HangMan</h1>
            <p>Guess the word to save the hanging man.</p>
          </div>
          <button onClick={handleUserClickStart}>Start</button>
          <p className="credits">Made with ❤ by <a href="https://github.com/markcalendario">Mark Kenneth Calendario</a></p>
        </div>
      </div>
    </section>
  )
}

function GameScreen() {
  const [didUserWin, setDidUserWin] = useState(null) // null means the user is currently playing
  const audio = useRef(new Audio())
  const [word, setWord] = useState(null)

  const fetchWord = useCallback(() => {
    fetch(wordList)
      .then((response) => {
        return response.text()
      })
      .then((result) => {
        let listOfWord = result.split('\n')
        setWord(listOfWord[Math.floor(Math.random() * listOfWord.length)].toUpperCase().split(''))
      })
  }, [])

  useEffect(() => {
    fetchWord()
  }, [fetchWord])

  const handleEndGame = useCallback((didUserGuessed, duration) => {
    // After three seconds, set the didUserWin state into true or false,
    // if true or false the GameStartedScreen will unmount and Stats will be mounted
    setTimeout(() => {
      setDidUserWin(didUserGuessed)
    }, 3000);
  }, [setDidUserWin])

  useEffect(() => {
    if (didUserWin === null) {
      return
    } else if (didUserWin) {
      audio.current.src = afterWinSound
    } else {
      audio.current.src = afterLoseSound
    }

    audio.current.play()

  }, [didUserWin])

  const handlePlayAgain = useCallback(() => {
    setDidUserWin(null)
    audio.current.pause()
    fetchWord()
  }, [setDidUserWin, fetchWord])

  return (
    <Fragment>
      {
        didUserWin !== null
          ? <Stats word={word} handlePlayAgain={handlePlayAgain} didUserWin={didUserWin} />
          : <GameStartedScreen word={word} handleEndGame={handleEndGame} />
      }
    </Fragment>
  )
}

function Stats({ word, didUserWin, handlePlayAgain }) {
  return (
    <div id="stats">
      <div className="container">
        <div className="wrapper">
          <div className="texts">
            <h1
              className={didUserWin ? "text-win" : "text-lose"}>
              {didUserWin ? 'YUN OH, NICE.' : 'HALA, LAGOT KA.'}
            </h1>
            <p>
              {
                didUserWin
                  ? "You have successfully guessed the word "
                  : "You have failed to guessed the word "
              }
              <strong>{word}.</strong>
            </p>
          </div>
          <div className="stats-images">
            <img className="glow" src={didUserWin ? glowBlue : glowRed} alt="glow" />
            <img className={"sprite" + (didUserWin ? '-win' : '-lose')} src={didUserWin ? alive : dead} alt="dead" />
          </div>
          <button onClick={handlePlayAgain}>Play Again</button>
        </div>
      </div>
    </div>
  )
}

function GameStartedScreen({ word, handleEndGame }) {
  const [userGuessedLetter, setUserGuessedLetter] = useState([])
  const [mistakesCountLeft, setMistakesCountLeft] = useState(6)
  const audio = useRef(new Audio())

  const onUserKeyClick = (char) => {
    if (mistakesCountLeft === 0) {
      return
    }

    // Check if a pressed character is not in the word
    if (!word.includes(char)) {
      setMistakesCountLeft(prev => { return prev - 1 })
    }

    // Prevent character doubling in the list
    if (!userGuessedLetter.includes(char)) {
      setUserGuessedLetter(prev => {
        return [...prev, char]
      })
    }
  }

  useEffect(() => {
    if (word === null) {
      return
    }

    let userWon = true

    for (let char = 0; char < word.length; char++) {
      if (!userGuessedLetter.includes(word[char])) {
        userWon = false
        break
      }
    }

    if (userWon) {
      audio.current.src = winSound
      audio.current.play()
      handleEndGame(true, 0)
    }

  }, [userGuessedLetter, handleEndGame, word])

  useEffect(() => {
    if (mistakesCountLeft === 6) {
      return
    }

    if (mistakesCountLeft === 0) {
      handleEndGame(false, 0)
      audio.current.src = loseSound
      audio.current.play()
      return
    }

    audio.current.src = popSound
    audio.current.play()
  }, [mistakesCountLeft, handleEndGame])

  return (
    <div id="game-started-screen">
      <div className="container">
        <div className="wrapper">
          <HangMan mistakesCountLeft={mistakesCountLeft} />
          <WordBlanks word={word} userGuessedLetter={userGuessedLetter} />
          <Alphabet userGuessedLetter={userGuessedLetter} word={word} onUserKeyClick={onUserKeyClick} />
        </div>
      </div>
    </div>
  )
}

function HangMan({ didUserWin, mistakesCountLeft }) {

  useEffect(() => {
    if (mistakesCountLeft === 0) {
      const hangMan = document.querySelector('.hang-man')
      hangMan.style.animationFillMode = "forwards"
      hangMan.style.animationIterationCount = "unset"
      hangMan.style.animationName = "hangManFallingAnim"
      hangMan.style.animationDuration = "1s"
      return
    }

    if (didUserWin) {
      const hangMan = document.querySelector('.hang-man')
      hangMan.style.animationFillMode = "forwards"
      hangMan.style.animationIterationCount = "unset"
      hangMan.style.animationName = "hangManAscendingAnim"
      hangMan.style.animationDuration = "1s"
      return
    }
  }, [mistakesCountLeft, didUserWin])

  return (
    <div className="hang-man-contain">
      <img className="hang-man" src={require(`./Images/balloon-${mistakesCountLeft}.png`)} alt="hang man" />
    </div>
  )
}

function WordBlanks({ word, userGuessedLetter }) {
  return (
    <div className="word-blanks">
      {
        word !== null
          ? word.map((char, index) => {
            if (userGuessedLetter.includes(char)) {
              return <h1 key={index + ' ' + char}>{char}</h1>
            } else {
              return <h1 key={index}>_</h1>
            }
          })
          : null
      }
    </div>
  )
}

function Alphabet({ word, onUserKeyClick, userGuessedLetter }) {
  const alphabetList = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"];

  const handleKeyClick = (char) => {
    if (!userGuessedLetter.includes(char)) {
      onUserKeyClick(char)
    }
  }

  const displayAlphabets = () => {
    return alphabetList.map(char => {
      let isAlphabetDiscarded = userGuessedLetter.includes(char) && !word.includes(char)
      let keyCorrect = userGuessedLetter.includes(char) && word.includes(char)

      return (
        <div
          onClick={() => { handleKeyClick(char) }}
          key={char}
          className={
            "alphabet-btn" +
            (isAlphabetDiscarded
              ? ' key-discarded'
              : keyCorrect
                ? ' key-correct'
                : ' key-pressable')
          }>
          <h1>{char}</h1>
        </div>
      )
    })
  }

  return (
    <div className="alphabet">
      {displayAlphabets()}
    </div>
  )
}