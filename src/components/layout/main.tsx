import React from 'react'
import { cn } from '@/lib/utils'
import { motion } from 'motion/react'

interface MainProps extends React.HTMLAttributes<HTMLElement> {
  fixed?: boolean
  ref?: React.Ref<HTMLElement>
}

export const Main = ({ fixed, className, children, ...props }: MainProps) => {
  return (
    <main
      className={cn(
        'peer-[.header-fixed]/header:mt-16',
        'px-4 py-6',
        fixed && 'fixed-main flex flex-grow flex-col overflow-hidden',
        className
      )}
      {...props}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
        className={fixed ? 'flex flex-col flex-1 overflow-hidden' : undefined}
      >
        {children}
      </motion.div>
    </main>
  )
}

Main.displayName = 'Main'
