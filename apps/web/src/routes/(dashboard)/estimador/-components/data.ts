export type LastMeasurementData = {
  id: number
  meterId: number
  name: string
  time: string
  tensaoFaseNeutroA: number | null
  tensaoFaseNeutroB: number | null
  tensaoFaseNeutroC: number | null
  estimation: number | null
  error: number | null
  isOverridden?: boolean
}
