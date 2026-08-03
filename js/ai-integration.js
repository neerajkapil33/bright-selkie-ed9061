(function(){ window.aiState = window.aiState || {}; window.aiState.resumeRawText = ''; window.aiState.adaptiveQuestions = null;

function computeAtsScore(text){ const targets = ['engineer','manager','product','data','cloud','agile','lead','develop','design','research','finance','analysis']; let detected = 0; targets.forEach(t=>{ if(text.toLowerCase().includes(t)) detected++; }); const lengthFactor = Math.min(30, Math.floor(text.length/80)); const keywordFactor = Math.min(50, detected * 8); const complianceBonus = text.length > 800 ? 20 : 5; const finalScore = Math.min(100, Math.max(20, 10 + lengthFactor + keywordFactor + complianceBonus)); return { score: finalScore, detected, length: text.length }; }

async function callGenerateQuestions(payload){ try{ const res = await fetch('/api/generate-questions',{ method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) }); if(!res.ok){ const txt = await res.text(); console.warn('generate-questions failed', res.status, txt); return null; } const data = await res.json(); if(!data) return null; if(Array.isArray(data.questions)) return data.questions; if(Array.isArray(data)) return data; return null; }catch(err){ console.warn('generate-questions error', err); return null; } }

async function aiHandleResumeUpload(event){ const file = event.target.files && event.target.files[0]; if(!file) return; const reader = new FileReader(); reader.onload = async function(e){ const text = (e.target.result || '').toString(); window.aiState.resumeRawText = text; const ats = computeAtsScore(text); const atsScoreElem = document.getElementById('atsScoreValue'); if(atsScoreElem) atsScoreElem.textContent = ${ats.score}%; const bar = document.getElementById('uploadProgressBar'); if(bar) bar.style.width = '100%'; const resultsCard = document.getElementById('atsResultsCard'); if(resultsCard) resultsCard.classList.remove('hidden'); const status = document.getElementById('uploadStatusText'); if(status) status.innerHTML = <span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Document Parsed</span>;
                                                                                                                                                                                               const suggestions = getAtsImprovementChecklist(ats.score);
  if(!document.getElementById('atsTips')){
    const insightBlock = document.getElementById('atsResultsCard');
    if(insightBlock){
      const div = document.createElement('div'); div.id='atsTips'; div.className='mt-3 text-[12px] text-slate-300'; insightBlock.appendChild(div);
    }
  }
  if(document.getElementById('atsTips')) {
    document.getElementById('atsTips').innerHTML = `<strong>Quick checklist to reach 90%+:</strong><ul class="mt-2 text-[12px] list-disc list-inside text-slate-400">${suggestions.map(i=>`<li>${i}</li>`).join('')}</ul>`;
  }

  // prepare payload and call backend to generate questions
  const payload = {
    resumeText: text,
    stage: (document.getElementById('atsIndustry')||{}).value || 'experienced',
    industry: (document.getElementById('atsIndustry')||{}).value || '',
    function: (document.getElementById('atsIndustry')||{}).value || '',
    skill: (document.getElementById('atsIndustry')||{}).value || '',
    role: (document.getElementById('uploadedFileName')||{}).innerText || ''
  };
  if(status) status.innerHTML = '<span class="text-amber-400 font-semibold">Generating adaptive questions…</span>';
  const questions = await callGenerateQuestions(payload);
  if(questions && questions.length >= 10){
    window.aiState.adaptiveQuestions = questions;
    if(status) status.innerHTML = `<span class="text-emerald-400 font-bold"><i class="fa-solid fa-circle-check"></i> Questions ready (${questions.length})</span>`;
    addStartAssessmentButton();
  } else {
    window.aiState.adaptiveQuestions = null;
    if(status) status.innerHTML = `<span class="text-rose-400">AI generation failed — using fallback questions</span>`;
    addStartAssessmentButton();
  }
};
try{ reader.readAsText(file.slice(0, 20000)); }catch(e){ reader.readAsText(file); }
                                           }

function addStartAssessmentButton(){ if(document.getElementById('startAdaptiveBtn')) return; const container = document.querySelector('#panel-ats .space-y-3') || document.querySelector('#panel-ats'); if(!container) return; const btn = document.createElement('button'); btn.id = 'startAdaptiveBtn'; btn.className = 'w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-xs uppercase tracking-wider mt-2'; btn.innerHTML = '<i class="fa-solid fa-play"></i> Start Adaptive Assessment'; btn.onclick = ()=>{ startAdaptiveAssessment(); }; container.appendChild(btn); }

function getAtsImprovementChecklist(score){ const items = []; if(score < 90){ items.push('Add 3-5 role-specific keywords from job descriptions.'); items.push('Use measurable bullets (metrics, %, counts).'); items.push('Add a Skills section with tools and technologies.'); } if(score < 60) items.push('Expand experience descriptions and include projects/examples.'); if(score >= 90) items.push('Minor formatting tweaks: ensure headings consistent and save as PDF/text for ATS.'); return items; }

function startAdaptiveAssessment(){ try{ document.getElementById('nav-diagnostic').click(); }catch(e){} const questions = window.aiState.adaptiveQuestions || buildFallbackQuestions(); const overlay = document.createElement('div'); overlay.id='ai-assess-overlay'; overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.zIndex='9999'; overlay.style.background='rgba(2,6,23,0.86)'; overlay.style.display='flex'; overlay.style.alignItems='center'; overlay.style.justifyContent='center'; const card = document.createElement('div'); card.style.width='min(720px,92vw)'; card.style.maxHeight='86vh'; card.style.overflow='auto'; card.style.borderRadius='12px'; card.style.padding='18px'; card.style.background='#071023'; card.style.border='1px solid #213548'; overlay.appendChild(card); document.body.appendChild(overlay);
                                   let idx=0; const answers = [];
function render(){
  card.innerHTML = '';
  const q = questions[idx];
  const h = document.createElement('h3'); h.style.color='#E6EEF6'; h.style.marginBottom='8px'; h.textContent = `Q${idx+1}: ${q.category} — ${q.q}`;
  card.appendChild(h);
  const opts = document.createElement('div'); opts.style.display='flex'; opts.style.flexDirection='column'; opts.style.gap='8px';
  (q.options || []).forEach((op,oi)=>{ const b = document.createElement('button'); b.className='p-3 rounded-lg'; b.style.background='#082335'; b.style.color='#CFEAF0'; b.style.border='1px solid #12323f'; b.textContent = op.text || op.t || op; b.onclick = ()=>{ selectOption(oi); }; opts.appendChild(b); });
  card.appendChild(opts);
  const elabLabel = document.createElement('div'); elabLabel.style.color='#9FB5C2'; elabLabel.style.marginTop='12px'; elabLabel.textContent = q.elaborative || 'Please elaborate (short)'; card.appendChild(elabLabel);
  const ta = document.createElement('textarea'); ta.style.width='100%'; ta.style.minHeight='80px'; ta.style.marginTop='6px'; ta.id='ai_elab'; card.appendChild(ta);
  const nav = document.createElement('div'); nav.style.display='flex'; nav.style.justifyContent='space-between'; nav.style.marginTop='12px';
  const back = document.createElement('button'); back.textContent='Back'; back.className='btn'; back.onclick = ()=>{ if(idx>0){ idx--; render(); } else { closeOverlay(); } };
  const next = document.createElement('button'); next.textContent = idx === questions.length-1 ? 'Finish' : 'Next'; next.className='btn'; next.onclick = ()=>{ const sel = card.querySelector('button[aria-selected="true"]'); const selectedIndex = sel ? Array.from(opts.children).indexOf(sel) : null; const elab = document.getElementById('ai_elab').value.trim(); if(!elab || elab.length<6){ alert('Please provide a short elaboration (min 6 chars).'); return;} answers[idx] = { question: q.q, category: q.category, option: selectedIndex, elaboration: elab }; if(idx < questions.length-1){ idx++; render(); } else { finalize(); } };
  nav.appendChild(back); nav.appendChild(next); card.appendChild(nav);
  function selectOption(n){ Array.from(opts.children).forEach((c,ci)=>{ c.style.border = '1px solid #12323f'; c.setAttribute('aria-selected','false'); if(ci===n){ c.style.border = '2px solid #2dd4bf'; c.setAttribute('aria-selected','true'); } }); }
}
function finalize(){
  closeOverlay();
  window.aiState.assessmentAnswers = answers;
  setTimeout(()=>{ alert('Assessment complete. Go to the Dashboard -> Diagnostic to see summary.'); },300);
}
function closeOverlay(){ const ov = document.getElementById('ai-assess-overlay'); if(ov) ov.remove(); }
render();
                                   }

function buildFallbackQuestions(){ const arr = []; for(let i=0;i<12;i++) arr.push({ category: ['Resume','Interview','Workplace','Skills','Jobs','Coach'][Math.floor(i/2)] || 'General', q: Fallback question ${i+1}, simplified:'Answer briefly', options:[{text:'Strong', score:4},{text:'Weak', score:1}], elaborative:'Provide an example or short explanation.' }); return arr; }

document.addEventListener('DOMContentLoaded', ()=>{ const input = document.getElementById('resumeFileInput'); if(input) input.addEventListener('change', aiHandleResumeUpload); }); })();
