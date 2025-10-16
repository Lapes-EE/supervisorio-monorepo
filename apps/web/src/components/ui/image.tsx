/** biome-ignore-all lint/performance/noImgElement: I not using next*/

import { type ImgHTMLAttributes, useState } from 'react'
import { cn } from '@/lib/utils'

interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  blurSrc?: string
  blurAlt?: string
  containerClassName?: string
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void
}

function Image({
  className,
  containerClassName,
  blurSrc,
  blurAlt = 'blur preview',
  alt,
  onLoad,
  ...props
}: ImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true)
    onLoad?.(e)
  }

  return (
    <div className={cn('relative', containerClassName)}>
      {blurSrc && (
        <img
          alt={blurAlt}
          aria-hidden="true"
          className={cn(
            'absolute inset-0 h-full w-full object-cover blur-lg transition-opacity duration-500',
            isLoaded && 'opacity-0'
          )}
          src={blurSrc}
        />
      )}
      {/* biome-ignore lint/nursery/noNoninteractiveElementInteractions: img onLoad is a valid native event */}
      <img
        alt={alt}
        className={cn(
          'z-10 h-full w-full object-contain transition-opacity duration-500',
          !isLoaded && 'opacity-0',
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
