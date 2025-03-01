/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_signature_free(a: number): void;
export function createSignature(a: number, b: number, c: number): number;
export function signature_verify(a: number, b: number, c: number): void;
export function signature_signatureBytes(a: number, b: number): void;
export function __wbg_algorithm_free(a: number): void;
export function AlgorithmBlsNormal(): number;
export function AlgorithmBlsSmall(): number;
export function AlgorithmSecp256k1(): number;
export function AlgorithmEd25519(): number;
export function __wbg_keygenconfiguration_free(a: number): void;
export function createKeyGenConfiguration(): number;
export function keygenconfiguration_useSeed(a: number, b: number, c: number): number;
export function keygenconfiguration_usePrivateKey(a: number, b: number): number;
export function keygenconfiguration_withAlgorithm(a: number, b: number): number;
export function __wbg_privatekey_free(a: number): void;
export function privatekey_digestFunction(a: number, b: number): void;
export function privatekey_payload(a: number, b: number): void;
export function createPrivateKeyFromJsKey(a: number): number;
export function createPublicKeyFromMultihash(a: number): number;
export function __wbg_keypair_free(a: number): void;
export function generateKeyPairWithConfiguration(a: number): number;
export function createKeyPairFromKeys(a: number, b: number): number;
export function keypair_publicKey(a: number): number;
export function keypair_privateKey(a: number): number;
export function __wbg_multihashdigestfunction_free(a: number): void;
export function MultihashDigestEd25519Pub(): number;
export function MultihashDigestSecp256k1Pub(): number;
export function MultihashDigestBls12381g1Pub(): number;
export function MultihashDigestBls12381g2Pub(): number;
export function createMultihashDigestFunctionFromString(a: number, b: number): number;
export function multihashdigestfunction_toString(a: number, b: number): void;
export function __wbg_multihash_free(a: number): void;
export function createMultihashFromBytes(a: number, b: number): number;
export function createMultihashFromPublicKey(a: number): number;
export function multihash_toBytes(a: number, b: number): void;
export function multihash_digestFunction(a: number): number;
export function multihash_payload(a: number, b: number): void;
export function __wbg_hash_free(a: number): void;
export function createHash(a: number, b: number): number;
export function hash_bytes(a: number, b: number): void;
export function publickey_payload(a: number, b: number): void;
export function signature_publicKey(a: number): number;
export function publickey_digestFunction(a: number, b: number): void;
export function main(): void;
export function __wbg_publickey_free(a: number): void;
export function __wbindgen_malloc(a: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number): void;
export function __wbindgen_realloc(a: number, b: number, c: number): number;
export function __wbindgen_exn_store(a: number): void;
export function __wbindgen_start(): void;
