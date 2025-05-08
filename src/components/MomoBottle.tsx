"use client";

import React, { useRef, useState } from "react";

const BOTTLE_CONTENT_Y_START = 45;
const BOTTLE_MAX_LIQUID_HEIGHT = 140;
const SLIDER_MIN_X = 25;
const SLIDER_MAX_X = 95;
const SLIDER_Y = 203;

export default function MomoBottle() {
  const [percent, setPercent] = useState(30);
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);

  // Calculate derived values
  const liquidHeight = (percent / 100) * BOTTLE_MAX_LIQUID_HEIGHT;
  const liquidY = BOTTLE_CONTENT_Y_START + BOTTLE_MAX_LIQUID_HEIGHT - liquidHeight;
  const thumbX = SLIDER_MIN_X + (percent / 100) * (SLIDER_MAX_X - SLIDER_MIN_X);

  // Drag handlers
  const getSvgX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const svgRect = svg.getBoundingClientRect();
    const svgWidth = svgRect.width;
    const viewBoxWidth = 120;
    const svgX = clientX - svgRect.left;
    return (svgX / svgWidth) * viewBoxWidth;
  };

  const updateFromX = (svgX: number) => {
    const newThumbX = Math.max(SLIDER_MIN_X, Math.min(SLIDER_MAX_X, svgX));
    const newPercent = Math.round(
      ((newThumbX - SLIDER_MIN_X) / (SLIDER_MAX_X - SLIDER_MIN_X)) * 100
    );
    setPercent(newPercent);
  };

  const onThumbDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDragging.current = true;
    window.addEventListener("mousemove", onDrag as (e: MouseEvent) => void);
    window.addEventListener("touchmove", onDrag as (e: TouchEvent) => void);
    window.addEventListener("mouseup", onDragEnd);
    window.addEventListener("touchend", onDragEnd);
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging.current) return;
    let clientX: number;
    if (e.type === "touchmove") {
      clientX = (e as TouchEvent).touches[0].clientX;
    } else {
      clientX = (e as MouseEvent).clientX;
    }
    const svgX = getSvgX(clientX);
    updateFromX(svgX);
  };

  const onDragEnd = () => {
    isDragging.current = false;
    window.removeEventListener("mousemove", onDrag as (e: MouseEvent) => void);
    window.removeEventListener("touchmove", onDrag as (e: TouchEvent) => void);
    window.removeEventListener("mouseup", onDragEnd);
    window.removeEventListener("touchend", onDragEnd);
  };

  const onTrackClick = (e: React.MouseEvent) => {
    const svgX = getSvgX(e.clientX);
    updateFromX(svgX);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 240"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: 300, width: "100%", height: "auto", touchAction: "none" }}
    >
      <defs>
        <clipPath id="bottleClip">
          <rect x="35" y="45" width="50" height="140" rx="10" />
        </clipPath>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5e5b3" />
          <stop offset="100%" stopColor="#b39c5a" />
        </linearGradient>
        <linearGradient id="bottleInnerShadow" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#000" stopOpacity="0.10"/>
          <stop offset="10%" stopColor="#000" stopOpacity="0.04"/>
          <stop offset="90%" stopColor="#000" stopOpacity="0.04"/>
          <stop offset="100%" stopColor="#000" stopOpacity="0.10"/>
        </linearGradient>
        <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#fff" stopOpacity="0.0" />
        </linearGradient>
        <linearGradient id="sliderThumbGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff2d55" />
          <stop offset="100%" stopColor="#007aff" />
        </linearGradient>
        <filter id="highlightBlur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
        <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="1" floodOpacity="0.3" />
        </filter>
      </defs>
      {/* Bottle body */}
      <rect
        x="30"
        y="40"
        width="60"
        height="150"
        rx="15"
        ry="15"
        fill="#f8f9fa"
        stroke="#2b2d42"
        strokeWidth="3"
        filter="url(#dropShadow)"
      />
      {/* More visible horizontal ridges */}
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <rect
          key={i}
          x={36}
          y={55 + i * 18}
          width={48}
          height={12}
          rx={6}
          fill="#fff"
          opacity="0.3"
        />
      ))}
      {/* Plastic inner shadow */}
      <rect
        x="30"
        y="40"
        width="60"
        height="150"
        rx="15"
        ry="15"
        fill="url(#bottleInnerShadow)"
        style={{ pointerEvents: "none" }}
      />
      {/* Vertical highlight */}
      <rect
        x="38"
        y="50"
        width="6"
        height="120"
        rx="3"
        fill="url(#highlightGradient)"
        opacity="0.18"
        filter="url(#highlightBlur)"
        style={{ pointerEvents: "none" }}
      />
      {/* Base shadow */}
      <ellipse
        cx="60"
        cy="195"
        rx="28"
        ry="7"
        fill="#000"
        opacity="0.12"
        filter="url(#highlightBlur)"
        style={{ pointerEvents: "none" }}
      />
      {/* Bottle cap */}
      <g>
        <rect
          x="38"
          y="20"
          width="44"
          height="20"
          fill="#4895ef"
          stroke="#2b2d42"
          strokeWidth="3"
          rx="4"
          filter="url(#dropShadow)"
        />
        <line x1="45" y1="25" x2="45" y2="35" stroke="white" strokeWidth="1" opacity="0.7" />
        <line x1="55" y1="25" x2="55" y2="35" stroke="white" strokeWidth="1" opacity="0.7" />
        <line x1="65" y1="25" x2="65" y2="35" stroke="white" strokeWidth="1" opacity="0.7" />
        <line x1="75" y1="25" x2="75" y2="35" stroke="white" strokeWidth="1" opacity="0.7" />
      </g>
      {/* Bottle background */}
      <rect x="35" y="45" width="50" height="140" fill="#f8f9fa" rx="10" />
      {/* Liquid */}
      <rect
        x="35"
        y={liquidY}
        width="50"
        height={liquidHeight}
        fill="url(#waterGradient)"
        clipPath="url(#bottleClip)"
      />
      {/* Percentage text inside bottle */}
      <text
        x="60"
        y="115"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        textAnchor="middle"
        fontWeight="bold"
        fill="#1d1e22"
        style={{
          paintOrder: 'stroke',
          stroke: '#fff',
          strokeWidth: 2,
        }}
      >
        {percent}%
      </text>
      {/* Modern slider track */}
      <rect
        x={SLIDER_MIN_X}
        y={200}
        width={SLIDER_MAX_X - SLIDER_MIN_X}
        height={6}
        rx={3}
        fill="#e9ecef"
        stroke="#ced4da"
        strokeWidth={1}
        style={{ cursor: "pointer" }}
        onClick={onTrackClick}
      />
      {/* Slider thumb */}
      <circle
        cx={thumbX}
        cy={SLIDER_Y}
        r={8}
        fill="url(#sliderThumbGradient)"
        style={{ cursor: "pointer" }}
        onMouseDown={onThumbDown}
        onTouchStart={onThumbDown}
      />
    </svg>
  );
} 