import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<HTMLDivElement[]>([]);
  const starIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const navigate = useNavigate();

  const [count, setCount] = useState<number>(3);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Bắt đầu đếm ngược
  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [count]);

  // Khởi động camera và canvas
  useEffect(() => {
    const startCamera = async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });

        setStream(userStream);
        if (videoRef.current) {
          videoRef.current.srcObject = userStream;
        }

        setTimeout(() => {
          startRecording();
          startFallingStars();
        }, 3000); // Delay 3s
      } catch (error) {
        console.error("Error accessing camera:", error);
      }
    };

    startCamera();
    drawCanvas();

    return () => {
      mediaRecorderRef.current?.stop();
      stream?.getTracks().forEach(track => track.stop());
      if (starIntervalRef.current) clearInterval(starIntervalRef.current);
    };
  }, [navigate]);

  // Hàm vẽ canvas liên tục
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
        ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);

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

  // Ghi hình
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

      mediaRecorder.onstop = () => {
        saveVideo();

        // Dừng sao
        stopFallingStars();

        // Sau 3s, khởi động lại
        setTimeout(() => {
          startFallingStars();
          startRecording();
        }, 3000);
      };

      mediaRecorder.start();

      setTimeout(() => {
        if (mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
      }, 10000); // quay 10s
    }
  };

  // Lưu video
// Lưu video
const saveVideo = () => {
  const blob = new Blob(recordedChunks.current, { type: "video/mp4" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `recorded-video-${Date.now()}.mp4`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // Khởi động lại đếm ngược
  setCount(3);
  setIsVisible(true);
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
    if (!starIntervalRef.current) {
      starIntervalRef.current = setInterval(createStar, 500);
    }
  };

  const stopFallingStars = () => {
    if (starIntervalRef.current) {
      clearInterval(starIntervalRef.current);
      starIntervalRef.current = null;
    }

    starsRef.current.forEach((star) => star.remove());
    starsRef.current = [];
  };

  return (
    <div className="camera-container">
      <div className="b">{isVisible && <span className="a">{count}</span>}</div>

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
