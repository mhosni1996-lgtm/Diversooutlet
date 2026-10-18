/* Diverso theme — vanilla JS, no dependencies */
(function () {
  'use strict';

  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var overlay = $('[data-overlay]');

  /* ---------- Overlay / drawers ---------- */

  var openPanel = null;

  function openDrawer(el) {
    if (!el) return;
    if (openPanel && openPanel !== el) closeDrawer(openPanel);
    el.classList.add('is-open');
    el.setAttribute('aria-hidden', 'false');
    overlay && overlay.classList.add('is-visible');
    document.body.classList.add('is-locked');
    openPanel = el;
  }

  function closeDrawer(el) {
    el = el || openPanel;
    if (!el) return;
    el.classList.remove('is-open');
    el.setAttribute('aria-hidden', 'true');
    overlay && overlay.classList.remove('is-visible');
    document.body.classList.remove('is-locked');
    if (openPanel === el) openPanel = null;
  }

  overlay && overlay.addEventListener('click', function () { closeDrawer(); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    closeDrawer();
    $$('.modal.is-open').forEach(function (m) { m.classList.remove('is-open'); });
    var bar = $('[data-search-bar]');
    bar && bar.classList.remove('is-open');
  });

  /* ---------- Intro ---------- */

  var intro = $('[data-intro]');
  function ready() { root.classList.add('is-ready'); }
  if (intro) {
    var shown = false;
    try { shown = sessionStorage.getItem('introShown') === '1'; } catch (e) {}
    if (shown || reduceMotion) {
      intro.remove();
      ready();
    } else {
      try { sessionStorage.setItem('introShown', '1'); } catch (e) {}
      setTimeout(function () {
        intro.classList.add('is-done');
        setTimeout(ready, 350);
        setTimeout(function () { intro.remove(); }, 1500);
      }, 1300);
    }
  } else {
    requestAnimationFrame(ready);
  }

  /* ---------- Header ---------- */

  var header = $('[data-header]');
  if (header) {
    var lastY = window.scrollY;
    var onScroll = function () {
      var y = window.scrollY;
      header.classList.toggle('is-scrolled', y > 40);
      var hide = y > lastY && y > 400 && !openPanel && !$('[data-search-bar].is-open');
      header.classList.toggle('is-hidden', hide);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  $$('[data-menu-open]').forEach(function (b) {
    b.addEventListener('click', function () { openDrawer($('[data-menu-drawer]')); });
  });
  $$('[data-menu-close]').forEach(function (b) {
    b.addEventListener('click', function () { closeDrawer($('[data-menu-drawer]')); });
  });

  var searchBar = $('[data-search-bar]');
  $$('[data-search-open]').forEach(function (b) {
    b.addEventListener('click', function (e) {
      if (!searchBar) return;
      e.preventDefault();
      searchBar.classList.add('is-open');
      header && header.classList.add('is-open');
      setTimeout(function () { $('input[type="search"]', searchBar).focus(); }, 50);
    });
  });
  $$('[data-search-close]').forEach(function (b) {
    b.addEventListener('click', function () {
      searchBar.classList.remove('is-open');
      header && header.classList.remove('is-open');
    });
  });

  /* ---------- Hero ---------- */

  $$('[data-split-chars]').forEach(function (el) {
    var text = el.textContent.trim();
    // Arabic script must not be split into letters (it would break the joining forms)
    if (/[؀-ۿ]/.test(text)) return;
    el.setAttribute('aria-label', text);
    // keep Latin letters in reading order on RTL pages
    el.setAttribute('dir', 'ltr');
    el.innerHTML = '';
    Array.prototype.forEach.call(text, function (ch, i) {
      var s = document.createElement('span');
      s.className = 'char';
      s.setAttribute('aria-hidden', 'true');
      s.style.setProperty('--i', i);
      s.textContent = ch === ' ' ? ' ' : ch;
      el.appendChild(s);
    });
  });

  $$('[data-video-toggle]').forEach(function (btn) {
    var video = $('video', btn.closest('[data-hero]'));
    if (!video) return;
    btn.addEventListener('click', function () {
      if (video.paused) { video.play(); btn.classList.remove('is-paused'); }
      else { video.pause(); btn.classList.add('is-paused'); }
    });
  });

  /* ---------- Parallax ---------- */

  var parallaxEls = reduceMotion ? [] : $$('[data-parallax], [data-parallax-img] img');
  if (parallaxEls.length) {
    var ticking = false;
    var updateParallax = function () {
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var box = (el.closest('[data-parallax-img]') || el).getBoundingClientRect();
        if (box.bottom < 0 || box.top > vh) return;
        if (el.hasAttribute('data-parallax')) {
          el.style.transform = 'translate3d(0,' + (window.scrollY * 0.3) + 'px,0) scale(1.05)';
        } else {
          var progress = (box.top + box.height / 2 - vh / 2) / vh;
          el.style.transform = 'translate3d(0,' + (progress * -6) + '%,0)';
        }
      });
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(updateParallax); ticking = true; }
    }, { passive: true });
    updateParallax();
  }

  /* ---------- Reveal on scroll ---------- */

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }) : null;

  function observe(ctx) {
    $$('.reveal, [data-collage], [data-float-cards]', ctx).forEach(function (el) {
      if (io) io.observe(el); else el.classList.add('is-in');
    });
  }
  observe(document);

  /* ---------- Product spotlight ---------- */

  $$('[data-spotlight]').forEach(function (wrap) {
    var slides = $$('[data-slide]', wrap);
    var dots = $$('[data-dot]', wrap);
    if (slides.length < 2) return;
    var interval = parseInt(wrap.dataset.interval, 10) || 5000;
    wrap.style.setProperty('--interval', interval + 'ms');
    var current = 0;
    var timer;

    function go(i) {
      slides[current].classList.remove('is-active');
      dots[current] && dots[current].classList.remove('is-active');
      current = (i + slides.length) % slides.length;
      slides[current].classList.add('is-active');
      if (dots[current]) {
        // restart the progress bar animation
        dots[current].classList.remove('is-active');
        void dots[current].offsetWidth;
        dots[current].classList.add('is-active');
      }
    }
    function play() { clearInterval(timer); if (!reduceMotion) timer = setInterval(function () { go(current + 1); }, interval); }

    dots.forEach(function (d) {
      d.addEventListener('click', function () { go(parseInt(d.dataset.dot, 10)); play(); });
    });
    wrap.addEventListener('mouseenter', function () { clearInterval(timer); });
    wrap.addEventListener('mouseleave', play);
    play();
  });

  /* ---------- Floating 3D cards ---------- */

  $$('[data-float-cards]').forEach(function (section) {
    if (reduceMotion || window.matchMedia('(hover: none)').matches) return;
    var cards = $$('.glass-card', section);
    var raf;
    section.addEventListener('mousemove', function (e) {
      var r = section.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        cards.forEach(function (card) {
          var depth = parseFloat(card.dataset.depth) || 1;
          card.style.setProperty('--mx', (x * 30 * depth) + 'px');
          card.style.setProperty('--my', (y * 24 * depth) + 'px');
          card.style.setProperty('--ry', (x * 14) + 'deg');
          card.style.setProperty('--rx', (y * -10) + 'deg');
        });
      });
    });
    section.addEventListener('mouseleave', function () {
      cards.forEach(function (card) {
        ['--mx', '--my', '--ry', '--rx'].forEach(function (p) { card.style.removeProperty(p); });
      });
    });
  });

  /* ---------- Cart ---------- */

  var cartSectionId = 'cart-drawer';

  function getDrawer() { return $('[data-cart-drawer]'); }

  function updateCount(count) {
    $$('[data-cart-count]').forEach(function (el) {
      el.textContent = count;
      el.classList.toggle('is-empty', count === 0);
    });
  }

  function renderDrawer(html, open) {
    var wrapper = document.getElementById('shopify-section-' + cartSectionId);
    if (!wrapper || !html) return;
    var doc = new DOMParser().parseFromString(html, 'text/html');
    var fresh = doc.querySelector('[data-cart-drawer]');
    if (!fresh) return;
    var wasOpen = open || (getDrawer() && getDrawer().classList.contains('is-open'));
    wrapper.innerHTML = '';
    wrapper.appendChild(fresh);
    if (openPanel && !document.body.contains(openPanel)) openPanel = null;
    if (wasOpen) openDrawer(fresh);
    updateCount(parseInt(fresh.dataset.count, 10) || 0);
  }

  function useDrawer() {
    return window.theme.settings.cartType === 'drawer' && getDrawer() && !$('[data-cart-page]');
  }

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-cart-open]');
    if (opener && useDrawer()) {
      e.preventDefault();
      openDrawer(getDrawer());
      return;
    }
    if (e.target.closest('[data-cart-close]')) {
      closeDrawer(getDrawer());
      return;
    }
    var change = e.target.closest('[data-qty-change]');
    if (change) {
      e.preventDefault();
      var item = change.closest('[data-line]');
      var line = parseInt(item.dataset.line, 10);
      var qty = Math.max(0, parseInt(change.dataset.qtyChange, 10));
      var drawer = getDrawer();
      drawer && drawer.classList.add('is-loading');
      fetch(window.theme.routes.cartChange + '.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ line: line, quantity: qty, sections: [cartSectionId] })
      })
        .then(function (r) { return r.json(); })
        .then(function (cart) {
          if ($('[data-cart-page]')) { window.location.reload(); return; }
          renderDrawer(cart.sections && cart.sections[cartSectionId]);
        })
        .catch(function () { drawer && drawer.classList.remove('is-loading'); });
    }
  });

  /* ---------- Product form ---------- */

  $$('[data-product]').forEach(function (section) {
    var form = $('[data-product-form]', section);
    var jsonEl = $('[data-product-json]', section);
    if (!form || !jsonEl) return;
    var product = JSON.parse(jsonEl.textContent);
    var idInput = $('[data-variant-id]', form);
    var addBtn = $('[data-add-to-cart]', form);
    var addLabel = addBtn && $('[data-add-label]', addBtn);
    var errorEl = $('[data-form-error]', form);
    var waLink = $('[data-wa-link]', form);
    var priceWrap = $('[data-price-wrap] [data-price]', form);

    function money(cents) {
      var format = window.theme.moneyFormat || '{{amount}}';
      var fmt = function (n, d, ts, ds) {
        var parts = (n / 100).toFixed(d).split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ts);
        return parts.join(ds);
      };
      return format.replace(/\{\{\s*(\w+)\s*\}\}/, function (_, key) {
        switch (key) {
          case 'amount_no_decimals': return fmt(cents, 0, ',', '.');
          case 'amount_with_comma_separator': return fmt(cents, 2, '.', ',');
          case 'amount_no_decimals_with_comma_separator': return fmt(cents, 0, '.', ',');
          case 'amount_with_apostrophe_separator': return fmt(cents, 2, "'", '.');
          default: return fmt(cents, 2, ',', '.');
        }
      });
    }

    function selectedOptions() {
      return $$('.variant-picker__option', form).map(function (fs) {
        var checked = $('input:checked', fs);
        return checked ? checked.value : null;
      });
    }

    function update() {
      var opts = selectedOptions();
      if (!opts.length) return;
      var variant = product.variants.find(function (v) {
        return v.options.every(function (o, i) { return o === opts[i]; });
      });

      $$('.variant-picker__option', form).forEach(function (fs, i) {
        var label = $('[data-option-value]', fs);
        if (label) label.textContent = opts[i];
        // mark values that have no available variant given the other selections
        $$('.pill', fs).forEach(function (pill) {
          var value = $('input', pill).value;
          var available = product.variants.some(function (v) {
            return v.available && v.options[i] === value && v.options.every(function (o, j) { return j === i || o === opts[j]; });
          });
          pill.classList.toggle('is-unavailable', !available);
        });
      });

      if (!addBtn || !addLabel) return;
      if (!variant) {
        addBtn.disabled = true;
        addLabel.textContent = window.theme.strings.unavailable;
        return;
      }

      idInput.value = variant.id;
      addBtn.disabled = !variant.available;
      addLabel.textContent = variant.available ? window.theme.strings.addToCart : window.theme.strings.soldOut;

      if (priceWrap) {
        var html = '<span class="price__current">' + money(variant.price) + '</span>';
        if (variant.compare_at_price > variant.price) html += '<s class="price__compare">' + money(variant.compare_at_price) + '</s>';
        priceWrap.innerHTML = html;
        priceWrap.classList.toggle('price--sale', variant.compare_at_price > variant.price);
      }

      if (variant.featured_media) {
        var media = $('[data-media-id="' + variant.featured_media.id + '"]', section);
        if (media) {
          var gallery = media.parentElement;
          if (window.matchMedia('(max-width: 989px)').matches) {
            gallery.scrollTo({ left: media.offsetLeft - gallery.offsetLeft, behavior: 'smooth' });
          } else if (media !== gallery.firstElementChild) {
            var first = gallery.firstElementChild;
            first.classList.remove('is-first');
            media.classList.add('is-first');
            gallery.insertBefore(media, first);
          }
        }
      }

      if (waLink) {
        var base = waLink.dataset.waBase || '';
        var href = waLink.getAttribute('href').split('?')[0];
        waLink.setAttribute('href', href + '?text=' + encodeURIComponent(base + ' (' + variant.title + ')'));
      }

      if (window.history.replaceState) {
        var url = new URL(window.location.href);
        url.searchParams.set('variant', variant.id);
        window.history.replaceState({}, '', url.toString());
      }
    }

    form.addEventListener('change', function (e) {
      if (e.target.closest('.variant-picker__option')) update();
    });

    $$('[data-qty-step]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var input = $('input[name="quantity"]', form);
        input.value = Math.max(1, (parseInt(input.value, 10) || 1) + parseInt(b.dataset.qtyStep, 10));
      });
    });

    form.addEventListener('submit', function (e) {
      if (!useDrawer() || !addBtn || !addLabel) return;
      e.preventDefault();
      if (errorEl) errorEl.hidden = true;
      addBtn.disabled = true;
      var previous = addLabel.textContent;
      addLabel.textContent = window.theme.strings.adding;

      var data = new FormData(form);
      data.append('sections', cartSectionId);
      data.append('sections_url', window.location.pathname);

      fetch(window.theme.routes.cartAdd + '.js', {
        method: 'POST',
        headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
        body: data
      })
        .then(function (r) { return r.json().then(function (json) { return { ok: r.ok, json: json }; }); })
        .then(function (res) {
          if (!res.ok) throw new Error(res.json.description || res.json.message || window.theme.strings.error);
          renderDrawer(res.json.sections && res.json.sections[cartSectionId], true);
        })
        .catch(function (err) {
          if (errorEl) { errorEl.textContent = err.message; errorEl.hidden = false; }
        })
        .finally(function () {
          addBtn.disabled = false;
          addLabel.textContent = previous;
        });
    });

    // tap to zoom on desktop
    $$('.product__media', section).forEach(function (m) {
      if (!$('img', m)) return;
      m.addEventListener('click', function () {
        if (window.matchMedia('(max-width: 989px)').matches) return;
        m.classList.toggle('is-zoomed');
      });
      m.addEventListener('mousemove', function (e) {
        if (!m.classList.contains('is-zoomed')) return;
        var r = m.getBoundingClientRect();
        $('img', m).style.transformOrigin = ((e.clientX - r.left) / r.width * 100) + '% ' + ((e.clientY - r.top) / r.height * 100) + '%';
      });
      m.addEventListener('mouseleave', function () { m.classList.remove('is-zoomed'); });
    });

    update();
  });

  /* ---------- Modals ---------- */

  document.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-modal-open]');
    if (opener) {
      var modal = $('[data-modal="' + opener.dataset.modalOpen + '"]');
      modal && modal.classList.add('is-open');
      return;
    }
    var modalEl = e.target.closest('.modal');
    if (e.target.closest('[data-modal-close]') || (modalEl && e.target === modalEl)) {
      modalEl.classList.remove('is-open');
    }
  });

  /* ---------- Product recommendations ---------- */

  $$('[data-recommendations]').forEach(function (el) {
    var load = function () {
      fetch(el.dataset.url)
        .then(function (r) { return r.text(); })
        .then(function (html) {
          var doc = new DOMParser().parseFromString(html, 'text/html');
          var fresh = doc.querySelector('[data-recommendations]');
          if (fresh && fresh.innerHTML.trim()) {
            el.innerHTML = fresh.innerHTML;
            observe(el);
          }
        })
        .catch(function () {});
    };
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { obs.disconnect(); load(); }
      }, { rootMargin: '0px 0px 400px 0px' });
      obs.observe(el);
    } else {
      load();
    }
  });

  /* ---------- Collection filters ---------- */

  $$('[data-filter-form]').forEach(function (form) {
    var submit = function () {
      var params = new URLSearchParams(new FormData(form));
      // drop empty values (e.g. blank price inputs)
      Array.from(params.keys()).forEach(function (k) {
        if (params.getAll(k).every(function (v) { return v === ''; })) params.delete(k);
      });
      window.location.search = params.toString();
    };
    form.addEventListener('change', submit);
    form.addEventListener('submit', function (e) { e.preventDefault(); submit(); });
    // close other open filters when one opens
    $$('details', form).forEach(function (d) {
      d.addEventListener('toggle', function () {
        if (!d.open) return;
        $$('details[open]', form).forEach(function (o) { if (o !== d) o.open = false; });
      });
    });
  });

  document.addEventListener('click', function (e) {
    $$('[data-filter-form] details[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.open = false;
    });
  });

  /* ---------- Account ---------- */

  var recoverBox = $('[data-recover-box]');
  if (recoverBox) {
    var showRecover = function () { recoverBox.classList.add('is-visible'); };
    if (window.location.hash === '#recover' || $('.form-message--success', recoverBox) || $('.errors', recoverBox)) showRecover();
    $$('[data-toggle-recover]').forEach(function (a) {
      a.addEventListener('click', function (e) { e.preventDefault(); showRecover(); recoverBox.scrollIntoView({ behavior: 'smooth' }); });
    });
  }

  /* ---------- Custom cursor ---------- */

  if (window.theme.settings.customCursor && !reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cursor);
    var cx = 0, cy = 0, tx = 0, ty = 0;
    document.addEventListener('mousemove', function (e) { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * 0.2;
      cy += (ty - cy) * 0.2;
      cursor.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();
    document.addEventListener('mouseover', function (e) {
      cursor.classList.toggle('is-hover', !!e.target.closest('a, button, .card__media, .glass-card, label'));
    });
  }

  /* ---------- Theme editor ---------- */

  document.addEventListener('shopify:section:load', function (e) { observe(e.target); });
})();
