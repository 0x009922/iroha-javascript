import * as dm from '@iroha2/data-model'
import fs from 'fs/promises'
import path from 'path'
import { temporaryDirectory } from 'tempy'
import { EXECUTOR_WASM_PATH, irohaCodecToJson, resolveBinary } from '@iroha2/iroha-source'
import { execa } from 'execa'
import type { PublicKey } from '@iroha2/crypto-core'
import { ACCOUNT_KEY_PAIR, CHAIN, GENESIS_KEY_PAIR } from './lib'

const BLOCK_TIME_MS = 0
const COMMIT_TIME_MS = 0

export const DOMAIN: dm.DomainId = new dm.Name('wonderland')

export async function createGenesis(params: {
  /**
   * A list of peers' public keys. Must be at least one.
   */
  topology: PublicKey[]
}): Promise<dm.SignedBlock> {
  const alice = dm.AccountId.parse(`${ACCOUNT_KEY_PAIR.publicKey}@${DOMAIN.value}`)
  const genesis = dm.AccountId.parse(`${GENESIS_KEY_PAIR.publicKey}@genesis`)

  const instructionsJson = await irohaCodecToJson(
    'Vec<InstructionBox>',
    dm.Vec.with(dm.getCodec(dm.InstructionBox)).encode([
      dm.InstructionBox.Register.Domain({ id: DOMAIN, metadata: [], logo: null }),
      dm.InstructionBox.Register.Account({ id: alice, metadata: [] }),
      dm.InstructionBox.Transfer.Domain({ source: genesis, object: DOMAIN, destination: alice }),
      dm.InstructionBox.SetParameter.Sumeragi.BlockTime(dm.Duration.fromMillis(BLOCK_TIME_MS)),
      dm.InstructionBox.SetParameter.Sumeragi.CommitTime(dm.Duration.fromMillis(COMMIT_TIME_MS)),
      ...[
        { name: 'CanSetParameters', payload: dm.Json.fromValue(null) },
        { name: 'CanRegisterDomain', payload: dm.Json.fromValue(null) },
      ].map((object) => dm.InstructionBox.Grant.Permission({ object, destination: alice })),
    ]),
  )

  // FIXME: produce SignedBlock directly, without Kagami.
  const kagami_input = {
    chain: CHAIN,
    executor: EXECUTOR_WASM_PATH,
    instructions: instructionsJson,
    topology: params.topology.map((x) => x.toMultihash()),
    // FIXME: migrate to direct building of `SignedBlock`, without `genesis.json`.
    //        And note that I don't use any WASMs and these fields are extra for my case.
    wasm_dir: 'why the hell do you require wasm_dir at all times?',
    wasm_triggers: [],
  }

  return signGenesisWithKagami(kagami_input)
}

async function signGenesisWithKagami(json: unknown): Promise<dm.SignedBlock> {
  const kagami = await resolveBinary('iroha_kagami')

  const dir = temporaryDirectory()
  await fs.writeFile(path.join(dir, 'genesis.json'), JSON.stringify(json))

  const { stdout } = await execa(
    kagami.path,
    [
      `genesis`,
      `sign`,
      path.join(dir, 'genesis.json'),
      `--public-key`,
      GENESIS_KEY_PAIR.publicKey,
      `--private-key`,
      GENESIS_KEY_PAIR.privateKey,
      // '--out-file',
      // path.join(dir, 'genesis.scale'),
    ],
    { encoding: 'buffer' },
  )

  return dm.getCodec(dm.SignedBlock).decode(stdout)
}
