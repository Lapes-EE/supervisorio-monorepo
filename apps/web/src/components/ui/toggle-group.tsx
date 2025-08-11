import {
  Item as ToggleGroupPrimitiveItem,
  Root as ToggleGroupPrimitiveRoot,
} from '@radix-ui/react-toggle-group'
import type { VariantProps } from 'class-variance-authority'
import { type ComponentProps, createContext, useContext } from 'react'
import { toggleVariants } from '@/components/ui/toggle'
import { cn } from '@/lib/utils'

const ToggleGroupContext = createContext<VariantProps<typeof toggleVariants>>({
  size: 'default',
  variant: 'default',
})

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitiveRoot> &
  VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitiveRoot
      className={cn(
        'group/toggle-group flex w-fit items-center rounded-md data-[variant=outline]:shadow-xs',
        className
      )}
      data-size={size}
      data-slot="toggle-group"
      data-variant={variant}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitiveRoot>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: ComponentProps<typeof ToggleGroupPrimitiveItem> &
  VariantProps<typeof toggleVariants>) {
  const context = useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitiveItem
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        'min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
        className
      )}
      data-size={context.size || size}
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      {...props}
    >
      {children}
    </ToggleGroupPrimitiveItem>
  )
}

export { ToggleGroup, ToggleGroupItem }
