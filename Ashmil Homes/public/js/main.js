// ---------- LOAD PROPERTIES (for properties.html and index.html featured) ----------
async function loadProperties(containerId, category = '', limit = 0) {
  try {
    let url = '/api/properties';
    if (category) url += `?category=${category}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch');
    let properties = await res.json();
    if (limit > 0) properties = properties.slice(0, limit);

    const container = document.getElementById(containerId);
    if (!container) return;
    if (properties.length === 0) {
      container.innerHTML = '<p class="text-center col-span-full">No properties found.</p>';
      return;
    }

    container.innerHTML = properties.map(prop => `
      <div class="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-elegant transition-smooth">
        <div class="relative h-64">
          <img src="${prop.images[0] || '/assets/placeholder.jpg'}" alt="${prop.title}" class="w-full h-full object-cover">
          <div class="absolute top-3 right-3 bg-gold text-navy text-xs font-bold px-3 py-1 rounded-full">${prop.category}</div>
        </div>
        <div class="p-5">
          <div class="flex justify-between items-start mb-2">
            <h3 class="font-serif text-xl font-bold">${prop.title}</h3>
            <span class="text-gold font-semibold">₦${prop.price}</span>
          </div>
          <p class="text-muted-foreground text-sm mb-3">${prop.location}</p>
          <div class="flex gap-4 text-sm text-muted-foreground mb-4">
            ${prop.bedrooms ? `<span>🛏️ ${prop.bedrooms}</span>` : ''}
            ${prop.bathrooms ? `<span>🚿 ${prop.bathrooms}</span>` : ''}
            ${prop.area ? `<span>📏 ${prop.area}</span>` : ''}
          </div>
          <p class="text-muted-foreground text-sm line-clamp-2">${prop.description}</p>
          <a href="#" class="mt-4 inline-flex items-center text-gold text-sm font-medium hover:gap-2 transition-all">View details →</a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
  }
}

// ---------- CONTACT FORM HANDLER (on contact.html) ----------
if (document.querySelector('#contact-form')) {
  document.querySelector('#contact-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      message: formData.get('message')
    };
    const btn = e.target.querySelector('button[type="submit"]');
    const originalText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Sending...';
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await res.json();
      alert(result.success ? 'Message sent! We\'ll get back to you soon.' : 'Error sending message.');
      if (result.success) e.target.reset();
    } catch (err) {
      alert('Network error. Please try again.');
    } finally {
      btn.disabled = false;
      btn.innerText = originalText;
    }
  });
}

// ---------- HERO SLIDER (for index.html) ----------
function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  const prevBtn = document.querySelector('.hero-prev');
  const nextBtn = document.querySelector('.hero-next');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;
  let current = 0;

  function showSlide(index) {
    slides.forEach((slide, i) => {
      slide.style.opacity = i === index ? '1' : '0';
      if (dots[i]) dots[i].classList.toggle('bg-gold', i === index);
    });
  }
  function next() { current = (current + 1) % slides.length; showSlide(current); }
  function prev() { current = (current - 1 + slides.length) % slides.length; showSlide(current); }

  if (nextBtn) nextBtn.addEventListener('click', next);
  if (prevBtn) prevBtn.addEventListener('click', prev);
  dots.forEach((dot, i) => dot.addEventListener('click', () => { current = i; showSlide(current); }));
  setInterval(next, 6000);
}

// Run on page load
document.addEventListener('DOMContentLoaded', () => {
  // featured properties on homepage
  if (document.getElementById('featured-properties')) loadProperties('featured-properties', '', 3);
  // properties page category detection
  const path = window.location.pathname;
  if (path.includes('/properties/houses')) loadProperties('properties-container', 'houses');
  else if (path.includes('/properties/land')) loadProperties('properties-container', 'land');
  else if (path.includes('/properties/shortlets')) loadProperties('properties-container', 'shortlets');
  else if (path.includes('/properties/flats')) loadProperties('properties-container', 'flats');
  else if (path === '/properties' || path === '/properties/') loadProperties('properties-container');
  // hero slider
  initHeroSlider();
});