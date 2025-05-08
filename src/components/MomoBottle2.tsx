"use client";

import React, { useRef, useState, useEffect } from "react";

const BOTTLE_CONTENT_Y_START = 45;
const BOTTLE_MAX_LIQUID_HEIGHT = 140;
const SLIDER_MIN_X = 25;
const SLIDER_MAX_X = 95;
const SLIDER_Y = 203;

export default function MomoBottle2() {
  const [percent, setPercent] = useState(30);
  const svgRef = useRef<SVGSVGElement>(null);
  const isDragging = useRef(false);
  const staticWaveRef = useRef<SVGPathElement>(null);
  const simpleWaveRef = useRef<SVGPathElement>(null);
  const bubble1Ref = useRef<SVGCircleElement>(null);
  const bubble2Ref = useRef<SVGCircleElement>(null);
  const bubble3Ref = useRef<SVGCircleElement>(null);

  // Calculate derived values
  const liquidHeight = (percent / 100) * BOTTLE_MAX_LIQUID_HEIGHT;
  const liquidY = BOTTLE_CONTENT_Y_START + BOTTLE_MAX_LIQUID_HEIGHT - liquidHeight;
  const thumbX = SLIDER_MIN_X + (percent / 100) * (SLIDER_MAX_X - SLIDER_MIN_X);

  const createWavePath = (baseY: number, amplitude: number) => {
    let path = `M35,${baseY + amplitude} `;
    path += `C45,${baseY - amplitude} 55,${baseY + amplitude} 65,${baseY - amplitude} `;
    path += `C75,${baseY + amplitude} 85,${baseY - amplitude} 85,${baseY} `;
    path += `L85,${BOTTLE_CONTENT_Y_START + BOTTLE_MAX_LIQUID_HEIGHT} `;
    path += `L35,${BOTTLE_CONTENT_Y_START + BOTTLE_MAX_LIQUID_HEIGHT} Z`;
    return path;
  };

  const updateLiquid = (newPercent: number) => {
    // Base liquid position
    const newLiquidHeight = (newPercent / 100) * BOTTLE_MAX_LIQUID_HEIGHT;
    const newLiquidY = BOTTLE_CONTENT_Y_START + BOTTLE_MAX_LIQUID_HEIGHT - newLiquidHeight;

    // Hide everything if percentage is too low
    if (newPercent < 5) {
      staticWaveRef.current?.setAttribute("d", "");
      simpleWaveRef.current?.setAttribute("d", "");
      bubble1Ref.current?.setAttribute("opacity", "0");
      bubble2Ref.current?.setAttribute("opacity", "0");
      bubble3Ref.current?.setAttribute("opacity", "0");
    } else {
      // Update static wave
      staticWaveRef.current?.setAttribute("d", createWavePath(newLiquidY, 4));

      // Update simple wave overlay position
      simpleWaveRef.current?.setAttribute("d", createWavePath(newLiquidY - 1, 3));

      // Update bubbles
      const bubbleOpacity = Math.min(0.2, newPercent / 100);

      // Only show bubbles if enough water
      if (newPercent > 20) {
        bubble1Ref.current?.setAttribute("opacity", bubbleOpacity.toString());
        bubble1Ref.current?.setAttribute("cy", (newLiquidY + newLiquidHeight * 0.3).toString());

        if (newPercent > 40) {
          bubble2Ref.current?.setAttribute("opacity", bubbleOpacity.toString());
          bubble2Ref.current?.setAttribute("cy", (newLiquidY + newLiquidHeight * 0.5).toString());

          if (newPercent > 60) {
            bubble3Ref.current?.setAttribute("opacity", bubbleOpacity.toString());
            bubble3Ref.current?.setAttribute("cy", (newLiquidY + newLiquidHeight * 0.7).toString());
          } else {
            bubble3Ref.current?.setAttribute("opacity", "0");
          }
        } else {
          bubble2Ref.current?.setAttribute("opacity", "0");
          bubble3Ref.current?.setAttribute("opacity", "0");
        }
      } else {
        bubble1Ref.current?.setAttribute("opacity", "0");
        bubble2Ref.current?.setAttribute("opacity", "0");
        bubble3Ref.current?.setAttribute("opacity", "0");
      }
    }

    setPercent(newPercent);
  };

  useEffect(() => {
    const animateWave = () => {
      const time = Date.now() / 1000;

      if (percent >= 5) {
        // Calculate wave position with subtle movement
        const waveOffset = Math.sin(time * 1.5) * 2;

        // Update the wave paths
        staticWaveRef.current?.setAttribute("d", createWavePath(liquidY + waveOffset, 4));
        simpleWaveRef.current?.setAttribute("d", createWavePath(liquidY + waveOffset - 1, 3));
      }

      requestAnimationFrame(animateWave);
    };

    const animationFrame = requestAnimationFrame(animateWave);
    return () => cancelAnimationFrame(animationFrame);
  }, [percent, liquidY]);

  const getSvgX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const svgRect = svg.getBoundingClientRect();
    const svgWidth = svgRect.width;
    const viewBoxWidth = 120;
    const svgX = clientX - svgRect.left;
    return (svgX / svgWidth) * viewBoxWidth;
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
    const newThumbX = Math.max(SLIDER_MIN_X, Math.min(SLIDER_MAX_X, svgX));
    const newPercent = Math.round(
      ((newThumbX - SLIDER_MIN_X) / (SLIDER_MAX_X - SLIDER_MIN_X)) * 100
    );
    updateLiquid(newPercent);
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
    const newThumbX = Math.max(SLIDER_MIN_X, Math.min(SLIDER_MAX_X, svgX));
    const newPercent = Math.round(
      ((newThumbX - SLIDER_MIN_X) / (SLIDER_MAX_X - SLIDER_MIN_X)) * 100
    );
    updateLiquid(newPercent);
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 120 240"
      xmlns="http://www.w3.org/2000/svg"
      style={{ maxWidth: 300, width: "100%", height: "auto", touchAction: "none" }}
    >
      <defs>
        <clipPath id="bottleClip2">
          <rect x="35" y="45" width="50" height="140" rx="10" />
        </clipPath>
        <linearGradient id="waterGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f5e5b3" />
          <stop offset="100%" stopColor="#b39c5a" />
        </linearGradient>
        <linearGradient id="sliderThumbGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff2d55" />
          <stop offset="100%" stopColor="#007aff" />
        </linearGradient>
      </defs>

      {/* Measurement lines */}
      <g stroke="#cccccc" strokeWidth="1">
        {[55, 69, 83, 97, 111, 125, 139, 153, 167, 181].map((y) => (
          <line key={y} x1="30" y1={y} x2="35" y2={y} />
        ))}
      </g>

      {/* Bottle body */}
      <rect
        x="30"
        y="40"
        width="60"
        height="150"
        rx="15"
        ry="15"
        fill="#1d1e22"
        stroke="#555555"
        strokeWidth="2"
      />

      {/* Bottle Lid */}
      <g>
        <rect
          x="38"
          y="20"
          width="44"
          height="20"
          fill="#0096c7"
          stroke="#555555"
          strokeWidth="2"
          rx="4"
        />
        <line x1="45" y1="25" x2="45" y2="35" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="55" y1="25" x2="55" y2="35" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="65" y1="25" x2="65" y2="35" stroke="white" strokeWidth="1" opacity="0.4" />
        <line x1="75" y1="25" x2="75" y2="35" stroke="white" strokeWidth="1" opacity="0.4" />
      </g>

      {/* Bottle background */}
      <rect x="35" y="45" width="50" height="140" fill="#1d1e22" rx="10" />

      {/* Static Wave Base */}
      <path
        ref={staticWaveRef}
        fill="url(#waterGradient2)"
        clipPath="url(#bottleClip2)"
        d=""
      />

      {/* Simple Wave Overlay */}
      <path
        ref={simpleWaveRef}
        fill="#f5e5b3"
        opacity="0.3"
        clipPath="url(#bottleClip2)"
        d=""
      />

      {/* Simple bubbles */}
      <circle
        ref={bubble1Ref}
        cx="50"
        cy="160"
        r="2"
        fill="white"
        opacity="0.2"
        clipPath="url(#bottleClip2)"
      />
      <circle
        ref={bubble2Ref}
        cx="65"
        cy="140"
        r="1.5"
        fill="white"
        opacity="0.2"
        clipPath="url(#bottleClip2)"
      />
      <circle
        ref={bubble3Ref}
        cx="45"
        cy="120"
        r="1"
        fill="white"
        opacity="0.2"
        clipPath="url(#bottleClip2)"
      />

      {/* Percentage text inside bottle */}
      <text
        x="60"
        y="115"
        fontFamily="Arial, sans-serif"
        fontSize="14"
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
        y="200"
        width={SLIDER_MAX_X - SLIDER_MIN_X}
        height="6"
        rx="3"
        fill="#2c2f35"
        stroke="#555555"
        strokeWidth="1"
        style={{ cursor: "pointer" }}
        onClick={onTrackClick}
      />

      {/* Slider thumb */}
      <circle
        cx={thumbX}
        cy={SLIDER_Y}
        r="8"
        fill="url(#sliderThumbGradient2)"
        style={{ cursor: "pointer" }}
        onMouseDown={onThumbDown}
        onTouchStart={onThumbDown}
      />
    </svg>
  );
} 