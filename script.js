(function () {
  'use strict';

  const $ = id => document.getElementById(id);

  const ghUser = $('ghUser');
  const ghRepo = $('ghRepo');
  const modeBadge = $('modeBadge');
  const targetUrlPreview = $('targetUrlPreview');
  const browserBarUrl = $('browserBarUrl');
  const repoNameHint = $('repoNameHint');
  const btnCopyUrl = $('btnCopyUrl');

  const codeEditor = $('codeEditor');
  const activeFileInfo = $('activeFileInfo');
  const charCount = $('charCount');
  const fileUpload = $('fileUpload');
  const dropZone = $('dropZone');
  const liveFrame = $('liveFrame');

  const btnSample = $('btnSample');
  const btnDeploy = $('btnDeploy');
  const btnRefreshPreview = $('btnRefreshPreview');
  const btnClearCode = $('btnClearCode');
  const btnDownloadSingle = $('btnDownloadSingle');
  const btnDownloadBundle = $('btnDownloadBundle');

  let activeTab = 'html';

  const files = {
    html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Dev-Strike Portfolio</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <div class="hero">
    <span class="tag">DEPLOYED ON GITHUB PAGES</span>
    <h1>Hello, I'm <span id="userDisplay">Dev-Strike</span> ⚡</h1>
    <p>Built with clean HTML, CSS, and JavaScript — ready for instant static hosting.</p>
    <button id="pingBtn">Test Interactive JS</button>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    css: `* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #0f172a, #1e1b4b);
  color: #f8fafc;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.hero {
  max-width: 560px;
  text-align: center;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  padding: 40px 32px;
  border-radius: 20px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
}
.tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 1px;
  padding: 5px 12px;
  border-radius: 999px;
  background: rgba(56, 189, 248, 0.18);
  color: #38bdf8;
  margin-bottom: 16px;
}
h1 {
  font-size: 32px;
  margin-bottom: 12px;
}
h1 span {
  color: #818cf8;
}
p {
  color: #cbd5e1;
  margin-bottom: 24px;
  line-height: 1.6;
}
button {
  background: #6366f1;
  color: #fff;
  border: none;
  padding: 12px 24px;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s, background 0.15s;
}
button:hover {
  background: #4f46e5;
  transform: translateY(-2px);
}`,
    js: `document.getElementById('pingBtn')?.addEventListener('click', () => {
  alert('🚀 Website is live and JavaScript works smoothly!');
});`
  };

  function toast(msg) {
    const el = $('toast');
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2400);
  }

  function sanitizeSlug(str) {
    return str.trim().replace(/[^a-zA-Z0-9-_]/g, '');
  }

  function updateDomainUI() {
    const user = sanitizeSlug(ghUser.value) || 'Dev-Strike';
    const repo = sanitizeSlug(ghRepo.value);
    const fullUrl = repo
      ? `https://${user}.github.io/${repo}`
      : `https://${user}.github.io`;

    targetUrlPreview.textContent = fullUrl;
    browserBarUrl.textContent = fullUrl;

    if (repo) {
      modeBadge.textContent = 'Project Site (/custom-path)';
      repoNameHint.textContent = `${user}/${repo}`;
    } else {
      modeBadge.textContent = 'Root Site (username.github.io)';
      repoNameHint.textContent = `${user}.github.io`;
    }
  }

  function switchTab(lang) {
    files[activeTab] = codeEditor.value;
    activeTab = lang;

    document.querySelectorAll('.file-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });

    const names = { html: 'index.html', css: 'style.css', js: 'script.js' };
    activeFileInfo.textContent = `Editing: ${names[lang]}`;
    codeEditor.value = files[lang];
    updateCharCount();
  }

  function updateCharCount() {
    charCount.textContent = `${codeEditor.value.length} chars`;
  }

  function buildCombinedHTML() {
    files[activeTab] = codeEditor.value;
    let html = files.html || '';
    const cssBlock = `<style>\n${files.css}\n</style>`;
    const jsBlock = `<script>\n${files.js}\n<\/script>`;

    if (/<link[^>]+href=["']style\.css["'][^>]*>/i.test(html)) {
      html = html.replace(/<link[^>]+href=["']style\.css["'][^>]*>/i, cssBlock);
    } else if (/<\/head>/i.test(html)) {
      html = html.replace(/<\/head>/i, `${cssBlock}\n</head>`);
    } else {
      html = `${cssBlock}\n${html}`;
    }

    if (/<script[^>]+src=["']script\.js["'][^>]*>\s*<\/script>/i.test(html)) {
      html = html.replace(/<script[^>]+src=["']script\.js["'][^>]*>\s*<\/script>/i, jsBlock);
    } else if (/<\/body>/i.test(html)) {
      html = html.replace(/<\/body>/i, `${jsBlock}\n</body>`);
    } else {
      html = `${html}\n${jsBlock}`;
    }

    return html;
  }

  function renderPreview() {
    liveFrame.srcdoc = buildCombinedHTML();
  }

  function downloadFile(filename, content, mime = 'text/plain;charset=utf-8') {
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

  function handleUploadedFiles(fileList) {
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
        toast(`Loaded ${file.name}`);
      };
      reader.readAsText(file);
    });
  }

  ghUser.addEventListener('input', updateDomainUI);
  ghRepo.addEventListener('input', updateDomainUI);

  btnCopyUrl.addEventListener('click', () => {
    navigator.clipboard?.writeText(targetUrlPreview.textContent);
    toast(`Copied: ${targetUrlPreview.textContent}`);
  });

  document.querySelectorAll('.file-tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.lang));
  });

  let previewTimer;
  codeEditor.addEventListener('input', () => {
    files[activeTab] = codeEditor.value;
    updateCharCount();
    clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPreview, 450);
  });

  fileUpload.addEventListener('change', e => {
    if (e.target.files.length) {
      handleUploadedFiles(e.target.files);
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
      handleUploadedFiles(e.dataTransfer.files);
    }
  });

  btnRefreshPreview.addEventListener('click', () => {
    renderPreview();
    toast('Live preview updated');
  });

  btnClearCode.addEventListener('click', () => {
    codeEditor.value = '';
    files[activeTab] = '';
    updateCharCount();
    renderPreview();
  });

  btnDeploy.addEventListener('click', () => {
    renderPreview();
    const repo = repoNameHint.textContent;
    toast(`Build ready for ${repo}! Download files below.`);
  });

  btnDownloadSingle.addEventListener('click', () => {
    downloadFile('index.html', buildCombinedHTML(), 'text/html;charset=utf-8');
    toast('Downloaded single bundled index.html');
  });

  btnDownloadBundle.addEventListener('click', () => {
    files[activeTab] = codeEditor.value;
    downloadFile('index.html', files.html, 'text/html;charset=utf-8');
    setTimeout(() => downloadFile('style.css', files.css, 'text/css;charset=utf-8'), 200);
    setTimeout(() => downloadFile('script.js', files.js, 'application/javascript;charset=utf-8'), 400);
    toast('Downloading index.html, style.css, and script.js...');
  });

  btnSample.addEventListener('click', () => {
    const user = sanitizeSlug(ghUser.value) || 'Dev-Strike';
    files.html = files.html.replace(/Dev-Strike/g, user);
    codeEditor.value = files[activeTab];
    updateCharCount();
    renderPreview();
    toast('Sample template synced with your username');
  });

  codeEditor.value = files.html;
  updateCharCount();
  updateDomainUI();
  renderPreview();
})();
