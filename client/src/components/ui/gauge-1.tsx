import { useEffect, useState } from "react"
import type { CSSProperties, SVGProps } from "react"
import { useMotionValue, useSpring } from "framer-motion"
import { cn } from "@/lib/utils"

export interface GaugeProps extends Omit<SVGProps<SVGSVGElement>, "className"> {
  value: number
  size?: number | string
  gapPercent?: number
  strokeWidth?: number
  equal?: boolean
  showValue?: boolean
  showPercentage?: boolean
  primary?: "danger" | "warning" | "success" | "info" | string | { [key: number]: string }
  secondary?: "danger" | "warning" | "success" | "info" | string | { [key: number]: string }
  gradient?: boolean
  gaugeType?: "full" | "half" | "quarter"
  transition?: { length?: number; step?: number; delay?: number }
  className?: string | { svgClassName?: string; primaryClassName?: string; secondaryClassName?: string; textClassName?: string }
  label?: string
  unit?: string
  min?: number
  max?: number
  glowEffect?: boolean
}

export function Gauge({
  value,
  size = 150,
  gapPercent = 5,
  strokeWidth = 10,
  equal = false,
  showValue = true,
  showPercentage = false,
  primary,
  secondary,
  gradient = false,
  gaugeType = "full",
  transition = { length: 1000, step: 200, delay: 0 },
  className,
  label,
  unit = "%",
  min = 0,
  max = 100,
  glowEffect = false,
  ...props
}: GaugeProps) {
  const circleSize = 100
  const radius = circleSize / 2 - strokeWidth / 2
  const circumference = 2 * Math.PI * radius
  const percentToDegree = 360 / 100

  const offsetFactor = equal ? 0.5 : 0
  const offsetFactorSecondary = 1 - offsetFactor

  const { formattedValue: animatedValue, rawValue: animatedRawValue } = useNumberCounter({
    value,
    delay: (transition?.delay ?? 0) / 1000,
    decimalPlaces: value % 1 !== 0 ? 1 : 0,
  })

  const strokePercent = animatedRawValue

  const gaugeConfig = (() => {
    switch (gaugeType) {
      case "half": return { startAngle: -90, endAngle: 90, circumferenceFactor: 0.5 }
      case "quarter": return { startAngle: 0, endAngle: 90, circumferenceFactor: 0.25 }
      default: return { startAngle: -90, endAngle: 270, circumferenceFactor: 1 }
    }
  })()

  const adjustedCircumference = circumference * gaugeConfig.circumferenceFactor
  const adjustedPercentToPx = adjustedCircumference / 100

  const primaryStrokeDasharray = () => {
    if (offsetFactor > 0 && strokePercent > 100 - gapPercent * 2 * offsetFactor) {
      const subtract = -strokePercent + 100
      return `${Math.max(strokePercent * adjustedPercentToPx - subtract * adjustedPercentToPx, 0)} ${adjustedCircumference}`
    }
    const subtract = gapPercent * 2 * offsetFactor
    return `${Math.max(strokePercent * adjustedPercentToPx - subtract * adjustedPercentToPx, 0)} ${adjustedCircumference}`
  }

  const secondaryStrokeDasharray = () => {
    if (offsetFactorSecondary < 1 && strokePercent < gapPercent * 2 * offsetFactorSecondary) {
      const subtract = strokePercent
      return `${Math.max((100 - strokePercent) * adjustedPercentToPx - subtract * adjustedPercentToPx, 0)} ${adjustedCircumference}`
    }
    const subtract = gapPercent * 2 * offsetFactorSecondary
    return `${Math.max((100 - strokePercent) * adjustedPercentToPx - subtract * adjustedPercentToPx, 0)} ${adjustedCircumference}`
  }

  const primaryTransform = () => {
    if (offsetFactor > 0 && strokePercent > 100 - gapPercent * 2 * offsetFactor) {
      const add = 0.5 * (-strokePercent + 100)
      return `rotate(${-90 + add * percentToDegree}deg)`
    }
    const add = gapPercent * offsetFactor
    return `rotate(${-90 + add * percentToDegree}deg)`
  }

  const secondaryTransform = () => {
    if (offsetFactorSecondary < 1 && strokePercent < gapPercent * 2 * offsetFactorSecondary) {
      const subtract = 0.5 * strokePercent
      return `rotate(${360 - 90 - subtract * percentToDegree}deg) scaleY(-1)`
    }
    const subtract = gapPercent * offsetFactorSecondary
    return `rotate(${360 - 90 - subtract * percentToDegree}deg) scaleY(-1)`
  }

  const getColor = (colorProp: typeof primary, isSecondary = false) => {
    const defaultColors = isSecondary
      ? { danger: "#fecaca", warning: "#fde68a", info: "#bfdbfe", success: "#bbf7d0" }
      : { danger: "#dc2626", warning: "#f59e0b", info: "#3b82f6", success: "#22c55e" }
    if (!colorProp) {
      if (isSecondary) return "rgba(85,85,85,0.15)"
      return strokePercent <= 25 ? defaultColors.danger : strokePercent <= 50 ? defaultColors.warning : strokePercent <= 75 ? defaultColors.info : defaultColors.success
    }
    if (typeof colorProp === "string") return defaultColors[colorProp as keyof typeof defaultColors] || colorProp
    if (typeof colorProp === "object") {
      const keys = Object.keys(colorProp).sort((a, b) => Number(a) - Number(b))
      const checkValue = isSecondary ? 100 - strokePercent : strokePercent
      for (let i = 0; i < keys.length; i++) {
        const currentKey = Number(keys[i])
        const nextKey = Number(keys[i + 1])
        if (checkValue >= currentKey && (checkValue < nextKey || !nextKey)) {
          const color = colorProp[currentKey]
          return defaultColors[color as keyof typeof defaultColors] || color
        }
      }
    }
    return isSecondary ? "#e5e7eb" : "#3b82f6"
  }

  const primaryStroke = getColor(primary)
  const secondaryStroke = getColor(secondary, true)

  const primaryOpacity = () => (offsetFactor > 0 && strokePercent < gapPercent * 2 * offsetFactor && strokePercent < gapPercent * 2 * offsetFactorSecondary) ? 0 : 1
  const secondaryOpacity = () => ((offsetFactor === 0 && strokePercent > 100 - gapPercent * 2) || (offsetFactor > 0 && strokePercent > 100 - gapPercent * 2 * offsetFactor && strokePercent > 100 - gapPercent * 2 * offsetFactorSecondary)) ? 0 : 1

  const circleStyles: CSSProperties = {
    strokeLinecap: "round",
    strokeLinejoin: "round",
    strokeDashoffset: 0,
    strokeWidth,
    transformOrigin: "50% 50%",
    shapeRendering: "geometricPrecision",
  }

  const glowStyles = glowEffect ? { filter: `drop-shadow(0 0 4px ${primaryStroke}80) drop-shadow(0 0 10px ${primaryStroke}40)` } : {}

  return (
    <div className="relative inline-block">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${circleSize} ${circleSize}`}
        shapeRendering="crispEdges"
        width={size}
        height={size}
        style={{ userSelect: "none", ...glowStyles }}
        fill="none"
        className={cn("", typeof className === "string" ? className : className?.svgClassName)}
        {...props}
      >
        {gradient && (
          <defs>
            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={primaryStroke} stopOpacity="0.3" />
              <stop offset="100%" stopColor={primaryStroke} stopOpacity="1" />
            </linearGradient>
          </defs>
        )}

        <circle cx={circleSize / 2} cy={circleSize / 2} r={radius}
          style={{ ...circleStyles, strokeDasharray: secondaryStrokeDasharray(), transform: secondaryTransform(), stroke: secondaryStroke, opacity: secondaryOpacity() }}
          className={cn("", typeof className === "object" && className?.secondaryClassName)}
        />
        <circle cx={circleSize / 2} cy={circleSize / 2} r={radius}
          style={{ ...circleStyles, strokeDasharray: primaryStrokeDasharray(), transform: primaryTransform(), stroke: gradient ? "url(#primaryGradient)" : primaryStroke, opacity: primaryOpacity() }}
          className={cn("", typeof className === "object" && className?.primaryClassName)}
        />

        {showValue && (
          <text x={circleSize / 2} y={circleSize / 2} textAnchor="middle" dominantBaseline="middle" alignmentBaseline="central"
            fill="currentColor" fontSize={30} fontWeight="700"
            className={cn("font-bold", typeof className === "object" && className?.textClassName)}
            style={{ userSelect: "none" }}>
            {animatedValue}{showPercentage && unit}
          </text>
        )}
        {label && (
          <text x={circleSize / 2} y={circleSize / 2 + 20} textAnchor="middle" dominantBaseline="middle"
            fontSize={8} fontWeight="400" className="fill-muted-foreground" style={{ userSelect: "none" }}>
            {label}
          </text>
        )}
      </svg>
    </div>
  )
}

export function useNumberCounter({ value, direction = "up", delay = 0, decimalPlaces = 0 }: {
  value: number; direction?: "up" | "down"; delay?: number; decimalPlaces?: number
}) {
  const [displayValue, setDisplayValue] = useState(direction === "down" ? value : 0)
  const [rawValue, setRawValue] = useState(direction === "down" ? value : 0)
  const [isInView, setIsInView] = useState(false)

  const motionValue = useMotionValue(direction === "down" ? value : 0)
  const springValue = useSpring(motionValue, { damping: 60, stiffness: 100 })

  useEffect(() => {
    const initialValue = direction === "down" ? value : 0
    setDisplayValue(initialValue)
    setRawValue(initialValue)
  }, [direction, value])

  useEffect(() => {
    const timer = setTimeout(() => setIsInView(true), 100)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (isInView) {
      const timeout = setTimeout(() => { motionValue.set(direction === "down" ? 0 : value) }, delay * 1000)
      return () => clearTimeout(timeout)
    }
  }, [motionValue, isInView, delay, value, direction])

  useEffect(() => {
    const unsubscribe = springValue.on("change", (latest) => {
      setDisplayValue(Number(latest.toFixed(decimalPlaces)))
      setRawValue(latest)
    })
    return unsubscribe
  }, [springValue, decimalPlaces])

  const formattedDisplayValue = Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(displayValue)

  return { formattedValue: formattedDisplayValue, rawValue }
}
