/** biome-ignore-all lint/performance/noImgElement: I not using next*/

import { type ImgHTMLAttributes, useCallback, useState } from "react"
import { cn } from "@/lib/utils"

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  blurAlt?: string
  blurSrc?: string
  containerClassName?: string
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

function Image({
  className,
  containerClassName,
  blurSrc,
  blurAlt = "blur preview",
  alt,
  onLoad,
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setIsLoaded(true)
      onLoad?.(e)
    },
    [onLoad]
  )

  return (
    <div className={cn("relative", containerClassName)}>
      {blurSrc ? (
        // biome-ignore lint/correctness/useImageSize: dynamic preview image
        <img
          alt={blurAlt}
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full object-cover blur-lg transition-opacity duration-500",
            isLoaded && "opacity-0"
          )}
          src={blurSrc}
        />
      ) : null}
      {/* biome-ignore lint/a11y/noNoninteractiveElementInteractions: img onLoad is a valid native event */}
      {/* biome-ignore lint/correctness/useImageSize: dynamic component */}
      <img
        alt={alt}
        className={cn(
          "z-10 h-full w-full object-contain transition-opacity duration-500",
          !isLoaded && "opacity-0",
          className
        )}
        data-slot="image"
        onLoad={handleLoad}
        {...props}
      />
    </div>
  )
}

export { Image }
