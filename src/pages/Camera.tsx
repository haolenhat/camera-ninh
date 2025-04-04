import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<HTMLDivElement[]>([]);
  const navigate = useNavigate(); 

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        setStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        startRecording();
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    const startRecording = () => {
      if (canvasRef.current) {
        const canvasStream = canvasRef.current.captureStream(30);
        const mediaRecorder = new MediaRecorder(canvasStream);
        mediaRecorderRef.current = mediaRecorder;
        recordedChunks.current = [];
    
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            recordedChunks.current.push(event.data);
          }
        };
    
        mediaRecorder.onstop = saveVideo;
    
        // Bắt đầu ghi
        mediaRecorder.start();
    
        const recordDuration = 10000; // Thời gian quay trong mili giây (10 giây)
    
        const recordingInterval = setInterval(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
          }
          setTimeout(() => {
            if (mediaRecorder.state === "inactive") {
              mediaRecorder.start();
            }
          }, 100);
        }, recordDuration);
    
        // Dừng quay khi component unmount
        return () => {
          clearInterval(recordingInterval);
          mediaRecorder.stop(); // Đảm bảo dừng ghi khi component unmount
        };
      }
    };
    

    const saveVideo = () => {
      const blob = new Blob(recordedChunks.current, { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recorded-video-${Date.now()}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      navigate('/'); // Chuyển hướng đến trang chính
    };

    const createStar = () => {
      const star = document.createElement("div");
      star.className = "star";
      star.innerText = "⭐️";
      star.style.left = `${Math.random() * 100}vw`;
      document.querySelector(".camera-container")?.appendChild(star);
      starsRef.current.push(star);

      star.addEventListener("animationend", () => {
        star.remove();
        starsRef.current = starsRef.current.filter((s) => s !== star);
      });
    };

    const startFallingStars = () => {
      setInterval(createStar, 500);
    };

    const drawCanvas = () => {
      if (canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        const video = videoRef.current;

        if (ctx && video.videoWidth > 0 && video.videoHeight > 0) {
          const videoAspect = video.videoWidth / video.videoHeight;
          const screenAspect = window.innerWidth / window.innerHeight;

          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          let drawWidth = canvas.width;
          let drawHeight = canvas.height;

          if (videoAspect > screenAspect) {
            drawHeight = canvas.height;
            drawWidth = videoAspect * drawHeight;
          } else {
            drawWidth = canvas.width;
            drawHeight = drawWidth / videoAspect;
          }

          const offsetX = (canvas.width - drawWidth) / 2;
          const offsetY = (canvas.height - drawHeight) / 2;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Vẽ video mà không lật
          ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

          // Vẽ các ngôi sao lên canvas tại vị trí đúng
          starsRef.current.forEach((star) => {
            const rect = star.getBoundingClientRect();
            const canvasRect = canvas.getBoundingClientRect();
            const x = rect.left - canvasRect.left;
            const y = rect.top - canvasRect.top;
            ctx.font = "24px Arial";
            ctx.fillText(star.innerText, x, y);
          });
        }
      }

      requestAnimationFrame(drawCanvas);
    };

    startCamera();
    startFallingStars();
    drawCanvas();

    return () => {
      mediaRecorderRef.current?.stop();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [navigate]); // Đảm bảo navigate nằm trong dependencies array

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        onLoadedMetadata={() => {
          if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
          }
        }}
        style={{ display: "none" }}
      />
      <canvas ref={canvasRef} className="w-full h-full object-contain" />
    </div>
  );
};

export default Camera;
