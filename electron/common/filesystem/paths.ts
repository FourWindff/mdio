import fs from 'fs'
import path from 'path'
import { isFile, isFile2, isSymbolicLink } from './index'

const isOsx = process.platform === 'darwin'

export const LEXICAL_EXTENSIONS = Object.freeze([
  'lexical'
])

export const LEXICAL_INCLUSIONS = Object.freeze(LEXICAL_EXTENSIONS.map(x => '*.' + x))

export const IMAGE_EXTENSIONS = Object.freeze([
  'jpeg',
  'jpg',
  'png',
  'gif',
  'svg',
  'webp'
])

/**
 * Returns true if the filename matches one of the markdown extensions.
 *
 * @param {string} filename Path or filename
 * @returns {boolean}
 */
export const hasLexicalExtension = (filename: string): boolean => {
  if (!filename || typeof filename !== 'string') return false
  return LEXICAL_EXTENSIONS.some(ext => filename.toLowerCase().endsWith(`.${ext}`))
}

/**
 * Returns true if the path is an image file.
 *
 * @param {string} filepath The path
 * @returns {boolean}
 */
export const isImageFile = (filepath: string): boolean => {
  const extname = path.extname(filepath)
  return isFile(filepath) && IMAGE_EXTENSIONS.some(ext => {
    const EXT_REG = new RegExp(ext, 'i')
    return EXT_REG.test(extname)
  })
}

/**
 * Returns true if the path is a markdown file or symbolic link to a markdown file.
 *
 * @param {string} filepath The path or link path.
 * @returns {boolean}
 */
export const isLexicalFile = (filepath: string): boolean => {
  if (!isFile2(filepath)) return false

  // Check symbolic link.
  if (isSymbolicLink(filepath)) {
    const targetPath = path.resolve(path.dirname(filepath), fs.readlinkSync(filepath))
    return isFile(targetPath) && hasLexicalExtension(targetPath)
  }
  return hasLexicalExtension(filepath)
}

/**
 * Check if the both paths point to the same file.
 *
 * @param {string} pathA The first path.
 * @param {string} pathB The second path.
 * @param {boolean} [isNormalized] Are both paths already normalized.
 * @returns {boolean}
 */
export const isSamePathSync = (pathA: string, pathB: string, isNormalized = false): boolean => {
  if (!pathA || !pathB) return false
  const a = isNormalized ? pathA : path.normalize(pathA)
  const b = isNormalized ? pathB : path.normalize(pathB)
  if (a.length !== b.length) {
    return false
  } else if (a === b) {
    return true
  } else if (a.toLowerCase() === b.toLowerCase()) {
    try {
      const fiA = fs.statSync(a)
      const fiB = fs.statSync(b)
      return fiA.ino === fiB.ino
    } catch (_) {
      // Ignore error
    }
  }
  return false
}

/**
 * Check whether a file or directory is a child of the given directory.
 *
 * @param {string} dir The parent directory.
 * @param {string} child The file or directory path to check.
 * @returns {boolean}
 */
export const isChildOfDirectory = (dir: string, child: string): boolean => {
  if (!dir || !child) return false
  const relative = path.relative(dir, child)
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

