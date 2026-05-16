'use strict';

/* ═══════════════════════════════════════════════
   PORTFOLIO DATA — update this with your real info
═══════════════════════════════════════════════ */
const DATA = {
  name:     'Bhagaban Ghadai',
  role:     'Software Developer II',
  location: 'India',
  status:   'Open to opportunities',
  email:    'bhagabanghadai043@gmail.com',
  linkedin: 'linkedin.com/in/bhagaban-ghadai',
  github:   'github.com/BhagabanGhadai',
  x:        'x.com/bhagaban_ghadai',
  website:  'bhagaban.in',

  about: [
    `I'm <span class="c-bold c-text">Bhagaban Ghadai</span>, a passionate Software Engineer`,
    `who loves building robust, scalable systems and crafting delightful`,
    `user experiences. I thrive at the intersection of clean code,`,
    `thoughtful architecture, and great product design.`,
    ``,
    `I specialize in Backend Architecture, Microservices & Database Optimization. I enjoy tackling`,
    `complex engineering problems and turning ideas into production-grade`,
    `software. I'm always learning, building, and shipping.`,
    ``,
    `When I'm not coding, you'll find me exploring new technologies,`,
    `contributing to open source, or sharpening problem-solving skills.`,
  ],

  experience: [
    {
      title:   'Software Developer II',
      company: 'Housivity Platform Pvt. Ltd.',
      period:  'Apr 2025 — Present',
      duties: [
        'Microservices & Messaging: Engineered async messaging using RabbitMQ, delay exchanges, and dead-letter queues.',
        'Infrastructure & Monitoring: Managed microservices on K8s; configured Prometheus/Alertmanager.',
        'System Reliability: Diagnosed and resolved complex production issues and race conditions.',
        'Built and maintained scalable backend services handling high-traffic workloads.',
        'Designed and implemented CI/CD pipelines reducing deployment time by 80%.',
        'Mentored junior developers and led architecture discussions.',
      ],
      stack: ['Node.js', 'Bun', 'NestJS', 'MongoDB', 'RabbitMQ', 'Redis', 'OpenSearch', 'Docker', 'Kubernetes', 'DigitalOcean', 'AWS', 'Lambda', 'CloudFront', 'CloudWatch'],
    },
    {
      title:   'Backend Developer',
      company: 'Iraitech Innovation & Technology Pvt. Ltd.',
      period:  'Dec 2022 — Nov 2024',
      duties: [
        'Scalable API Design: Built high-performance RESTful APIs using Python (Django/FastAPI) and Node.js.',
        'Database Optimization: Designed flexible MongoDB schemas for heavy read operations.',
        'Performance Tuning: Identified bottlenecks and optimized database queries for faster response.',
      ],
      stack: ['Python', 'FastAPI', 'Django', 'Node.js', 'MongoDB', 'Redis', 'AWS', 'Docker', 'Git', 'Jenkins', 'Postgres', 'RabbitMQ'],
    },
  ],

  projects: [
    {
      name:   'Seat Reservation Platform',
      desc:   'A scalable platform for real-time seat reservation across venues. Implemented live availability and booking confirmations.',
      stack:  ['Node.js', 'Redis', 'Websocket'],
      github: null,
      live:   null,
    },
    {
      name:   'ECommerce',
      desc:   'Microservices platform featuring catalog management, shopping cart, and secure payments with third-party shipping integrations.',
      stack:  ['Node.js', 'Microservices', 'REST'],
      github: null,
      live:   null,
    },
    {
      name:   'Social Media',
      desc:   'Social app with profiles, posts, comments, and real-time messaging using websockets. Integrated robust content moderation.',
      stack:  ['Node.js', 'Websocket', 'MongoDB'],
      github: null,
      live:   null,
    },
  ],

  skills: {
    'Languages':   ['JavaScript', 'TypeScript', 'Python', 'Golang'],
    'Technologies':['Node.js', 'Express', 'FastAPI', 'GraphQL', 'REST', 'Websocket'],
    'Databases':   ['MongoDB', 'Postgres', 'MySQL', 'Redis'],
    'Messaging':   ['RabbitMQ', 'Kafka', 'Celery'],
    'DevOps':      ['Docker', 'AWS', 'CI/CD', 'Jenkins', 'ELK Stack', 'Git'],
  },
};

/* ═══════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════ */
const sleep  = ms => new Promise(r => setTimeout(r, ms));

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* Pad/truncate a string to exactly `n` chars */
function pad(s, n, ch = ' ') {
  s = String(s);
  while (s.length < n) s += ch;
  return s.slice(0, n);
}

/* Repeat a char n times */
const rep = (ch, n) => ch.repeat(Math.max(0, n));

/* ═══════════════════════════════════════════════
   TERMINAL CLASS
═══════════════════════════════════════════════ */
class Terminal {
  constructor({ outputEl, inputRow, inputEl, promptEl }) {
    this.output   = outputEl;
    this.inputRow = inputRow;
    this.input    = inputEl;
    this.promptEl = promptEl;

    this.history      = [];
    this.histIdx      = -1;
    this.currentDraft = '';
    this.locked       = true;
    this.commands     = {};

    this._setupEvents();
    this._setPrompt();
  }

  /* ── Public API ── */

  print(html, pre = false) {
    const el = document.createElement('span');
    el.className = 'line' + (pre ? ' pre' : '');
    el.innerHTML = html;
    this.output.appendChild(el);
    this.output.appendChild(document.createTextNode('\n'));
    this._scroll();
  }

  blank() { this.print('', false); }

  printLines(lines, pre = false) {
    for (const l of lines) this.print(l, pre);
  }

  clear() {
    this.output.innerHTML = '';
  }

  lock()   { this.locked = true;  this.input.disabled = true; }
  unlock() { this.locked = false; this.input.disabled = false; this.input.focus(); }

  focus() { this.input.focus(); }

  register(name, fn) { this.commands[name.toLowerCase()] = fn; }

  async execute(raw) {
    if (this.locked) return;
    const input = raw.trim();
    if (!input) return;

    this._addHistory(input);

    /* Echo typed command */
    const parts  = input.split(/\s+/);
    const cmd    = parts[0].toLowerCase();
    const args   = parts.slice(1);

    this.print(this._promptHTML() + `<span class="c-text">${esc(input)}</span>`);

    /* Check special compound commands */
    const fullLower = input.toLowerCase();
    if (fullLower === 'sudo hire-me' || fullLower === 'sudo hire me') {
      const r = await this._dispatch('sudo hire-me', []);
      if (r) this.printLines(r);
      this.blank();
      this._scroll();
      return;
    }

    const r = await this._dispatch(cmd, args);
    if (r != null) {
      if (Array.isArray(r)) this.printLines(r);
      else this.print(r);
    }

    this.blank();
    this._scroll();
  }

  /* ── Private ── */

  async _dispatch(cmd, args) {
    if (this.commands[cmd]) return await this.commands[cmd](this, args);
    return [
      `<span class="c-red">command not found:</span> <span class="c-text">${esc(cmd)}</span>`,
      `<span class="c-dim">Type 'help' to see available commands.</span>`,
    ];
  }

  _addHistory(cmd) {
    if (this.history[this.history.length - 1] !== cmd) this.history.push(cmd);
    this.histIdx = this.history.length;
    this.currentDraft = '';
  }

  _scroll() {
    requestAnimationFrame(() => {
      const body = this.output.closest('.term-body');
      if (body) body.scrollTop = body.scrollHeight;
    });
  }

  _setPrompt() {
    this.promptEl.innerHTML = this._promptHTML() + ' ';
  }

  _promptHTML() {
    return `<span class="p-user">visitor</span><span class="p-at">@</span><span class="p-host">bhagaban</span><span class="p-sep">:</span><span class="p-path">~</span><span class="p-sym">$</span>`;
  }

  _setupEvents() {
    this.input.addEventListener('keydown', e => this._onKey(e));

    /* Click anywhere in the terminal body → focus input */
    document.getElementById('termBody').addEventListener('click', () => {
      if (!this.locked) this.input.focus();
    });
  }

  _onKey(e) {
    if (this.locked) return;

    if (e.key === 'Enter') {
      e.preventDefault();
      const val = this.input.value;
      this.input.value = '';
      this.execute(val);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (this.histIdx === this.history.length) this.currentDraft = this.input.value;
      if (this.histIdx > 0) {
        this.histIdx--;
        this.input.value = this.history[this.histIdx];
        this._moveCaretEnd();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (this.histIdx < this.history.length - 1) {
        this.histIdx++;
        this.input.value = this.history[this.histIdx];
      } else {
        this.histIdx = this.history.length;
        this.input.value = this.currentDraft;
      }
      this._moveCaretEnd();
      return;
    }

    if (e.key === 'Tab') {
      e.preventDefault();
      this._tabComplete();
      return;
    }

    if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      this.clear();
      return;
    }

    if (e.ctrlKey && e.key === 'c') {
      e.preventDefault();
      this.print(this._promptHTML() + `<span class="c-text">${esc(this.input.value)}</span><span class="c-dim">^C</span>`);
      this.input.value = '';
      this.blank();
      return;
    }

    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      this.input.value = '';
      return;
    }
  }

  _tabComplete() {
    const val  = this.input.value.toLowerCase().trim();
    if (!val) return;
    const keys = Object.keys(this.commands);
    const matches = keys.filter(k => k.startsWith(val));
    if (matches.length === 1) {
      this.input.value = matches[0];
    } else if (matches.length > 1) {
      this.print(this._promptHTML() + `<span class="c-text">${esc(this.input.value)}</span>`);
      this.print(matches.map(m => `<span class="c-sky">${m}</span>`).join('    '));
      this.blank();
    }
    this._moveCaretEnd();
  }

  _moveCaretEnd() {
    const len = this.input.value.length;
    this.input.setSelectionRange(len, len);
  }
}

/* ═══════════════════════════════════════════════
   ASCII BANNER
═══════════════════════════════════════════════ */
const BANNER_ART = [
  `  <span class="c-purple"> ██████╗  ██████╗ </span>`,
  `  <span class="c-purple"> ██╔══██╗██╔════╝ </span>    <span class="c-bold c-text">${DATA.name}</span>`,
  `  <span class="c-purple"> ██████╔╝██║  ███╗</span>    <span class="c-sub">${DATA.role}</span>`,
  `  <span class="c-purple"> ██╔══██╗██║   ██║</span>    <span class="c-dim">─────────────────────────────</span>`,
  `  <span class="c-purple"> ██████╔╝╚██████╔╝</span>    <span class="c-dim">Type</span> <span class="c-sky">help</span> <span class="c-dim">to begin.</span>`,
  `  <span class="c-purple"> ╚═════╝  ╚═════╝ </span>    <span class="c-dim">↑↓ history · Tab autocomplete</span>`,
];

/* ═══════════════════════════════════════════════
   BOOT SEQUENCE
═══════════════════════════════════════════════ */
async function runBoot(term) {
  term.lock();

  const bootLines = [
    `<span class="c-dim">[  0.000]</span> <span class="c-green">BG/OS Portfolio System v2.0.0</span>`,
    `<span class="c-dim">[  0.012]</span> <span class="c-sub">Checking CPU</span><span class="c-dim"> ......................... </span><span class="c-green">OK</span>`,
    `<span class="c-dim">[  0.031]</span> <span class="c-sub">Loading experience module</span><span class="c-dim"> ......... </span><span class="c-green">OK</span>`,
    `<span class="c-dim">[  0.049]</span> <span class="c-sub">Loading projects module</span><span class="c-dim"> ........... </span><span class="c-green">OK</span>`,
    `<span class="c-dim">[  0.067]</span> <span class="c-sub">Loading skills module</span><span class="c-dim"> ............. </span><span class="c-green">OK</span>`,
    `<span class="c-dim">[  0.089]</span> <span class="c-sub">Loading contact module</span><span class="c-dim"> ............ </span><span class="c-green">OK</span>`,
    `<span class="c-dim">[  0.104]</span> <span class="c-sub">Mounting interface</span><span class="c-dim"> ................ </span><span class="c-green">OK</span>`,
    `<span class="c-dim">[  0.121]</span> <span class="c-sub">Starting session</span><span class="c-dim"> .................. </span><span class="c-green">OK</span>`,
    ``,
    `<span class="c-dim">[  0.135]</span> <span class="c-yellow">All systems operational.</span>`,
  ];

  for (let i = 0; i < bootLines.length; i++) {
    await sleep(i === 0 ? 200 : 60 + Math.random() * 40);
    term.print(bootLines[i]);
  }

  await sleep(600);
  term.clear();

  for (const l of BANNER_ART) term.print(l, true);
  term.blank();

  term.unlock();
}

/* ═══════════════════════════════════════════════
   MATRIX EFFECT
═══════════════════════════════════════════════ */
class MatrixEffect {
  constructor(canvas) {
    this.canvas  = canvas;
    this.ctx     = canvas.getContext('2d');
    this.animId  = null;
    this.chars   = 'アイウエオカキクケコサシスセソタチツテトナニヌネノABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*<>{}[]';
    this.columns = [];
    this.onStop  = null;
  }

  start(onStop) {
    this.onStop = onStop;
    this.canvas.classList.add('visible');
    this.canvas.width  = window.innerWidth;
    this.canvas.height = window.innerHeight;

    const size = 14;
    const cols = Math.floor(this.canvas.width / size);
    this.columns = Array.from({ length: cols }, () => Math.random() * -50);
    this.size    = size;

    this._frame();

    const dismiss = () => {
      this.stop();
      this.canvas.removeEventListener('click',   dismiss);
      document.removeEventListener('keydown',    dismiss);
    };
    this.canvas.addEventListener('click',  dismiss);
    document.addEventListener('keydown',   dismiss, { once: true });
  }

  _frame() {
    const { ctx, canvas, size } = this;
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font      = `${size}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = '#00ff41';

    for (let i = 0; i < this.columns.length; i++) {
      const char = this.chars[Math.floor(Math.random() * this.chars.length)];
      const x = i * size;
      const y = this.columns[i] * size;

      /* Bright leading character */
      ctx.fillStyle = '#ccffcc';
      ctx.fillText(char, x, y);
      ctx.fillStyle = '#00ff41';

      if (y > canvas.height && Math.random() > 0.975) this.columns[i] = 0;
      this.columns[i] += 1;
    }

    this.animId = requestAnimationFrame(() => this._frame());
  }

  stop() {
    if (this.animId) { cancelAnimationFrame(this.animId); this.animId = null; }
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.canvas.classList.remove('visible');
    if (this.onStop) this.onStop();
  }
}

/* ═══════════════════════════════════════════════
   COMMAND DEFINITIONS
═══════════════════════════════════════════════ */
function registerCommands(term, matrixEffect) {

  /* ── help ── */
  term.register('help', () => [
    `<span class="c-dim">┌─────────────────────────────────────────────────────────┐</span>`,
    `<span class="c-dim">│</span>  <span class="c-bold c-text">Available Commands</span>                                     <span class="c-dim">│</span>`,
    `<span class="c-dim">└─────────────────────────────────────────────────────────┘</span>`,
    ``,
    `<span class="c-purple c-bold">PORTFOLIO</span>`,
    `<span class="c-dim">──────────────────────────────────────────────────────────</span>`,
    `  <span class="c-sky">whoami</span>       <span class="c-dim">·</span>  Quick intro`,
    `  <span class="c-sky">about</span>        <span class="c-dim">·</span>  About me in detail`,
    `  <span class="c-sky">experience</span>   <span class="c-dim">·</span>  Work history & timeline`,
    `  <span class="c-sky">projects</span>     <span class="c-dim">·</span>  Things I've built`,
    `  <span class="c-sky">skills</span>       <span class="c-dim">·</span>  Technologies I use`,
    `  <span class="c-sky">contact</span>      <span class="c-dim">·</span>  Get in touch`,
    `  <span class="c-sky">social</span>       <span class="c-dim">·</span>  Social links`,
    ``,
    `<span class="c-purple c-bold">UTILITY</span>`,
    `<span class="c-dim">──────────────────────────────────────────────────────────</span>`,
    `  <span class="c-sky">ls</span>           <span class="c-dim">·</span>  List all sections`,
    `  <span class="c-sky">clear</span>        <span class="c-dim">·</span>  Clear terminal  <span class="c-dim">[also Ctrl+L]</span>`,
    `  <span class="c-sky">history</span>      <span class="c-dim">·</span>  Show command history`,
    `  <span class="c-sky">date</span>         <span class="c-dim">·</span>  Current date & time`,
    `  <span class="c-sky">neofetch</span>     <span class="c-dim">·</span>  System info card`,
    `  <span class="c-sky">banner</span>       <span class="c-dim">·</span>  Show ASCII banner`,
    `  <span class="c-sky">open &lt;n&gt;</span>     <span class="c-dim">·</span>  Open project by number`,
    `  <span class="c-sky">theme &lt;name&gt;</span> <span class="c-dim">·</span>  Switch theme  <span class="c-dim">[default · matrix · dracula · nord]</span>`,
    `  <span class="c-sky">echo &lt;text&gt;</span>  <span class="c-dim">·</span>  Print text`,
    `  <span class="c-sky">pwd</span>          <span class="c-dim">·</span>  Print working directory`,
    ``,
    `<span class="c-purple c-bold">FUN</span>`,
    `<span class="c-dim">──────────────────────────────────────────────────────────</span>`,
    `  <span class="c-sky">matrix</span>             <span class="c-dim">·</span>  ???`,
    `  <span class="c-sky">sudo hire-me</span>       <span class="c-dim">·</span>  The most important command`,
    `  <span class="c-sky">rm -rf /</span>           <span class="c-dim">·</span>  Try it...`,
    ``,
    `<span class="c-dim">Tip: ↑↓ arrows for history · Tab to autocomplete · Ctrl+L to clear</span>`,
  ]);

  /* ── whoami ── */
  term.register('whoami', () => [
    `  <span class="c-bold c-text">${DATA.name}</span>`,
    `  <span class="c-dim">─────────────────────────────────────────</span>`,
    `  <span class="c-dim">Role     </span> <span class="c-sub">${DATA.role}</span>`,
    `  <span class="c-dim">Location </span> <span class="c-sub">${DATA.location}</span>`,
    `  <span class="c-dim">Status   </span> <span class="c-green">${DATA.status} ✓</span>`,
    `  <span class="c-dim">Email    </span> <span class="c-sky">${DATA.email}</span>`,
    `  <span class="c-dim">X        </span> <span class="c-sky">${DATA.x}</span>`,
    `  <span class="c-dim">LinkedIn </span> <span class="c-sky">${DATA.linkedin}</span>`,
  ]);

  /* ── about ── */
  term.register('about', () => {
    const lines = [
      `<span class="c-dim">╔══════════════════════════════════════════════════════════╗</span>`,
      `<span class="c-dim">║</span>  <span class="c-bold c-text">${pad('ABOUT — ' + DATA.name, 56)}</span><span class="c-dim">║</span>`,
      `<span class="c-dim">╚══════════════════════════════════════════════════════════╝</span>`,
      ``,
    ];
    for (const l of DATA.about) lines.push(`  ` + l);
    return lines;
  });

  /* ── experience ── */
  term.register('experience', () => {
    const lines = [
      `<span class="c-dim">┌─────────────────────────────────────────────────────────┐</span>`,
      `<span class="c-dim">│</span>  <span class="c-bold c-purple">WORK EXPERIENCE</span>                                        <span class="c-dim">│</span>`,
      `<span class="c-dim">└─────────────────────────────────────────────────────────┘</span>`,
    ];

    DATA.experience.forEach((job, i) => {
      lines.push(``);
      if (i > 0) lines.push(`  <span class="c-dimmer">──────────────────────────────────────────────────────</span>`);
      if (i > 0) lines.push(``);

      lines.push(`  <span class="c-bold c-text">${esc(job.title)}</span>  <span class="c-dim">@</span>  <span class="c-peach">${esc(job.company)}</span>  <span class="c-dim">·  ${esc(job.period)}</span>`);
      lines.push(`  <span class="c-dimmer">${rep('─', 54)}</span>`);
      lines.push(``);

      for (const duty of job.duties) {
        lines.push(`    <span class="c-dim">▸</span>  <span class="c-sub">${esc(duty)}</span>`);
      }

      lines.push(``);
      const tags = job.stack.map(s => `<span class="c-dimmer">[</span><span class="c-sky">${esc(s)}</span><span class="c-dimmer">]</span>`).join('  ');
      lines.push(`    <span class="c-dim">Stack  →  </span>${tags}`);
    });

    return lines;
  });

  /* ── projects ── */
  term.register('projects', () => {
    const lines = [
      `<span class="c-dim">┌─────────────────────────────────────────────────────────┐</span>`,
      `<span class="c-dim">│</span>  <span class="c-bold c-purple">PROJECTS</span>  <span class="c-dim">─  type</span> <span class="c-sky">open &lt;n&gt;</span> <span class="c-dim">to visit</span>                    <span class="c-dim">│</span>`,
      `<span class="c-dim">└─────────────────────────────────────────────────────────┘</span>`,
    ];

    DATA.projects.forEach((proj, i) => {
      lines.push(``);
      lines.push(`  <span class="c-dim">┌──────────────────────────────────────────────────────┐</span>`);

      const numTag  = `<span class="c-dimmer">[</span><span class="c-yellow">${i + 1}</span><span class="c-dimmer">]</span>`;
      const ghTag   = proj.github ? `  <span class="c-dim">↗ GitHub</span>` : '';
      const liveTag = proj.live   ? `  <span class="c-green">↗ Live</span>`  : '';
      lines.push(`  <span class="c-dim">│</span>  ${numTag}  <span class="c-bold c-text">${esc(proj.name)}</span>${ghTag}${liveTag}`);
      lines.push(`  <span class="c-dim">├──────────────────────────────────────────────────────┤</span>`);

      /* Wrap description manually at ~52 chars */
      const words = proj.desc.split(' ');
      let cur = '';
      const descLines = [];
      for (const w of words) {
        if ((cur + ' ' + w).trim().length > 52) { descLines.push(cur.trim()); cur = w; }
        else cur = (cur + ' ' + w).trim();
      }
      if (cur) descLines.push(cur);

      for (const dl of descLines) {
        lines.push(`  <span class="c-dim">│</span>  <span class="c-sub">${esc(dl)}</span>`);
      }

      const stackStr = proj.stack.map(s => `<span class="c-sky">${esc(s)}</span>`).join(' <span class="c-dimmer">·</span> ');
      lines.push(`  <span class="c-dim">│</span>  <span class="c-dim">Stack →</span> ${stackStr}`);
      lines.push(`  <span class="c-dim">└──────────────────────────────────────────────────────┘</span>`);
    });

    return lines;
  });

  /* ── skills ── */
  term.register('skills', () => {
    const lines = [
      `<span class="c-dim">╔═══════════════════╦══════════════════════════════════════╗</span>`,
      `<span class="c-dim">║</span> <span class="c-bold c-purple">CATEGORY          </span><span class="c-dim">║</span> <span class="c-bold c-purple">TECHNOLOGIES                         </span><span class="c-dim">║</span>`,
      `<span class="c-dim">╠═══════════════════╬══════════════════════════════════════╣</span>`,
    ];

    const cats = Object.entries(DATA.skills);
    cats.forEach(([cat, items], i) => {
      const catCell  = pad(cat, 17);
      const techStr  = items.join('  ');
      const techCells = items.map(t => `<span class="c-sky">${esc(t)}</span>`).join('  ');
      lines.push(`<span class="c-dim">║</span> <span class="c-text">${esc(catCell)}</span> <span class="c-dim">║</span> ${techCells}`);
      if (i < cats.length - 1) {
        lines.push(`<span class="c-dim">╠═══════════════════╬══════════════════════════════════════╣</span>`);
      }
    });

    lines.push(`<span class="c-dim">╚═══════════════════╩══════════════════════════════════════╝</span>`);
    return lines;
  });

  /* ── contact ── */
  term.register('contact', () => {
    const render = (html, visibleLen) => {
      const padLen = Math.max(0, 56 - visibleLen);
      return `<span class="c-dim">│</span>${html}${rep(' ', padLen)}<span class="c-dim">│</span>`;
    };

    return [
      `<span class="c-dim">╭────────────────────────────────────────────────────────╮</span>`,
      render(`  <span class="c-bold c-text">Let's work together!</span>`, 22),
      render(``, 0),
      render(`  <span class="c-dim">📧  Email</span>`, 11),
      render(`     <span class="c-sky">${DATA.email}</span>`, 5 + DATA.email.length),
      render(``, 0),
      render(`  <span class="c-dim">📱  X</span>`, 7),
      render(`     <span class="c-sky">${DATA.x}</span>`, 5 + String(DATA.x).length),
      render(``, 0),
      render(`  <span class="c-dim">💼  LinkedIn</span>`, 14),
      render(`     <span class="c-sky">${DATA.linkedin}</span>`, 5 + DATA.linkedin.length),
      render(``, 0),
      render(`  <span class="c-dim">🐙  GitHub</span>`, 12),
      render(`     <span class="c-sky">${DATA.github}</span>`, 5 + DATA.github.length),
      render(``, 0),
      render(`  <span class="c-green">Status: ${DATA.status} ✓</span>`, 10 + DATA.status.length),
      `<span class="c-dim">╰────────────────────────────────────────────────────────╯</span>`,
    ];
  });

  /* ── social ── */
  term.register('social', () => [
    `  <span class="c-bold c-text">Social Links</span>`,
    `  <span class="c-dim">────────────────────────────────────────</span>`,
    `  <span class="c-dim">🔵 LinkedIn </span> <span class="c-sky">https://${DATA.linkedin}</span>`,
    `  <span class="c-dim">🐙 GitHub   </span> <span class="c-sky">https://${DATA.github}</span>`,
    `  <span class="c-dim">📧 Email    </span> <span class="c-sky">mailto:${DATA.email}</span>`,
    `  <span class="c-dim">📱 X    </span> <span class="c-sky">${DATA.x}</span>`,
  ]);

  /* ── neofetch ── */
  term.register('neofetch', () => {
    const swatches = ['#f38ba8','#a6e3a1','#f9e2af','#89b4fa','#cba6f7','#89dceb','#cdd6f4','#585b70']
      .map(c => `<span class="swatch" style="background:${c}"></span>`).join('');

    return [
      ``,
      `  <span class="c-purple"> ██████╗  ██████╗ </span>   <span class="c-bold c-text">visitor</span><span class="c-dim">@</span><span class="c-bold c-purple">bhagaban-portfolio</span>`,
      `  <span class="c-purple"> ██╔══██╗██╔════╝ </span>   <span class="c-dimmer">─────────────────────────────────</span>`,
      `  <span class="c-purple"> ██████╔╝██║  ███╗</span>   <span class="c-dim">OS       </span><span class="c-sub">BG/OS Portfolio v2.0.0</span>`,
      `  <span class="c-purple"> ██╔══██╗██║   ██║</span>   <span class="c-dim">Host     </span><span class="c-sub">${DATA.website}</span>`,
      `  <span class="c-purple"> ██████╔╝╚██████╔╝</span>   <span class="c-dim">Uptime   </span><span class="c-sub">3+ years of coding</span>`,
      `  <span class="c-purple"> ╚═════╝  ╚═════╝ </span>   <span class="c-dim">Shell    </span><span class="c-sub">terminal.js v2.0.0</span>`,
      `                        <span class="c-dim">Role     </span><span class="c-sub">${DATA.role}</span>`,
      `                        <span class="c-dim">Location </span><span class="c-sub">${DATA.location}</span>`,
      `                        <span class="c-dim">Status   </span><span class="c-green">${DATA.status} ✓</span>`,
      `                        <span class="c-dim">Theme    </span><span class="c-sub">Catppuccin Mocha</span>`,
      ``,
      `                        ${swatches}`,
      ``,
    ];
  });

  /* ── banner ── */
  term.register('banner', () => {
    const lines = [...BANNER_ART];
    lines.push('');
    return lines;
  });

  /* ── ls ── */
  term.register('ls', () => {
    const items = [
      { name: 'about.txt',      color: 'c-green' },
      { name: 'experience.log', color: 'c-green' },
      { name: 'projects/',      color: 'c-blue' },
      { name: 'skills.json',    color: 'c-green' },
      { name: 'contact.txt',    color: 'c-green' },
      { name: 'resume.pdf',     color: 'c-peach' },
    ];
    return [
      `<span class="c-dim">total ${items.length}</span>`,
      items.map(f => `<span class="${f.color}">${f.name}</span>`).join('    '),
      ``,
      `<span class="c-dim">Run a command like 'about', 'projects', 'skills' to read a file.</span>`,
    ];
  });

  /* ── cat ── */
  term.register('cat', (t, args) => {
    const rawArg = (args[0] || '').toLowerCase();
    if (rawArg === 'resume.pdf' || rawArg === 'resume') {
      return [
        `<span class="c-red">cat: resume.pdf: cannot display binary file</span>`,
        `<span class="c-dim">Hint: Use</span> <span class="c-sky">open resume.pdf</span> <span class="c-dim">to open it in a viewer.</span>`,
      ];
    }
    
    const file = rawArg.replace(/\..*$/, '');
    const map = { about: 'about', experience: 'experience', skills: 'skills', contact: 'contact', projects: 'projects' };
    if (map[file]) return t.commands[map[file]](t, []);
    return [
      `<span class="c-red">cat: ${esc(args[0] || '')}: No such file</span>`,
      `<span class="c-dim">Available: about.txt  experience.log  skills.json  contact.txt  resume.pdf</span>`,
    ];
  });

  /* ── date ── */
  term.register('date', () => {
    const now = new Date();
    const days  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const months= ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const fmt = `${days[now.getDay()]} ${months[now.getMonth()]} ${String(now.getDate()).padStart(2,'0')} `
              + `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')} `
              + `${now.getFullYear()}`;
    return [`  <span class="c-text">${fmt}</span>`];
  });

  /* ── history ── */
  term.register('history', (t) => {
    if (!t.history.length) return [`<span class="c-dim">No history yet.</span>`];
    return t.history.map((cmd, i) =>
      `  <span class="c-dimmer">${String(i + 1).padStart(3)}  </span><span class="c-text">${esc(cmd)}</span>`
    );
  });

  /* ── clear ── */
  term.register('clear', (t) => { t.clear(); return null; });

  /* ── pwd ── */
  term.register('pwd', () => [`  <span class="c-blue">/home/visitor/bhagaban-portfolio</span>`]);

  /* ── echo ── */
  term.register('echo', (t, args) => [`  ${esc(args.join(' '))}`]);

  /* ── open ── */
  term.register('open', (t, args) => {
    const arg = (args[0] || '').toLowerCase();
    
    if (arg === 'resume.pdf' || arg === 'resume') {
      window.open('resume.pdf', '_blank', 'noopener,noreferrer');
      return [
        `<span class="c-green">Opening</span> <span class="c-text">resume.pdf</span> <span class="c-dim">in a new tab...</span>`,
      ];
    }

    const n = parseInt(arg, 10);
    if (isNaN(n) || n < 1 || n > DATA.projects.length) {
      return [
        `<span class="c-red">open: invalid target or project number</span>`,
        `<span class="c-dim">Usage: open &lt;n&gt; (1–${DATA.projects.length}) OR open resume.pdf</span>`,
        `<span class="c-dim">Run 'projects' to see the list.</span>`,
      ];
    }
    const proj = DATA.projects[n - 1];
    const url  = proj.live || proj.github;
    if (!url) return [`<span class="c-yellow">No live URL for "${esc(proj.name)}"</span>`];

    window.open(url, '_blank', 'noopener,noreferrer');
    return [
      `<span class="c-green">Opening</span> <span class="c-text">${esc(proj.name)}</span> <span class="c-dim">→ ${esc(url)}</span>`,
    ];
  });

  /* ── theme ── */
  term.register('theme', (t, args) => {
    const valid = ['default', 'matrix', 'dracula', 'nord'];
    const name  = (args[0] || '').toLowerCase();
    if (!valid.includes(name)) {
      return [
        `<span class="c-red">theme: unknown theme '${esc(name)}'</span>`,
        `<span class="c-dim">Available: ${valid.join(' · ')}</span>`,
      ];
    }
    document.documentElement.setAttribute('data-theme', name);
    return [`<span class="c-green">Theme switched to</span> <span class="c-text">${esc(name)}</span>`];
  });

  /* ── matrix ── */
  term.register('matrix', async (t) => {
    t.print(`<span class="c-green">Wake up, Neo...</span>`);
    t.print(`<span class="c-dim">Click or press any key to exit.</span>`);
    await sleep(600);

    await new Promise(resolve => {
      matrixEffect.start(() => {
        t.blank();
        t.print(`<span class="c-green">There is no spoon.</span>`);
        resolve();
      });
    });
    return null;
  });

  /* ── sudo ── */
  term.register('sudo', (t, args) => {
    const sub = args.join(' ').toLowerCase();
    if (sub === 'hire-me' || sub === 'hire me') {
      return term.commands['sudo hire-me'](t, []);
    }
    return [
      `<span class="c-red">sudo: permission denied: ${esc(args.join(' '))}</span>`,
      `<span class="c-dim">Hint: try</span> <span class="c-sky">sudo hire-me</span>`,
    ];
  });

  /* ── sudo hire-me ── */
  term.register('sudo hire-me', () => [
    ``,
    `<span class="c-green c-bold">  ✦ ACCESS GRANTED ✦</span>`,
    ``,
    `<span class="c-dim">  Initiating hire sequence...</span>`,
    ``,
    `  <span class="c-text">Congratulations! You've found the most important command.</span>`,
    ``,
    `  <span class="c-sub">I'm actively looking for great opportunities where I can</span>`,
    `  <span class="c-sub">build impactful products with a team that cares about craft.</span>`,
    ``,
    `  <span class="c-dim">Reach out at:</span> <span class="c-sky">${DATA.email}</span>`,
    ``,
    `<span class="c-dim">  [ Press Enter to complete the transaction ]</span>`,
    ``,
  ]);

  /* ── rm ── */
  term.register('rm', (t, args) => {
    if (args.includes('-rf') && (args.includes('/') || args.includes('*'))) {
      return [
        `<span class="c-red">rm: cannot remove '/':</span> <span class="c-sub">You can't delete a portfolio this good.</span>`,
        ``,
        `<span class="c-dim">Nice try though 😄</span>`,
      ];
    }
    return [`<span class="c-red">rm: permission denied</span>`];
  });

  /* ── ping ── */
  term.register('ping', (t, args) => {
    const host = args[0] || 'localhost';
    return [
      `<span class="c-dim">PING ${esc(host)}: 56 data bytes</span>`,
      `<span class="c-green">64 bytes from ${esc(host)}: icmp_seq=0 ttl=64 time=0.042 ms</span>`,
      `<span class="c-green">64 bytes from ${esc(host)}: icmp_seq=1 ttl=64 time=0.038 ms</span>`,
      `<span class="c-green">64 bytes from ${esc(host)}: icmp_seq=2 ttl=64 time=0.041 ms</span>`,
      `<span class="c-dim">--- ${esc(host)} ping statistics ---</span>`,
      `<span class="c-dim">3 packets transmitted, 3 received, 0% packet loss</span>`,
    ];
  });

  /* ── curl ── */
  term.register('curl', (t, args) => {
    const sub = (args[0] || '').toLowerCase();
    if (sub === 'resume' || sub === 'resume.pdf') {
      return [
        `<span class="c-yellow">curl: resume not yet uploaded.</span>`,
        `<span class="c-dim">In the meantime, reach out via email:</span> <span class="c-sky">${DATA.email}</span>`,
      ];
    }
    return [`<span class="c-red">curl: could not resolve host: ${esc(args[0] || '')}</span>`];
  });

  /* ── man ── */
  term.register('man', (t, args) => {
    const cmd = (args[0] || '').toLowerCase();
    const docs = {
      help:       'help — list all available commands',
      whoami:     'whoami — display a quick intro',
      about:      'about — display detailed biography',
      experience: 'experience — show work history and timeline',
      projects:   'projects — list all projects (use open <n> to visit)',
      skills:     'skills — display skills table by category',
      contact:    'contact — show contact information',
      neofetch:   'neofetch — display system info in neofetch style',
      theme:      'theme <name> — switch color theme [default|matrix|dracula|nord]',
      open:       'open <n> — open project number n in browser',
      matrix:     'matrix — display the matrix rain effect',
    };
    if (docs[cmd]) {
      return [`  <span class="c-bold c-text">NAME</span>`, `      ${docs[cmd]}`, ``];
    }
    return [
      `<span class="c-red">man: no manual entry for ${esc(args[0] || '(nothing)')}</span>`,
    ];
  });

  /* ── uname ── */
  term.register('uname', (t, args) => {
    if (args.includes('-a') || args.includes('-all')) {
      return [`  <span class="c-sub">BG/OS portfolio 2.0.0 terminal.js x86_64 Portfolio/v2</span>`];
    }
    return [`  <span class="c-sub">BG/OS</span>`];
  });

  /* ── uptime ── */
  term.register('uptime', () => {
    const now   = new Date();
    const hours = String(now.getHours()).padStart(2,'0');
    const mins  = String(now.getMinutes()).padStart(2,'0');
    return [`  <span class="c-text">${hours}:${mins}</span>  <span class="c-dim">up 3+ years, 1 user, load average: 0.42, 0.38, 0.41</span>`];
  });

  /* ── exit / quit ── */
  term.register('exit', () => [
    `<span class="c-yellow">You can't leave — the portfolio won't let you go.</span>`,
    `<span class="c-dim">Try 'contact' instead.</span>`,
  ]);
  term.register('quit', (t, a) => t.commands.exit(t, a));

  /* ── Unknown compound shortcuts ── */
  term.register('git', (t, args) => {
    const sub = args[0];
    if (sub === 'clone') return [`<span class="c-dim">Cloning into '${esc(args[1] || 'portfolio')}'...</span>`, `<span class="c-green">Done. Now type 'projects' to explore!</span>`];
    return [`<span class="c-red">fatal: not a git repository (or any parent up to root)</span>`];
  });

  term.register('vim',  () => [`<span class="c-yellow">vim: exiting (type ':q!' in real vim)</span>`]);
  term.register('nano', () => [`<span class="c-yellow">nano: no file to edit. Try 'cat about.txt' instead.</span>`]);
  term.register('ls -la', (t) => t.commands.ls(t, []));
}

/* ═══════════════════════════════════════════════
   WINDOW DRAG & RESIZE
═══════════════════════════════════════════════ */
function initWindowControls(term) {
  const win      = document.getElementById('termWindow');
  const titlebar = document.getElementById('titlebar');
  const tlClose  = document.getElementById('tlClose');
  const tlMin    = document.getElementById('tlMin');
  const tlMax    = document.getElementById('tlMax');

  /* Drag */
  let dragging = false;
  let ox = 0, oy = 0;

  titlebar.addEventListener('mousedown', e => {
    if (e.target.closest('.traffic-lights')) return;
    dragging = true;
    const rect = win.getBoundingClientRect();
    ox = e.clientX - rect.left;
    oy = e.clientY - rect.top;
    win.style.transition = 'none';
  });

  document.addEventListener('mousemove', e => {
    if (!dragging) return;
    const x = Math.max(0, Math.min(e.clientX - ox, window.innerWidth  - win.offsetWidth));
    const y = Math.max(28, Math.min(e.clientY - oy, window.innerHeight - win.offsetHeight - 80));
    win.style.left      = x + 'px';
    win.style.top       = y + 'px';
    win.style.transform = 'none';
  });

  document.addEventListener('mouseup', () => {
    dragging = false;
    win.style.transition = '';
  });

  /* Maximize / Restore */
  let maximized = false;
  let saved = {};
  tlMax.addEventListener('click', () => {
    if (!maximized) {
      const r = win.getBoundingClientRect();
      saved = { left: r.left + 'px', top: r.top + 'px', width: r.width + 'px', height: r.height + 'px', transform: win.style.transform };
      win.style.left      = '0';
      win.style.top       = '28px';
      win.style.width     = '100vw';
      win.style.height    = `calc(100vh - 28px - 80px)`;
      win.style.transform = 'none';
      win.style.borderRadius = '0';
      maximized = true;
    } else {
      Object.assign(win.style, saved);
      win.style.borderRadius = '';
      maximized = false;
    }
    setTimeout(() => term.focus(), 50);
  });

  /* Minimize → wiggle */
  tlMin.addEventListener('click', () => {
    win.style.transition = 'transform 0.3s';
    win.style.transform  = (win.style.transform === 'none' ? '' : win.style.transform) + ' scale(0.97)';
    setTimeout(() => { win.style.transform = ''; win.style.transition = ''; }, 300);
  });

  /* Close → fun message */
  tlClose.addEventListener('click', () => {
    term.blank();
    term.print(`<span class="c-red">close(): </span><span class="c-sub">Nice try! A portfolio can't be closed, only explored.</span>`);
    term.blank();
    term.focus();
  });

  /* Keyboard shortcut: Cmd/Ctrl+M → maximize */
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
      e.preventDefault();
      tlMax.click();
    }
  });
}

/* ═══════════════════════════════════════════════
   DOCK
═══════════════════════════════════════════════ */
function initDock(term) {
  document.querySelectorAll('.dock-item[data-cmd]').forEach(item => {
    item.addEventListener('click', () => {
      const cmd = item.dataset.cmd;
      if (!cmd) return;
      term.focus();
      term.execute(cmd);
      document.querySelectorAll('.dock-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

/* ═══════════════════════════════════════════════
   MENUBAR CLOCK
═══════════════════════════════════════════════ */
function initClock() {
  const el = document.getElementById('menuTime');
  function tick() {
    const now = new Date();
    const h   = String(now.getHours()).padStart(2, '0');
    const m   = String(now.getMinutes()).padStart(2, '0');
    el.textContent = `${h}:${m}`;
  }
  tick();
  setInterval(tick, 10000);
}

/* ═══════════════════════════════════════════════
   INIT
═══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const term = new Terminal({
    outputEl: document.getElementById('output'),
    inputRow: document.getElementById('inputRow'),
    inputEl:  document.getElementById('cmdInput'),
    promptEl: document.getElementById('promptEl'),
  });

  const matrixEffect = new MatrixEffect(document.getElementById('matrixCanvas'));

  registerCommands(term, matrixEffect);
  initWindowControls(term);
  initDock(term);
  initClock();

  /* Auto-focus terminal on desktop click */
  document.getElementById('desktop').addEventListener('click', e => {
    if (!e.target.closest('.dock') && !e.target.closest('.menubar')) {
      term.focus();
    }
  });

  /* Resize: update window max height */
  window.addEventListener('resize', () => {
    const win = document.getElementById('termWindow');
    if (!win.classList.contains('maximized')) {
      win.style.maxHeight = `calc(100vh - 140px)`;
    }
  });

  /* Boot! */
  runBoot(term);
});
