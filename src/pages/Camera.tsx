import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';

const Camera: React.FC = () => {
  const webcamRef = useRef<Webcam>(null);
  const [image, setImage] = useState<string | null>(null);

  const handleCapture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setImage(imageSrc);
    }
  }, [webcamRef]);

  const handleSave = () => {
    if (image) {
      const link = document.createElement('a');
      link.href = image;
      link.download = 'captured-image.jpg';
      link.click();
    }
  };

  const handleCancel = () => {
    setImage(null);
  };

  return (
    <div className="camera-container">
      {image ? (
        <div>
          <img src={image} alt="Captured" />
          <div>
            <button onClick={handleSave}>Lưu</button>
            <button onClick={handleCancel}>Hủy</button>
          </div>
        </div>
      ) : (
        <div>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            mirrored={true}
          />
          <button onClick={handleCapture}>Chụp Ảnh</button>
        </div>
      )}
    </div>
  );
};

export default Camera;