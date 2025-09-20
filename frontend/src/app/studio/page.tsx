'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

export default function StudioPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setRecordedVideo(videoUrl);

        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Error accessing camera/microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      // Create FormData for upload
      const formData = new FormData();
      formData.append('videoFile', file);
      formData.append('title', file.name);
      formData.append('description', `Uploaded video: ${file.name}`);
      formData.append('isPublic', 'true');

      // Upload to backend
      const strapiUrl = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';
      const response = await fetch(`${strapiUrl}/api/videos/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();
      console.log('Upload successful:', result);

      // Create a video URL for preview
      const videoUrl = URL.createObjectURL(file);
      setUploadedVideo(videoUrl);

      alert('Video uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetRecording = () => {
    setRecordedVideo(null);
    setUploadedVideo(null);
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-black/40 backdrop-blur-sm border-b border-yellow-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold text-white mb-4">
              Creator <span className="bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">Studio</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Record and upload videos for your PlayazKlub audience
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Recording Section */}
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-lg p-8 border border-yellow-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">🎥 Record Video</h2>

            <div className="space-y-6">
              {/* Video Preview */}
              <div className="aspect-video bg-black rounded-lg overflow-hidden border border-gray-700">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                {!isRecording && !recordedVideo && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl mb-4">📹</div>
                      <p className="text-gray-400">Camera preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Recorded Video Preview */}
              {recordedVideo && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden border border-green-500/50">
                  <video
                    src={recordedVideo}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-4 justify-center">
                {!isRecording ? (
                  <button
                    onClick={startRecording}
                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-red-500/25"
                  >
                    🎬 Start Recording
                  </button>
                ) : (
                  <button
                    onClick={stopRecording}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    ⏹️ Stop Recording
                  </button>
                )}

                {(recordedVideo || uploadedVideo) && (
                  <button
                    onClick={resetRecording}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300"
                  >
                    🔄 Reset
                  </button>
                )}
              </div>

              {isRecording && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 bg-red-500/20 border border-red-500/50 rounded-lg px-4 py-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-400 font-semibold">RECORDING</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-sm rounded-lg p-8 border border-yellow-500/20">
            <h2 className="text-2xl font-bold text-white mb-6">📤 Upload Video</h2>

            <div className="space-y-6">
              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center hover:border-yellow-400/50 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="video-upload"
                  disabled={isUploading}
                />
                <label htmlFor="video-upload" className="cursor-pointer">
                  <div className="text-6xl mb-4">📁</div>
                  <p className="text-gray-300 mb-2">
                    {isUploading ? 'Uploading...' : 'Click to select video file'}
                  </p>
                  <p className="text-gray-500 text-sm">
                    MP4, WebM, MOV up to 500MB
                  </p>
                </label>
              </div>

              {/* Upload Progress */}
              {isUploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-300">
                    <span>Uploading...</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full animate-pulse" style={{ width: '30%' }}></div>
                  </div>
                </div>
              )}

              {/* Uploaded Video Preview */}
              {uploadedVideo && (
                <div className="aspect-video bg-black rounded-lg overflow-hidden border border-green-500/50">
                  <video
                    src={uploadedVideo}
                    controls
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Upload Tips */}
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
                <h3 className="text-yellow-400 font-semibold mb-2">📋 Upload Tips</h3>
                <ul className="text-gray-300 text-sm space-y-1">
                  <li>• Use MP4 format for best compatibility</li>
                  <li>• Keep videos under 500MB for faster upload</li>
                  <li>• Ensure good lighting and clear audio</li>
                  <li>• Add engaging thumbnails</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 text-center">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/events"
              className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 text-black font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg shadow-yellow-500/25"
            >
              📺 Go Live
            </Link>
            <Link
              href="/podcasts"
              className="border-2 border-yellow-400/50 hover:border-yellow-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 hover:bg-yellow-400/10"
            >
              🎧 Manage Podcasts
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}