import React, { useState, useEffect, useRef } from "react";
import Wavesurfer from "wavesurfer.js";

const AudioInput = ({ onAudioUpload }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [recorder, setRecorder] = useState(null);
  const waveformRef = useRef(null); // Ref to hold the waveform container
  const waveSurferRef = useRef(null); // To store the WaveSurfer instance
  const [audioChunks, setAudioChunks] = useState([]); // Store audio chunks

  // Initialize the WaveSurfer instance only once after component mounts
  useEffect(() => {
    if (waveformRef.current && !waveSurferRef.current) {
      waveSurferRef.current = Wavesurfer.create({
        container: waveformRef.current,
        waveColor: "#6b8e23",
        progressColor: "#3e2723",
        height: 100,
        barWidth: 2,
        barRadius: 3,
      });
    }

    return () => {
      if (waveSurferRef.current) {
        waveSurferRef.current.destroy(); // Clean up WaveSurfer on component unmount
      }
    };
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Start recording the audio
  const startRecording = () => {
    if (!navigator.mediaDevices) {
      console.error("Your browser does not support media devices");
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();

        setAudioChunks([]); // Reset audio chunks before new recording

        mediaRecorder.ondataavailable = (event) => {
          setAudioChunks((prevChunks) => [...prevChunks, event.data]);

          const audioChunkBlob = new Blob([event.data], { type: "audio/wav" });

          // Dynamically update the waveform with the audio chunk
          if (waveSurferRef.current) {
            waveSurferRef.current.loadBlob(audioChunkBlob); // Load audio chunk to update waveform
          }
        };

        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          setAudioBlob(audioBlob);
          const audioURL = URL.createObjectURL(audioBlob);
          setAudioURL(audioURL);
          setAudioFile(audioBlob);
          onAudioUpload(audioBlob); // Pass audio file to parent
        };

        setRecorder(mediaRecorder);
        setIsRecording(true); // Set recording state to true
      })
      .catch((error) => {
        console.error("Error accessing the microphone:", error);
      });
  };

  // Stop recording the audio
  const stopRecording = () => {
    if (recorder) {
      recorder.stop();
      setIsRecording(false); // Set recording state to false
    }
  };

  // Handle file upload
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith("audio")) {
      setAudioFile(file);
      const audioURL = URL.createObjectURL(file); // Object URL for file preview
      setAudioURL(audioURL);
      onAudioUpload(file);
    }
  };

  return (
    <div className="mt-8 w-[700px] mx-auto">
      {/* Flex Row: Upload + Record Boxes */}
      <div className="flex justify-between gap-4">
        {/* Upload Audio Box */}
        <div className="border-2 border-dashed border-[#6b8e23] p-4 w-[600px] h-[140px] mx-auto">
          <h3 className="text-xl text-center text-[#3e2723] font-semibold mb-4">
            Upload Audio File
          </h3>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Record Audio Box */}
        <div className="border-2 border-dashed border-[#6b8e23] p-4 w-[600px] h-[140px] mx-auto">
          <h3 className="text-xl text-center text-[#3e2723] font-semibold mb-4">
            Record Your Voice
          </h3>
          {!isRecording ? (
            <button
              onClick={startRecording}
              className="bg-green-600 text-white p-4 rounded-full shadow-md hover:bg-green-700 w-full"
            >
              Start Recording
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-red-600 text-white p-4 rounded-full shadow-md hover:bg-red-700 w-full"
            >
              Stop Recording
            </button>
          )}

          {/* Waveform Visualization (During Recording) */}
          {isRecording && (
            <div className="mt-6">
              <div
                ref={waveformRef}
                className="w-full"
                style={{ height: "100px" }}
              ></div>
            </div>
          )}
        </div>
      </div>

      {/* Audio Preview*/}
      {audioURL && !isRecording && (
        <div className="mt-8 flex justify-center">
          <audio controls src={audioURL} className="w-[400px]"></audio>
        </div>
      )}
    </div>
  );
};

export default AudioInput;
