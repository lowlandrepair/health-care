document.addEventListener('DOMContentLoaded', () => {
  // Function to fetch and load page content via AJAX
  async function loadPage(url, addToHistory = true) {
    try {
      const response = await fetch(url, { method: 'GET', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!response.ok) throw new Error('Network response was not ok');
      const text = await response.text();

      // Parse the fetched HTML text
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');

      // Extract the main content to replace
      const newContent = doc.body.innerHTML;

      // Replace the body content
      document.body.innerHTML = newContent;

      // Update the document title
      document.title = doc.title;

      // Re-run scripts in the new content
      const scripts = Array.from(document.body.querySelectorAll('script'));
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        if (oldScript.src) {
          newScript.src = oldScript.src;
          newScript.async = false;
        } else {
          newScript.textContent = oldScript.textContent;
        }
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });

      // Scroll to top
      window.scrollTo(0, 0);

      // Update browser history
      if (addToHistory) {
        history.pushState({ url: url }, '', url);
      }

      // Re-attach navigation handlers for new links
      attachLinkHandlers();

    } catch (error) {
      console.error('Failed to load page:', error);
      window.location.href = url; // fallback to full reload
    }
  }

  // Attach click handlers to internal links
  function attachLinkHandlers() {
    const links = document.querySelectorAll('a[href]');
    links.forEach(link => {
      const url = new URL(link.href, window.location.origin);
      if (url.origin === window.location.origin) {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          loadPage(url.pathname);
        });
      }
    });
  }

  // Handle browser back/forward buttons
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.url) {
      loadPage(event.state.url, false);
    }
  });

  // Initial setup
  attachLinkHandlers();
});
