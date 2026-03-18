const IGNORE_WORDS = new Set([
  "i","me","you","he","she","it","we","they","us","them",
  "my","your","his","her","our","their",
  "mine","yours","hers","ours","theirs",
  "myself","yourself","himself","herself","itself","ourselves","themselves",

  "a","an","the",
  "and","or","but","nor","so","yet",
  "of","to","in","on","at","by","for","with","from","as","into","onto","over","under",
  "this","that","these","those",
  "not","no","yes","very","too","so","just","also","then","than","there","here",
  "if","because","while","though","although","when","where","which","who","whom","whose","what"
])

const HELPER_VERBS = new Set([
  "am","is","are","was","were","be","been","being",
  "can","could","will","would","shall","should","may","might","must",
  "do","does","did",
  "have","has","had"
])

const COMMON_VERBS = new Set([
  "go","goes","went","gone","going",
  "walk","walks","walked","walking",
  "run","runs","ran","running",
  "eat","eats","ate","eating","eaten",
  "buy","buys","bought","buying",
  "sell","sells","sold","selling",
  "make","makes","made","making",
  "take","takes","took","taking","taken",
  "get","gets","got","getting","gotten",
  "see","sees","saw","seeing","seen",
  "say","says","said","saying",
  "tell","tells","told","telling",
  "find","finds","found","finding",
  "think","thinks","thought","thinking",
  "know","knows","knew","knowing","known",
  "give","gives","gave","giving","given",
  "come","comes","came","coming",
  "leave","leaves","left","leaving",
  "work","works","worked","working",
  "use","uses","used","using",
  "need","needs","needed","needing",
  "want","wants","wanted","wanting",
  "call","calls","called","calling",
  "try","tries","tried","trying",
  "ask","asks","asked","asking",
  "seem","seems","seemed","seeming",
  "feel","feels","felt","feeling",
  "start","starts","started","starting",
  "stop","stops","stopped","stopping",
  "play","plays","played","playing",
  "read","reads","reading",
  "write","writes","wrote","writing","written",
  "change","changes","changed","changing",
  "replace","replaces","replaced","replacing"
])

const COMMON_NOUN_SUFFIXES = [
  "tion","sion","ment","ness","ity","ism","ist","er","or","ship","age","ance","ence","hood"
]

const COMMON_VERB_SUFFIXES = [
  "ing","ed","ize","ise","fy","en"
]

const ADJECTIVE_SUFFIXES = [
  "ous","ful","able","ible","al","ive","ic","less","ish","ary"
]

if (ADJECTIVE_SUFFIXES.some(s => lower.endsWith(s))) {
  return false
}

function isWord(token) {
  return /^[A-Za-z]+(?:'[A-Za-z]+)?$/.test(token)
}

function preserveCase(original, replacement) {
  if (original === original.toUpperCase()) return replacement.toUpperCase()
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1)
  }
  return replacement
}

function isSentenceBoundary(token) {
  return /[.!?]/.test(token)
}

function isCapitalized(word) {
  return /^[A-Z][a-z]/.test(word)
}

function isProperNoun(tokens, index) {
  const word = tokens[index]
  if (!isCapitalized(word)) return false

  for (let i = index - 1; i >= 0; i--) {
    const t = tokens[i].trim()
    if (!t) continue
    if (isSentenceBoundary(t)) return false
    return true
  }

  return false
}

function looksLikeVerb(word) {
  const lower = word.toLowerCase()

  if (HELPER_VERBS.has(lower)) return false
  if (COMMON_VERBS.has(lower)) return true
  if (COMMON_VERB_SUFFIXES.some(suffix => lower.endsWith(suffix))) return true

  if (lower.endsWith("s") && lower.length > 3) {
    const base = lower.slice(0, -1)
    if (COMMON_VERBS.has(base)) return true
  }

  return false
}

function looksLikePluralNoun(word) {
  const lower = word.toLowerCase()
  if (lower.length <= 2) return false
  if (!lower.endsWith("s")) return false
  if (HELPER_VERBS.has(lower)) return false
  if (COMMON_VERBS.has(lower)) return false
  if (looksLikeVerb(lower)) return false
  return true
}

function looksLikeNoun(word) {
  const lower = word.toLowerCase()

  if (IGNORE_WORDS.has(lower) || HELPER_VERBS.has(lower)) return false
  if (COMMON_VERBS.has(lower)) return false
  if (looksLikeVerb(lower)) return false
  if (COMMON_NOUN_SUFFIXES.some(suffix => lower.endsWith(suffix))) return true
  if (looksLikePluralNoun(lower)) return true

  // fallback: medium/long content words are more likely nouns
  return lower.length >= 4
}

function conjugateTuah(original) {
  const lower = original.toLowerCase()

  if (lower.endsWith("ing")) return preserveCase(original, "tuahing")
  if (lower.endsWith("ed")) return preserveCase(original, "tuahed")

  if (lower === "goes" || lower === "does" || lower === "makes" || lower.endsWith("es")) {
    return preserveCase(original, "tuahs")
  }

  if (lower.endsWith("s")) return preserveCase(original, "tuahs")

  return preserveCase(original, "tuah")
}

function nounForm(original) {
  const lower = original.toLowerCase()
  return preserveCase(original, looksLikePluralNoun(lower) ? "hawks" : "hawk")
}

function fixArticles(tokens) {
  for (let i = 0; i < tokens.length - 1; i++) {
    const current = tokens[i]
    const next = tokens[i + 1]

    if (!isWord(current) || !isWord(next)) continue

    const lower = current.toLowerCase()
    const nextLower = next.toLowerCase()

    if (lower === "an" && !/^[aeiou]/.test(nextLower)) {
      tokens[i] = preserveCase(current, "a")
    } else if (lower === "a" && /^[aeiou]/.test(nextLower)) {
      tokens[i] = preserveCase(current, "an")
    }
  }
}

function transformText(text) {
  const tokens = text.split(/(\b|\s+|[^\w\s]+)/)
  let lastReplacementType = null

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (!isWord(token)) continue

    const lower = token.toLowerCase()

    if (lower === "hawk" || lower === "hawks" || lower.startsWith("tuah")) {
      lastReplacementType = "already"
      continue
    }

    if (IGNORE_WORDS.has(lower) || HELPER_VERBS.has(lower)) {
      lastReplacementType = null
      continue
    }

    if (isProperNoun(tokens, i)) {
      lastReplacementType = null
      continue
    }

    if (looksLikeVerb(token)) {
      tokens[i] = conjugateTuah(token)
      lastReplacementType = "verb"
      continue
    }

    if (looksLikeNoun(token)) {
      // prevent consecutive noun replacements: "hawk hawk"
      if (lastReplacementType === "noun") {
        lastReplacementType = null
        continue
      }

      // also avoid replacing right after an article if next word would get weirdly doubled later
      tokens[i] = nounForm(token)
      lastReplacementType = "noun"
      continue
    }

    lastReplacementType = null
  }

  fixArticles(tokens)
  return tokens.join("")
}

function shouldSkipElement(node) {
  return (
    node.tagName === "SCRIPT" ||
    node.tagName === "STYLE" ||
    node.tagName === "NOSCRIPT" ||
    node.tagName === "TEXTAREA" ||
    node.tagName === "INPUT" ||
    node.tagName === "CODE" ||
    node.tagName === "PRE" ||
    node.isContentEditable
  )
}

function walk(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    if (!node.nodeValue.trim()) return
    node.nodeValue = transformText(node.nodeValue)
    return
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    if (shouldSkipElement(node)) return
    for (const child of node.childNodes) {
      walk(child)
    }
  }
}

walk(document.body)