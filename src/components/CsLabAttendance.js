import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';
import supabase from '../supabaseClient';
import '../assets/styles/App.css';
import tickGif from '../assets/tick.gif'; // Import the tick GIF
import { useNavigate } from 'react-router-dom';

function CsLabAttendance() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showTick, setShowTick] = useState(false); // State to manage tick GIF visibility
  const videoRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const codeReaderRef = useRef(null);
  const scanningRef = useRef(false);

  const handleSave = useCallback(async () => {
    try {
      let { data: existingData, error: existError } = await supabase
        .from('attendance_exist')
        .select('*')
        .eq('adm_no', barcodeInput);

      if (existError) {
        throw existError;
      }

      if (existingData.length > 0) {
        const { adm_no, name, class_sec } = existingData[0];
        await supabase
          .from('attendance_new')
          .insert([{ adm_no, name, class_sec, timestamp: new Date() }]);
          
        // Show tick GIF after successful submission
        setShowTick(true);
        setTimeout(() => setShowTick(false), 2000); // Hide the GIF after 2 seconds

      } else {
        alert('NOT A TTS STUDENT');
      }
    } catch (error) {
      console.error('Error:', error);
    }

    setBarcodeInput('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [barcodeInput]);

  useEffect(() => {
    const expectedLength = 8;
    if (barcodeInput.length === expectedLength) {
      handleSave();
    }
  }, [barcodeInput, handleSave]);

  useEffect(() => {
    codeReaderRef.current = new BrowserMultiFormatReader();

    const startDecoding = async () => {
      try {
        await codeReaderRef.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result && !scanningRef.current) {
            scanningRef.current = true;
            setBarcodeInput(result.text);
            setTimeout(() => {
              scanningRef.current = false;
            }, 300); // Reduce debounce time to 300ms for faster response
          } else if (err) {
            console.error(err);
          }
        });
      } catch (err) {
        console.error('Error starting decoding:', err);
      }
    };

    startDecoding();

    return () => {
      codeReaderRef.current.reset();
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    setBarcodeInput(e.target.value);
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Day-Boarding Attendance</h1>
        <div className="input-container">
          <input
            type="text"
            className="barcode-input"
            placeholder="Scan barcode here"
            value={barcodeInput}
            onChange={handleInputChange}
            ref={inputRef}
          />
        </div>
        <button onClick={goToDashboard} className="dashboard-button">
          Go to Dashboard
        </button>
        <div className="video-container">
          <video ref={videoRef} className="video-feed"></video>
        </div>
        {showTick && (
          <div className="tick-gif">
            <img src={tickGif} alt="Success" />
          </div>
        )}
      </header>
    </div>
  );
}

export default CsLabAttendance;
