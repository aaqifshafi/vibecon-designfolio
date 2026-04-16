import React, { useState, useRef } from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { motion, AnimatePresence, MotionConfig } from "framer-motion"
import { Sparkles, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import profileImg from "@/assets/images/profile.png"

function useClickAway(ref: React.RefObject<HTMLElement>, handler: (event: MouseEvent | TouchEvent) => void) {
  React.useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return
      }
      handler(event)
    }
    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)
    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

const menuItems = [
  { id: "upgrade", label: "Upgrade PRO", icon: Sparkles },
  { id: "settings", label: "Settings", subLabel: "Custom Domains, Username and more", icon: Settings },
  { id: "logout", label: "Logout", icon: LogOut },
]

export function AvatarDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null) as any

  useClickAway(dropdownRef, () => setIsOpen(false))

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false)
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="relative" ref={dropdownRef}>
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-black/20 dark:focus:ring-white/20 transition-all cursor-pointer block"
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <Avatar className="h-10 w-10 border border-black/10 dark:border-white/10 flex-shrink-0 transition-transform hover:scale-105">
            <AvatarImage src={profileImg} alt="Profile" />
            <AvatarFallback>MB</AvatarFallback>
          </Avatar>
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { duration: 0.15, ease: "easeOut" },
              }}
              exit={{
                opacity: 0,
                y: -4,
                transition: { duration: 0.15, ease: "easeIn" },
              }}
              className="absolute right-0 top-full mt-2 z-50 min-w-[280px]"
              onKeyDown={handleKeyDown}
              style={{ transformOrigin: "top right" }}
            >
              <div className="w-full rounded-2xl border border-black/10 dark:border-white/10 bg-white dark:bg-[#2A2520] p-1.5 shadow-lg overflow-hidden">
                <div className="relative flex flex-col" onMouseLeave={() => setHoveredId(null)}>
                  {menuItems.map((item) => {
                    const isActive = hoveredId === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onMouseEnter={() => setHoveredId(item.id)}
                        onClick={() => setIsOpen(false)}
                        className="relative w-full text-left focus:outline-none cursor-pointer group"
                      >
                        {isActive && (
                          <motion.div
                            layoutId="avatar-dropdown-highlight"
                            className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-xl z-0"
                            initial={false}
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.4,
                            }}
                          />
                        )}
                        <div className="relative z-10 flex items-center w-full px-3 py-3 rounded-xl transition-colors duration-150 text-[#1A1A1A] dark:text-[#F0EDE7]">
                          <div className="flex items-center justify-center shrink-0 mr-3">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[13px] font-medium leading-none">
                              {item.label}
                            </span>
                            {item.subLabel && (
                              <span className="text-[12px] text-[#7A736C] dark:text-[#9E9893]">
                                {item.subLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MotionConfig>
  )
}
