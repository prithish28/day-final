import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import supabase from '../supabaseClient';
import '../assets/styles/App.css';
import tickGif from '../assets/tick.gif';
import { useNavigate } from 'react-router-dom';

function CsLabAttendance() {
  const [barcodeInput, setBarcodeInput] = useState('');
  const [showTick, setShowTick] = useState(false);
  const scannerRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleSave = async () => {
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

        setShowTick(true);
        setTimeout(() => setShowTick(false), 2000);
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
  };

  useEffect(() => {
    const expectedLength = 8;
    if (barcodeInput.length === expectedLength) {
      handleSave();
    }
  }, [barcodeInput]);

  useEffect(() => {
    const scannerConfig = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      formatsToSupport: [Html5QrcodeSupportedFormats.CODE_128],
    };

    scannerRef.current = new Html5QrcodeScanner(
      'reader',
      scannerConfig,
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        setBarcodeInput(decodedText);
      },
      (error) => {
        console.warn(`Error scanning: ${error}`);
      }
    );

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch((error) => {
          console.error('Error clearing scanner:', error);
        });
      }
    };
  }, []);

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
            onChange={(e) => setBarcodeInput(e.target.value)}
            ref={inputRef}
          />
        </div>
        <button onClick={goToDashboard} className="dashboard-button">
          Go to Dashboard
        </button>
        <div id="reader" className="video-container"></div>
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
