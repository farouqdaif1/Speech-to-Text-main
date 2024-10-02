/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import React, { useRef, useState, useEffect } from "react";
import RecordingTimer from "../common/RecordingTimer";
import { Visualizer } from "react-sound-visualizer";
import Lottie from "lottie-react";
import recordLottie from "../../assets/record-lottie.json";

import { formatTimeStamp } from "../../utils/formatTimeStamp";
import Image from "next/image";
import PermissionModal from "../common/PermissionModal";
import playbuttonSvg from "../../assets/play-button-svg.svg";

function RecordingContainer({ userEmail, accessToken }) {
  const [recording, setRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [waveform, setWaveform] = useState(null);
  const mediaRecorderRef = useRef(null);
  const [displayAudio, setDisplayAudio] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const [showRetry, setShowRetry] = useState(false);
  const [audio, setAudio] = useState(null); // State to hold audio stream
  const [fullTranscript, setFullTranscript] = useState(""); // State variable to hold the full transcript
  const [stoped, setStopped] = useState(null);
  const [docId, setDocId] = useState(null);
  const [recordingStartDate, setRecordingStartDate] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const socketRef = useRef(null);
  const [isPermissionModalOpen, setPermissionModalOpen] = useState(false);
  const [list, setList] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  let mediaStream;
  useEffect(() => {
    const beforeUnloadHandler = (event) => {
      if (recording) {
        // Recommended for modern browsers
        event.preventDefault();
        // Required for legacy browsers (Chrome < 119, Edge < 119)
        event.returnValue = true;
      }
    };
    window.addEventListener("beforeunload", beforeUnloadHandler);
    // Cleanup the event listener when component unmounts
    return () => {
      window.removeEventListener("beforeunload", beforeUnloadHandler);
    };
  }, [recording]);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      setAudio(stream);
      // eslint-disable-next-line react-hooks/exhaustive-deps
      mediaStream = stream;

      console.log("stream:", stream);
      console.log("media stream:", mediaStream);
      mediaRecorderRef.current = new MediaRecorder(stream);
      mediaRecorderRef.current.addEventListener(
        "dataavailable",
        handleDataAvailable
      );
    });

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stoped) {
      handleSendRecording();
    }
  }, [stoped]);
  const textareaRef = useRef(null);

  // Scroll to the bottom whenever new text is added
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [fullTranscript]);

  const handleStartRecording = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setAudio(stream);
      setIsPlaying(true);

      // Set the recording start date
      let recordingFormattedDate =
        recordingStartDate || formatTimeStamp(new Date());
      if (!recordingStartDate) {
        setRecordingStartDate(recordingFormattedDate);
      }

      console.log("recordingFormattedDate:", recordingFormattedDate);

      let existingTranscript = fullTranscript || "";

      console.log("existingTranscript:", existingTranscript);

      // Set up WebSocket connection (e.g., to Gladia or your own API)
      const socket = new WebSocket(
        "wss://api.deepgram.com/v1/listen?model=nova-2-medical&smart_format=true",
        ["token", "3302291b9d64b7db3a6310139b50b3e9e60dc6bb"]
      );
      socketRef.current = socket; // Store the socket in the ref

      socket.onopen = () => {
        console.log({ event: "onopen" });
        handleStartMediaRecorder(socket);
      };

      // Handle live transcription from the WebSocket
      socket.onmessage = (message) => {
        const data = JSON.parse(message.data);
        const transcript = data.channel.alternatives[0].transcript;

        if (transcript && data.is_final) {
          existingTranscript += transcript + " ";
          console.log("existingTranscript:", existingTranscript);
          setFullTranscript((prev) => prev + transcript + " ");
          const email = userEmail || "NO_ACCOUNT_ID";
          const recordingId = `${email}__${recordingFormattedDate}`;
          const transcriptObject = {
            id: recordingId,
            created_date: recordingFormattedDate,
            transcript: existingTranscript,
          };

          setDocId(recordingId);

          let transcriptSavedObject =
            JSON.parse(localStorage.getItem("transcript")) || {};
          if (!transcriptSavedObject[email]) {
            transcriptSavedObject[email] = [];
          }

          const existingIndex = transcriptSavedObject[email].findIndex(
            (item) => item.id === transcriptObject.id
          );
          if (existingIndex !== -1) {
            transcriptSavedObject[email][existingIndex] = transcriptObject;
          } else {
            transcriptSavedObject[email].push(transcriptObject);
          }

          localStorage.setItem(
            "transcript",
            JSON.stringify(transcriptSavedObject)
          );
        }
      };

      socket.onclose = () => {
        console.log({ event: "onclose" });
      };

      socket.onerror = (error) => {
        console.log({ event: "onerror", error });
      };

      setRecording(true);
      setDisplayAudio(false);
      setAudioUrl("");
      waveform && waveform.empty();
      waveform && waveform.setMute(true);
    } catch (err) {
      console.error("Permission denied or no microphone found", err);
      setPermissionModalOpen(true); // Open the modal if permission is denied
    }
  };

  const handleStartMediaRecorder = (socket) => {
    let mimeType = "audio/webm";
    if (MediaRecorder.isTypeSupported("audio/mp4")) {
      mimeType = "audio/mp4";
    } else if (MediaRecorder.isTypeSupported("audio/aac")) {
      mimeType = "audio/aac";
    }

    mediaRecorderRef.current = new MediaRecorder(audio, {
      mimeType: mimeType,
    });

    mediaRecorderRef.current.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0 && socket.readyState === 1) {
        socket.send(event.data);
      }
    });

    mediaRecorderRef.current.start(10); // Start recording in chunks of 10ms
  };

  const handleStopRecording = async () => {
    try {
      setRecording(false);
      setIsPaused(false);
      setDisplayAudio(true);
      setIsPlaying(false);

      waveform && waveform.setMute(false);
      setAudio(null); // Reset audio streams
      setStopped(true);
      if (mediaRecorderRef.current) {
        // Stop the recorder
        await mediaRecorderRef.current.stop();

        // Close the WebSocket connection
        if (socketRef.current) {
          socketRef.current.close();
        }

        // Clear the audio stream
        if (audio) {
          audio.getTracks().forEach((track) => track.stop());
        }

        setRecording(false);
        setDisplayAudio(true); // Show audio controls or a message
        console.log("Recording stopped");
      }
    } catch (error) {
      console.error("Error stopping the recording:", error);
    }
  };

  const handlePauseRecording = () => {
    setIsPaused(true);
    setIsPlaying(false);

    // Stop the media recording
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    // Close the WebSocket connection
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.close();
    }

    // Save the current fullTranscript
    const email = userEmail;

    const recordingFormattedDate =
      recordingStartDate || new Date().toISOString();
    const transcriptObject = {
      id: `${email}__${recordingFormattedDate}`,
      created_date: recordingFormattedDate,
      transcript: fullTranscript,
    };

    // Save the transcript object to localStorage
    let transcriptSavedObject =
      JSON.parse(localStorage.getItem("transcript")) || {};
    if (!transcriptSavedObject[email]) {
      transcriptSavedObject[email] = [];
    }

    const existingIndex = transcriptSavedObject[email].findIndex(
      (item) => item.id === transcriptObject.id
    );
    if (existingIndex !== -1) {
      transcriptSavedObject[email][existingIndex] = transcriptObject;
    } else {
      transcriptSavedObject[email].push(transcriptObject);
    }

    localStorage.setItem("transcript", JSON.stringify(transcriptSavedObject));

    // Update state to reflect that recording is paused
    // setRecording(false);
  };
  const handlePlayRecording = () => {
    setIsPaused(false);
    // Your logic to play recording
    setIsPlaying(true);
    handleStartRecording();
  };

  useEffect(() => {
    if (waveform && audioUrl) {
      waveform.on("finish", handleAudioEnded);
    }
  }, [waveform, audioUrl]);

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioEnded(true);
    setAudio(null);
  };

  const handleDataAvailable = (event) => {
    // console.log("handle data called")
    const audioBlob = new Blob([event.data], { type: "audio/wav" });
    const audioUrl = URL.createObjectURL(audioBlob);
    setAudioUrl(audioUrl);
    setAudioBlob(audioBlob);
    // console.log("handle data done");
  };

  const handleSendRecording = async () => {
    console.log("sending record");

    if (localStorage.getItem("transcript")) {
      let savedTranscript = localStorage.getItem("transcript");
    }

    console.log("fullTranscript:", fullTranscript);

    if (audioUrl || fullTranscript || stoped) {
      try {
        setShowRetry(false);
        setLoading(true);

        const formData = new FormData();

        formData.append("account_id", userEmail || "NO_ACCOUNT_ID");
        formData.append("doc_id", docId);
        formData.append("transcript", fullTranscript);
        formData.append("created_date", recordingStartDate);

        // console.log(recordingStartDate);
        console.log("form data appended");
        console.log(formData.toString());
        console.log("Send Data", fullTranscript);
        const res = await fetch(
          `https://sina.azurewebsites.net/api/define_words?code=Oc_puMvVIB5xvHRQRLWkiumHnkZe5_otVjYJEJu9lcpOAzFuIqg9iA%3D%3D&query=${fullTranscript}`
        );
        const data = await res.json();
        setList(data);
        console.log("data", data);
      } catch (err) {
        console.error("Failed to send the recording: ", err);
        setShowRetry(true);
      } finally {
        setLoading(false); // Hide spinner regardless of success or failure
      }
    }
  };

  const recordstyle = {
    height: 175,
  };

  return (
    <div>
      <PermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setPermissionModalOpen(false)}
      />
      <div className=" w-full text-center flex flex-col justify-center  ">
        <div className="w-full  py-8 h-[80vh]">
          {!displayAudio ? (
            <>
              {!recording ? (
                <>
                  <h2 className="text-3xl text-center font-motiva-bold ">
                    Press to Start Recording
                  </h2>

                  <div className="flex justify-end ">
                    <div className="flex gap-5 lg:gap-10 mt-10 flex-col lg:flex-row items-center justify-center lg:items-start lg:justify-start"></div>
                  </div>
                  <button
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                      padding: "5rem",
                    }}
                    onClick={handleStartRecording}
                    disabled={recording}
                  >
                    <Lottie
                      animationData={recordLottie}
                      speed={0.5}
                      style={recordstyle}
                    />
                  </button>
                </>
              ) : (
                <>
                  <h2
                    className="text-3xl font-medium mb-2"
                    style={{ padding: "2rem" }}
                  >
                    Recording in progress...
                  </h2>

                  <span className="text-2xl">
                    <span
                      className="font-bold text-3xl"
                      style={{ color: "#608CFE" }}
                    ></span>
                  </span>
                  <RecordingTimer recording={recording} pause={isPaused} />

                  <div className="container">
                    <Visualizer
                      audio={audio}
                      mode="continuous"
                      strokeColor="#DA3025"
                      autoStart
                    >
                      {({ canvasRef, stop, start, reset }) => (
                        <div>
                          {!isPaused ? (
                            <canvas
                              ref={canvasRef}
                              width={window.innerWidth >= 1024 ? 4000 : 1000}
                              height={100}
                              className="text-center container my-20 lg:pl-20 self-center"
                            />
                          ) : (
                            <div
                              className="text-center my-20 "
                              style={{ width: "100%" }}
                            >
                              {null}
                            </div>
                          )}
                        </div>
                      )}
                    </Visualizer>
                  </div>

                  <div className="flex justify-center mt-10 space-x-4">
                    <button
                      onClick={
                        isPaused ? handlePlayRecording : handlePauseRecording
                      }
                      disabled={!recording}
                      className="bg-sinaBlue-light hover:bg-sinaBlue w-28 h-28 rounded-full flex justify-center items-center "
                    >
                      {isPaused ? (
                        <Image
                          src={playbuttonSvg}
                          className="w-14 ml-2"
                          alt="play button"
                        ></Image>
                      ) : (
                        <div className="flex space-x-1">
                          <div className="w-4 h-14 bg-sinaBlue-dark" />
                          <div className="w-4 h-14 bg-sinaBlue-dark" />
                        </div>
                      )}
                    </button>
                    <button
                      onClick={handleStopRecording}
                      disabled={!recording}
                      className="bg-sinaBlue/25 hover:bg-sinaBlue w-28 h-28 rounded-full flex justify-center items-center "
                    >
                      <div className="w-14 h-14 bg-sinaBlue-dark" />
                    </button>
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="space-y-4 space-x-2 w-[100%] flex items-center justify-center ">
              {isLoading ? (
                <>
                  <div className="container mx-auto text-center">
                    <h1 className="text-4xl font-bold mb-5">Processing...</h1>
                    <p className="text-3xl font-light mb-10">
                      This may take a few minutes.
                    </p>

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.3}
                      stroke="currentColor"
                      className="w-28 h-28 text-sinaBlue animate-spin mx-auto"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                      />
                    </svg>
                    {showRetry ? (
                      <div className="flex justify-center">
                        <button
                          className="flex gap-3 items-center mt-5 bg-sinaBlue-dark py-2 px-5 rounded-sm"
                          onClick={handleSendRecording}
                        >
                          <span className="font-medium">Retry</span>
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="space-x-2 w-[80%]">
                  {list &&
                    list.map((item, index) => {
                      return (
                        <div
                          key={index}
                          className="relative inline-block space-x-2 group"
                        >
                          <span className="text-blue-600 font-medium cursor-pointer group z-3">
                            {item.word}
                          </span>
                          <div className="absolute left-0 mt-1 bg-white p-2  min-w-[300px] hidden border border-gray-200 z-10 rounded shadow-lg group-hover:block">
                            <p>
                              {item?.definitions?.[0]?.definition ||
                                "No definition available"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
        {isPlaying && (
          <div className="w-full h-[20vh] p-4  flex align-center justify-center">
            {fullTranscript && (
              <textarea
                ref={textareaRef}
                readOnly
                className="bg-black/70 text-white text-center  text-lg px-4 py-2 rounded-md  w-[60%] mx-auto fixed bottom-10  overflow-y-auto"
                value={fullTranscript}
                style={{
                  lineHeight: "1.5em",
                  maxHeight: "4.5em",
                  overflowY: "scroll",
                  scrollbarWidth: "none", // For Firefox
                  msOverflowStyle: "none", // For IE and Edge
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default RecordingContainer;
