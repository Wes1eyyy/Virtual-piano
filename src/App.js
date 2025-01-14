import React, { useEffect, useState } from 'react';
import './App.css';

const NOTES = [
  { note: 'C', octave: 4, fileNumber: 40, key: 'z' },
  { note: 'C#', octave: 4, fileNumber: 41, key: 's' },
  { note: 'D', octave: 4, fileNumber: 42, key: 'x' },
  { note: 'D#', octave: 4, fileNumber: 43, key: 'd' },
  { note: 'E', octave: 4, fileNumber: 44, key: 'c' },
  { note: 'F', octave: 4, fileNumber: 45, key: 'v' },
  { note: 'F#', octave: 4, fileNumber: 46, key: 'g' },
  { note: 'G', octave: 4, fileNumber: 47, key: 'b' },
  { note: 'G#', octave: 4, fileNumber: 48, key: 'h' },
  { note: 'A', octave: 4, fileNumber: 49, key: 'n' },
  { note: 'A#', octave: 4, fileNumber: 50, key: 'j' },
  { note: 'B', octave: 4, fileNumber: 51, key: 'm' },
  { note: 'C', octave: 5, fileNumber: 52, key: 'q' },
  { note: 'C#', octave: 5, fileNumber: 53, key: '2' },
  { note: 'D', octave: 5, fileNumber: 54, key: 'w' },
  { note: 'D#', octave: 5, fileNumber: 55, key: '3' },
  { note: 'E', octave: 5, fileNumber: 56, key: 'e' },
  { note: 'F', octave: 5, fileNumber: 57, key: 'r' },
  { note: 'F#', octave: 5, fileNumber: 58, key: '5' },
  { note: 'G', octave: 5, fileNumber: 59, key: 't' },
  { note: 'G#', octave: 5, fileNumber: 60, key: '6' },
  { note: 'A', octave: 5, fileNumber: 61, key: 'y' },
  { note: 'A#', octave: 5, fileNumber: 62, key: '7' },
  { note: 'B', octave: 5, fileNumber: 63, key: 'u' },
  { note: 'C', octave: 6, fileNumber: 64, key: 'i' }
];

function App() {
  const [activeNotes, setActiveNotes] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const [audioFiles, setAudioFiles] = useState({});

  useEffect(() => {
    const loadAudioFiles = async () => {
      const audioMap = {};
      const loadPromises = NOTES.map(note => {
        return new Promise((resolve) => {
          const audio = new Audio(`/notes/${note.fileNumber}.wav`);
          audio.addEventListener('canplaythrough', () => {
            audioMap[`${note.note}${note.octave}`] = audio;
            setLoadedCount(prev => prev + 1);
            resolve();
          });
          audio.addEventListener('error', () => {
            console.error(`Error loading audio file: ${note.fileNumber}.wav`);
            resolve();
          });
        });
      });

      await Promise.all(loadPromises);
      setAudioFiles(audioMap);
      setIsLoading(false);
    };

    loadAudioFiles();
  }, []);

  const playNote = (note) => {
    const noteId = `${note.note}${note.octave}`;
    const audio = audioFiles[noteId];
    if (audio) {
      audio.currentTime = 0;
      audio.play()
        .catch(error => {
          console.error('Error playing audio:', error);
        });
      setActiveNotes(new Set([...activeNotes, noteId]));
    }
  };

  const stopNote = (note) => {
    const newActiveNotes = new Set(activeNotes);
    newActiveNotes.delete(`${note.note}${note.octave}`);
    setActiveNotes(newActiveNotes);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      const note = NOTES.find(n => n.key === e.key.toLowerCase());
      if (note && !activeNotes.has(`${note.note}${note.octave}`)) {
        playNote(note);
      }
    };

    const handleKeyUp = (e) => {
      const note = NOTES.find(n => n.key === e.key.toLowerCase());
      if (note) {
        stopNote(note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [activeNotes]);

  return (
    <div className="app">
      <h1>Virtual Piano</h1>
      {isLoading ? (
        <div className="loading">
          加载音频文件... {loadedCount}/{NOTES.length}
        </div>
      ) : (
        <div className="piano">
          {NOTES.map((note) => (
            <div
              key={`${note.note}${note.octave}`}
              className={`key ${note.note.includes('#') ? 'black' : 'white'} 
                ${activeNotes.has(`${note.note}${note.octave}`) ? 'active' : ''}`}
              onMouseDown={() => playNote(note)}
              onMouseUp={() => stopNote(note)}
              onMouseLeave={() => stopNote(note)}
            >
              <span className="note-name">{note.note}</span>
              <span className="key-binding">{note.key}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
