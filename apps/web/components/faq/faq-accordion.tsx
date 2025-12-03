"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  items: FAQItem[];
}

export function FAQAccordion({ items }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="bg-white/5 dark:bg-oslo-gray-900/50 backdrop-blur-sm border border-white/10 dark:border-oslo-gray-700/50 rounded-xl overflow-hidden transition-all duration-300 hover:border-indigo-500/30"
        >
          <button
            onClick={() => toggleItem(index)}
            className="w-full px-6 py-5 flex items-center justify-between text-left gap-4 group"
          >
            <span className="text-lg font-semibold text-white dark:text-oslo-gray-50 group-hover:text-indigo-300 dark:group-hover:text-indigo-400 transition-colors">
              {item.question}
            </span>
            <ChevronDown
              className={`w-5 h-5 text-oslo-gray-400 flex-shrink-0 transition-transform duration-300 ${
                openIndex === index ? "rotate-180" : ""
              }`}
            />
          </button>

          <div
            className={`overflow-hidden transition-all duration-300 ${
              openIndex === index ? "max-h-96" : "max-h-0"
            }`}
          >
            <div className="px-6 pb-5 text-oslo-gray-300 dark:text-oslo-gray-400 leading-relaxed">
              {item.answer}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
