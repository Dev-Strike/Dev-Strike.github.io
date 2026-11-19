(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  const siteSlug = $('siteSlug');
  const slugDisplay = $('slugDisplay');
  const deployStatus = $('deployStatus');
  const liveUrlLink = $('liveUrlLink');
  const btnOpenTab = $('btnOpenTab');
  const btnCopyUrl = $('btnCopyUrl');
  const browserBar = $('browserBar');
  const buildBadge = $('buildBadge');
  const buildSummary = $('buildSummary');

  const codeEditor = $('codeEditor');
  const activeFileInfo = $('activeFileInfo');
  const charCount = $('charCount');
  const fileUpload = $('fileUpload');
  const dropZone = $('dropZone');
  const liveFrame = $('liveFrame');

  const btnSample = $('btnSample');
  const btnDeployNow = $('btnDeployNow');
  const btnRunPreview = $('btnRunPreview');
  const btnClearTab = $('btnClearTab');
  const btnDownloadAll = $('btnDownloadAll');

  let activeTab = 'html';
  let currentBlobUrl = null;

  const files = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Strike-Dev Live Page</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="box">
    <h1>Live Site: <span id="pathLabel">/strike-dev</span></h1>
    <p>This website is rendered directly from your HTML, CSS, and JavaScript code.</p>
    <button id="actionBtn">Click Me</button>
  </main>
  <script src="script.js"></script>
</body>
</html>`,
    css: `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #0b1020;
  color: #f8fafc;
  min-height: 100vh;
  display: grid;
  place-items: center;
}
.box {
  text-align: center;
  padding: 36px 28px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
span {
  color: #38bdf8;
}
button {
  margin-top: 16px;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  background: #6366f1;
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}`,
    js: `document.getElementById('actionBtn')?.addEventListener('click', () => {
  alert('Live deployment is active!');
});`
  };

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function cleanSlug(val) {
    const cleaned = val.trim().replace(/[^a-zA-Z0-9-_]/g, '');
    return cleaned || 'strike-dev';
  }

  function updateSlugUI() {
    const slug = cleanSlug(siteSlug.value);
    slugDisplay.textContent = `/${slug}`;
    browserBar.textContent = `https://dev-strike.site/${slug}`;
  }

  function switchTab(lang) {
    files[activeTab] = codeEditor.value;
    activeTab = lang;

    document.querySelectorAll('.file-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const map = { html: 'index.html', css: 'style.css', js: 'script.js' };
    activeFileInfo.textContent = `Editing: ${map[lang]}`;
    codeEditor.value = files[lang];
    updateCharCount();
  }

  function updateCharCount() {
    charCount.textContent = `${codeEditor.value.length} chars`;
  }

  function buildBundleHTML() {
    files[activeTab] = codeEditor.value;
    const slug = cleanSlug(siteSlug.value);
    let html = files.html || '';

    const cssTag = `<style>\n${files.css}\n</style>`;
    const jsTag = `<script>\n${files.js}\n<\/script>`;

    if (/<link[^>]+href=["']style\.css["'][^>]*>/i.test(html)) {
      html = html.replace(/<link[^>]+href=["']style\.css["'][^>]*>/i, cssTag);
    } else if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `${cssTag}\n</head>`);
    } else {
      html = `${cssTag}\n${html}`;
    }

    if (/<script[^>]+src=["']script\.js["'][^>]*>\s*<\/script>/i.test(html)) {
      html = html.replace(/<script[^>]+src=["']script\.js["'][^>]*>\s*<\/script>/i, jsTag);
    } else if (/<\/body>/i.test(html)) {
      html = html.replace(/<\/body>/i, `${jsTag}\n</body>`);
    } else {
      html = `${html}\n${jsTag}`;
    }

    html = html.replace(/\/strike-dev/g, `/${slug}`);
    return html;
  }

  function renderPreview() {
    liveFrame.srcdoc = buildBundleHTML();
  }

  function deployLive() {
    const slug = cleanSlug(siteSlug.value);
    const bundled = buildBundleHTML();
    liveFrame.srcdoc = bundled;

    if (currentBlobUrl) {
      URL.revokeObjectURL(currentBlobUrl);
    }

    const blob = new Blob([bundled], { type: 'text/html;charset=utf-8' });
    currentBlobUrl = URL.createObjectURL(blob);

    liveUrlLink.href = currentBlobUrl;
    liveUrlLink.textContent = `${currentBlobUrl} (/${slug})`;
    btnOpenTab.disabled = false;
    btnCopyUrl.disabled = false;

    deployStatus.textContent = 'Deployed Live';
    deployStatus.classList.add('live');
    buildBadge.textContent = 'LIVE DEPLOYED';
    buildBadge.classList.add('published');
    buildSummary.innerHTML = `Deployed at custom path <strong>/${slug}</strong>. Click <strong>Open Tab</strong> to view full screen.`;

    toast(`Deployed live at /${slug}`);
  }

  function downloadFile(filename, content, mime) {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function handleUpload(fileList) {
    Array.from(fileList).forEach(file => {
      const ext = file.name.split('.').pop().toLowerCase();
      const reader = new FileReader();
      reader.onload = e => {
        const text = e.target.result;
        if (ext === 'html' || ext === 'htm') {
          files.html = text;
          switchTab('html');
        } else if (ext === 'css') {
          files.css = text;
          switchTab('css');
        } else if (ext === 'js') {
          files.js = text;
          switchTab('js');
        }
        renderPreview();
        toast(`Uploaded ${file.name}`);
      };
      reader.readAsText(file);
    });
  }

  siteSlug.addEventListener('input', updateSlugUI);

  btnOpenTab.addEventListener('click', () => {
    if (currentBlobUrl) {
      window.open(currentBlobUrl, '_blank', 'noopener,noreferrer');
    }
  });

  btnCopyUrl.addEventListener('click', () => {
    if (currentBlobUrl) {
      navigator.clipboard?.writeText(currentBlobUrl);
      toast('Live deployment URL copied');
    }
  });

  document.querySelectorAll('.file-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.lang));
  });

  let timer;
  codeEditor.addEventListener('input', () => {
    files[activeTab] = codeEditor.value;
    updateCharCount();
    clearTimeout(timer);
    timer = setTimeout(renderPreview, 400);
  });

  fileUpload.addEventListener('change', e => {
    if (e.target.files.length) {
      handleUpload(e.target.files);
      e.target.value = '';
    }
  });

  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) {
      handleUpload(e.dataTransfer.files);
    }
  });

  btnRunPreview.addEventListener('click', () => {
    renderPreview();
    toast('Preview refreshed');
  });

  btnClearTab.addEventListener('click', () => {
    codeEditor.value = '';
    files[activeTab] = '';
    updateCharCount();
    renderPreview();
  });

  btnDeployNow.addEventListener('click', deployLive);

  btnDownloadAll.addEventListener('click', () => {
    files[activeTab] = codeEditor.value;
    downloadFile('index.html', files.html, 'text/html;charset=utf-8');
    setTimeout(() => downloadFile('style.css', files.css, 'text/css;charset=utf-8'), 200);
    setTimeout(() => downloadFile('script.js', files.js, 'application/javascript;charset=utf-8'), 400);
    toast('Downloaded index.html, style.css, and script.js');
  });

  btnSample.addEventListener('click', () => {
    const slug = cleanSlug(siteSlug.value);
    files.html = files.html.replace(/\/[a-zA-Z0-9-_]+(?=<\/span>)/, `/${slug}`);
    codeEditor.value = files[activeTab];
    updateCharCount();
    renderPreview();
    toast('Sample loaded');
  });

  codeEditor.value = files.html;
  updateCharCount();
  updateSlugUI();
  renderPreview();
})();
