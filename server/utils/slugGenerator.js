/**
 * Generate URL-friendly slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} - URL-friendly slug
 */
const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    // Replace spaces and special characters with hyphens
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Ensure slug is unique by appending number if duplicate exists
 * @param {string} slug - Base slug
 * @param {Function} checkExists - Function to check if slug exists (async)
 * @param {string} excludeId - Post ID to exclude from check (for updates)
 * @returns {Promise<string>} - Unique slug
 */
const ensureUniqueSlug = async (slug, checkExists, excludeId = null) => {
  let uniqueSlug = slug;
  let counter = 1;

  // Truncate slug if too long (max 200 chars)
  if (uniqueSlug.length > 200) {
    uniqueSlug = uniqueSlug.substring(0, 200);
    // Remove trailing hyphen if truncated at hyphen
    uniqueSlug = uniqueSlug.replace(/-+$/, '');
  }

  // Check if slug exists
  while (await checkExists(uniqueSlug, excludeId)) {
    // Append number to make it unique
    const suffix = `-${counter}`;
    const maxLength = 200 - suffix.length;
    uniqueSlug = slug.substring(0, maxLength) + suffix;
    counter++;
  }

  return uniqueSlug;
};

module.exports = {
  generateSlug,
  ensureUniqueSlug,
};

