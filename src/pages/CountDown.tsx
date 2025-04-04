// Countdown.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate


const Countdown: React.FC = () => {
  const navigate = useNavigate(); // Sử dụng useNavigate để điều hướng
  const numbers = [3, 2, 1];

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/camera'); // Chuyển hướng đến Camera sau 3 giây
    }, 3000); // Đếm ngược 3 giây

    return () => clearTimeout(timer); // Dọn dẹp timer khi component unmount
  }, [navigate]);

  return (
    <div className="countdown">
      {numbers.map((number) => (
        <div className="number" key={number}>
          <h2>{number}</h2>
        </div>
      ))}
    </div>
  );
};

export default Countdown;
