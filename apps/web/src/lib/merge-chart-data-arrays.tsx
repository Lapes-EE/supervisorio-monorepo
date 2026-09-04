interface DataEntry {
  time: string
  [key: string]: number | string
}

export function mergeDataArrays(...arrays: DataEntry[][]): DataEntry[] {
  const mergedMap = new Map<string, DataEntry>()

  for (const array of arrays) {
    for (const item of array) {
      const { time, ...rest } = item
      const existing = mergedMap.get(time) || { time }
      mergedMap.set(time, { ...existing, ...rest })
    }
  }

  return Array.from(mergedMap.values()).sort((a, b) =>
    a.time.localeCompare(b.time)
  )
}
