(() => {
  const FILE_KEYS = [
    {
      key: 'scEDI_PREC_VDD_AWRI_2x2',
      prefix: 'scEDI_PREC_VDD_AWRI_2x2_',
      cardId: 'card-2x2',
      imgId: 'img-2x2',
      metaId: 'meta-2x2',
    },
    {
      key: 'scEDI_contour_DEM',
      prefix: 'scEDI_contour_DEM_',
      cardId: 'card-contour',
      imgId: 'img-contour',
      metaId: 'meta-contour',
    },
    {
      key: 'Province_scEDI_map',
      prefix: 'Province_scEDI_map_',
      cardId: 'card-province',
      imgId: 'img-province',
      metaId: 'meta-province',
      optional: true,
    },
  ];

  const dateSelect = document.getElementById('dateSelect');
  const statusEl = document.getElementById('status');
  let catalog = { dates: [] };

  function setStatus(msg, isError) {
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.classList.toggle('error', !!isError);
  }

  function renderDateOptions(dates) {
    dateSelect.innerHTML = '';
    dates.forEach((entry, i) => {
      const opt = document.createElement('option');
      opt.value = entry.date;
      opt.textContent = entry.date;
      if (i === 0) opt.selected = true;
      dateSelect.appendChild(opt);
    });
  }

  function showImage(card, img, meta, src, filename) {
    card.classList.remove('hidden');
    const empty = card.querySelector('.gallery-empty');
    if (empty) empty.classList.add('hidden');
    img.classList.remove('hidden');
    img.src = src;
    img.alt = filename;
    if (meta) meta.textContent = filename;
  }

  function hideOptional(card, img, meta, message) {
    card.classList.add('hidden');
    img.removeAttribute('src');
    img.alt = '';
    if (meta) meta.textContent = message || 'Not available';
  }

  function showMissingRequired(card, img, meta, message) {
    card.classList.remove('hidden');
    img.classList.add('hidden');
    img.removeAttribute('src');
    let empty = card.querySelector('.gallery-empty');
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'gallery-empty';
      card.querySelector('.gallery-body').appendChild(empty);
    }
    empty.classList.remove('hidden');
    empty.textContent = message;
    if (meta) meta.textContent = 'missing';
  }

  function updateGalleries(date) {
    const entry = catalog.dates.find((d) => d.date === date);
    if (!entry) {
      setStatus('Selected date not found in index.', true);
      return;
    }
    const files = entry.files || {};
    FILE_KEYS.forEach(({ key, prefix, cardId, imgId, metaId, optional }) => {
      const card = document.getElementById(cardId);
      const img = document.getElementById(imgId);
      const meta = document.getElementById(metaId);
      const available = !!files[key];
      const filename = `${prefix}${date}.png`;
      const src = `data/${date}/${filename}`;
      if (available) {
        showImage(card, img, meta, src, filename);
      } else if (optional) {
        hideOptional(card, img, meta, 'Province map not available for this date');
      } else {
        showMissingRequired(card, img, meta, `Missing: ${filename}`);
      }
    });
    setStatus(`Showing ${date}`);
  }

  async function init() {
    try {
      const res = await fetch('data/index.json', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      catalog = await res.json();
      const dates = Array.isArray(catalog.dates) ? catalog.dates.slice() : [];
      if (!dates.length) {
        setStatus('No drought dates published yet.', true);
        return;
      }
      // Newest first (index.json should already be sorted)
      dates.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
      catalog.dates = dates;
      renderDateOptions(dates);
      updateGalleries(dates[0].date);
      dateSelect.addEventListener('change', () => updateGalleries(dateSelect.value));
    } catch (err) {
      console.error(err);
      setStatus('Failed to load drought/data/index.json.', true);
    }
  }

  init();
})();
