"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@repo/ui";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const CHAR_LIMIT = 300;

interface PropertyDescriptionCardProps {
  description: string;
}

export function PropertyDescriptionCard({
  description,
}: PropertyDescriptionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isLong = description.length > CHAR_LIMIT;
  const displayText = isExpanded
    ? description
    : description.substring(0, CHAR_LIMIT) + (isLong ? "..." : "");

  // Animate card entrance on scroll
  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.trigger === containerRef.current) trigger.kill();
      });
    };
  }, []);

  // Animate height on expand/collapse
  useEffect(() => {
    if (!contentRef.current) return;

    const contentHeight = contentRef.current.scrollHeight;

    gsap.to(contentRef.current, {
      height: isExpanded ? contentHeight : "200px",
      duration: 0.4,
      ease: "power2.inOut",
      overwrite: "auto",
    });
  }, [isExpanded]);

  return (
    <div
      ref={containerRef}
      className="bg-white dark:bg-oslo-gray-900 rounded-2xl p-8 shadow-sm border border-oslo-gray-100 dark:border-oslo-gray-800 hover:shadow-md transition-shadow duration-300"
    >
      {/* Header */}
      <h2 className="text-2xl font-bold text-oslo-gray-950 dark:text-white mb-4">
        Descripción
      </h2>

      {/* Content with gradient fade */}
      <div className="relative">
        <div
          ref={contentRef}
          className={cn(
            "overflow-hidden transition-all",
            isLong && !isExpanded && "relative"
          )}
          style={{ height: isLong ? "200px" : "auto" }}
        >
          <p className="text-oslo-gray-700 dark:text-oslo-gray-300 leading-relaxed whitespace-pre-wrap text-base">
            {displayText}
          </p>

          {/* Gradient fade at bottom (only when collapsed) */}
          {isLong && !isExpanded && (
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-white dark:from-oslo-gray-900 to-transparent pointer-events-none" />
          )}
        </div>
      </div>

      {/* Read More / Read Less Button */}
      {isLong && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "mt-4 inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-all duration-300",
            isExpanded && "flex-row-reverse"
          )}
          aria-expanded={isExpanded}
          aria-controls="description-content"
        >
          <span>{isExpanded ? "Leer menos" : "Leer más"}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 transition-transform duration-300",
              isExpanded && "rotate-180"
            )}
          />
        </button>
      )}
    </div>
  );
}
