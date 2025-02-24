"use client"
import React, { useState, useEffect } from "react"
import { Copy, CalendarDays, LinkIcon, BookOpen, CheckCircle, Clock, Tag, Info, Lock, ChevronDown, ChevronUp } from 'lucide-react'
import styles from "./TaskDisplay.module.css"

function isValidUrl(string: string) {
  try {
    new URL(string)
    return true
  } catch {
    return false
  }
}

function convertLinksToJSX(text: string) {
  if (!text) return null
  return text.split(" ").map((word, index) => {
    if (isValidUrl(word)) {
      return (
        <a
          key={index}
          href={word}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.link}
        >
          <LinkIcon className={styles.linkIcon} />
          {word}
        </a>
      )
    }
    return word + " "
  })
}

function ShimmeringTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className={`${styles.sectionTitle} ${styles.shimmer}`}>
      {children}
    </h2>
  )
}

function CollapsibleSection({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className={styles.section}>
      <div 
        className={`${styles.sectionHeader} ${styles.collapsibleHeader}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {icon}
        <ShimmeringTitle>{title}</ShimmeringTitle>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </div>
      {isOpen && <div className={styles.sectionContent}>{children}</div>}
    </div>
  )
}

function SecretKeyDisplay({ password }: { password: string }) {
  const [showPassword, setShowPassword] = React.useState(false)
  const [copied, setCopied] = React.useState(false)
  const [toast, setToast] = React.useState<{ show: boolean; message: string }>({
    show: false,
    message: "",
  })

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setToast({ show: true, message: "Copied to clipboard" })
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
    <div className={styles.secretKeyContainer}>
      <div className={styles.secretKeyHeader}>
        <h3 className={styles.secretKeyTitle}>
          <Lock size={16} className={styles.lockIcon} />
          Secret Key
        </h3>
        <div className={styles.secretKeyActions}>
          
          <button
            onClick={handleCopy}
            className={styles.iconButton}
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
      <div className={styles.secretKeyValue}>
        {showPassword ? password : "*".repeat(password.length)}
      </div>
      {toast.show && (
        <div className={styles.toast}>{toast.message}</div>
      )}
    </div>
  )
}

interface Task {
  title: string
  description: string
  resources?: string
  dueDate?: string
  category?: string
  instructions?: string
}

interface ClientTaskContentProps {
  task: Task | null
  taskId: string
  password: string
}

export default function ClientTaskContent({ task, taskId, password }: ClientTaskContentProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Default instructions if not provided
  const defaultInstructions = "You would be prioritized more if you worked on Next.js or display the results in a better frontend and innovative works related to the project.";

  return (
    <div className={styles.pageContainer}>
      <div className={`${styles.taskCard} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.taskHeader}>
          <div className={styles.taskHeaderContent}>
            <h1 className={`${styles.taskTitle} ${styles.shimmer}`}>{task.title}</h1>
            <span className={styles.taskId}>Task #{taskId}</span>
          </div>
        </div>
        <div className={styles.taskContent}>
          <CollapsibleSection 
            title="Instructions" 
            icon={<Info className={styles.sectionIcon} size={24} />}
          >
            <div className={styles.instructionsSection}>
              {convertLinksToJSX(task.instructions || defaultInstructions)}
            </div>
          </CollapsibleSection>
          
          <CollapsibleSection 
            title="Description" 
            icon={<BookOpen className={styles.sectionIcon} size={24} />}
          >
            {convertLinksToJSX(task.description)}
          </CollapsibleSection>
          
          {task.resources && (
            <CollapsibleSection 
              title="Resources" 
              icon={<CalendarDays className={styles.sectionIcon} size={24} />}
            >
              <div className={styles.resourcesContent}>
                <pre className={styles.resources}>{convertLinksToJSX(task.resources)}</pre>
              </div>
            </CollapsibleSection>
          )}

          <div className={styles.taskMeta}>
            {task.dueDate && (
              <div className={styles.metaItem}>
                <Clock size={16} className={styles.metaIcon} />
                <span>Due: {task.dueDate}</span>
              </div>
            )}
            {task.category && (
              <div className={styles.metaItem}>
                <Tag size={16} className={styles.metaIcon} />
                <span>{task.category}</span>
              </div>
            )}
          </div>
          
          {/* Secret Key moved to the bottom */}
          <SecretKeyDisplay password={password} />
        </div>
      </div>
    </div>
  )
}
