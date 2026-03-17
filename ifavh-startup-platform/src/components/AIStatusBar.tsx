"use client";

import { Cpu, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

type AIStatus = {
  provider: "NVIDIA" | "None";
  model: string;
  keyExists: boolean;
  lastUsed: string | null;
  status: "idle" | "loading" | "success" | "error";
};

export function AIStatusBar() {
  const [status, setStatus] = useState<AIStatus>({
    provider: "None",
    model: "None",
    keyExists: false,
    lastUsed: null,
    status: "idle",
  });

  useEffect(() => {
    // Check which API key is configured
    const checkAIStatus = async () => {
      const nvidiaKey = process.env.NVIDIA_API_KEY;
      const groqKey = process.env.GROQ_API_KEY;

      let provider: AIStatus["provider"] = "None";
      let model: string = "None";
      let keyExists: boolean = false;

      if (nvidiaKey) {
        provider = "NVIDIA";
        model = "mistralai/mistral-nemotron";
        keyExists = true;
      } else if (groqKey) {
        provider = "NVIDIA";
        model = "mistralai/mistral-nemotron";
        keyExists = true;
      }

      setStatus({
        provider,
        model,
        keyExists,
        lastUsed: null,
        status: keyExists ? "idle" : "error",
      });
    };

    checkAIStatus();

    // Listen for AI requests to update live status
    const handleAIRequest = (event: CustomEvent) => {
      setStatus((prev) => ({
        ...prev,
        status: "loading",
        lastUsed: new Date().toLocaleTimeString(),
      }));
    };

    const handleAIResponse = (event: CustomEvent) => {
      setStatus((prev) => ({
        ...prev,
        status: "success",
      }));
    };

    const handleAIError = (event: CustomEvent) => {
      setStatus((prev) => ({
        ...prev,
        status: "error",
      }));
    };

    window.addEventListener("ai:request", handleAIRequest as EventListener);
    window.addEventListener("ai:response", handleAIResponse as EventListener);
    window.addEventListener("ai:error", handleAIError as EventListener);

    return () => {
      window.removeEventListener(
        "ai:request",
        handleAIRequest as EventListener
      );
      window.removeEventListener(
        "ai:response",
        handleAIResponse as EventListener
      );
      window.removeEventListener("ai:error", handleAIError as EventListener);
    };
  }, []);

  if (process.env.NODE_ENV === "production") {
    return null; // Hide in production
  }

  const getStatusIcon = () => {
    switch (status.status) {
      case "idle":
        return <Cpu className="w-3 h-3" />;
      case "loading":
        return <Loader2 className="w-3 h-3 animate-spin" />;
      case "success":
        return <CheckCircle2 className="w-3 h-3" />;
      case "error":
        return <XCircle className="w-3 h-3" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case "idle":
        return "text-[#c2c6d9]";
      case "loading":
        return "text-[#7bd0ff]";
      case "success":
        return "text-[#50fa7b]";
      case "error":
        return "text-[#ffb4ab]";
    }
  };

  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#070d1f]/50 border border-[#424656]/10 text-xs"
    >
      {getStatusIcon()}
      <div className={`flex flex-col ${getStatusColor()}`}>
        <span className="font-medium">
          {status.provider} {status.keyExists ? "✓" : "✗"}
        </span>
        <span className="text-[10px] text-[#8c90a2]">{status.model}</span>
      </div>
      {status.lastUsed && (
        <span className="text-[10px] text-[#8c90a2]/60 ml-1">
          @{status.lastUsed}
        </span>
      )}
    </div>
  );
}