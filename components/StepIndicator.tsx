import { Check } from "lucide-react";

interface StepIndicatorProps {
  steps: Array<{ label: string }>;
  currentStep: number;
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, index) => {
        const isCompleted = index < currentStep;
        const isActive = index === currentStep;
        return (
          <div key={index} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isActive
                    ? "bg-[#06082C] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {isCompleted ? <Check size={14} /> : index + 1}
              </div>
              <span className={`text-xs mt-1 font-medium ${isActive ? "text-[#06082C]" : "text-gray-400"}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-2 mb-4 ${isCompleted ? "bg-green-400" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
