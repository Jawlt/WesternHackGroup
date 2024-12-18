import { useState } from 'react';
import styled from 'styled-components';

import { useClipboard } from '../hooks/useClipboard';
import { useScreenShot } from '../hooks/useScreenShot';
import { useThemeContext } from '../hooks/useTheme';

import { IoCopy } from 'react-icons/io5';
import { FaCameraRetro } from 'react-icons/fa';

import Character from './Character';
import ResultCard from './ResultCard';

import type { Results } from '../types';
import type { HistoryType } from '../types';

type ModalContentProps = {
  totalTime: number;
  history: HistoryType;
  results: Results;
};

const StyledCopyButton = styled.button`
  &:hover {
    color: ${({ theme }) => theme.text.secondary};
  }
`;

const ModalContent = ({ totalTime, history, results }: ModalContentProps) => {
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);

  const { copyTextToClipboard } = useClipboard();
  const { ref, image, getImage } = useScreenShot();
  const { systemTheme } = useThemeContext();

  return (
    <div
      className='mx-auto flex h-full w-[95%] flex-col gap-10 pb-10 pt-8 font-mono'
      style={{
        color: systemTheme.text.primary,
      }}
    >
      <div
        ref={ref}
        className='flex-[3] px-5 py-7'
        style={{
          backgroundColor: systemTheme.background.primary,
        }}
      >
        <div className=' grid grid-flow-col grid-rows-6 justify-center gap-4 sm:grid-rows-4 sm:justify-normal lg:grid-rows-2 lg:justify-normal lg:gap-10 '>
          <ResultCard
            title='wpm/cpm'
            tooltipId='wpm'
            tooltipContent='words per minute / characters per minute'
            tooltipPlace='top'
            results={`${results.wpm} / ${results.cpm}`}
          />
          <ResultCard
            title='acc.'
            tooltipId='accuracy'
            tooltipContent='accuracy percentage'
            tooltipPlace='bottom'
            results={`${Math.round(results.accuracy)}%`}
          />
          <ResultCard
            title='character'
            tooltipId='character'
            tooltipContent='correct/incorrect'
            tooltipPlace='top'
            results={`${Math.round(
              history.typedHistory.length * (results.accuracy / 100)
            )} / ${Math.round(
              history.typedHistory.length * (results.error / 100)
            )}`}
          />
          <ResultCard
            title='err.'
            tooltipId='error'
            tooltipContent='error percentage'
            tooltipPlace='bottom'
            results={`${Math.round(results.error)}%`}
          />
          <ResultCard
            title='time'
            tooltipId='time'
            tooltipContent='time taken to complete the test'
            tooltipPlace='top'
            results={`${totalTime / 1000}s`}
          />
          <ResultCard
            title='total'
            tooltipId='total'
            tooltipContent='total character typed'
            tooltipPlace='bottom'
            results={`${history.typedHistory.length}`}
          />
        </div>
      </div>

      <div className='flex-[3] px-5'>
        <div className='flex items-center gap-2'>
          <div
            className='rounded-md'
            style={{
              backgroundColor: systemTheme.background.secondary,
            }}
          >
            {copied === true ? (
              <span
                className='p-5 '
                style={{ color: systemTheme.text.secondary }}
              >
                Copied ✅
              </span>
            ) : null}
          </div>
        </div>
        <div className='mt-3 text-lg lg:text-xl'>
          {history.typedHistory.split('').map((char, index) => {
            return (
              <Character
                key={index + char}
                character={history.wordHistory[index]}
                state={history.wordHistory[index] === char}
              />
            );
          })}
        </div>
      </div>

      <div className='flex flex-[1] flex-col px-5'>
        <div
          className='group mt-auto flex cursor-pointer items-center gap-2 '
          onClick={async () => {
            try {
              getImage();
              const res = await fetch(image);
              const data = await res.blob();
              await navigator.clipboard.write([
                new ClipboardItem({ [data.type]: data }),
              ]);

              setImageCopied(true);
              setTimeout(() => {
                setImageCopied(false);
              }, 2000);
            } catch (error) {
              console.log(error);
            }
          }}
        >
        </div>
      </div>
    </div>
  );
};

export default ModalContent;
