// app.js
// =======================================================
// STICKY HEADER
// =======================================================

const stickyHeader = document.querySelector(".sticky-header");

window.addEventListener("scroll", () => {
  if (window.scrollY > 100) {
    stickyHeader.classList.add("visible");
  } else {
    stickyHeader.classList.remove("visible");
  }
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const href = this.getAttribute('href');
    if (href !== '#') {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    }
  });
});

// =======================================================
// GALLERY + VIEWER
// =======================================================

const images = Array.from({ length: 50 }, (_, i) => {
  const num = String(50 - i).padStart(2, '0');
  return {
    src: `thumbnails/IMAGE${num}.webp`,
    title: `Image ${50 - i}`,
    info: `Los Santos • Frame ${50 - i}`
  };
});

const gallery = document.getElementById("gallery");
const viewer = document.getElementById("viewer");
const viewerImg = document.getElementById("viewerImg");
const viewerTitle = document.getElementById("viewerTitle");
const viewerInfo = document.getElementById("viewerInfo");
const viewerClose = document.getElementById("viewerClose");

images.forEach(img => {
  const frame = document.createElement("div");
  frame.className = "frame";
  frame.innerHTML = `
    <img src="${img.src}" loading="lazy">
    <div class="meta">
      <h3>${img.title}</h3>
      <span>${img.info}</span>
    </div>
  `;
  frame.addEventListener("click", () => openViewer(img));
  gallery.appendChild(frame);
});

function openViewer(img) {
  viewerImg.src = img.src;
  viewerTitle.textContent = img.title;
  viewerInfo.textContent = img.info;
  viewer.classList.add("active");
}

viewerClose.addEventListener("click", () => {
  viewer.classList.remove("active");
});

viewer.addEventListener("click", e => {
  if (e.target === viewer) viewer.classList.remove("active");
});

// =======================================================
// CUSTOM CURSOR
// =======================================================

const cursor = document.querySelector(".cursor");

window.addEventListener("mousemove", e => {
  if (!cursor) return;
  cursor.style.left = e.clientX + "px";
  cursor.style.top = e.clientY + "px";
});

// =======================================================
// CURVED LOOP TEXT ANIMATION
// =======================================================

(() => {
  // Configuration
  const config = {
    marqueeText: "VITALRP ✦ PHOTOGRAPHY ✦ VIDEOGRAPHY ✦ LOS SANTOS ✦",
    // speed is in px/second (time-based to keep identical motion on 60/144/240Hz)
    speed: 90,
    // flatter curve reduces aliasing artifacts for SVG text-on-path
    curveAmount: 220,
    direction: 'left',
    interactive: true
  };

  const jacket = document.querySelector(".curved-loop-jacket");
  const measureText = document.getElementById("measureText");
  const textPath = document.getElementById("curveTextPath");
  const path = document.getElementById("curvePath");

  if (!jacket || !measureText || !textPath || !path) return;

  // Process text - ensure trailing space
  const processText = (text) => {
    const hasTrailing = /\s|\u00A0$/.test(text);
    return (hasTrailing ? text.replace(/\s+$/, '') : text) + '\u00A0';
  };

  const text = processText(config.marqueeText);
  let spacing = 0;
  let offset = 0;
  let ready = false;
  let animationFrame = null;

  // Drag interaction state
  let dragRef = { current: false };
  let lastXRef = { current: 0 };
  let velRef = { current: 0 };
  let dirRef = { current: config.direction };

  // Update path curve
  const updatePath = () => {
    // Use a centered control point for more stable rasterization.
    path.setAttribute('d', `M-100,40 Q720,${40 + config.curveAmount} 1540,40`);
  };
  updatePath();

  // Measure text length
  const measureTextLength = () => {
    measureText.textContent = text;
    measureText.setAttribute('font-weight', 'bold');
    measureText.setAttribute('font-size', '6rem');
    measureText.setAttribute('xml:space', 'preserve');
    
    const length = measureText.getComputedTextLength();
    if (length > 0) {
      spacing = length;
      ready = true;
      return true;
    }
    return false;
  };

  // Initialize text content
  const initText = () => {
    if (!spacing) return;
    
    const totalText = Array(Math.ceil(1800 / spacing) + 2)
      .fill(text)
      .join('');
    
    textPath.textContent = totalText;
    const initial = -spacing;
    textPath.setAttribute('startOffset', initial + 'px');
    offset = initial;
    
    jacket.style.visibility = 'visible';
    
    // Trigger fade-up animation
    setTimeout(() => {
      jacket.style.transition = 'opacity 0.9s ease, transform 0.9s ease';
      jacket.style.opacity = '1';
      jacket.style.transform = 'translateY(0)';
    }, 600); // Start after hero animation begins
  };

  // Animation loop
  let lastT = performance.now();
  const quantize = (v) => Math.round(v); // avoid sub-pixel shimmer on high-Hz panels

  const animate = (t = performance.now()) => {
    if (!ready || !textPath) return;

    const dt = Math.min(48, Math.max(0, t - lastT));
    lastT = t;

    if (!dragRef.current) {
      const deltaPx = (config.speed * dt) / 1000;
      const delta = dirRef.current === 'right' ? deltaPx : -deltaPx;
      let newOffset = offset + delta;

      const wrapPoint = spacing;
      if (newOffset <= -wrapPoint) newOffset += wrapPoint;
      if (newOffset > 0) newOffset -= wrapPoint;

      newOffset = quantize(newOffset);
      textPath.setAttribute('startOffset', newOffset + 'px');
      offset = newOffset;
    }

    animationFrame = requestAnimationFrame(animate);
  };

  // Drag handlers
  const onPointerDown = (e) => {
    if (!config.interactive) return;
    dragRef.current = true;
    lastXRef.current = e.clientX;
    velRef.current = 0;
    jacket.style.cursor = 'grabbing';
    if (e.target.setPointerCapture) {
      e.target.setPointerCapture(e.pointerId);
    }
  };

  const onPointerMove = (e) => {
    if (!config.interactive || !dragRef.current || !textPath) return;
    
    const dx = e.clientX - lastXRef.current;
    lastXRef.current = e.clientX;
    velRef.current = dx;

    let newOffset = offset + dx;
    const wrapPoint = spacing;

    if (newOffset <= -wrapPoint) newOffset += wrapPoint;
    if (newOffset > 0) newOffset -= wrapPoint;

    newOffset = quantize(newOffset);
    textPath.setAttribute('startOffset', newOffset + 'px');
    offset = newOffset;
  };

  const endDrag = () => {
    if (!config.interactive) return;
    dragRef.current = false;
    dirRef.current = velRef.current > 0 ? 'right' : 'left';
    jacket.style.cursor = dragRef.current ? 'grabbing' : 'grab';
  };

  // Setup
  const setup = () => {
    if (measureTextLength()) {
      initText();
      animate();
    } else {
      requestAnimationFrame(setup);
    }
  };

  // Event listeners
  if (config.interactive) {
    jacket.style.cursor = 'grab';
    jacket.addEventListener('pointerdown', onPointerDown);
    jacket.addEventListener('pointermove', onPointerMove);
    jacket.addEventListener('pointerup', endDrag);
    jacket.addEventListener('pointerleave', endDrag);
  }

  // Initialize
  jacket.style.visibility = 'hidden';
  jacket.style.opacity = '0';
  jacket.style.transform = 'translateY(80px)';
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();

// =======================================================
// SCROLL ANIMATIONS
// =======================================================

(() => {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('scroll-visible');
        // Unobserve after animation to improve performance
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all elements that should animate
  const animateElements = document.querySelectorAll('.frame, .team-card, .team-title, .about-title, .about-description, .work-title');
  animateElements.forEach(el => {
    observer.observe(el);
  });
})();