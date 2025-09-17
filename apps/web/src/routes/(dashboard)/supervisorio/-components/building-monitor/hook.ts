import { useState } from 'react'
import type { History, Sensor } from './types'

export function useChartZoom(sensor?: Sensor) {
  type DataType = History['phases']

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

    // Sempre extrai valores das três fases
    const allValues: number[] = data.flatMap((item) => [
      item.phaseA,
      item.phaseB,
      item.phaseC,
    ])

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
    const data = sensor.history.phases
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
    const data = sensor.history.phases
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
