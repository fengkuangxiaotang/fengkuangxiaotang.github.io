gsap.registerPlugin(ScrollTrigger);

// Theme toggle
function toggleTheme() {
  var d = document.documentElement.getAttribute('data-theme') === 'dark';
  if (d) { document.documentElement.removeAttribute('data-theme'); localStorage.setItem('theme', 'light'); }
  else { document.documentElement.setAttribute('data-theme', 'dark'); localStorage.setItem('theme', 'dark'); }
  updateThemeIcon();
}
function updateThemeIcon() {
  var d = document.documentElement.getAttribute('data-theme') === 'dark';
  var i = document.getElementById('themeIcon'), l = document.getElementById('themeLabel');
  if (i) i.textContent = d ? '☀' : '☾';
  if (l) l.textContent = d ? 'Dark' : 'Light';
}
updateThemeIcon();

// Hero — text scramble effect (2 lines) + hover replay — desktop only
(function() {
  if (window.innerWidth <= 900) return;
  var el = document.getElementById('scramble-target');
  if (!el) return;
  var lines = el.querySelectorAll('.line');
  var origHTML = Array.from(lines).map(function(l) { return l.innerHTML; });
  var lineTexts = [
    '用 AI 与剪辑 创作影像',
    '让 每一帧 都打动人心'
  ];
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&<>?';
  var scrambleLens = [13, 11];
  var activeTimers = [];

  function runScramble() {
    activeTimers.forEach(function(t) { clearInterval(t); clearTimeout(t); });
    activeTimers = [];

    lines.forEach(function(span, i) {
      span.textContent = Array.from({length: scrambleLens[i]}, function() { return chars[Math.floor(Math.random() * chars.length)]; }).join('');
    });
    var preTimer = setInterval(function() {
      lines.forEach(function(span, i) {
        span.textContent = Array.from({length: scrambleLens[i]}, function() { return chars[Math.floor(Math.random() * chars.length)]; }).join('');
      });
    }, 40);
    activeTimers.push(preTimer);

    var t = setTimeout(function() {
      clearInterval(preTimer);
      lineTexts.forEach(function(text, li) {
        var span = lines[li];
        var len = text.length;
        var locked = new Array(len).fill(false);
        var display = new Array(len);
        for (var i = 0; i < len; i++) display[i] = chars[Math.floor(Math.random() * chars.length)];

        var lockIndex = 0;
        var scrambleTimer = setInterval(function() {
          for (var i = 0; i < len; i++) {
            if (!locked[i]) display[i] = chars[Math.floor(Math.random() * chars.length)];
          }
          span.textContent = display.join('');
        }, 40);
        activeTimers.push(scrambleTimer);

        var lockTimer = setInterval(function() {
          if (lockIndex >= len) {
            clearInterval(scrambleTimer);
            clearInterval(lockTimer);
            span.innerHTML = origHTML[li];
            return;
          }
          locked[lockIndex] = true;
          display[lockIndex] = text[lockIndex];
          lockIndex++;
        }, 35);
        activeTimers.push(lockTimer);
      });
    }, 400);
    activeTimers.push(t);
  }

  // Run on page load
  runScramble();

  // Replay on hover
  el.addEventListener('mouseenter', runScramble);
})();
gsap.from('.hero p', { opacity: 0, y: 15, duration: 0.6, delay: 2.2 });
gsap.from('.hero-tag', { opacity: 0, y: 10, scale: 0.9, duration: 0.4, stagger: 0.08, delay: 1.1, ease: 'back.out(1.7)' });

// Award cards — slide up
gsap.from('.ab-card', { opacity: 0, y: 20, duration: 0.5, stagger: 0.15, delay: 1.3 });

// Marquee — infinite scroll
const marquee = document.getElementById('marquee');
const mw = marquee.scrollWidth / 2;
gsap.to(marquee, { x: -mw, duration: 25, ease: 'none', repeat: -1 });

// Scroll-triggered sections
document.querySelectorAll('.gsap-fade').forEach(el => {
  gsap.to(el, {
    opacity: 1, y: 0,
    duration: 0.6, ease: 'power2.out',
    scrollTrigger: { trigger: el, start: 'top 98%', once: true }
  });
});
// Fallback: reveal any still-hidden sections after 3s
setTimeout(() => {
  document.querySelectorAll('.gsap-fade').forEach(el => {
    if (parseFloat(getComputedStyle(el).opacity) < 0.1) {
      gsap.to(el, { opacity: 1, y: 0, duration: 0.4 });
    }
  });
}, 3000);

// Featured works — stagger slide in
ScrollTrigger.create({
  trigger: '.fw-list',
  start: 'top 85%',
  once: true,
  onEnter: () => {
    gsap.from('.fw', { opacity: 0, x: -15, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
  }
});

// Research topic blocks — stagger
ScrollTrigger.create({
  trigger: '.research-grid',
  start: 'top 85%',
  once: true,
  onEnter: () => {
    gsap.fromTo('.research-topic', { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.4, stagger: 0.08, ease: 'power2.out' });
  }
});

// Year blocks — stagger
ScrollTrigger.create({
  trigger: '.year-block',
  start: 'top 88%',
  once: true,
  onEnter: () => {
    gsap.from('.year-block', { opacity: 0, x: -15, duration: 0.4, stagger: 0.06, ease: 'power2.out' });
  }
});

// Stats — count up
ScrollTrigger.create({
  trigger: '.stats-row',
  start: 'top 85%',
  once: true,
  onEnter: () => {
    document.querySelectorAll('.stat-num').forEach(el => {
      const target = parseInt(el.textContent) || 0;
      if (target > 0) {
        gsap.from(el, { textContent: 0, duration: 1.2, ease: 'power1.out', snap: { textContent: 1 },
          onUpdate: function() { el.textContent = Math.ceil(parseFloat(el.textContent)); }
        });
      }
    });
    gsap.from('.stat-card', { opacity: 0, y: 15, duration: 0.4, stagger: 0.08 });
  }
});

// Section bars — grow in
document.querySelectorAll('.sec-bar').forEach(bar => {
  gsap.from(bar, {
    scaleY: 0, transformOrigin: 'top',
    duration: 0.4, ease: 'power2.out',
    scrollTrigger: { trigger: bar, start: 'top 90%', once: true }
  });
});

// Sync code-block widths: FM matches SE
function syncCodeBlocks() {
  var seBlocks = document.querySelectorAll('#nlToCodeAnim .code-block');
  var fmBlocks = document.querySelectorAll('#acslAnim .code-block');
  if (seBlocks.length === 2 && fmBlocks.length === 2) {
    fmBlocks[0].style.width = seBlocks[0].offsetWidth + 'px';
    fmBlocks[1].style.width = seBlocks[1].offsetWidth + 'px';
  }
}
window.addEventListener('load', syncCodeBlocks);
window.addEventListener('resize', syncCodeBlocks);

// Sidebar — subtle entrance (immediate on load)
gsap.fromTo('.s-avatar', { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.6, delay: 0.1, ease: 'power2.out' });
gsap.fromTo('.s-name', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.3 });
gsap.fromTo('.s-role', { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, delay: 0.4 });
gsap.fromTo('.s-nav a', { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3, stagger: 0.04, delay: 0.5 });
gsap.fromTo('.s-links a', { opacity: 0, y: 5 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.04, delay: 0.8 });

// ══════════════════════════════════════════
// TOPIC 1: Benchmark Bar Chart Race
// ══════════════════════════════════════════
const benchData = {
  humaneval: [
    { name: '剪映', score: 95, color: '#4d6dff' },
    { name: 'Premiere', score: 85, color: '#60a5fa' },
    { name: 'After Effects', score: 70, color: '#34d399' },
    { name: 'Photoshop', score: 60, color: '#fb923c' },
    { name: '即梦AI', score: 80, color: '#f87171' },
  ],
  mbpp: [
    { name: '剪映', score: 88, color: '#4d6dff' },
    { name: 'Premiere', score: 75, color: '#60a5fa' },
    { name: 'After Effects', score: 65, color: '#34d399' },
    { name: 'Photoshop', score: 70, color: '#fb923c' },
    { name: '即梦AI', score: 92, color: '#f87171' },
  ],
  livecodebench: [
    { name: '剪映', score: 90, color: '#4d6dff' },
    { name: 'Premiere', score: 88, color: '#60a5fa' },
    { name: 'After Effects', score: 75, color: '#34d399' },
    { name: 'Photoshop', score: 80, color: '#fb923c' },
    { name: '即梦AI', score: 70, color: '#f87171' },
  ],
  swebench: [
    { name: '剪映', score: 85, color: '#4d6dff' },
    { name: 'Premiere', score: 82, color: '#60a5fa' },
    { name: 'After Effects', score: 60, color: '#34d399' },
    { name: 'Photoshop', score: 65, color: '#fb923c' },
    { name: '即梦AI', score: 60, color: '#f87171' },
  ],
  cruxeval: [
    { name: '剪映', score: 80, color: '#4d6dff' },
    { name: 'Premiere', score: 78, color: '#60a5fa' },
    { name: 'After Effects', score: 90, color: '#34d399' },
    { name: 'Photoshop', score: 75, color: '#fb923c' },
    { name: '即梦AI', score: 65, color: '#f87171' },
  ],
};

function buildBenchRows() {
  const container = document.getElementById('benchRows');
  container.innerHTML = '';
  const models = benchData.humaneval;
  models.forEach(m => {
    container.innerHTML += `
      <div class="bench-row">
        <span class="bench-dot" style="background:${m.color}"></span>
        <span class="bench-name">${m.name}</span>
        <div class="bench-bar-bg"><div class="bench-bar" data-model="${m.name}" style="background:${m.color}"></div></div>
        <span class="bench-score" data-model="${m.name}">0</span>
      </div>`;
  });
}
buildBenchRows();

function animateBench(benchKey) {
  const data = benchData[benchKey];
  const maxScore = 100;
  data.forEach((m, i) => {
    const bar = document.querySelector(`.bench-bar[data-model="${m.name}"]`);
    const score = document.querySelector(`.bench-score[data-model="${m.name}"]`);
    if (bar && score) {
      bar.style.transition = 'none';
      bar.style.width = '0';
      score.textContent = '0.0';
      setTimeout(() => {
        bar.style.transition = 'width 3.5s cubic-bezier(0.16, 1, 0.3, 1)';
        bar.style.width = (m.score / maxScore * 100) + '%';
        gsap.to({ val: 0 }, {
          val: m.score, duration: 3.5, ease: 'power2.out',
          onUpdate: function() { score.textContent = this.targets()[0].val.toFixed(1); }
        });
      }, i * 150);
    }
  });
}

// Benchmark switcher
document.querySelectorAll('.bench-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.bench-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    animateBench(btn.dataset.bench);
  });
});

// Trigger on scroll
let benchTriggered = false;
ScrollTrigger.create({
  trigger: '#benchmarkAnim',
  start: 'top 75%',
  once: true,
  onEnter: () => {
    if (!benchTriggered) {
      benchTriggered = true;
      animateBench('humaneval');
    }
  }
});
document.getElementById('benchmarkAnim').addEventListener('mouseenter', function() {
  var active = document.querySelector('.bench-btn.active');
  animateBench(active ? active.dataset.bench : 'humaneval');
});

// ══════════════════════════════════════════
// TOPIC 2: NL → Code Generation — scroll + hover
// ══════════════════════════════════════════
function animateNlToCode() {
  var nlLines = document.querySelectorAll('#nlToCodeAnim .nl-line');
  var codeLines = document.querySelectorAll('#nlToCodeAnim .code-line');
  nlLines.forEach(function(l) { gsap.set(l, { opacity: 0 }); });
  codeLines.forEach(function(l) { gsap.set(l, { opacity: 0 }); });
  nlLines.forEach(function(l) { gsap.to(l, { opacity: 1, duration: 0.4, delay: parseFloat(l.dataset.delay) * 0.2 }); });
  codeLines.forEach(function(l) { gsap.to(l, { opacity: 1, duration: 0.35, delay: parseFloat(l.dataset.delay) * 0.18 }); });
}
ScrollTrigger.create({ trigger: '#nlToCodeAnim', start: 'top 75%', once: true, onEnter: animateNlToCode });
document.getElementById('nlToCodeAnim').addEventListener('mouseenter', animateNlToCode);

// ══════════════════════════════════════════
// TOPIC 3: C → C + ACSL — scroll + hover
// ══════════════════════════════════════════
function animateAcsl() {
  var allLines = document.querySelectorAll('#acslAnim .code-line');
  allLines.forEach(function(l) { gsap.set(l, { opacity: 0 }); });
  allLines.forEach(function(l) { gsap.to(l, { opacity: 1, duration: 0.35, delay: parseFloat(l.dataset.delay) * 0.16 }); });
}
ScrollTrigger.create({ trigger: '#acslAnim', start: 'top 75%', once: true, onEnter: animateAcsl });
document.getElementById('acslAnim').addEventListener('mouseenter', animateAcsl);

// ══════════════════════════════════════════
// TOPIC 4: Neural Network Bug Detection — scroll + hover
// ══════════════════════════════════════════
(function() {
  var nodes = document.querySelectorAll('.nn-node');
  var edgesG = document.getElementById('nnEdges');
  var layers = [[],[],[],[]];
  nodes.forEach(function(n) { layers[+n.dataset.layer].push(n); });
  for (var l = 0; l < 3; l++) {
    layers[l].forEach(function(src) {
      layers[l+1].forEach(function(dst) {
        var line = document.createElementNS('http://www.w3.org/2000/svg','line');
        line.setAttribute('x1', src.cx.baseVal.value);
        line.setAttribute('y1', src.cy.baseVal.value);
        line.setAttribute('x2', dst.cx.baseVal.value);
        line.setAttribute('y2', dst.cy.baseVal.value);
        line.classList.add('nn-edge');
        line.dataset.src = src.dataset.layer;
        line.dataset.dst = (+src.dataset.layer+1).toString();
        if (dst.dataset.buggy) line.dataset.toBuggy = 'true';
        edgesG.appendChild(line);
      });
    });
  }
  var nnTimers = [];
  function animateNN() {
    nnTimers.forEach(function(t) { clearTimeout(t); });
    nnTimers = [];
    nodes.forEach(function(n) { n.classList.remove('scanned','buggy'); });
    document.querySelectorAll('.nn-edge').forEach(function(e) { e.classList.remove('active','buggy'); });
    document.getElementById('nnBugCount').textContent = '0';
    var bugs = 0, d = 0;
    for (var li = 0; li < 4; li++) {
      (function(layer) {
        if (layer > 0) {
          nnTimers.push(setTimeout(function() {
            document.querySelectorAll('.nn-edge[data-dst="'+layer+'"]').forEach(function(e) { e.classList.add('active'); });
          }, d));
          d += 300;
        }
        layers[layer].forEach(function(n, ni) {
          nnTimers.push(setTimeout(function() {
            n.classList.add('scanned');
            if (n.dataset.buggy) {
              nnTimers.push(setTimeout(function() {
                n.classList.remove('scanned');
                n.classList.add('buggy');
                bugs++;
                document.getElementById('nnBugCount').textContent = bugs;
                document.querySelectorAll('.nn-edge[data-toBuggy="true"]').forEach(function(e) {
                  if (+e.getAttribute('x2') == n.cx.baseVal.value && +e.getAttribute('y2') == n.cy.baseVal.value) e.classList.add('buggy');
                });
              }, 200));
            }
          }, d + ni * 150));
        });
        d += layers[layer].length * 150 + 200;
      })(li);
    }
  }
  ScrollTrigger.create({ trigger: '#nnBugAnim', start: 'top 75%', once: true, onEnter: animateNN });
  document.getElementById('nnBugAnim').addEventListener('mouseenter', animateNN);
})();

// Topic papers stagger
document.querySelectorAll('.topic-papers').forEach(container => {
  ScrollTrigger.create({
    trigger: container,
    start: 'top 85%',
    once: true,
    onEnter: () => {
      gsap.from(container.querySelectorAll('.topic-paper'), {
        opacity: 0, y: 16, duration: 0.4, stagger: 0.08
      });
    }
  });
});

// ══════════════════════════════════════════
// Guppy Fish Chat (powered by guppyLM-9M)
// ══════════════════════════════════════════
var GUPPY_MODEL_BASE='https://arman-bd.github.io/guppylm',GUPPY_CONFIG={vocab_size:4096,max_seq_len:128,d_model:384,n_layers:6,n_heads:6,ffn_hidden:768,pad_id:0,bos_id:1,eos_id:2},GUPPY_GEN={temperature:0.7,top_k:50,max_tokens:32},guppySession=null,guppyTokenizer=null,guppyLoading=false;
var chatKB={intro:"唐萍遥，长沙师范学院艺术与科技专业本科生（2023.9-2027.6）。专注于 AI 漫剧与短视频剪辑全流程创作。",skills:"核心技能：\n• 视频剪辑：剪映、Premiere Pro、After Effects\n• AI 内容生产：DeepSeek、即梦AI、可灵、LIB TV、ChatGPT\n• 设计工具：Photoshop、Illustrator\n• 专业能力：AI 短剧全流程、AI 漫剧、音视频剪辑",project:"代表项目：\n• 徐特立 150 周年 AI 漫剧（2026.5-6）：统筹策划，完成脚本、分镜、原画、动态、剪辑、海报全流程\n• 长沙宣传纪录片（2025.11）：拍摄、素材生成、剪辑合成",ai:"AI 漫剧制作流程：\n1. DeepSeek 撰写脚本\n2. 分镜设计 + IP 形象设定\n3. 即梦AI / 可灵 生成原画\n4. LIB TV 制作动态\n5. 剪映剪辑、配音、字幕、配乐\n6. PS 制作封面与海报",award:"证书荣誉：\n• 普通话水平测试证书\n• 全国计算机二级证书\n• 影像创作项目平均得分年级前 5%",edu:"教育背景：长沙师范学院 · 艺术与科技（本科）2023.9 - 2027.6\n主修影视剪辑与特效、影像基础、媒介与传播、跨媒介技术、交互影像创作\n平均成绩 85+，任班级学习委员",exp:"在校经历：\n• 学习委员（2023.9-至今）：统筹班级学业，对接 30 名同学与教师\n• 大学生自治委员会 部长（2023.9-2025.6）：活动宣传物料制作，差错率<2%",intent:"求职意向：剪辑师 / AI 漫剧制作（实习）\n意向方向：短视频剪辑、AI 漫剧全流程、宣传片/纪录片剪辑",contact:"联系方式：\n📞 13787057528\n📧 2816094267@qq.com",eval:"自我评价：艺术与科技专业背景，掌握 AI 漫剧与短视频剪辑全流程；具备美学思维，熟悉主流剪辑与图像处理工具；具探索精神与自主学习能力。"};
function matchBio(input){var q=input.toLowerCase();if(/求职|岗位|实习|工作|招|position|job|intern/.test(q))return chatKB.intent;if(/项目|作品|project|徐特立|漫剧|纪录片/.test(q))return chatKB.project;if(/ai|漫剧|流程|deepseek|即梦|可灵|lib/.test(q))return chatKB.ai;if(/技能|工具|剪映|ps|premiere|skill/.test(q))return chatKB.skills;if(/证书|奖|honor|award|普通话|计算机/.test(q))return chatKB.award;if(/学校|学历|专业|教育|长沙|师范/.test(q))return chatKB.edu;if(/经历|在校|学习委员|部长|experience/.test(q))return chatKB.exp;if(/联系|电话|邮箱|contact|mail|phone/.test(q))return chatKB.contact;if(/自我|评价|self/.test(q))return chatKB.eval;if(/介绍|谁|who|你是谁|唐萍遥/.test(q))return chatKB.intro+'\n\n'+chatKB.skills;if(/hi|hello|hey|你好|嗨/.test(q))return"你好！我是唐萍遥的小鱼助手，可以问我技能、项目、证书或联系方式～";return null;}
function buildGuppyTokenizer(json){var vocab=json.model.vocab,merges=json.model.merges,added={};for(var t of json.added_tokens)added[t.content]=t.id;var id2token={};for(var[tok,id]of Object.entries(vocab))id2token[id]=tok;for(var[tok2,id2]of Object.entries(added))id2token[id2]=tok2;var byte2char={},char2byte={},ranges=[[33,126],[161,172],[174,255]],direct=new Set();for(var[lo,hi]of ranges)for(var b=lo;b<=hi;b++)direct.add(b);var n=0;for(var b2=0;b2<256;b2++){byte2char[b2]=direct.has(b2)?String.fromCharCode(b2):String.fromCharCode(256+n++);}for(var[b3,c]of Object.entries(byte2char))char2byte[c]=parseInt(b3);var mergeRank={};for(var i=0;i<merges.length;i++){mergeRank[Array.isArray(merges[i])?merges[i].join(' '):merges[i]]=i;}function bytesToTokenStr(bytes){return Array.from(bytes).map(function(b){return byte2char[b];}).join('');}function tokenStrToBytes(s){return Uint8Array.from([...s].map(function(c){return char2byte[c]??c.charCodeAt(0);}));}function bpe(word){if(word.length<=1)return word;var pieces=word.slice();while(pieces.length>1){var bestRank=Infinity,bestIdx=-1;for(var i2=0;i2<pieces.length-1;i2++){var rank=mergeRank[pieces[i2]+' '+pieces[i2+1]];if(rank!==undefined&&rank<bestRank){bestRank=rank;bestIdx=i2;}}if(bestIdx===-1)break;pieces=[...pieces.slice(0,bestIdx),pieces[bestIdx]+pieces[bestIdx+1],...pieces.slice(bestIdx+2)];}return pieces;}var PAT=/'(?:[sdmt]|ll|ve|re)| ?\p{L}+| ?\p{N}+| ?[^\s\p{L}\p{N}]+|\s+(?!\S)|\s+/gu;function encode(text){var specialPattern=Object.keys(added).map(function(s){return s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');}).join('|');var segments=text.split(new RegExp('('+specialPattern+')'));var ids=[];for(var seg of segments){if(seg==='')continue;if(added[seg]!==undefined){ids.push(added[seg]);continue;}for(var word of(seg.match(PAT)||[seg])){var byteChars=[...bytesToTokenStr(new TextEncoder().encode(word))];for(var tok3 of bpe(byteChars)){var id3=vocab[tok3];if(id3!==undefined)ids.push(id3);}}}return ids;}function decode(ids){var parts=[];for(var id4 of ids){var tok4=id2token[id4];if(tok4&&added[tok4]===undefined)parts.push(tok4);}return new TextDecoder('utf-8',{fatal:false}).decode(tokenStrToBytes(parts.join('')));}return{encode:encode,decode:decode};}
async function ensureGuppyLoaded(){if(guppySession)return true;if(guppyLoading)return false;guppyLoading=true;try{var ort=await import('https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/ort.min.mjs');window._ort=ort;ort.env.wasm.wasmPaths='https://cdn.jsdelivr.net/npm/onnxruntime-web@1.21.0/dist/';var[tokResp,modelResp]=await Promise.all([fetch(GUPPY_MODEL_BASE+'/tokenizer.json'),fetch(GUPPY_MODEL_BASE+'/model.onnx')]);guppyTokenizer=buildGuppyTokenizer(await tokResp.json());guppySession=await ort.InferenceSession.create(await modelResp.arrayBuffer(),{executionProviders:['wasm']});return true;}catch(e){console.error('guppyLM load failed:',e);guppyLoading=false;return false;}}
async function guppyGenerate(inputIds){var ort=window._ort,ids=inputIds.slice();for(var i=0;i<GUPPY_GEN.max_tokens;i++){var seq=ids.slice(-GUPPY_CONFIG.max_seq_len);var tensor=new ort.Tensor('int64',BigInt64Array.from(seq.map(BigInt)),[1,seq.length]);var out=await guppySession.run({input_ids:tensor});var logits=out.logits.data;var offset=(seq.length-1)*GUPPY_CONFIG.vocab_size;var lastLogits=new Float32Array(GUPPY_CONFIG.vocab_size);for(var v=0;v<GUPPY_CONFIG.vocab_size;v++)lastLogits[v]=logits[offset+v]/GUPPY_GEN.temperature;if(GUPPY_GEN.top_k>0){var sorted=[...lastLogits].sort(function(a,b){return b-a;});var cutoff=sorted[Math.min(GUPPY_GEN.top_k,sorted.length)-1];for(var v2=0;v2<GUPPY_CONFIG.vocab_size;v2++)if(lastLogits[v2]<cutoff)lastLogits[v2]=-Infinity;}var maxVal=Math.max(...lastLogits.filter(function(v3){return v3!==-Infinity;}));var sumExp=0;var probs=new Float32Array(GUPPY_CONFIG.vocab_size);for(var v4=0;v4<GUPPY_CONFIG.vocab_size;v4++){probs[v4]=Math.exp(lastLogits[v4]-maxVal);sumExp+=probs[v4];}for(var v5=0;v5<GUPPY_CONFIG.vocab_size;v5++)probs[v5]/=sumExp;var r=Math.random(),acc=0,nextId=0;for(var v6=0;v6<GUPPY_CONFIG.vocab_size;v6++){acc+=probs[v6];if(acc>=r){nextId=v6;break;}}ids.push(nextId);if(nextId===GUPPY_CONFIG.eos_id)break;}return ids.slice(inputIds.length);}
async function sendChat(){var input=document.getElementById('chatInput'),body=document.getElementById('chatBody'),text=input.value.trim();if(!text)return;body.innerHTML+='<div class="chat-msg user">'+text.replace(/</g,'&lt;')+'</div>';input.value='';body.scrollTop=body.scrollHeight;var bio=matchBio(text);if(bio){body.innerHTML+='<div class="chat-msg bot">'+bio.replace(/\n/g,'<br>')+'</div>';body.scrollTop=body.scrollHeight;return;}var typing=document.createElement('div');typing.className='chat-typing';body.appendChild(typing);body.scrollTop=body.scrollHeight;if(!guppySession){typing.textContent='loading guppyLM-9M (~10 MB, first time only)...';var ok=await ensureGuppyLoaded();if(!ok){var retryMsgs=['still loading, hang on...','almost there...','one more try...'];for(var ri=0;ri<3&&!ok;ri++){typing.textContent=retryMsgs[ri];await new Promise(function(r){setTimeout(r,2000);});guppyLoading=false;ok=await ensureGuppyLoaded();}if(!ok){typing.remove();var fallbacks=['blub... my tiny brain failed to load. Try again in a bit!','*swims in circles* Model loading hiccup — maybe try again?','The fish tank is too cold for inference right now. Try later!','blub blub... network might be slow. Give me another chance?'];body.innerHTML+='<div class="chat-msg bot">'+fallbacks[Math.floor(Math.random()*fallbacks.length)]+'</div>';body.scrollTop=body.scrollHeight;return;}}}typing.textContent='guppyLM-9M is thinking...';try{var prompt='<|im_start|>user\n'+text+'<|im_end|>\n<|im_start|>assistant\n';var inputIds=guppyTokenizer.encode(prompt);var outputIds=await guppyGenerate(inputIds);var reply=guppyTokenizer.decode(outputIds).trim();if(reply.includes('<|im_end|>'))reply=reply.split('<|im_end|>')[0];if(reply.includes('<|im_start|>'))reply=reply.split('<|im_start|>')[0];reply=reply.trim();if(!reply||reply.length<2||/^[^a-zA-Z0-9]*$/.test(reply)){reply="blub... I'm just a tiny 9M fish! Try asking about 唐萍遥's skills, projects, awards, or contact info.";}typing.remove();body.innerHTML+='<div class="chat-msg bot">'+reply.replace(/</g,'&lt;').replace(/\n/g,'<br>')+'</div>';}catch(e){console.error('guppyLM error:',e);typing.remove();body.innerHTML+='<div class="chat-msg bot">blub... something went wrong. Try asking about 唐萍遥's skills, projects, or awards!</div>';}body.scrollTop=body.scrollHeight;}

// Research grid: switch to 1 column when 2-col box ratio < 1.5:1
(function() {
  var grid = document.querySelector('.research-grid');
  if (!grid) return;
  var GAP = 20, BOX_H = 320, MIN_RATIO = 1.5;
  function update() {
    var w = grid.offsetWidth;
    var boxW = (w - GAP) / 2;
    grid.style.gridTemplateColumns = (boxW / BOX_H) >= MIN_RATIO ? 'repeat(2, 1fr)' : '1fr';
  }
  update();
  window.addEventListener('resize', update);
})();


