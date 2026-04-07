/**
 * Orbital Authority: Kinetic Internal Linking Script
 * Dynamically injects high-priority internal links across the site.
 * Gravity Wells: High-'mass' pages are prioritized first.
 */

document.addEventListener('DOMContentLoaded', () => {
    const orbitalContainerId = 'orbital-gravity-well';
    const jsonPath = 'js/orbital-priority.json';

    // Find the container where we want to inject links (usually in footer/sidebar)
    const well = document.getElementById(orbitalContainerId);
    if (!well) return;

    fetch(jsonPath)
        .then(response => response.json())
        .then(data => {
            const links = data.orbital_priority;
            
            // Sort by mass descending (highest mass 100 first)
            links.sort((a, b) => b.mass - a.mass);

            let html = '<div class="orbital-links">';
            html += '<h4 class="orbital-title">Explore Featured Wayanad Experiences</h4>';
            html += '<ul>';

            links.forEach(link => {
                // Skip it if we're already on the same page
                if (window.location.pathname.includes(link.url)) return;

                html += `
                    <li class="orbital-item" data-mass="${link.mass}">
                        <a href="${link.url}" title="${link.title}">
                            ${link.anchor}
                        </a>
                    </li>
                `;
            });

            html += '</ul></div>';
            well.innerHTML = html;
        })
        .catch(error => console.error('[Orbital Authority] Gravity Well Error:', error));
});
