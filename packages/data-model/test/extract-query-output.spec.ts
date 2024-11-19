import { datamodel, extractQueryOutput } from '@iroha2/data-model'
import { expect, test } from 'vitest'
import { SAMPLE_ACCOUNT_ID } from './util'

test('Extract a batch of AssetDefinitions', () => {
  const definitions = [
    datamodel.AssetDefinition({
      id: 'rose#wonderland',
      type: { t: 'Numeric', value: {} },
      mintable: 'Not',
      ownedBy: SAMPLE_ACCOUNT_ID,
      totalQuantity: { mantissa: 42n, scale: 0n },
    }),
  ]
  const response = datamodel.QueryResponse({
    t: 'Iterable',
    value: { batch: { t: 'AssetDefinition', value: definitions }, remainingItems: 4n },
  })
  expect(extractQueryOutput('FindAssetsDefinitions', response)).toEqual(definitions)
})

test('Extract singular domain metadata', () => {
  const metadata = { foo: 'bar', baz: [1, 2, 3] }
  const response = datamodel.QueryResponse({
    t: 'Singular',
    value: { t: 'Json', value: metadata },
  })
  expect(extractQueryOutput('FindDomainMetadata', response).asValue()).toEqual(metadata)
})
