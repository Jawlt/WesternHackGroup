import { useCallback, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useCountdown } from './useCountdown';
import { useKeyDown } from './useKeyDown';
import { useLocalStorage } from './useLocalStorage';
import { useModal } from './useModal';
import { useWord } from './useWord';

import {
  calculateAccuracy,
  calculateErrorPercentage,
  calculateWPM,
} from '../utils';

import type { Results } from '../types';
import type { HistoryType } from '../types';

type LanguageType = 'python' | 'javascript' | 'c';

export const useSystem = (selectedLanguage: LanguageType) => {

  const {user} = useAuth0(); 
  const [results, setResults] = useState<Results>({
    accuracy: 0,
    wpm: 0,
    cpm: 0,
    error: 0,
    timing: 0
  });

  const [history, setHistory] = useState<HistoryType>({
    wordHistory: '',
    typedHistory: '',
  });

  const { setLocalStorageValue, getLocalStorageValue } = useLocalStorage();
  const [wordContainerFocused, setWordContainerFocused] = useState(false);
  const [time, setTime] = useState(() => 120000);  // Change timer here
  const { countdown, resetCountdown, startCountdown } = useCountdown(time);
  
  // Updated useWord call with selectedLanguage
  const { word, updateWord, totalWord, resetWord } = useWord(selectedLanguage);
  
  const {
    charTyped,
    typingState,
    cursorPosition,
    totalCharacterTyped,
    resetCharTyped,
    resetCursorPointer,
    setTotalCharacterTyped,
    setTypingState,
  } = useKeyDown(wordContainerFocused);
  const { modalIsOpen, aboutModal, openModal, closeModal } = useModal();

  // Add useEffect to handle language changes
  useEffect(() => {
    resetWord();
  }, [selectedLanguage, resetWord]);

  const restartTest = useCallback(() => {
    resetCountdown();
    updateWord(true);
    resetCursorPointer();
    resetCharTyped();
    setTypingState('idle');
    setTotalCharacterTyped('');
  }, [
    resetCountdown,
    updateWord,
    resetCursorPointer,
    resetCharTyped,
    setTypingState,
    setTotalCharacterTyped,
  ]);

  const checkCharacter = useCallback(
    (index: number) => {
      if (charTyped[index] === word[index]) {
        return true;
      } else {
        return false;
      }
    },
    [charTyped, word]
  );

  // if (word.length === charTyped.length) {
  //   updateWord();
  //   resetCharTyped();
  //   resetCursorPointer();
  // }

  if (typingState === 'start') {
    startCountdown();
    setTypingState('typing');
  }

const saveTestResult = async () => {
  let data = {
    "userId": user?.name,
    "email": user?.email,
    "topScore": results
  }
  try {
    console.log('Sending results:', data.topScore);
    console.log(user?.name)
    const response = await axios.post(`http://localhost:3000/api/userData/update/${user?.name}`, data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Test result saved successfully:', response.data);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
useEffect(() => {
  if (
    results.accuracy !== 0 || 
    results.wpm !== 0 || 
    results.cpm !== 0 || 
    results.error !== 0
  ) {
    saveTestResult();
  }
}, [results]);

  if (countdown === 0 || word.length <= charTyped.length) {
    (async () => {  // Create an immediately invoked async function
      const { accuracy } = calculateAccuracy(totalWord, totalCharacterTyped);
      const { wpm, cpm } = calculateWPM(totalCharacterTyped, accuracy, time);
      const error = calculateErrorPercentage(accuracy);
      const timing = countdown;
  
      console.log('Test completed with values:', { wpm, cpm, accuracy, error });  
  
      setResults({
        accuracy,
        wpm,
        cpm,
        error,
        timing
      });
  
      setHistory({
        wordHistory: totalWord,
        typedHistory: totalCharacterTyped,
      });
      openModal('result');
      restartTest();
    })();  // Immediately invoke the async function
  }
  

  return {
    charTyped,
    countdown,
    cursorPosition,
    modalIsOpen,
    aboutModal,
    results,
    time,
    history,
    word,
    wordContainerFocused,
    setWordContainerFocused,
    setTime,
    resetCountdown,
    setLocalStorageValue,
    updateWord,
    restartTest,
    checkCharacter,
    closeModal,
    openModal,
    resetWord,  // Add resetWord to the returns
    selectedLanguage,  // Add selectedLanguage to the returns
  };
};