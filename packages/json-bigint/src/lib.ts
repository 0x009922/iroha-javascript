// Adopted version of https://github.com/sidorares/json-bigint/blob/3391780b2a3f613bb51536c47e6cddbca31013eb/lib/parse.js
// TODO refactor it...

const suspectProtoRx =
  /(?:_|\\u005[Ff])(?:_|\\u005[Ff])(?:p|\\u0070)(?:r|\\u0072)(?:o|\\u006[Ff])(?:t|\\u0074)(?:o|\\u006[Ff])(?:_|\\u005[Ff])(?:_|\\u005[Ff])/
const suspectConstructorRx =
  /(?:c|\\u0063)(?:o|\\u006[Ff])(?:n|\\u006[Ee])(?:s|\\u0073)(?:t|\\u0074)(?:r|\\u0072)(?:u|\\u0075)(?:c|\\u0063)(?:t|\\u0074)(?:o|\\u006[Ff])(?:r|\\u0072)/

interface Options {
  /**
   * not being strict means do not generate syntax errors for "duplicate key"
   * @default false
   */
  strict?: boolean
  /**
   * toggles whether the values should be stored as BigNumber (default) or a string
   * @default false
   */
  storeAsString?: boolean
  /**
   * toggles whether all numbers should be Big
   * @default false
   */
  alwaysParseAsBig?: boolean
  /**
   * @default 'error'
   */
  protoAction?: Action
  /**
   * @default 'error'
   */
  constructorAction?: Action
}

type Action = 'error' | 'ignore'

const ESCAPEE = {
  '"': '"',
  '\\': '\\',
  '/': '/',
  b: '\b',
  f: '\f',
  n: '\n',
  r: '\r',
  t: '\t',
}

class Parser {
  #text: string
  #at: number
  #char: string | null

  public constructor(text: string) {
    this.#text = text
    this.#at = -1
    this.#char = null
  }

  private get char(): string {
    if (!this.#char) throw new Error('no current char')
    return this.#char
  }

  private error(message: string): never {
    throw Object.assign(new SyntaxError(message), { at: this.#at, text: this.#text })
  }

  private parseString(): string {}
}

export function createParse(options?: Options) {
  const resolvedOptions: Required<Options> = {
    strict: false,
    storeAsString: false,
    alwaysParseAsBig: false,
    protoAction: 'error',
    constructorAction: 'error',
    ...options,
  }

  //   let at: number // The index of the current character
  //   let _currentChar: string // The current character

  //   let text: string

  function throwError(message: string): never {
    // Call error when something is wrong.

    const err = Object.assign(new SyntaxError(message), { at, text })
    throw err
  }

  function nextChar(expectCurrentToBe?: string) {
    // If a c parameter is provided, verify that it matches the current character.

    if (expectCurrentToBe && expectCurrentToBe !== currentChar) {
      throwError("Expected '" + expectCurrentToBe + "' instead of '" + currentChar + "'")
    }

    // Get the next character. When there are no more characters,
    // return the empty string.

    currentChar = text.charAt(at)
    at += 1
    return currentChar
  }

  // eslint-disable-next-line complexity
  function parseNumber() {
    // Parse a number value.

    let ch = currentChar
    let number
    let string = ''

    if (currentChar === '-') {
      string = '-'
      ch = nextChar('-')
    }
    while (ch >= '0' && ch <= '9') {
      string += currentChar
      ch = nextChar()
    }
    if (currentChar === '.') {
      string += '.'
      while ((ch = nextChar()) && ch >= '0' && ch <= '9') {
        string += currentChar
      }
    }
    if (ch === 'e' || ch === 'E') {
      string += currentChar
      ch = nextChar()
      if (ch === '-' || ch === '+') {
        string += currentChar
        ch = nextChar()
      }
      while (ch >= '0' && ch <= '9') {
        string += currentChar
        ch = nextChar()
      }
    }
    number = Number(string)
    if (!isFinite(number)) {
      throwError('Bad number')
    } else {
      // if (number > 9007199254740992 || number < -9007199254740992)
      // Bignumber has stricter check: everything with length > 15 digits disallowed
      if (string.length > 15) return resolvedOptions.storeAsString ? string : BigInt(string)
      else return !resolvedOptions.alwaysParseAsBig ? number : BigInt(number)
    }
  }

  function parseString() {
    // Parse a string value.

    let hex
    let i
    let string = ''
    let uffff

    // When parsing for string values, we must look for " and \ characters.

    if (currentChar === '"') {
      let startAt = at
      while (nextChar()) {
        if (currentChar === '"') {
          if (at - 1 > startAt) string += text.substring(startAt, at - 1)
          nextChar()
          return string
        }
        if (currentChar === '\\') {
          if (at - 1 > startAt) string += text.substring(startAt, at - 1)
          nextChar()
          if (currentChar === 'u') {
            uffff = 0
            for (i = 0; i < 4; i += 1) {
              hex = parseInt(nextChar(), 16)
              // eslint-disable-next-line max-depth
              if (!isFinite(hex)) {
                break
              }
              uffff = uffff * 16 + hex
            }
            string += String.fromCharCode(uffff)
          } else if (typeof ESCAPEE[currentChar] === 'string') {
            string += ESCAPEE[currentChar]
          } else {
            break
          }
          startAt = at
        }
      }
    }
    throwError('Bad string')
  }

  function parseWhitespace() {
    // Skip whitespace.

    let ch = currentChar
    while (ch && ch <= ' ') {
      ch = nextChar()
    }
  }

  function parseWord() {
    // true, false, or null.

    switch (currentChar) {
      case 't':
        nextChar('t')
        nextChar('r')
        nextChar('u')
        nextChar('e')
        return true
      case 'f':
        nextChar('f')
        nextChar('a')
        nextChar('l')
        nextChar('s')
        nextChar('e')
        return false
      case 'n':
        nextChar('n')
        nextChar('u')
        nextChar('l')
        nextChar('l')
        return null
    }
    throwError("Unexpected '" + currentChar + "'")
  }

  function parseArray(): any[] {
    // Parse an array value.

    let ch = currentChar
    const array: any[] = []

    if (ch === '[') {
      ch = nextChar('[')
      parseWhitespace()
      if (ch === ']') {
        nextChar(']')
        return array // empty array
      }
      while (ch) {
        array.push(parseValue())
        parseWhitespace()
        if (ch === ']') {
          ch = nextChar(']')
          return array
        }
        ch = nextChar(',')
        parseWhitespace()
      }
    }
    throwError('Bad array')
  }

  function parseObject() {
    // Parse an object value.

    let ch = currentChar
    let key
    let object = Object.create(null)

    if (ch === '{') {
      ch = nextChar('{')
      parseWhitespace()
      if (ch === '}') {
        ch = nextChar('}')
        return object // empty object
      }
      while (ch) {
        key = parseString()
        parseWhitespace()
        ch = nextChar(':')
        if (resolvedOptions.strict === true && Object.hasOwnProperty.call(object, key)) {
          throwError('Duplicate key "' + key + '"')
        }

        if (suspectProtoRx.test(key) === true) {
          if (resolvedOptions.protoAction === 'error') {
            throwError('Object contains forbidden prototype property')
          } else if (resolvedOptions.protoAction === 'ignore') {
            parseValue()
          } else {
            object[key] = parseValue()
          }
        } else if (suspectConstructorRx.test(key) === true) {
          if (resolvedOptions.constructorAction === 'error') {
            throwError('Object contains forbidden constructor property')
          } else if (resolvedOptions.constructorAction === 'ignore') {
            parseValue()
          } else {
            object[key] = parseValue()
          }
        } else {
          object[key] = parseValue()
        }

        parseWhitespace()
        if (ch === '}') {
          ch = nextChar('}')
          return object
        }
        ch = nextChar(',')
        parseWhitespace()
      }
    }
    throwError('Bad object')
  }

  function parseValue() {
    // Parse a JSON value. It could be an object, an array, a string, a number,
    // or a word.

    parseWhitespace()
    switch (currentChar) {
      case '{':
        return parseObject()
      case '[':
        return parseArray()
      case '"':
        return parseString()
      case '-':
        return parseNumber()
      default:
        return currentChar >= '0' && currentChar <= '9' ? parseNumber() : parseWord()
    }
  }

  // Return the json_parse function. It will have access to all of the above
  // functions and variables.

  return function (source: string, reviver?: (key: string, value: unknown) => any) {
    let result

    text = String(source)
    at = 0
    currentChar = ' '
    result = parseValue()
    parseWhitespace()
    if (currentChar) {
      throwError('Syntax error')
    }

    // If there is a reviver function, we recursively walk the new structure,
    // passing each name/value pair to the reviver function for possible
    // transformation, starting with a temporary root object that holds the result
    // in an empty key. If there is not a reviver function, we simply return the
    // result.

    return typeof reviver === 'function'
      ? (function walk(holder: any, key: string) {
          let k
          let v
          let value = holder[key]
          if (value && typeof value === 'object') {
            Object.keys(value).forEach((k) => {
              v = walk(value, k)
              if (v !== undefined) {
                value[k] = v
              } else {
                delete value[k]
              }
            })
          }
          return reviver.call(holder, key, value)
        })({ '': result }, '')
      : result
  }
}
