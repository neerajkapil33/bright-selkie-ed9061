import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const sourceIndex = path.join(root, 'index.html');
const distIndex = path.join(dist, 'index.html');

if (!fs.existsSync(dist)) fs.mkdirSync(dist, { recursive: true });
if (!fs.existsSync(distIndex) && fs.existsSync(sourceIndex)) fs.copyFileSync(sourceIndex, distIndex);
if (!fs.existsSync(distIndex)) throw new Error('dist/index.html was not produced');

let html = fs.readFileSync(distIndex, 'utf8');
const site = 'https://w3me.in';
const profile = `${site}/neeraj-kapil/`;
const image = `${site}/neeraj%20image.jpeg`;

const meta = `\n<link rel="canonical" href="${site}/">\n<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">\n<meta name="author" content="Neeraj Kapil">\n<meta name="keywords" content="Neeraj Kapil, W3ME, career intelligence, career diagnostics, Talent Acquisition, AI in Talent Acquisition, recruitment AI, career coaching, HR transformation, future of work">\n<meta property="og:type" content="website">\n<meta property="og:url" content="${site}/">\n<meta property="og:title" content="W3ME + Neeraj Kapil | Career Intelligence, Talent Acquisition & AI">\n<meta property="og:description" content="W3ME is a career intelligence platform by Neeraj Kapil, combining career diagnostics, AI coaching, Talent Acquisition expertise and practical career strategy.">\n<meta property="og:image" content="${image}">\n<meta property="og:site_name" content="W3ME">\n<meta name="twitter:card" content="summary_large_image">\n<meta name="twitter:title" content="W3ME + Neeraj Kapil | Career Intelligence, Talent Acquisition & AI">\n<meta name="twitter:description" content="Career intelligence, Talent Acquisition insight and practical AI-enabled career guidance from Neeraj Kapil.">\n<meta name="twitter:image" content="${image}">\n<link rel="author" href="${profile}">\n`;

const person = {
  '@type': 'Person',
  '@id': `${profile}#person`,
  name: 'Neeraj Kapil',
  url: profile,
  image,
  jobTitle: 'Talent Acquisition & Career Intelligence Leader',
  description: 'Neeraj Kapil is a Talent Acquisition leader and creator of W3ME, focused on Talent Acquisition transformation, AI, career intelligence and practical career guidance.',
  worksFor: { '@type': 'Organization', name: 'W3ME', url: site },
  sameAs: [
    'https://www.linkedin.com/in/neeraj-kapil',
    'https://github.com/neerajkapil33'
  ]
};
const profilePage = {
  '@type': 'ProfilePage',
  '@id': `${profile}#profilepage`,
  url: profile,
  name: 'Neeraj Kapil | Talent Acquisition, AI & Career Intelligence',
  isPartOf: { '@type': 'WebSite', '@id': `${site}/#website`, url: site, name: 'W3ME' },
  mainEntity: { '@id': `${profile}#person` },
  about: { '@id': `${profile}#person` }
};
const jsonLd = `\n<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': [person, profilePage] })}</script>\n`;

html = html.replace(/<title>[^<]*<\/title>/i, '<title>W3ME + Neeraj Kapil | Career Intelligence, Talent Acquisition & AI</title>');
html = html.replace(/<meta\s+name="description"[^>]*>/i, '<meta name="description" content="W3ME + Neeraj Kapil — career intelligence, career diagnostics, Talent Acquisition expertise and practical AI-enabled career guidance.">');
if (!html.includes('rel="canonical"')) html = html.replace('</head>', `${meta}${jsonLd}</head>`);

const authoritySection = `\n<section id="w3me-authority" aria-label="W3ME and Neeraj Kapil authority" style="margin:0 20px 18px;padding:18px 16px;border:1px solid rgba(227,178,60,.32);border-radius:16px;background:rgba(255,255,255,.06);color:#fff;text-align:left;line-height:1.55;">\n  <div style="font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:#F3D89A;font-weight:700;">W3ME · Neeraj Kapil</div>\n  <h2 style="font-family:'Fraunces',serif;font-size:20px;line-height:1.2;margin:7px 0 6px;">Career Intelligence built from hiring experience, AI and practical coaching.</h2>\n  <p style="font-size:12px;color:rgba(255,255,255,.68);margin:0 0 10px;">Explore Neeraj Kapil's work across Talent Acquisition leadership, AI in hiring, career diagnostics, future-of-work thinking and W3ME — a career intelligence platform designed to help people understand where they stand and what to do next.</p>\n  <nav aria-label="W3ME authority topics" style="display:flex;flex-wrap:wrap;gap:7px;">\n    <a href="${profile}" style="color:#F3D89A;text-decoration:none;font-size:11px;font-weight:700;">Neeraj Kapil</a>\n    <a href="${profile}#talent-acquisition" style="color:#F3D89A;text-decoration:none;font-size:11px;font-weight:700;">Talent Acquisition</a>\n    <a href="${profile}#ai" style="color:#F3D89A;text-decoration:none;font-size:11px;font-weight:700;">AI &amp; Hiring</a>\n    <a href="${profile}#career-intelligence" style="color:#F3D89A;text-decoration:none;font-size:11px;font-weight:700;">Career Intelligence</a>\n    <a href="${profile}#writing" style="color:#F3D89A;text-decoration:none;font-size:11px;font-weight:700;">Insights</a>\n  </nav>\n</section>\n`;

if (!html.includes('id="w3me-authority"')) {
  const marker = '<div class="auth-stack">';
  html = html.replace(marker, `${authoritySection}${marker}`);
}

fs.writeFileSync(distIndex, html);

const profileDir = path.join(dist, 'neeraj-kapil');
fs.mkdirSync(profileDir, { recursive: true });
const profileHtml = `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width,initial-scale=1">\n<title>Neeraj Kapil | Talent Acquisition, AI & Career Intelligence | W3ME</title>\n<meta name="description" content="Neeraj Kapil — Talent Acquisition leader, AI in hiring practitioner and creator of W3ME. Explore his work in Talent Acquisition, AI, career intelligence and future of work.">\n<link rel="canonical" href="${profile}">\n<meta name="robots" content="index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1">\n<meta property="og:type" content="profile">\n<meta property="og:url" content="${profile}">\n<meta property="og:title" content="Neeraj Kapil | Talent Acquisition, AI & Career Intelligence">\n<meta property="og:description" content="Talent Acquisition leadership, AI in hiring, career intelligence and W3ME by Neeraj Kapil.">\n<meta property="og:image" content="${image}">\n<script type="application/ld+json">${JSON.stringify({ '@context':'https://schema.org','@graph':[person,profilePage] })}</script>\n<style>body{margin:0;font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:#16233d;background:#f5f2e8}main{max-width:1000px;margin:auto;padding:56px 24px 80px}a{color:#173c70}.eyebrow{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:800;color:#a17416}h1{font-family:Georgia,serif;font-size:clamp(38px,7vw,68px);line-height:1.02;margin:10px 0 16px}h2{font-family:Georgia,serif;font-size:30px;margin:0 0 12px}.lead{font-size:19px;line-height:1.65;max-width:780px;color:#4e596c}.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:30px}.card{background:#fffdf7;border:1px solid #ddd6c7;border-radius:18px;padding:22px}.card p{line-height:1.65;color:#5a6478}.nav{display:flex;gap:14px;flex-wrap:wrap;margin:24px 0}.nav a{font-weight:750;text-decoration:none}.cta{display:inline-block;background:#132a52;color:#fff;padding:13px 18px;border-radius:12px;text-decoration:none;font-weight:750}@media(max-width:760px){.grid{grid-template-columns:1fr}}</style>\n</head>\n<body>\n<main>\n<div class="eyebrow">W3ME · Neeraj Kapil</div>\n<h1>Talent Acquisition. AI. Career Intelligence.</h1>\n<p class="lead">Neeraj Kapil is a Talent Acquisition leader and creator of W3ME, bringing more than two decades of hiring-side experience into practical thinking about talent strategy, AI-enabled hiring, career diagnostics and the future of work.</p>\n<div class="nav"><a href="${site}/">Open W3ME →</a><a href="https://www.linkedin.com/in/neeraj-kapil" rel="me noopener" target="_blank">LinkedIn ↗</a><a href="https://github.com/neerajkapil33" rel="me noopener" target="_blank">GitHub ↗</a></div>\n<section id="talent-acquisition" class="card"><h2>Talent Acquisition</h2><p>Global Talent Acquisition strategy, transformation, workforce planning, recruiting operations, analytics, compliance, employer branding and the operating systems that make hiring scalable.</p></section>\n<div class="grid">\n<section id="ai" class="card"><h2>AI &amp; Hiring</h2><p>Practical exploration of predictive AI, generative AI, assessment AI and agentic AI — with an emphasis on responsible adoption and redesigning the hiring system, not simply adding another tool.</p></section>\n<section id="career-intelligence" class="card"><h2>Career Intelligence</h2><p>W3ME combines career diagnostics, resume signals, interview preparation, communication practice and personalized roadmaps to help people understand their career gaps and next actions.</p></section>\n<section id="writing" class="card"><h2>Insights &amp; Writing</h2><p>Writing on Talent Acquisition, AI transformation, future of work, career positioning and the human side of professional decisions.</p></section>\n</div>\n<section class="card" style="margin-top:16px"><h2>W3ME</h2><p>W3ME — “What's Wrong With Me?” — is the product platform behind the career diagnostics work. It is designed as a practical career intelligence layer rather than generic career advice.</p><a class="cta" href="${site}/">Start with W3ME →</a></section>\n</main>\n</body>\n</html>\n`;
fs.writeFileSync(path.join(profileDir, 'index.html'), profileHtml);

const robots = `User-agent: *\nAllow: /\n\nSitemap: ${site}/sitemap.xml\n`;
fs.writeFileSync(path.join(dist, 'robots.txt'), robots);
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${site}/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>\n  <url><loc>${profile}</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>\n  <url><loc>${site}/about.html</loc><changefreq>monthly</changefreq><priority>0.6</priority></url>\n  <url><loc>${site}/contact.html</loc><changefreq>monthly</changefreq><priority>0.4</priority></url>\n</urlset>\n`;
fs.writeFileSync(path.join(dist, 'sitemap.xml'), sitemap);

console.log('SEO build complete: homepage metadata + authority section, /neeraj-kapil/, robots.txt and sitemap.xml');
