import { useState, useRef, useEffect, useCallback } from "react";

export const useCamera = () => {
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraInfo, setCameraInfo] = useState<{
    deviceId?: string;
    label?: string;
    width?: number;
    height?: number;
  }>({});
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Full camera enable function with comprehensive functionality
  const startCamera = useCallback(async (options?: {
    width?: number;
    height?: number;
    facingMode?: "user" | "environment";
    constraints?: MediaStreamConstraints;
  }) => {
    try {
      console.log("🎥 [CAMERA] Starting camera initialization...");
      setError(null);
      
      // Check if video element is available
      if (!videoRef.current) {
        console.error("❌ [CAMERA] Video element not available - component not mounted yet");
        setError("Camera not ready. Please try again in a moment.");
        return;
      }
      
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera not supported in this browser");
      }
      
      console.log("🔍 [CAMERA] Checking available cameras...");
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log(`📷 [CAMERA] Found ${videoDevices.length} camera(s):`, videoDevices.map(d => d.label || 'Unknown'));
      
      // Set default camera options
      const cameraOptions = {
        width: options?.width || 1280,
        height: options?.height || 720,
        facingMode: options?.facingMode || "user",
        ...options?.constraints
      };
      
      console.log("⚙️ [CAMERA] Camera configuration:", cameraOptions);
      
      // Request camera access with enhanced constraints
      const constraints: MediaStreamConstraints = {
        video: {
          width: { 
            ideal: cameraOptions.width,
            min: 640,
            max: 1920
          },
          height: { 
            ideal: cameraOptions.height,
            min: 480,
            max: 1080
          },
          facingMode: cameraOptions.facingMode,
          frameRate: { 
            ideal: 30,
            max: 60 
          }
        },
        audio: false
      };
      
      console.log("📡 [CAMERA] Requesting camera permission...");
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Get video track information
      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error("No video track found in stream");
      }
      
      const settings = videoTrack.getSettings();
      const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : null;
      
      console.log("📊 [CAMERA] Video track settings:", settings);
      console.log("🔧 [CAMERA] Video track capabilities:", capabilities);
      
      // Store stream reference
      streamRef.current = stream;
      
      // Double-check video element is still available
      if (!videoRef.current) {
        throw new Error("Video element became unavailable during initialization");
      }
      
      // Set video element source and play
      console.log("🎬 [CAMERA] Attaching stream to video element...");
      
      // Set up video element
      videoRef.current.srcObject = stream;
      videoRef.current.autoplay = true;
      videoRef.current.muted = true;
      videoRef.current.playsInline = true;
      
      // Wait for video to be ready
      await new Promise((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Video element lost during setup"));
          return;
        }
        
        const timeoutId = setTimeout(() => {
          reject(new Error("Video loading timeout - camera may be in use"));
        }, 10000); // 10 second timeout
        
        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeoutId);
          console.log("📹 [CAMERA] Video metadata loaded");
          console.log(`📏 [CAMERA] Video dimensions: ${videoRef.current?.videoWidth}x${videoRef.current?.videoHeight}`);
          resolve(true);
        };
        
        videoRef.current.onerror = (e) => {
          clearTimeout(timeoutId);
          console.error("❌ [CAMERA] Video element error:", e);
          reject(new Error("Video element error - camera may be in use"));
        };
      });
      
      // Start video playback
      try {
        await videoRef.current.play();
        console.log("▶️ [CAMERA] Video playback started successfully");
      } catch (playError) {
        console.warn("⚠️ [CAMERA] Video autoplay failed, attempting manual play:", playError);
        // Try manual play as fallback
        try {
          await videoRef.current.play();
          console.log("▶️ [CAMERA] Manual play successful");
        } catch (manualError) {
          console.error("❌ [CAMERA] Manual play also failed:", manualError);
          throw new Error("Camera is already in use by another application");
        }
      }
      
      // Update camera info
      setCameraInfo({
        deviceId: videoTrack.getSettings().deviceId,
        label: videoTrack.label || 'Default Camera',
        width: videoRef.current.videoWidth,
        height: videoRef.current.videoHeight
      });
      
      setIsActive(true);
      console.log("✅ [CAMERA] Camera successfully enabled and active!");
      console.log(`🎯 [CAMERA] Active camera: ${videoTrack.label || 'Default'} (${videoRef.current.videoWidth}x${videoRef.current.videoHeight})`);
      
      // Test video element is working
      if (videoRef.current && videoRef.current.readyState >= 2) {
        console.log("📹 [CAMERA] Video element is ready and playing");
      } else {
        console.warn("⚠️ [CAMERA] Video element might not be fully ready yet");
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access camera";
      console.error("❌ [CAMERA] Camera initialization failed:", errorMessage);
      
      // Handle specific error types
      if (errorMessage.includes("Permission denied")) {
        console.log("🔒 [CAMERA] Camera permission denied by user");
        setError("Camera permission denied. Please allow camera access and try again.");
      } else if (errorMessage.includes("NotFoundError")) {
        console.log("📷 [CAMERA] No camera found");
        setError("No camera found. Please connect a camera and try again.");
      } else if (errorMessage.includes("NotReadableError")) {
        console.log("🔒 [CAMERA] Camera is already in use");
        setError("Camera is already in use by another application.");
      } else if (errorMessage.includes("OverconstrainedError")) {
        console.log("⚠️ [CAMERA] Camera constraints not satisfiable");
        setError("Camera does not support the requested resolution.");
      } else if (errorMessage.includes("Video element not available")) {
        console.log("🎬 [CAMERA] Video element not ready");
        setError("Camera not ready. Please try again in a moment.");
      } else if (errorMessage.includes("already in use")) {
        console.log("🔒 [CAMERA] Camera is already in use");
        setError("Camera is already in use by another application.");
      } else {
        console.log("❓ [CAMERA] Unknown camera error");
        setError(`Camera error: ${errorMessage}`);
      }
      
      setIsActive(false);
      setCameraInfo({});
      
      // Cleanup on error
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, []);

  // Enhanced stop camera function
  const stopCamera = useCallback(() => {
    console.log("⏹️ [CAMERA] Stopping camera...");
    
    if (streamRef.current) {
      console.log("🔄 [CAMERA] Stopping media tracks...");
      streamRef.current.getTracks().forEach(track => {
        console.log(`📡 [CAMERA] Stopping track: ${track.kind} (${track.label || 'Unknown'})`);
        track.stop();
      });
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      console.log("🎬 [CAMERA] Clearing video element source...");
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    
    setIsActive(false);
    setCameraInfo({});
    setError(null);
    
    console.log("✅ [CAMERA] Camera successfully stopped");
  }, []);

  // Switch camera function (for devices with multiple cameras)
  const switchCamera = useCallback(async () => {
    console.log("🔄 [CAMERA] Switching camera...");
    
    if (!isActive) {
      console.log("⚠️ [CAMERA] Cannot switch - camera not active");
      return;
    }
    
    // Get current facing mode
    const currentTrack = streamRef.current?.getVideoTracks()[0];
    const currentFacingMode = currentTrack?.getSettings().facingMode;
    
    // Switch to opposite facing mode
    const newFacingMode = currentFacingMode === "user" ? "environment" : "user";
    
    console.log(`📷 [CAMERA] Switching from ${currentFacingMode} to ${newFacingMode}`);
    
    // Stop current camera
    stopCamera();
    
    // Start new camera with different facing mode
    await startCamera({ facingMode: newFacingMode });
  }, [isActive, startCamera, stopCamera]);

  // Get camera capabilities
  const getCameraCapabilities = useCallback(() => {
    if (!streamRef.current) return null;
    
    const videoTrack = streamRef.current.getVideoTracks()[0];
    if (!videoTrack) return null;
    
    const capabilities = videoTrack.getCapabilities?.();
    const settings = videoTrack.getSettings();
    
    return {
      capabilities,
      settings,
      info: cameraInfo
    };
  }, [cameraInfo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 [CAMERA] Cleaning up on component unmount...");
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => {
          console.log(`📡 [CAMERA] Stopping track on unmount: ${track.kind}`);
          track.stop();
        });
        streamRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
    };
  }, []);

  return {
    videoRef,
    isActive,
    error,
    cameraInfo,
    startCamera,
    stopCamera,
    switchCamera,
    getCameraCapabilities,
  };
};

