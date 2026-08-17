import type { Category } from '../types'
import { categories as initialCategories } from '../data/mockData'

const STORAGE_KEY = 'webgom_custom_collections'

export function getStoredCategories(): Category[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Failed to read stored collections', err)
  }
  return initialCategories
}

export function saveStoredCategory(category: Category): Category[] {
  const current = getStoredCategories()
  const index = current.findIndex(c => c.id === category.id)
  let updated: Category[]
  if (index >= 0) {
    updated = [...current]
    updated[index] = category
  } else {
    updated = [...current, category]
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to save collection', err)
  }
  return updated
}

export function deleteStoredCategory(id: string): Category[] {
  const current = getStoredCategories()
  const updated = current.filter(c => c.id !== id)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to delete collection', err)
  }
  return updated
}

export function resetStoredCategories(): Category[] {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCategories))
  } catch (err) {
    console.error('Failed to reset collections', err)
  }
  return initialCategories
}
