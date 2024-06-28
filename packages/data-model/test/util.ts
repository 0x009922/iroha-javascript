export { toHex } from '@scale-codec/util'

function* hexes(hex: string): Generator<number> {
  for (let i = 0; i < hex.length; ) {
    if (/^[0-9a-fA-F]{2}/.test(hex.slice(i))) {
      yield Number.parseInt(hex.slice(i, i + 2), 0x10)
      i += 2
    } else i += 1
  }
}

export function fromHex(hex: string): Uint8Array {
  return new Uint8Array(hexes(hex))
}