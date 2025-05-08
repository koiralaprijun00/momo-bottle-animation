"use client";

import React from "react";
import MomoBottle from "./MomoBottle";
import MomoBottle2 from "./MomoBottle2";

export default function BottleComparison() {
  return (
    <div className="flex flex-col md:flex-row gap-8 justify-center items-center p-8">
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">Original Design</h2>
        <MomoBottle />
      </div>
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4">New Design</h2>
        <MomoBottle2 />
      </div>
    </div>
  );
} 