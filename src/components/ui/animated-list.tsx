import { motion, AnimatePresence } from 'framer-motion'
import { ReactNode } from 'react'

interface AnimatedListProps {
  children: ReactNode[]
  className?: string
  staggerDelay?: number
}

export function AnimatedList({ 
  children, 
  className,
  staggerDelay = 0.1 
}: AnimatedListProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2
      }
    }
  }

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <AnimatePresence mode="popLayout">
        {children.map((child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            layout
            exit="exit"
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

interface FadeInProps {
  children: ReactNode
  delay?: number
  duration?: number
  className?: string
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  className 
}: FadeInProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface SlideInProps {
  children: ReactNode
  direction?: 'left' | 'right' | 'up' | 'down'
  delay?: number
  className?: string
}

export function SlideIn({ 
  children, 
  direction = 'up',
  delay = 0,
  className 
}: SlideInProps) {
  const getInitialPosition = () => {
    switch (direction) {
      case 'left': return { x: -50, y: 0 }
      case 'right': return { x: 50, y: 0 }
      case 'up': return { x: 0, y: 20 }
      case 'down': return { x: 0, y: -20 }
    }
  }

  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        ...getInitialPosition()
      }}
      animate={{ 
        opacity: 1, 
        x: 0, 
        y: 0 
      }}
      transition={{ 
        duration: 0.5,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface ScaleInProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function ScaleIn({ 
  children, 
  delay = 0,
  className 
}: ScaleInProps) {
  return (
    <motion.div
      className={className}
      initial={{ 
        opacity: 0, 
        scale: 0.9 
      }}
      animate={{ 
        opacity: 1, 
        scale: 1 
      }}
      transition={{ 
        duration: 0.4,
        delay,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}

interface PullToRefreshProps {
  children: ReactNode
  onRefresh: () => Promise<void>
  className?: string
}

export function PullToRefresh({ 
  children, 
  onRefresh,
  className 
}: PullToRefreshProps) {
  return (
    <motion.div
      className={className}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={(_, info) => {
        if (info.offset.y > 100) {
          onRefresh()
        }
      }}
      whileDrag={{ 
        scale: 1.02,
        transition: { duration: 0.2 } 
      }}
    >
      {children}
    </motion.div>
  )
}