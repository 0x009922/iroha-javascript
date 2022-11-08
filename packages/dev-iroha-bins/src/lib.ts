export { KnownBinaries } from './types'

import path from 'path'
import makeDir from 'make-dir'
import del from 'del'
import { $ } from 'zx'
import consola from 'consola'
import { match } from 'ts-pattern'
import { KnownBinaries } from './types'

const TMP_DIR = path.resolve(__dirname, '../tmp')
const TMP_CARGO_ROOT = path.resolve(TMP_DIR, 'cargo')

async function prepareTmpDir() {
  await makeDir(TMP_DIR)
}

function cargoInstallArgs(binary: KnownBinaries): string[] {
  const IROHA_DIR = path.resolve('../../../iroha')

  return [
    '--root',
    TMP_CARGO_ROOT,
    ...match(binary)
      .with(KnownBinaries.Iroha, () => ['--path', path.join(IROHA_DIR, 'cli')])
      .with(KnownBinaries.Kagami, () => ['--path', path.join(IROHA_DIR, 'tools/kagami')])
      .exhaustive(),
  ]
}

export async function install(binary: KnownBinaries): Promise<void> {
  await prepareTmpDir()
  consola.info(`Installing binary with cargo: ${binary}`)
  await $`cargo install ${cargoInstallArgs(binary)}`
}

/**
 * Removes all temporary files
 */
export async function clean() {
  await del(TMP_DIR)
}

export async function resolveBinaryPath(binary: KnownBinaries): Promise<string> {
  return path.resolve(
    TMP_CARGO_ROOT,
    'bin',
    match(binary)
      .with(KnownBinaries.Iroha, () => 'iroha')
      .with(KnownBinaries.Kagami, () => 'kagami')
      .exhaustive(),
  )
}
