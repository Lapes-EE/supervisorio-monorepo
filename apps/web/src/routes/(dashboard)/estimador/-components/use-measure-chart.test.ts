import { describe, expect, it } from "vitest"
import type { EstimationItem } from "@/http/estimation-api"
import { buildMeasureChartData } from "./use-measure-chart"

const history: EstimationItem[] = [
  {
    barra: "Barra 3",
    ID_medidor: 1,
    indice_EE: 3,
    time: "2026-08-21T14:58:00.000Z",
    tensao_pu: 1,
    tensao_V: 218,
    tensao_medida_V: 219,
    erro_V: 1,
    potencia_ativa_medida_W: 5000,
    potencia_ativa_W: 4980,
    erro_potencia_ativa_W: 20,
    potencia_reativa_medida_VAr: 100,
    potencia_reativa_VAr: 90,
    erro_potencia_reativa_VAr: 10,
  },
  {
    barra: "Barra 3",
    ID_medidor: 1,
    indice_EE: 3,
    time: "2026-08-21T14:59:00.000Z",
    tensao_pu: 1,
    tensao_V: 220,
    tensao_medida_V: 221,
    erro_V: 1,
    potencia_ativa_medida_W: 5100,
    potencia_ativa_W: 5080,
    erro_potencia_ativa_W: 20,
    potencia_reativa_medida_VAr: 110,
    potencia_reativa_VAr: 100,
    erro_potencia_reativa_VAr: 10,
  },
]

describe("buildMeasureChartData", () => {
  it("maps backend voltage history to chart points", () => {
    const result = buildMeasureChartData(history, "tensao")

    expect(result).toEqual([
      {
        label: "11:58",
        time: "2026-08-21T14:58:00.000Z",
        actual: 219,
        estimated: 218,
        error: 1,
      },
      {
        label: "11:59",
        time: "2026-08-21T14:59:00.000Z",
        actual: 221,
        estimated: 220,
        error: 1,
      },
    ])
  })

  it("uses the selected power fields", () => {
    const result = buildMeasureChartData(history, "potencia_ativa")

    expect(result[0]).toMatchObject({
      actual: 5000,
      estimated: 4980,
      error: 20,
    })
  })

  it("returns no points for an empty history", () => {
    expect(buildMeasureChartData([], "potencia_reativa")).toEqual([])
  })
})
