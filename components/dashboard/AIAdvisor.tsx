"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, RefreshCw, ChevronDown, ChevronUp, Zap } from "lucide-react";

interface Suggestion { area: string; icon: string; tip: string; }
interface Advice {
  greeting: string;
  overallScore: number;
  summary: string;
  suggestions: Suggestion[];
  highlight: string;
  challenge: string;
}

export default function AIAdvisor() {
  const [advice, setAdvice] = useState<Advice | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState("");
  const [lastFetched, setLastFetched] = useState<string | null>(null);

  useEffect(() => {
    // Auto-load once, cache in sessionStorage so it doesn't re-call on every render
    const cached = se