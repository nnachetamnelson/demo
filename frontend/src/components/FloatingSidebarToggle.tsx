import React, { useEffect, useState } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface SidebarToggleProps {
  isCollapsed: boolean
  toggleSidebar: () => void
}

const FloatingSidebarToggle: React.FC<SidebarToggleProps> = ({
  isCollapsed,
  toggleSidebar,
}) => {
  const { scrollY } = useScroll()
  // Fade out slightly and move inward as user scrolls
  const opacity = useTransform(scrollY, [0, 150], [1, 0.5])
  const xOffset = useTransform(scrollY, [0, 150], [0, 10])

  const [isVisible, setIsVisible] = useState(true)

  // Hide button briefly when user scrolls down fast
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleScroll = () => {
      setIsVisible(false)
      clearTimeout(timeout)
      timeout = setTimeout(() => setIsVisible(true), 300)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.button
      onClick={toggleSidebar}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: isVisible ? 1 : 0, x: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        opacity,
        x: xOffset,
      }}
      className={`fixed top-1/2 transform -translate-y-1/2 z-50 
        bg-gray-900 text-white shadow-lg hover:bg-gray-800
        rounded-full px-3 py-2 transition-all duration-300
        flex items-center justify-center group
        ${isCollapsed ? "left-3" : "left-64"} `}
    >
      {isCollapsed ? (
        <ChevronRight className="w-5 h-5 transition-transform group-hover:scale-110" />
      ) : (
        <ChevronLeft className="w-5 h-5 transition-transform group-hover:scale-110" />
      )}
    </motion.button>
  )
}

export default FloatingSidebarToggle
