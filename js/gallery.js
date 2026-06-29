/* ===== Product image gallery: clickable thumbs + arrow nav + lightbox + video modal ===== */
(function () {
  function initGallery() {
    var gallery = document.querySelector('.product-hero__gallery');
    if (!gallery) return;

    var mainImg = gallery.querySelector('.product-hero__main-img img');
    var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('.product-hero__thumb'));
    if (!mainImg || !thumbs.length) return;

    var current = 0;

    function show(i) {
      current = (i + thumbs.length) % thumbs.length;
      var img = thumbs[current].querySelector('img');
      mainImg.src = img.src;
      mainImg.alt = img.alt;
      thumbs.forEach(function (t) { t.classList.remove('active'); });
      thumbs[current].classList.add('active');
    }

    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener('click', function () { show(i); });
    });

    var prev = gallery.querySelector('.gallery-arrow--prev');
    var next = gallery.querySelector('.gallery-arrow--next');
    if (prev) prev.addEventListener('click', function () { show(current - 1); });
    if (next) next.addEventListener('click', function () { show(current + 1); });

    // Keyboard arrows when gallery is focused/hovered
    document.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') show(current - 1);
      if (e.key === 'ArrowRight') show(current + 1);
    });

    // Lightbox: click the main image to view full size
    var lightbox = document.querySelector('.lightbox');
    if (lightbox) {
      var lightboxImg = lightbox.querySelector('img');
      mainImg.style.cursor = 'zoom-in';
      mainImg.addEventListener('click', function () {
        lightboxImg.src = mainImg.src;
        lightboxImg.alt = mainImg.alt;
        lightbox.classList.add('is-open');
      });
      lightbox.addEventListener('click', function () { lightbox.classList.remove('is-open'); });
    }

    show(0);
  }

  function initVideoModal() {
    var modal = document.querySelector('.video-modal');
    if (!modal) return;
    var video = modal.querySelector('video');
    var triggers = document.querySelectorAll('[data-video-trigger]');

    function open() {
      modal.classList.add('is-open');
      if (video) { try { video.currentTime = 0; video.play(); } catch (e) {} }
    }
    function close() {
      modal.classList.remove('is-open');
      if (video) video.pause();
    }

    triggers.forEach(function (t) { t.addEventListener('click', open); });
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.classList.contains('video-modal__close')) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { initGallery(); initVideoModal(); });
  } else {
    initGallery();
    initVideoModal();
  }
})();
