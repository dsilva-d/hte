# Hawk Tuah Replacer Chrome Extension

This Chrome extension replaces most:

- nouns with `hawk` / `hawks`
- verbs with `tuah` / `tuahs` / `tuahed` / `tuahing`

It also adjusts `a` / `an` after replacement.

## Notes

This uses heuristics, not a full natural-language parser, so it works pretty well for normal page text but will not be perfect on every sentence.

It intentionally avoids changing:

- pronouns like `I`, `me`, `you`
- common names like `David`, `John`
- text in inputs, textareas, code blocks, scripts, and editable fields

## Install

1. Open Chrome.
2. Go to `chrome://extensions/`
3. Turn on **Developer mode**.
4. Click **Load unpacked**.
5. Select the `hawk_tuah_extension` folder.

## Customize

If you want to protect more names, add them to `PROTECTED_WORDS` in `content.js`.
