/**
 * CMS Content Loader for 50 Fables
 * Fetches JSON content and populates the DOM based on data-cms attributes.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Determine which content file to load based on the current page
    const path = globalThis.location.pathname;
    const page = path.split('/').pop() || 'index.html';
    
    let contentFile = '';
    if (page === 'index.html' || page === '') {
        contentFile = 'content/home.json';
    } else if (page === 'about.html') {
        contentFile = 'content/about.json';
    } else if (page === 'contact.html') {
        contentFile = 'content/contact.json';
    } else if (page === 'gallery.html') {
        contentFile = 'content/gallery.json';
    } else if (page === 'wayanad.html') {
        contentFile = 'content/wayanad.json';
    }

    if (contentFile) {
        fetch(contentFile)
            .then(response => response.json())
            .then(data => {
                applyContent(data);
                
                // If it is the gallery page, wait for all images to completely load to show them all at once
                if (page === 'gallery.html' || path.includes('/gallery')) {
                    const galleryImages = document.querySelectorAll('.page-gallery img');
                    let loadedCount = 0;
                    const totalImages = galleryImages.length;
                    
                    if (totalImages === 0) {
                        $(".preloader").fadeOut(600);
                    } else {
                        const checkAndHidePreloader = () => {
                            loadedCount++;
                            if (loadedCount >= totalImages) {
                                $(".preloader").fadeOut(600);
                            }
                        };
                        
                        galleryImages.forEach(img => {
                            if (img.complete) {
                                checkAndHidePreloader();
                            } else {
                                img.addEventListener('load', checkAndHidePreloader);
                                img.addEventListener('error', checkAndHidePreloader); // Hide preloader even if some images fail
                            }
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error loading CMS content:', error);
                if (page === 'gallery.html' || path.includes('/gallery')) {
                    $(".preloader").fadeOut(600);
                }
            });
    }
});

/**
 * Recursively applies content from JSON to the DOM
 * Supports:
 * - InnerText/InnerHTML: [data-cms-key="key"]
 * - Attributes: [data-cms-attr="attrName:key"]
 * - Lists: [data-cms-list="listKey"] (needs a template child)
 */
function applyContent(data) {
    // 1. Handle Simple Keys (Text/HTML)
    const textElements = document.querySelectorAll('[data-cms-key]');
    textElements.forEach(el => {
        const key = el.dataset.cmsKey;
        const value = getNestedValue(data, key);
        if (value !== undefined) {
            if ('cmsHtml' in el.dataset) {
                el.innerHTML = value;
            } else {
                el.innerText = value;
            }
        }
    });

    // 2. Handle Attributes (Images, Links, etc.)
    const attrElements = document.querySelectorAll('[data-cms-attr]');
    attrElements.forEach(el => {
        const attrMapping = el.dataset.cmsAttr; // e.g. "src:hero_image" or "href:hero_link"
        const [attrName, key] = attrMapping.split(':');
        const value = getNestedValue(data, key);
        if (value !== undefined) {
            el.setAttribute(attrName, value);
        }
    });

    // 3. Handle Lists (Arrays)
    const listElements = document.querySelectorAll('[data-cms-list]');
    listElements.forEach(container => {
        const listKey = container.dataset.cmsList;
        const items = getNestedValue(data, listKey);
        
        if (Array.isArray(items)) {
            const template = container.querySelector('[data-cms-item]');
            if (!template) return;

            // Clear existing content except the template
            // We keep the template but hide it, or just use it as a blueprint
            const blueprint = template.cloneNode(true);
            delete blueprint.dataset.cmsItem;
            blueprint.style.display = ''; // Ensure it's visible if the template was hidden

            // Remove all children first
            container.innerHTML = '';

            items.forEach(itemData => {
                const newItem = blueprint.cloneNode(true);
                
                // If the item itself is a string (like a simple list)
                if (typeof itemData === 'string') {
                    const textEl = newItem.querySelector('[data-cms-sub-key="."]') || newItem;
                    textEl.innerText = itemData;
                } else {
                    // Handle sub-keys within the list item
                    newItem.querySelectorAll('[data-cms-sub-key]').forEach(subEl => {
                        const subKey = subEl.dataset.cmsSubKey;
                        const subValue = getNestedValue(itemData, subKey);
                        if (subValue !== undefined) {
                            if ('cmsHtml' in subEl.dataset) {
                                subEl.innerHTML = subValue;
                            } else {
                                subEl.innerText = subValue;
                            }
                        }
                    });

                    // Handle sub-attributes within the list item
                    newItem.querySelectorAll('[data-cms-sub-attr]').forEach(subEl => {
                        const subAttrMapping = subEl.dataset.cmsSubAttr;
                        const [attrName, subKey] = subAttrMapping.split(':');
                        const subValue = getNestedValue(itemData, subKey);
                        if (subValue !== undefined) {
                            // Support template strings in sub-attributes: e.g. "style:background-image: url('{image}')"
                            let finalValue = subValue;
                            if (attrName.includes('{') || subAttrMapping.includes('{')) {
                                // This is a bit complex, let's just handle the style case simply for now
                                // but for now, we'll just check if the mapping has a placeholder
                                if (subAttrMapping.includes('{')) {
                                   const templateStr = subAttrMapping.substring(attrName.length + 1);
                                   finalValue = templateStr.replace(`{${subKey}}`, subValue);
                                }
                            }
                            subEl.setAttribute(attrName, finalValue);
                        }
                    });

                    // Handle index-based classes (needed for Wayanad experiences)
                    const indexEl = newItem.querySelector('[data-cms-item-index]') || ('cmsItemIndex' in newItem.dataset ? newItem : null);
                    if (indexEl) {
                        const prefix = indexEl.dataset.cmsItemIndexAttr || '';
                        if (prefix.includes(':')) {
                            const [, pre] = prefix.split(':');
                            indexEl.classList.add(`${pre}${items.indexOf(itemData)}`);
                        }
                    }
                }
                container.appendChild(newItem);
            });
        }
    });

    // Optional: Re-trigger any animations (like WOW.js or text-anime)
    if (globalThis.WOW) new globalThis.WOW().init();
}

/**
 * Helper to get value from nested object using dot notation (e.g. "seo.title")
 */
function getNestedValue(obj, path) {
    if (path === '.') return obj;
    return path.split('.').reduce((prev, curr) => {
        return prev ? prev[curr] : undefined;
    }, obj);
}
