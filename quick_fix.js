const fs = require('fs');
let html = fs.readFileSync('gallery.html', 'utf8');

// Replace all lazy loading tags
html = html.replace(/<img loading="lazy" src="/g, '<img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7" class="lazy-load" data-src="');

const jsCode = `<!-- Lazy Loading Script -->
<script>
document.addEventListener('DOMContentLoaded', function() {
    var lazyImages = [].slice.call(document.querySelectorAll('img.lazy-load'));

    if ('IntersectionObserver' in window) {
        let lazyImageObserver = new IntersectionObserver(function(entries, observer) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    let lazyImage = entry.target;
                    if(lazyImage.dataset.src) {
                        lazyImage.src = lazyImage.dataset.src;
                        lazyImage.onload = () => { lazyImage.classList.add('loaded'); };
                        lazyImageObserver.unobserve(lazyImage);
                    }
                }
            });
        });

        lazyImages.forEach(function(lazyImage) {
            lazyImageObserver.observe(lazyImage);
        });
    } else {
        lazyImages.forEach(function(lazyImage) {
            if(lazyImage.dataset.src) {
                lazyImage.src = lazyImage.dataset.src;
                lazyImage.classList.add('loaded');
            }
        });
    }
});
</script>
</body>`;

if (!html.includes('Lazy Loading Script')) {
    html = html.replace('</body>', jsCode);
}

fs.writeFileSync('gallery.html', html);
console.log('Update complete!');
