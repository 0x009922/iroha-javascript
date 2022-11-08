export enum KnownBinaries {
  /**
   * Kagami (teacher)
   */
  Kagami = 'kagami',
  /**
   * Main Iroha CLI binary - runs peer
   */
  Iroha = 'cli',
}

export type BinaryNameMap = { [K in KnownBinaries]: string }
