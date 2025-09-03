import { useState } from 'react'
import type { History, Sensor } from './types'

export function useChartZoom<T extends boolean>(sensor?: Sensor, hasPhase?: T) {
  type DataType = T extends true ? History['phases'] : History['single']

  const [yDomainTop, setYDomainTop] = useState<number | undefined>(undefined)
  const [yDomainBottom, setYDomainBottom] = useState<number | undefined>(
    undefined
  )
  const [isZoomed, setIsZoomed] = useState(false)
  const [visibleData, setVisibleData] = useState<DataType>()
  const [xDomainLeft, setXDomainLeft] = useState<string>('')
  const [xDomainRight, setXDomainRight] = useState<string>('')

  const getYAxisMinMax = (data: DataType) => {
    if (!data.length) {
      return [0, 10]
    }

    let allValues: number[] = []
    if (hasPhase) {
      allValues = (data as History['phases']).flatMap((item) => [
        item.phaseA,
        item.phaseB,
        item.phaseC,
      ])
    } else {
      allValues = (data as History['single']).map((item) => item.value)
    }

    if (!allValues.length) {
      return [0, 10]
    }

    const min = Math.min(...allValues)
    const max = Math.max(...allValues)
    const padding = (max - min) * 0.1 || 1

    return [
      Number((min - padding).toFixed(3)),
      Number((max + padding).toFixed(3)),
    ]
  }

  const getAxisYDomain = (from: string, to: string) => {
    if (!sensor?.history) {
      return { range: [0, 10], reverseOrder: false }
    }

    let reverseOrder = false
    const data = hasPhase ? sensor.history.phases : sensor.history.single
    const dataKeys = data.map((e) => e.time)
    let fromIndex = dataKeys.indexOf(from)
    let toIndex = dataKeys.indexOf(to)

    if (fromIndex > toIndex) {
      ;[fromIndex, toIndex] = [toIndex, fromIndex]
      reverseOrder = true
    }

    const filteredData = data.slice(fromIndex, toIndex + 1) as DataType
    setVisibleData(filteredData)

    return {
      range: getYAxisMinMax(filteredData),
      reverseOrder,
    }
  }

  // // --- effects ---
  // useEffect(() => {
  //   if (sensor?.history) {
  //     const data = hasPhase ? sensor.history.phases : sensor.history.single
  //     setVisibleData(data as DataType)
  //     if (!isZoomed) {
  //       const [min, max] = getYAxisMinMax(data as DataType)
  //       setYDomainBottom(min)
  //       setYDomainTop(max)
  //     }
  //   }
  // }, [sensor, isZoomed, hasPhase])

  // --- actions ---
  const zoomIn = () => {
    if (xDomainLeft === xDomainRight || xDomainRight === '') {
      setXDomainLeft('')
      setXDomainRight('')
      return
    }

    let _xDomainLeft = xDomainLeft
    let _xDomainRight = xDomainRight

    const { range, reverseOrder } = getAxisYDomain(_xDomainLeft, _xDomainRight)
    const [bottomPoint, topPoint] = range

    if (reverseOrder) {
      ;[_xDomainLeft, _xDomainRight] = [_xDomainRight, _xDomainLeft]
    }

    setIsZoomed(true)
    setXDomainLeft('')
    setXDomainRight('')
    setYDomainBottom(bottomPoint)
    setYDomainTop(topPoint)
  }

  const zoomOut = () => {
    if (!sensor?.history) {
      return
    }

    setIsZoomed(false)
    const data = hasPhase ? sensor.history.phases : sensor.history.single
    setVisibleData(data as DataType)
    setXDomainLeft('')
    setXDomainRight('')
    const [min, max] = getYAxisMinMax(data as DataType)
    setYDomainBottom(min)
    setYDomainTop(max)
  }

  return {
    yDomainTop,
    yDomainBottom,
    isZoomed,
    visibleData,
    xDomainLeft,
    setXDomainLeft,
    xDomainRight,
    setXDomainRight,
    zoomIn,
    zoomOut,
  }
}
