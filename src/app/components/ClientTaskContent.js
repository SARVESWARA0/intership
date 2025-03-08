"use client"
import React, { useState, useEffect } from "react"
import { Copy, LinkIcon, BookOpen, CheckCircle, Clock, Tag, Info, Lock, ChevronDown, ChevronUp, Award } from 'lucide-react'
import styles from "./TaskDisplay.module.css"
import useTaskStore from "../store/taskStore" // Import the task store

function isValidUrl(string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

function convertLinksToJSX(text) {
  if (!text) return null;

  // Split the text by lines
  const lines = text.split("\n");
  const result = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Empty line
    if (line.trim() === '') {
      result.push(<br key={`br-${i}`} />);
      continue;
    }
    
    // Check for markdown headings
    if (line.trim().startsWith('##')) {
      // Count the number of # to determine heading level
      const headingLevel = line.trim().match(/^#{2,6}/)[0].length;
      const headingText = line.trim().replace(/^#{2,6}\s*/, '');
      
      if (headingLevel === 2) {
        result.push(
          <div key={`heading-${i}`} className={styles.instructionHeading}>
            {headingText}
          </div>
        );
      } else if (headingLevel === 3) {
        result.push(
          <div key={`subheading-${i}`} className={styles.instructionSubheading}>
            {headingText}
          </div>
        );
      }
      continue;
    }
    
    // Check for list items
    if (line.trim().startsWith('- ')) {
      const listItemContent = line.trim().substring(2);
      
      // Process URLs in list items
      const parts = listItemContent.split(/(https?:\/\/[^\s]+)/);
      const formattedParts = parts.map((part, partIndex) => {
        if (isValidUrl(part)) {
          if (part.includes("alphavantage.co")) {
            return (
              <span key={partIndex} className={styles.link}>
                {part}
              </span>
            );
          }
          return (
            <a
              key={partIndex}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              {part}
            </a>
          );
        }
        return part;
      });
      
      result.push(
        <div key={`list-item-${i}`} className={styles.listItem}>
          <span className={styles.bulletPoint}>•</span>
          <span>{formattedParts}</span>
        </div>
      );
      continue;
    }
    
    // Regular line - check for URLs
    const parts = line.split(/(https?:\/\/[^\s]+)/);
    const formattedParts = parts.map((part, partIndex) => {
      if (isValidUrl(part)) {
        if (part.includes("alphavantage.co")) {
          return (
            <span key={partIndex} className={styles.link}>
              {part}
            </span>
          );
        }
        return (
          <a
            key={partIndex}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {part}
          </a>
        );
      }
      return part;
    });

    result.push(<div key={`line-${i}`} className={styles.textLine}>{formattedParts}</div>);
  }

  return result;
}

// New function to handle resources as specified
function convertResourceLinksToJSX(text) {
  if (!text) return null;

  return text.split("\n").map((line, index) => {
    if (line.trim() === '') return <br key={index} />;

    // Check if line starts with a heading (ends with ':')
    if (line.trim().endsWith(':')) {
      return <div key={index} className={styles.resourceHeading}>{line}</div>;
    }

    // For each line, check for URLs while preserving other text
    const parts = line.split(/(https?:\/\/[^\s]+)/);
    const formattedParts = parts.map((part, i) => {
      if (isValidUrl(part)) {
        if (part.includes("alphavantage.co")) {
          return (
            <span key={i} className={styles.link}>
              {part}
            </span>
          );
        }
        return (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            {part}
          </a>
        );
      }
      return part;
    });

    return <div key={index}>{formattedParts}</div>;
  });
}

function SectionTitle({ children }) {
  return (
    <h2 className={styles.sectionTitle}>
      {children}
    </h2>
  )
}

function CollapsibleSection({ title, icon, children }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div 
      className={`${styles.section} ${isHovered ? styles.sectionHovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`${styles.sectionHeader} ${styles.collapsibleHeader} ${isOpen ? styles.sectionHeaderOpen : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className={styles.iconWrapper}>
          {icon}
        </div>
        <SectionTitle>{title}</SectionTitle>
        <div className={`${styles.chevronIcon} ${isOpen ? styles.rotated : ''}`}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>
      <div 
        className={`${styles.sectionContentWrapper} ${isOpen ? styles.contentVisible : styles.contentHidden}`}
        style={{ 
          maxHeight: isOpen ? "1000px" : "0px",
          opacity: isOpen ? 1 : 0,
          transition: "max-height 0.5s ease, opacity 0.5s ease" 
        }}
      >
        <div className={styles.sectionContent}>
          {children}
        </div>
      </div>
    </div>
  )
}

function SecretKeyDisplay({ password }) {
  const [showPassword] = useState(false)
  const [copied, setCopied] = useState(false)
  const [toast, setToast] = useState({
    show: false,
    message: "",
  })
  const [isHovered, setIsHovered] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setToast({ show: true, message: "Copied to clipboard" })
      
      // Create copy animation elements
      const container = document.createElement("div")
      container.style.position = "fixed"
      container.style.top = "0"
      container.style.left = "0"
      container.style.width = "100%"
      container.style.height = "100%"
      container.style.pointerEvents = "none"
      container.style.zIndex = "9999"
      document.body.appendChild(container)
      
      // Create floating elements
      for (let i = 0; i < 5; i++) {
        const element = document.createElement("div")
        element.textContent = "✓"
        element.style.position = "absolute"
        element.style.color = "#10b981"
        element.style.fontSize = "24px"
        element.style.fontWeight = "bold"
        element.style.top = `${50 + Math.random() * 10}%`
        element.style.left = `${45 + Math.random() * 10}%`
        element.style.opacity = "1"
        element.style.transition = "transform 1s ease, opacity 1s ease"
        container.appendChild(element)
        
        setTimeout(() => {
          element.style.transform = `translate(${Math.random() * 100 - 50}px, -100px)`
          element.style.opacity = "0"
        }, 10)
        
        setTimeout(() => {
          container.removeChild(element)
        }, 1000)
      }
      
      // Remove container after animation completes
      setTimeout(() => {
        document.body.removeChild(container)
      }, 1100)
      
      setTimeout(() => {
        setCopied(false)
        setToast({ show: false, message: "" })
      }, 2000)
    } catch (error) {
      console.error("Copy failed:", error)
      setToast({ show: true, message: "Failed to copy" })
    }
  }

  return (
    <div 
      className={`${styles.secretKeyContainer} ${isHovered ? styles.secretKeyHovered : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={styles.secretKeyHeader}>
        <h3 className={styles.secretKeyTitle}>
          <Lock size={16} className={`${styles.lockIcon} ${isHovered ? styles.lockIconPulse : ''}`} />
          Secret Key
        </h3>
        <div className={styles.secretKeyActions}>
          <button
            onClick={handleCopy}
            className={`${styles.iconButton} ${copied ? styles.iconButtonSuccess : ''}`}
            aria-label="Copy password"
          >
            {copied ? (
              <CheckCircle size={20} className={styles.copySuccess} />
            ) : (
              <Copy size={20} />
            )}
          </button>
        </div>
      </div>
      <div className={`${styles.secretKeyValue} ${showPassword ? styles.revealed : ''}`}>
        {showPassword ? password : "•".repeat(password.length)}
      </div>
      {toast.show && (
        <div className={styles.toast}>{toast.message}</div>
      )}
    </div>
  )
}

function ProgressBar({ progress }) {
  return (
    <div className={styles.progressBarContainer}>
      <div className={styles.progressBarTrack}>
        <div 
          className={styles.progressBarFill} 
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className={styles.progressText}>{progress}% Complete</span>
    </div>
  )
}

const defaultInstructions = `
## General Instructions
This document outlines the task requirements and expectations. Please read each section carefully to ensure that your submission meets all criteria.

## Overview
- You have the flexibility to work with or without a user interface (UI); however, implementing and refining the UI will be given priority.
- Your solution should focus on practical functionality and present a clean, professional front-end experience if the UI is utilized.

## AI Agent Requirements
- Develop an AI agent designed to fulfill a specific use case as defined by the project scope.
- The agent must integrate a minimum of two tool calls dedicated to managing real-time data and knowledge retrieval. These calls should be efficient and clearly documented.
- In addition, the solution must include at least four tool calls for handling long-term memory, ensuring that the agent can manage historical data or context over extended sessions.
- Each tool integration should be accompanied by a brief explanation of its purpose and integration method.

## Tech Stack
### LLM Providers:
- Gemini
- Groq
### Vector Database Options:
- Pinecone
- Supabase (using pgvector)
- Neon (using pgvector)
- Neo4J

### Languages & Frameworks:
- Python,Utilize frameworks such as Agno or CrewAI to implement backend logic and AI functionalities.
- JavaScript,Leverage the Vercel AI SDK and Mastra.ai for front-end interactions and dynamic functionalities.
- UI Development: Build the user interface using React.js and Next.js, along with any preferred CSS libraries to ensure a responsive and modern design.

### Deployment Platforms:
- Vercel
- Netlify
- Render

## Time to Complete
The complete task must be delivered within 5 days. It is important to manage your time efficiently, ensuring all components of the project are implemented and tested before submission.


`

export default function ClientTaskContent({ task, taskId, password }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  
  // Use Zustand to get and set the progress
  const getTaskProgress = useTaskStore(state => state.getTaskProgress)
  const setTaskProgress = useTaskStore(state => state.setTaskProgress)
  
  // Get progress from store or default to 0
  const [progress, setProgress] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Get progress from Zustand store
    const savedProgress = getTaskProgress(taskId) || 0
    // Set progress directly from store, starting at 0 by default
    setProgress(savedProgress)
  }, [taskId, getTaskProgress])

  const celebrateProgress = () => {
    setShowConfetti(true)
    setTimeout(() => setShowConfetti(false), 3000)

    // Increase progress
    const newProgress = Math.min(100, progress + 10)
    setProgress(newProgress)
    
    // Save to Zustand store
    setTaskProgress(taskId, newProgress)
  }

  if (!task) {
    return (
      <div className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <h2 className={styles.notFoundTitle}>Task Not Found</h2>
          <p className={styles.notFoundText}>The requested task could not be found.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.pageContainer}>
      {showConfetti && <div className={styles.confetti}></div>}
      <div className={`${styles.taskCard} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.taskHeader}>
          <div className={styles.taskHeaderContent}>
            <div className={styles.titleSection}>
              <h1 className={styles.taskTitle}>{task.title}</h1>
              <div className={styles.taskBadges}>
                <span className={styles.taskId}>Task #{taskId}</span>
              </div>
            </div>
            <div className={styles.progressSection}>
              <ProgressBar progress={progress} />
              <button 
                className={styles.progressButton}
                onClick={celebrateProgress}
              >
                Update Progress
              </button>
            </div>
          </div>
        </div>

        <div className={styles.taskContent}>
          <CollapsibleSection 
            title="Instructions" 
            icon={<Info className={styles.sectionIcon} size={24} />}
          >
            <div className={styles.instructionsSection}>
              {convertLinksToJSX(task.instructions || defaultInstructions)}
              <div className={styles.tipBox}>
                <Award size={16} className={styles.tipIcon} />
                <p>Tip: Early submissions earn extra points!</p>
              </div>
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection 
            title="Description" 
            icon={<BookOpen className={styles.sectionIcon} size={24} />}
          >
            <div className={styles.descriptionContent}>
              {convertLinksToJSX(task.description)}
            </div>
          </CollapsibleSection>
          
          {task.resources && (
  <CollapsibleSection 
    title="Resources" 
    icon={<LinkIcon className={styles.sectionIcon} size={24} />}
  >
    <div className={styles.resourceStaticInfo}>
        Use two tool calling for the specific usecase to get the realtime data or data from database which were assigned to you.
      </div>
    <div className={styles.resourcesContent}>
      {/* Static info inside the blue box */}
      
      {convertResourceLinksToJSX(task.resources)}
    </div>
  </CollapsibleSection>
)}



          <div className={styles.taskMeta}>
            {task.dueDate && (
              <div className={`${styles.metaItem} ${styles.metaItemDue}`}>
                <Clock size={16} className={styles.metaIcon} />
                <span>Due: {task.dueDate}</span>
              </div>
            )}
            {task.category && (
              <div className={`${styles.metaItem} ${styles.metaItemCategory}`}>
                <Tag size={16} className={styles.metaIcon} />
                <span>{task.category}</span>
              </div>
            )}
          </div>
          
          <SecretKeyDisplay password={password} />
        </div>
      </div>
    </div>
  )
}
