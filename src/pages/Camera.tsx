import { useEffect, useRef, useState } from "react";

const Camera = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<HTMLDivElement[]>([]);

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
        mediaRecorder.start();

        setTimeout(() => {
          mediaRecorder.stop();
          setTimeout(() => {
            startRecording();
          }, 100);
        }, 10000);
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
    };

    const createStar = () => {
      const star = document.createElement("div");
      star.className = "star";
      star.innerText = "⭐️";
      star.style.left = `${Math.random() * 100}vw`;
      star.style.animationDuration = `${Math.random() * 2 + 3}s`;
      document.querySelector(".camera-container")?.appendChild(star);
      starsRef.current.push(star);

      star.addEventListener("animationend", () => {
        star.remove();
        starsRef.current = starsRef.current.filter((s) => s !== star);
      });
    };

    const startFallingStars = () => {
      setInterval(createStar, 200); // Giảm thời gian xuống 200ms để tạo nhiều ngôi sao hơn
    };

    const drawCanvas = () => {
      if (canvasRef.current && videoRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
          starsRef.current.forEach((star) => {
            const rect = star.getBoundingClientRect();
            ctx.font = "20px Arial";
            ctx.fillText(star.innerText, rect.left, rect.top);
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
  }, []);

  return (
    <div className="camera-container">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full"
        style={{ display: "none" }} // Ẩn phần tử video
      />
      <canvas ref={canvasRef} className="w-full h-full object-contain" /> {/* Sử dụng object-contain cho canvas */}
    </div>
  );
};

export default Camera;
