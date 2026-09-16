import re

path = "index.html"
content = open(path, encoding="utf-8").read()
orig_len = len(content)

def apply(old, new, label):
    global content
    n = content.count(old)
    if n != 1:
        raise SystemExit(f"ANCHOR PROBLEM for {label}: found {n} occurrences (expected 1)")
    content = content.replace(old, new, 1)

# 1) Title year freshen
apply(
    '<title>SAT Test Centers in Samarkand | Official Locations 2025–2026</title>',
    '<title>SAT Test Centers in Samarkand | Official Locations 2026–2027</title>',
    "title"
)

# 2) Add meta keywords right after description
apply(
    '<meta name="description" content="Complete list of official SAT test centers in Samarkand, Uzbekistan. Addresses, Google Maps and Yandex Maps links for all 5 authorized SAT testing locations.">',
    '<meta name="description" content="Complete list of official SAT test centers in Samarkand, Uzbekistan. Addresses, Google Maps and Yandex Maps links for all 5 authorized SAT testing locations.">\n'
    '<meta name="keywords" content="SAT test centers Samarkand, SAT exam Samarkand, Digital SAT Samarkand, SAT preparation Samarkand, SAT courses Samarkand, SAT prep Uzbekistan, where to take SAT in Samarkand, SAT Samarkand narxi, SAT markazlari Samarqand, SAT imtihon markazi Samarqand, SAT kurslari Samarqand, SAT tayyorgarlik Samarqand, Samarqandda SAT topshirish, центры SAT Самарканд, экзамен SAT Самарканд, курсы SAT Самарканд, подготовка к SAT Самарканд, где сдать SAT в Самарканде">',
    "meta keywords"
)

# 3) JSON-LD structured data before </head>
jsonld = '''<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "SAT Test Centers in Samarkand",
  "itemListElement": [
    {"@type":"ListItem","position":1,"item":{"@type":"Place","name":"Cambridge Unit School","description":"SAT Samarkand partner testing location","address":{"@type":"PostalAddress","addressLocality":"Samarkand","addressCountry":"UZ"},"geo":{"@type":"GeoCoordinates","latitude":39.6607841,"longitude":66.9470338},"hasMap":"https://maps.app.goo.gl/QytADWvjn8n3NzvN6"}},
    {"@type":"ListItem","position":2,"item":{"@type":"Place","name":"Presidential School in Samarkand","description":"Authorized College Board Digital SAT test center","address":{"@type":"PostalAddress","streetAddress":"Amir Temur Street 82","addressLocality":"Samarkand","postalCode":"140100","addressCountry":"UZ"}}},
    {"@type":"ListItem","position":3,"item":{"@type":"Place","name":"Silk Road International University of Tourism & Cultural Heritage","description":"Authorized College Board Digital SAT test center","address":{"@type":"PostalAddress","streetAddress":"University Boulevard 17","addressLocality":"Samarkand","postalCode":"140129","addressCountry":"UZ"}}},
    {"@type":"ListItem","position":4,"item":{"@type":"Place","name":"Innovative Centre","description":"Authorized College Board Digital SAT test center","address":{"@type":"PostalAddress","addressLocality":"Samarkand","addressCountry":"UZ"}}},
    {"@type":"ListItem","position":5,"item":{"@type":"Place","name":"Samarkand International University of Technology (SIUT)","description":"Authorized College Board Digital SAT test center","address":{"@type":"PostalAddress","streetAddress":"128 Khuja Gunzhoish Street, mahalla Humo","addressLocality":"Samarkand","postalCode":"140100","addressCountry":"UZ"}}},
    {"@type":"ListItem","position":6,"item":{"@type":"Place","name":"Agency for Assessment of Knowledge and Competencies — Samarkand Branch","description":"Government agency overseeing standardized testing in Uzbekistan","address":{"@type":"PostalAddress","addressLocality":"Samarkand","addressCountry":"UZ"}}}
  ]
}
</script>
</head>'''
apply('</head>', jsonld, "jsonld+head-close")

# 4) Insert Partner Spotlight section between hero </section> and INFO BAND
old_anchor = '''    </div>
  </div>
</section>

<!-- INFO BAND -->'''
new_block = '''    </div>
  </div>
</section>

<!-- PARTNER SPOTLIGHT -->
<div style="max-width:860px;margin:0 auto;padding:48px 5vw 0">
  <div style="text-align:center;margin-bottom:18px">
    <span style="display:inline-block;background:linear-gradient(135deg,#8a6414,#D9A74C);color:#fff;font-size:.68rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:6px 16px;border-radius:999px" data-en="SAT Samarkand Partner Location" data-uz="SAT Samarkand hamkor markazi" data-ru="Партнёрская площадка SAT Samarkand">SAT Samarkand Partner Location</span>
  </div>
  <div class="ctr-card" style="border:1.5px solid #D9A74C;margin-bottom:8px">
    <div class="ctr-top" style="background:linear-gradient(135deg,#7a5810,#D9A74C)">
      <div class="ctr-num" style="background:rgba(255,255,255,.28)">
        <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7-6.2-3.8L6 21l1.6-7L2.2 9.2l7.1-.6z"/></svg>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap">
        <div class="ctr-name" data-en="Cambridge Unit School" data-uz="Cambridge Unit School" data-ru="Cambridge Unit School">Cambridge Unit School</div>
        <span style="background:rgba(255,255,255,.92);color:#7a5810;font-size:.62rem;font-weight:800;letter-spacing:.06em;text-transform:uppercase;padding:4px 11px;border-radius:999px;flex-shrink:0" data-en="Partner" data-uz="Hamkor" data-ru="Партнёр">Partner</span>
      </div>
    </div>
    <div class="ctr-body">
      <div class="ctr-row">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span data-en="Samarkand, Uzbekistan — see map for exact location" data-uz="Samarqand, O'zbekiston — aniq manzil uchun xaritaga qarang" data-ru="Самарканд, Узбекистан — точное расположение см. на карте">Samarkand, Uzbekistan — see map for exact location</span>
      </div>
      <div class="ctr-maps">
        <a href="https://maps.app.goo.gl/QytADWvjn8n3NzvN6" target="_blank" rel="noopener" class="mlink mlink-g">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          Google Maps
        </a>
        <a href="https://yandex.uz/maps/-/CTxKeSPl" target="_blank" rel="noopener" class="mlink mlink-y">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
          Yandex Maps
        </a>
      </div>
      <div class="ctr-note" data-en="Partnered with SAT Samarkand for Digital SAT testing. Contact SAT Samarkand for exam-day scheduling." data-uz="Digital SAT imtihonini topshirish uchun SAT Samarkand bilan hamkorlikda ishlaydi. Imtihon kuni jadvali uchun SAT Samarkand bilan bog'laning." data-ru="Сотрудничает с SAT Samarkand для проведения Digital SAT. По вопросам записи на экзамен обращайтесь в SAT Samarkand.">Partnered with SAT Samarkand for Digital SAT testing. Contact SAT Samarkand for exam-day scheduling.</div>
    </div>
  </div>
  <p style="text-align:center;color:#a0aec0;font-size:.8rem;margin:14px 0 8px" data-en="See the 5 independently authorized College Board centers below." data-uz="Quyida 5 ta mustaqil vakolatli College Board markazlari keltirilgan." data-ru="Ниже — 5 независимо авторизованных центров College Board.">See the 5 independently authorized College Board centers below.</p>
</div>

<!-- INFO BAND -->'''
apply(old_anchor, new_block, "partner spotlight insertion")

open(path, "w", encoding="utf-8").write(content)
print("OK, new length", len(content), "delta", len(content) - orig_len)
