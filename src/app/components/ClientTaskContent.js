"use client";
import { useState, useEffect } from "react";
import {
  Copy,
  BookOpen,
  CheckCircle,
  Info,
  Lock,
  ChevronDown,
  ChevronUp,
  Award,
} from "lucide-react";
import styles from "./TaskDisplay.module.css";

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch {
    return false;
  }
}

function replaceTechStackNames(text, techStackItems = []) {
  if (!text) return null;
  if (!techStackItems || techStackItems.length === 0) return text;
  const techStackMap = techStackItems.reduce((acc, item) => {
    acc[item.name] = item.url;
    return acc;
  }, {});
  const namesPattern = Object.keys(techStackMap).join("|");
  const regex = new RegExp(`\\b(${namesPattern})\\b`, "g");
  const parts = text.split(regex);
  return parts.map((part, index) => {
    if (techStackMap[part]) {
      return (
        <a
          key={index}
          href={techStackMap[part]}
          target="_blank"
          rel="noopener noreferrer"
          className="tech-stack-link"
        >
          {part}
        </a>
      );
    }
    return part;
  });
}

// Enhanced converter that recognizes markdown headings (#, ##, ###) and lists
function convertLinksToJSX(text, techStackItems = []) {
  if (!text) return null;
  const lines = text.split("\n");
  const result = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    if (trimmed === "") {
      result.push(<br key={`br-${i}`} />);
      return;
    }

    // Handle headings: # for main heading, ## for subheading, ### for section titles
    if (/^#{1,3}\s/.test(trimmed)) {
      const match = trimmed.match(/^(#{1,3})\s(.*)/);
      if (match) {
        const level = match[1].length;
        const headingText = match[2];
        let headingClass = styles.instructionHeading;
        if (level === 2) {
          headingClass = styles.instructionSubheading;
        } else if (level === 3) {
          headingClass = styles.instructionSection;
        }
        result.push(
          <div key={`heading-${i}`} className={headingClass}>
            {headingText}
          </div>
        );
        return;
      }
    }

    // Handle list items (lines starting with "- ")
    if (trimmed.startsWith("- ")) {
      const listItemContent = trimmed.substring(2);
      const parts = listItemContent.split(/(https?:\/\/[^\s]+)/);
      const formattedParts = parts.map((part, j) => {
        if (isValidUrl(part)) {
          return (
            <a
              key={j}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {part}
            </a>
          );
        }
        return replaceTechStackNames(part, techStackItems);
      });
      result.push(
        <div key={`list-${i}`} className={styles.listItem}>
          <span className={styles.bulletPoint}>•</span>
          <span>{formattedParts}</span>
        </div>
      );
      return;
    }

    // Regular text lines with link and tech stack name replacement
    const parts = trimmed.split(/(https?:\/\/[^\s]+)/);
    const formattedParts = parts.map((part, j) => {
      if (isValidUrl(part)) {
        return (
          <a
            key={j}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {part}
          </a>
        );
      }
      return replaceTechStackNames(part, techStackItems);
    });
    result.push(
      <div key={`line-${i}`} className={styles.textLine}>
        {formattedParts}
      </div>
    );
  });

  return result;
}

function SectionTitle({ children }) {
  return <h2 className={styles.sectionTitle}>{children}</h2>;
}

function CollapsibleSection({ title, icon, children, maxHeight = "1000px" }) {
  const [isOpen, setIsOpen] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className={`${styles.section} ${isHovered ? styles.sectionHovered : ""}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`${styles.sectionHeader} ${styles.collapsibleHeader} ${
          isOpen ? styles.sectionHeaderOpen : ""
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.iconWrapper}>{icon}</div>
        <SectionTitle>{title}</SectionTitle>
        <div className={`${styles.chevronIcon} ${isOpen ? styles.rotated : ""}`}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      <div
        className={`${styles.sectionContentWrapper} ${
          isOpen ? styles.contentVisible : styles.contentHidden
        }`}
        style={{
          maxHeight: isOpen ? maxHeight : "0px",
          opacity: isOpen ? 1 : 0,
          overflowY: isOpen ? "auto" : "hidden",
          transition: "max-height 0.5s ease, opacity 0.5s ease",
        }}
      >
        <div className={styles.sectionContent}>{children}</div>
      </div>
    </div>
  );
}

function SecretKeyDisplay({ password }) {
  const [showPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setToast({ show: true, message: "Copied to clipboard" });
      setTimeout(() => {
        setCopied(false);
        setToast({ show: false, message: "" });
      }, 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      setToast({ show: true, message: "Failed to copy" });
    }
  };

  return (
    <div
      className={`${styles.secretKeyContainer} ${
        isHovered ? styles.secretKeyHovered : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.secretKeyHeader}>
        <h3 className={styles.secretKeyTitle}>
          <Lock size={16} className={`${styles.lockIcon} ${isHovered ? styles.lockIconPulse : ""}`} />
          Secret Key
        </h3>
        <div className={styles.secretKeyActions}>
          <button
            onClick={handleCopy}
            className={`${styles.iconButton} ${copied ? styles.iconButtonSuccess : ""}`}
            aria-label="Copy password"
          >
            {copied ? <CheckCircle size={20} className={styles.copySuccess} /> : <Copy size={20} />}
          </button>
        </div>
      </div>
      <div className={`${styles.secretKeyValue} ${showPassword ? styles.revealed : ""}`}>
        {showPassword ? password : "•".repeat(password.length)}
      </div>
      {toast.show && <div className={styles.toast}>{toast.message}</div>}
    </div>
  );
}

// New default instructions with proper markdown formatting and subheadings
const defaultInstructions = `# Core Requirements
## AI Agent Functionality
- Build an AI agent that solves the assigned use case problem
- Implement persistent memory across different chat sessions using Vector DB
- Integrate real-time data retrieval through relevant APIs based on your use case
- Ensure the agent can recall previous interactions and use them for context in new conversations
- Implement at least 2 use-case specific tools and 4 memory-related tools

# Technical Requirements
## Your agent must demonstrate both:
- Long-term memory: Store and retrieve conversation history and important information
- Real-time knowledge: Access current data through APIs relevant to your use case

# Technology Options
## LLM Providers (choose one)
- Gemini (Recommended)
- Groq

## Vector Database (choose one)
- Pinecone (Recommended)
- Supabase  (pgvector) (Recommended)
- Neon (pgvector)
- Neo4J (vector index)

# Development Stack
## Python Option
- Agno (Recommended)
- LangChain
- CrewAI
- LlamaIndex

## JavaScript Option
- Vercel AI SDK (Recommended)
- Mastra.ai (Recommended)
- LangChain
- LlamaIndex

# UI (Optional but Highly Preferred)
- Next.js (Recommended)
- React.js
- Any CSS libraries of your choice

# Deployment (Optional)
- Vercel (Recommended)
- Netlify
- Render

# Implementation Options
## Option 1: With UI (Highly Preferred)
- Develop a clean, professional user interface
- Integrate your AI agent API with the frontend
- Deploy the application (optional but recommended)

## Option 2: Without UI
- Demonstrate functionality through CLI or API testing tools (e.g., Postman)
- Provide clear documentation on how to test and use your agent

# Development Approach
We recommend:
- First focus on completing the core AI agent functionality
- Then implement the UI and integration
- Finally deploy the application if possible

# Timeline
- Final Submission Deadline is April 10, 2025  
- Plan your time accordingly to ensure all core requirements are met and focus on completing core functionality first before adding additional features

# Evaluation Criteria
- Functionality of the AI agent
- Quality of memory implementation
- Effective use of real-time data
- Code quality and organization
- UI implementation
- Deployment (optional but valued)
`;

const techStackItems = [
  { name: "Gemini", url: "https://aistudio.google.com/prompts/new_chat" },
  { name: "Groq", url: "https://groq.com/" },
  { name: "Pinecone", url: "https://www.pinecone.io/" },
  { name: "Supabase", url: "https://supabase.com/" },
  { name: "Neon (pgvector)", url: "https://neon.tech/" },
  { name: "Neo4J", url: "https://neo4j.com/" },
  { name: "Agno", url: "https://www.agno.com/" },
  { name: "LangChain", url: "https://python.langchain.com/docs/introduction/" },
  { name: "CrewAI", url: "https://www.crewai.com/" },
  { name: "LlamaIndex", url: "https://www.llamaindex.ai/" },
  { name: "Vercel AI SDK", url: "https://sdk.vercel.ai/" },
  { name: "Mastra.ai", url: "https://mastra.ai/" },
  { name: "Next.js", url: "https://nextjs.org/" },
  { name: "React.js", url: "https://react.dev/" },
  { name: "Vercel", url: "https://vercel.com" },
  { name: "Netlify", url: "https://www.netlify.com/" },
  { name: "Render", url: "https://render.com/" },
];

export default function ClientTaskContent({ task, password }) {
  const [isScrolled, setIsScrolled] = useState(false);
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!task) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <h2 className={styles.notFoundTitle}>Task Not Found</h2>
          <p className={styles.notFoundText}>The requested task could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.taskCard} ${isScrolled ? styles.scrolled : ""}`}>
        <div className={styles.taskHeader}>
          <div className={styles.taskHeaderContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.taskTitle}>{task.title}</h1>
              <div className={styles.taskBadges}>
                
              </div>
            </div>
          </div>
        </div>
        <div className={styles.taskContent}>
          <CollapsibleSection title="Instructions" icon={<Info size={24} />} maxHeight="600px">
            {convertLinksToJSX(task.instructions || defaultInstructions, techStackItems)}
            <div className={styles.tipBox}>
              <Award size={70} className={styles.tipIcon} />
              <p>
              Note: You will receive another email with a link to submit your work. High preference will be given to candidates who implement AI agent functionality with UI.</p>
            </div>
          </CollapsibleSection>
          <CollapsibleSection title="Problem Statement" icon={<BookOpen size={24} className={styles.sectionIcon} />}>
            <div className={styles.descriptionContent}>
              {convertLinksToJSX(task.description, techStackItems)}
            </div>
          </CollapsibleSection>
          
          
          <SecretKeyDisplay password={password} />
          <div className={styles.secretKeyInstruction}>
          You will need to enter this secret key when submitting your completed work. Don't share it with anyone and keep it private.
</div>

        </div>
      </div>
    </div>
  );
}
