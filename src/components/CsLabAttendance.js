import React, { useState, useEffect, useRef, useCallback } from 'react';
import Quagga from 'quagga';
import supabase from '../supabaseClient';
import '../assets/styles/App.css';
import { useNavigate } from 'react-router-dom';

function CsLabAttendance() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isSuccessful, setIsSuccessful] = useState(false);
  const inputRef = useRef(null);
  const videoRef = useRef(null);
  const navigate = useNavigate();
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

        // Show tick icon
        setIsSuccessful(true);
        setTimeout(() => setIsSuccessful(false), 2000);
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
    if (videoRef.current) {
      Quagga.init({
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: videoRef.current, // Pass in the ref to the DOM element
          constraints: {
            width: 640,
            height: 480,
            facingMode: "environment"
          }
        },
        decoder: {
          readers: ["code_128_reader", "ean_reader", "ean_8_reader", "code_39_reader", "code_93_reader", "upc_reader", "upc_e_reader"]
        }
      }, (err) => {
        if (err) {
          console.error(err);
          return;
        }
        Quagga.start();
      });

      Quagga.onDetected((data) => {
        if (!scanningRef.current) {
          scanningRef.current = true;
          setBarcodeInput(data.codeResult.code);
          setTimeout(() => {
            scanningRef.current = false;
          }, 300);
        }
      });

      return () => {
        Quagga.stop();
      };
    }
  }, [videoRef]);

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
          {isSuccessful && <span className="tick-icon">✅</span>}
        </div>
        <button onClick={goToDashboard} className="dashboard-button">
          Go to Dashboard
        </button>
        <div className="video-container">
          <div ref={videoRef} className="video-feed"></div>
        </div>
      </header>
    </div>
  );
}

export default CsLabAttendance;
