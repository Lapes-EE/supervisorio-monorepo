import type { ColumnDef } from "@tanstack/react-table"
import { describe, expect, it } from "vitest"
import { getColumns } from "./columns"
import type { LastMeasurementData } from "./data"

function accessorKeyOf(
  column: ColumnDef<LastMeasurementData>
): string | undefined {
  return "accessorKey" in column ? column.accessorKey : undefined
}

const noop = () => {
  // onEditMeter is not exercised by these column-selection tests.
}

describe("getColumns column selection", () => {
  it("selects voltage columns for tensao", () => {
    const columns = getColumns("tensao", noop)

    expect(accessorKeyOf(columns[1])).toBe("tensaoFaseNeutroC")
    expect(columns[1].header).toBe("Tensão Medida (V)")
    expect(accessorKeyOf(columns[2])).toBe("estimation")
    expect(columns[2].header).toBe("Estimação (V)")
    expect(accessorKeyOf(columns[3])).toBe("error")
    expect(columns[3].header).toBe("Resíduo (V)")
  })

  it("selects active power columns for potencia_ativa", () => {
    const columns = getColumns("potencia_ativa", noop)

    expect(accessorKeyOf(columns[1])).toBe("potenciaAtivaFundamentalC")
    expect(columns[1].header).toBe("Potência Ativa Medida (W)")
    expect(accessorKeyOf(columns[2])).toBe("potenciaAtivaEstimada")
    expect(columns[2].header).toBe("Estimação (W)")
    expect(accessorKeyOf(columns[3])).toBe("erroPotenciaAtiva")
    expect(columns[3].header).toBe("Resíduo (W)")
  })

  it("selects reactive power columns for potencia_reativa", () => {
    const columns = getColumns("potencia_reativa", noop)

    expect(accessorKeyOf(columns[1])).toBe("potenciaReativaC")
    expect(columns[1].header).toBe("Potência Reativa Medida (VAr)")
    expect(accessorKeyOf(columns[2])).toBe("potenciaReativaEstimada")
    expect(columns[2].header).toBe("Estimação (VAr)")
    expect(accessorKeyOf(columns[3])).toBe("erroPotenciaReativa")
    expect(columns[3].header).toBe("Resíduo (VAr)")
  })
})
