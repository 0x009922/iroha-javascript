export interface RustDefinitions {
  [typeFullPath: string]: RustTypeDefinitionVariant
}

export type RustTypeDefinitionVariant =
  | RustMapDefinition
  | RustDirectAlias
  | RustVecDefinition
  | RustOptionDefinition
  | RustNamedStructDefinition
  | RustTupleStructDefinition
  | RustEnumDefinition
  | RustArrayDefinition
  | RustIntDef
  | RustFixedPointDef
  | RustTupleDef

export interface RustMapDefinition {
  Map: {
    key: TypePath
    value: TypePath
    sorted_by_key: boolean
  }
}

export interface RustTupleDef {
  Tuple: {
    types: TypePath[]
  }
}

export type RustDirectAlias = TypePath

export interface RustVecDefinition {
  Vec: {
    ty: TypePath
    sorted: boolean
  }
}

export interface RustArrayDefinition {
  Array: {
    len: number
    ty: TypePath
  }
}

export interface RustOptionDefinition {
  Option: TypePath
}

export interface RustNamedStructDefinition {
  Struct: {
    declarations: Array<{
      name: string
      ty: TypePath
    }>
  }
}

export interface RustTupleStructDefinition {
  TupleStruct: {
    types: Array<TypePath>
  }
}

export interface RustEnumDefinition {
  Enum: {
    variants: Array<RustEnumVarDef>
  }
}

export interface RustEnumVarDef {
  name: string
  discriminant: number
  ty: TypePath | null
}

export interface RustIntDef {
  Int: string
}

export interface RustFixedPointDef {
  FixedPoint: {
    base: string
    decimal_places: number
  }
}

export type TypePath = string
