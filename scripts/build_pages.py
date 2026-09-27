#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Builds the multi-page version of "For Sneha ♥" from the data below.

Run:  python3 scripts/build_pages.py
Output: index.html, ch1.html .. ch7.html, our-numbers.html, poem.html,
        letter.html, final.html   (all written to the repo root)

Why this exists instead of hand-duplicating 11 HTML files:
  - one shared <head>/top-bar/cursor/canvases/lightbox/nav block
  - one place to fix image markup (webp + intrinsic w/h => no layout shift)
  - one place to wire prev/next + prefetch + view-transition-name
so the story content below is the ONLY thing that differs page to page.
"""
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)

with open("images/manifest.json") as fh:
    IMG = json.load(fh)


def pic(src, alt, cls="", cap=None, lightbox=True, sizes="(max-width:700px) 90vw, 640px"):
    """<figure><picture>webp+jpg with intrinsic size, no CLS.</picture>{cap}</figure>"""
    m = IMG[src]
    attrs = ' data-lightbox' if lightbox else ''
    cap_html = f'\n        <p class="cap">{cap}</p>' if cap else ''
    return f'''<figure class="{cls}"{attrs}>
        <picture>
          <source type="image/webp" srcset="{m['display_webp']}" sizes="{sizes}">
          <img src="{src}" data-full="{m['full_webp']}" width="{m['display_w']}" height="{m['display_h']}" alt="{alt}" loading="lazy" decoding="async">
        </picture>{cap_html}
      </figure>'''


# ────────────────────────────────────────────────────────────
# PAGE ORDER  (drives prev/next, prefetch, and the progress nav)
# ────────────────────────────────────────────────────────────
ORDER = [
    "index", "ch1", "ch2", "ch3", "ch4", "ch5",
    "our-numbers", "ch6", "ch7", "poem", "letter", "final",
]
FILES = {p: ("index.html" if p == "index" else f"{p}.html") for p in ORDER}

# dots shown in the fixed side nav — deliberately EXCLUDES "our-numbers":
# it's an unlisted, surprise interlude you only find by going forward.
DOTS = [
    ("index", "Cover"), ("ch1", "The Beginning"), ("ch2", "First Yes"),
    ("ch3", "Journeys"), ("ch4", "Real Story"), ("ch5", "You Chose Me"),
    ("ch6", "Home"), ("ch7", "Today"), ("poem", "Poem"),
    ("letter", "Letter"), ("final", "Final"),
]

TITLES = {
    "index": "For Sneha ♥", "ch1": "The day it all began — For Sneha ♥",
    "ch2": "The first yes — For Sneha ♥", "ch3": "The journey — For Sneha ♥",
    "ch4": "A real story — For Sneha ♥", "ch5": "You chose me — For Sneha ♥",
    "our-numbers": "A year, in numbers — For Sneha ♥",
    "ch6": "Home — For Sneha ♥", "ch7": "Today — For Sneha ♥",
    "poem": "A year, in his words — For Sneha ♥",
    "letter": "The letter — For Sneha ♥", "final": "Always — For Sneha ♥",
}

# text shown between chapters in the original single page — now sits as a
# closing transition line at the bottom of the earlier page.
BETWEEN = {
    "ch1": "29 September 2025 &rarr; 24 October 2025",
    "ch2": "The journey between",
    "ch3": "The chapters no one else saw",
    "ch4": "6 February 2026 — The day everything changed",
    "ch5": "Our life, collected",
    "our-numbers": "29 September 2026 — One year later",
    "ch6": "A year, in his words",
    "ch7": "A year, in his words",
    "poem": "From him, to her",
    "letter": "And if I could go back&hellip;",
}

NEXT_LABEL = {
    "index": "Begin Our Story", "ch1": "Chapter Two", "ch2": "Chapter Three",
    "ch3": "Chapter Four", "ch4": "Chapter Five", "ch5": "Keep Going",
    "our-numbers": "Chapter Six", "ch6": "Chapter Seven", "ch7": "The Poem",
    "poem": "The Letter", "letter": "One Last Thing",
}

# ════════════════════════════════════════════════════════════
# PAGE CONTENT  (verbatim story text from the original single page)
# ════════════════════════════════════════════════════════════
CONTENT = {}

CONTENT["ch1"] = f'''
  <section class="chapter chapter-ch1" id="ch1" data-chapter="ch1">
    <div class="chapter-in">
      <span class="chapter-badge">Chapter One</span>
      <p class="date-mark">29 September 2025</p>
      <h2 class="chapter-head">The day it all began</h2>
      <p class="lede" data-reveal>Before I knew where this story was going,<br>I simply met you.</p>
    </div>

    <div class="photo-reveal" data-reveal>
      {pic("images/01-first-meeting/meeting-1.jpg", "The day we met", "polaroid tilt-card", "A day that looked ordinary. It wasn't.")}
      {pic("images/01-first-meeting/meeting-2.jpg", "The evening we met", "polaroid polaroid-alt tilt-card", "Same day. A few hours later — I was already looking forward to the next.")}
    </div>

    <p class="whisper" data-reveal>I didn't know it was the beginning.<br>I only knew something had started.</p>
  </section>
'''

CONTENT["ch2"] = f'''
  <section class="chapter chapter-ch2" id="ch2" data-chapter="ch2">
    <div class="chapter-in">
      <span class="chapter-badge">Chapter Two</span>
      <p class="date-mark">24 October 2025</p>
      <h2 class="chapter-head">The first yes</h2>
      <p class="lede" data-reveal>Our story was no longer just a meeting.<br>It became a promise.</p>
    </div>

    {pic("images/02-engagement/engagement-1.jpg", "Engagement day", "hero-photo", "A little more certain. A little more serious. A promise beginning to take shape.")}
  </section>
'''

CONTENT["ch3"] = f'''
  <section class="chapter chapter-ch3" id="ch3" data-chapter="ch3">
    <div class="chapter-in">
      <span class="chapter-badge">Chapter Three</span>
      <p class="date-mark">Somewhere in between</p>
      <h2 class="chapter-head">The journey</h2>
      <p class="lede" data-reveal>Different places. The same two people,<br>slowly becoming one story.</p>
    </div>

    <div class="scroll-gallery" data-reveal>
      {pic("images/03-journeys/journey-1.jpg", "A memory together", "scroll-card", "Another place.", sizes="220px")}
      {pic("images/03-journeys/journey-3.jpg", "A memory together", "scroll-card", "Another reason to remember.", sizes="220px")}
      {pic("images/03-journeys/journey-4.jpg", "A memory together", "scroll-card", "An ordinary day that became extraordinary because you were there.", sizes="220px")}
      {pic("images/03-journeys/journey-5.jpg", "A memory together", "scroll-card", "Another place.", sizes="220px")}
      {pic("images/03-journeys/journey-6.jpg", "A memory together", "scroll-card", "Another photograph.", sizes="220px")}
      {pic("images/03-journeys/journey-7.jpg", "A memory together", "scroll-card", "Another reason to remember.", sizes="220px")}
    </div>
    <p class="scroll-hint" data-reveal>swipe through the memories &rarr;</p>

    <div class="collage" data-reveal>
      {pic("images/04-beautiful-moments/moment-1.jpg", "A quiet moment", lightbox=True, sizes="45vw")}
      {pic("images/04-beautiful-moments/moment-2.jpg", "A quiet moment", lightbox=True, sizes="45vw")}
      {pic("images/04-beautiful-moments/moment-3.jpg", "A quiet moment", lightbox=True, sizes="45vw")}
      {pic("images/04-beautiful-moments/moment-4.jpg", "A quiet moment", lightbox=True, sizes="45vw")}
    </div>

    <p class="whisper" data-reveal>
      We didn't know the ending.<br>
      We didn't know the chapters.<br>
      We only knew that something had begun,<br>
      and we kept saying yes to it, one ordinary day at a time.
    </p>
  </section>
'''

CONTENT["ch4"] = '''
  <section class="chapter chapter-ch4" id="ch4" data-chapter="ch4">
    <div class="chapter-in">
      <span class="chapter-badge">Chapter Four</span>
      <h2 class="chapter-head">But every beautiful story<br>has difficult chapters.</h2>
    </div>

    <div class="real-story-text" data-reveal>
      <p>There were days when everything felt easy.</p>
      <p>And there were days when even understanding each other felt difficult.</p>
      <p>There were moments when my own moods became battles I didn't know how to fight &mdash;<br>
      moments when I wasn't the easiest person to love.</p>
    </div>

    <p class="stay-line" data-reveal>And yet&mdash;</p>
    <p class="stay-word" data-reveal>you stayed.</p>

    <div class="real-story-text real-story-text-2" data-reveal>
      <p>That is something I don't think I will ever be able to explain completely.</p>
      <p>Because you could have chosen differently. You had choices.<br>
      You could have walked toward an easier story.</p>
    </div>
  </section>
'''

CONTENT["ch5"] = f'''
  <section class="chapter chapter-ch5" id="ch5" data-chapter="ch5">
    <div class="chapter-in">
      <span class="chapter-badge">Chapter Five</span>
      <p class="reveal-line" data-reveal>Among all the choices life could have given you&hellip;</p>
      <p class="reveal-line reveal-strong" data-reveal>you chose me.</p>
    </div>

    <div class="chosen-lines" data-reveal-stagger>
      <p>You didn't choose a perfect man.</p>
      <p>You chose a man who is still becoming.</p>
      <p>You saw my strengths.</p>
      <p>You saw my weaknesses.</p>
      <p>And somehow&hellip;</p>
      <p class="chosen-final">you still said yes.</p>
    </div>

    <div class="date-reveal" data-reveal>
      <p class="date-huge" id="weddingDate">6<span class="date-sep">&middot;</span>02<span class="date-sep">&middot;</span>2026</p>
      <p class="date-caption">Our wedding day.</p>
    </div>

    <div class="wedding-slideshow" data-reveal>
      {pic("images/06-wedding/wedding-1.jpg", "Our wedding", lightbox=True, sizes="45vw")}
      {pic("images/06-wedding/wedding-2.jpg", "Our wedding", lightbox=True, sizes="45vw")}
      {pic("images/06-wedding/wedding-3.jpg", "Our wedding", lightbox=True, sizes="45vw")}
      {pic("images/06-wedding/wedding-4.jpg", "Our wedding", lightbox=True, sizes="45vw")}
    </div>
  </section>
'''

CONTENT["our-numbers"] = '''
  <section class="chapter chapter-warm" id="stats" data-chapter="stats">
    <div class="chapter-in" data-reveal>
      <span class="chapter-badge">A little surprise</span>
      <h2 class="chapter-head" style="color:var(--gold-soft)">A year, in numbers</h2>
    </div>
    <div class="stats-bar" data-reveal>
      <div class="stat-item">
        <div class="stat-num" data-count="365">0</div>
        <div class="stat-label">Days together</div>
      </div>
      <div class="stat-item">
        <div class="stat-num" data-count="1">0</div>
        <div class="stat-label">Wedding</div>
      </div>
      <div class="stat-item">
        <div class="stat-num" data-count="20">0</div>
        <div class="stat-label">Photographs here</div>
      </div>
      <div class="stat-item">
        <div class="stat-num" data-count="1">0</div>
        <div class="stat-label">Forever promised</div>
      </div>
    </div>
  </section>
'''

CONTENT["ch6"] = f'''
  <section class="chapter chapter-ch6" id="ch6" data-chapter="ch6">
    <div class="chapter-in">
      <span class="chapter-badge">Chapter Six</span>
    </div>

    <div class="married-gallery" data-reveal>
      {pic("images/07-married-life/married-1.jpg", "Married life", lightbox=True, sizes="45vw")}
      {pic("images/07-married-life/married-2.jpg", "Married life", lightbox=True, sizes="45vw")}
    </div>

    <div class="chapter-in" data-reveal>
      <p class="lede lede-center">Somewhere between the photographs, the journeys, the laughter,<br>
      the arguments, the silence, and the ordinary days&hellip;</p>
      <p class="lede lede-center">I realized something.</p>
      <p class="home-line">Home was never a place.</p>
      <p class="home-word">Home was you.</p>
    </div>
  </section>
'''

CONTENT["ch7"] = f'''
  <section class="chapter chapter-warm" id="ch7" data-chapter="ch7">
    <div class="chapter-in">
      <span class="chapter-badge">Chapter Seven</span>
      <p class="date-mark">29 September 2026</p>
      <p class="reveal-line" data-reveal>Today is your birthday.</p>
      <p class="reveal-line" data-reveal>But for me, this date means more than your birthday.</p>
      <p class="reveal-line" data-reveal>It reminds me of the day our story began.</p>
      <p class="reveal-line" data-reveal>A year ago, I met you.</p>
      <p class="reveal-line reveal-strong" data-reveal>Today, I get to call you my wife.</p>
    </div>

    {pic("images/08-today/today-1.jpg", "Us, today", "hero-photo hero-photo-today")}

    <h2 class="happy-birthday" data-reveal>
      Happy Birthday, Sneha <span class="heart">&hearts;</span>
    </h2>
  </section>
'''

CONTENT["poem"] = '''
  <section class="chapter chapter-poem poem-section" id="poem" data-chapter="poem">
    <p class="poem-eyebrow" data-reveal>a year, in his words</p>
    <div class="poem">
      <p data-reveal>I didn't know it was the beginning.</p>
      <p data-reveal>29 September,<br>just another date on the calendar,<br>until I met you<br>and somehow,<br>the days after that<br>started carrying your name.</p>
      <p data-reveal>We didn't know the ending.<br>We didn't know the chapters.<br>We didn't know how many photographs<br>we would collect,<br>how many roads we would travel,<br>how many ordinary moments<br>would quietly become memories.</p>
      <p data-reveal>We only knew<br>that something had begun.</p>
      <p data-reveal>Then came 24 October.</p>
      <p data-reveal>A little more certain.<br>A little more serious.<br>A promise beginning to take shape.</p>
      <p data-reveal>And somewhere between<br>the conversations,<br>the laughter,<br>the journeys,<br>the photographs,<br>the beautiful days<br>and the days we wish we could rewrite,</p>
      <p data-reveal>we became us.</p>
      <p data-reveal>Not a perfect us.<br>A real us.</p>
      <p data-reveal>There were days<br>when everything felt easy.</p>
      <p data-reveal>And there were days<br>when even understanding each other<br>felt difficult.</p>
      <p data-reveal>There were moments<br>when my own moods<br>became battles I didn't know how to fight.</p>
      <p data-reveal>Moments when I wasn't<br>the easiest person to love.</p>
      <p data-reveal>And yet&hellip;</p>
      <p data-reveal class="poem-emphasis">you stayed.</p>
      <p data-reveal>That is something<br>I don't think I will ever be able<br>to explain completely.</p>
      <p data-reveal>Because you could have chosen differently.</p>
      <p data-reveal>You had choices.</p>
      <p data-reveal>You could have walked toward<br>an easier story.</p>
      <p data-reveal>But somehow,<br>you looked at me,<br>with all my strengths,<br>all my weaknesses,<br>all the things I still need to become,</p>
      <p data-reveal>and you chose me.</p>
      <p data-reveal>Then came<br><span class="poem-date">6 February 2026</span>.</p>
      <p data-reveal>A date that changed<br>the way I say your name.</p>
      <p data-reveal>You were no longer<br>just the woman I loved.</p>
      <p data-reveal>You became my wife.</p>
      <p data-reveal>And I became the man<br>who was lucky enough<br>to call you his.</p>
      <p data-reveal>Since then,<br>we have continued collecting<br>little pieces of our life.</p>
      <p data-reveal>Photographs. Journeys. Laughter. Silences.<br>Small arguments. Small celebrations.<br>Ordinary mornings. Beautiful evenings.</p>
      <p data-reveal>Things that probably mean nothing<br>to the rest of the world,<br>but mean everything<br>to me.</p>
      <p data-reveal>Because they are ours.</p>
      <p data-reveal>And today,<br><span class="poem-date">29 September</span>,</p>
      <p data-reveal>the date where this story began,</p>
      <p data-reveal>I look at everything behind us<br>and realize something.</p>
      <p data-reveal>The greatest memory<br>is not one photograph.</p>
      <p data-reveal>It is not one place.</p>
      <p data-reveal>It is not even one perfect day.</p>
      <p data-reveal class="poem-emphasis">It is you.</p>
      <p data-reveal>You stayed<br>when I was not at my best.</p>
      <p data-reveal>You held my hand<br>through chapters<br>I wish I could have written better.</p>
      <p data-reveal>And I want you to know,</p>
      <p data-reveal>I see that.<br>I see you.<br>I see the patience.<br>I see the love.<br>I see the choice you made.</p>
      <p data-reveal>And I don't want to take<br>any of it for granted.</p>
      <p data-reveal>I know I am still becoming<br>the man I want to be.</p>
      <p data-reveal>I know there are parts of me<br>I need to change.</p>
      <p data-reveal>But I promise you this:</p>
      <p data-reveal>I will keep trying.</p>
      <p data-reveal>Not because you asked me to.</p>
      <p data-reveal>But because the life<br>we are building together<br>deserves the best version of me.</p>
      <p data-reveal>So on your birthday,<br>I don't just want to say,<br><em>&ldquo;Happy Birthday.&rdquo;</em></p>
      <p data-reveal>I want to say,<br>thank you.</p>
      <p data-reveal>Thank you for finding me.<br>Thank you for choosing me.<br>Thank you for staying.<br>Thank you for becoming my wife.</p>
      <p data-reveal>And if life gave me<br>the chance to go back,<br>back to 29 September 2025,<br>knowing everything<br>I know today&hellip;</p>
      <p data-reveal>I would still walk toward you.<br>I would still meet you.<br>I would still choose you.<br>I would still say yes.</p>
      <p data-reveal>And on 6 February 2026,<br>I would still marry you.</p>
      <p data-reveal>Because if I had<br>to live this story again,<br>I wouldn't change<br>the person beside me.</p>
      <p data-reveal>I would only try<br>to love her better.</p>
      <p data-reveal class="poem-signoff">
        Happy Birthday, Sneha.<br>
        My wife.<br>
        My favourite chapter.<br>
        And the person I would choose again.<br>
        Every time.
      </p>
    </div>
  </section>
'''

CONTENT["letter"] = '''
  <section class="chapter letter-section" id="letter" data-chapter="letter">
    <div class="letter-wrap" data-reveal>
      <p class="letter-to">Sneha,</p>
      <p>I'm not writing this because it's your birthday. I'm writing it because I don't say this often enough out loud.</p>
      <p>I know I am not perfect. I know there are parts of me I still need to work on. I know sometimes my moods become difficult, and I know that living with that isn't always easy.</p>
      <p>But I want you to know &mdash; I see your patience. I see your love. I see every single time you chose to stay in the room instead of walking out of it.</p>
      <p>I'm going through a phase right now where I don't always feel like the best version of myself. And through all of it, you have simply stayed beside me. Not because you have to. You never had to. You had other choices in life &mdash; and you chose to build yours with me anyway.</p>
      <p>That is not a small thing. I don't want to ever treat it like one.</p>
      <p>So thank you for choosing me. Thank you for becoming my wife. Thank you for walking beside me, on the easy days and the difficult ones.</p>
      <p>I promise I will keep becoming a better version of myself &mdash; not because you asked me to, but because the life we are building together deserves it.</p>
      <p class="letter-close">Happy Birthday, my Sneha.</p>
      <p class="letter-sign">&mdash; Amit &hearts;</p>
    </div>
  </section>
'''

CONTENT["final"] = '''
  <section class="chapter chapter-final final-section" id="final" data-chapter="final">
    <div class="final-lines">
      <p class="final-line" data-reveal>One last thing&hellip;</p>
      <p class="final-line" data-reveal>If I could go back to<br>29 September 2025&hellip;</p>
      <p class="final-line final-pause" data-reveal>I would meet you again.</p>
      <p class="final-line final-pause" data-reveal>I would fall for you again.</p>
      <p class="final-line final-pause" data-reveal>I would choose you again.</p>
      <p class="final-line" data-reveal>And I would still say&hellip;</p>
      <p class="final-line final-date" data-reveal>6 February 2026.</p>
      <p class="final-line final-tag" data-reveal>My wife.</p>
      <p class="final-line final-tag" data-reveal>My Sneha.</p>
      <h2 class="final-happy-bday" data-reveal id="finalBday">
        Happy Birthday, Mummy <span class="heart">&hearts;</span>
      </h2>
    </div>

    <div class="forever" data-reveal>
      <p>Forever isn't a promise about how long life will be.</p>
      <p>It is a promise about who I want beside me while I live it.</p>
    </div>

    <p class="signature" data-reveal>Amit <span class="heart">&hearts;</span> Sneha</p>

    <a class="replay-btn" id="replayBtn" href="index.html" data-reveal>
      &#8635;&nbsp;Replay Our Story
    </a>

    <footer class="footer">Made with love by Amit <span class="heart">&hearts;</span></footer>
  </section>
'''

# ════════════════════════════════════════════════════════════
# SHARED CHROME
# ════════════════════════════════════════════════════════════

def head(page_id):
    idx = ORDER.index(page_id)
    nxt = ORDER[idx + 1] if idx + 1 < len(ORDER) else None
    prefetch = f'\n<link rel="prefetch" href="{FILES[nxt]}">' if nxt else ""
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<meta name="theme-color" content="#06040a">
<meta name="description" content="A private love story — for Sneha, from Amit. Happy Birthday.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="For Sneha">

<title>{TITLES[page_id]}</title>

<link rel="manifest" href="manifest.json">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500&family=Caveat:wght@500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap" rel="stylesheet">

<link rel="stylesheet" href="style.css">{prefetch}
</head>
<body data-page="{page_id}">
'''


TOP_CHROME = '''
<div class="grain" aria-hidden="true"></div>
<div class="vignette" aria-hidden="true"></div>

<div id="cursor" aria-hidden="true"></div>
<div id="cursor-ring" aria-hidden="true"></div>

<div id="scroll-bar" aria-hidden="true"></div>

<canvas id="fireworks-canvas" aria-hidden="true"></canvas>
<canvas id="confetti-canvas" aria-hidden="true"></canvas>

<div id="particles" class="particles" aria-hidden="true"></div>
<div id="hearts-layer" aria-hidden="true"></div>

<div id="lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer">
  <img id="lightbox-img" src="" alt="">
  <p id="lightbox-caption"></p>
  <button id="lightbox-close" aria-label="Close">&#10005;</button>
  <button id="lightbox-prev" aria-label="Previous photo">&#8249;</button>
  <button id="lightbox-next" aria-label="Next photo">&#8250;</button>
</div>

<div id="toast" role="status" aria-live="polite"></div>

<div class="top-bar">
  <button id="installBtn" class="glass-btn" aria-label="Install app" title="Install app">
    <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M10 2a1 1 0 011 1v8.586l2.293-2.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 11.586V3a1 1 0 011-1zM3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/></svg>
    <span>Install</span>
  </button>
  <button id="musicBtn" class="glass-btn music-btn" aria-label="Play music" title="Play background music">
    <svg viewBox="0 0 24 24" class="icon-note">
      <path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/>
      <circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.4" fill="none"/>
    </svg>
  </button>
</div>

<audio id="bgMusic" loop preload="none">
  <source src="audio/song.mp3" type="audio/mpeg">
</audio>
'''


def progress_nav(page_id):
    dots = []
    for cid, title in DOTS:
        active = " active" if cid == page_id else ""
        dots.append(
            f'  <a class="progress-dot{active}" href="{FILES[cid]}" title="{title}" aria-label="{title}"></a>'
        )
    return '<nav class="progress" aria-label="Story chapters">\n' + "\n".join(dots) + "\n</nav>\n"


def bottom_nav(page_id):
    """Transition line (if any) + Next chapter link. First/last pages are special-cased outside."""
    strip = ""
    if page_id in BETWEEN:
        strip = f'''
  <div class="timeline-strip">
    <span class="ts-dot"></span>
    <span>{BETWEEN[page_id]}</span>
    <span class="ts-dot"></span>
  </div>
'''
    idx = ORDER.index(page_id)
    nxt = ORDER[idx + 1] if idx + 1 < len(ORDER) else None
    nav = ""
    if nxt and page_id != "final":
        nav = f'''
  <div class="chapter-nav">
    <a class="next-chapter-btn" href="{FILES[nxt]}">{NEXT_LABEL.get(page_id, "Continue")} &rarr;</a>
  </div>
'''
    return strip + nav


FOOT = '''
<script src="script.js"></script>
</body>
</html>
'''

# ════════════════════════════════════════════════════════════
# INDEX (cover + birthday modal) — special, no chapter-nav wrapper
# ════════════════════════════════════════════════════════════
INDEX_MAIN = '''
<nav class="progress" aria-label="Story chapters">
__DOTS__
</nav>

<section class="cover" id="cover" data-chapter="cover">
  <div class="cover-glow-ring" aria-hidden="true"></div>
  <div class="cover-glow-ring" aria-hidden="true"></div>

  <div class="cover-lines">
    <p class="cover-line" data-line="1">Some stories are written with words.</p>
    <p class="cover-line" data-line="2">Some are written with photographs.</p>
    <p class="cover-line" data-line="3">But ours&hellip;</p>
    <p class="cover-line" data-line="4">&hellip;was written by time.</p>
    <h1 class="cover-line for-sneha" data-line="5">
      For Sneha <span class="heart">&hearts;</span>
    </h1>
    <p class="cover-tagline" id="coverTagline">A year of love, in photographs and words.</p>
    <a class="begin-btn cover-line" data-line="6" id="beginBtn" href="ch1.html" aria-label="Begin our story">
      <span>Begin Our Story</span>
    </a>
  </div>
</section>

<div id="bday-modal" aria-modal="true" role="dialog" aria-label="Birthday surprise">
  <div class="bday-modal-inner">
    <div class="bday-balloons" aria-hidden="true">
      <span>&#127880;</span><span>&#127881;</span><span>&#127882;</span><span>&#127880;</span><span>&#128150;</span><span>&#127873;</span><span>&#127880;</span>
    </div>
    <div class="bday-cake" aria-hidden="true">&#127874;</div>
    <h2 class="bday-title">Happy Birthday<br><span class="bday-name">Sneha</span> <span class="bday-heart">&hearts;</span></h2>
    <p class="bday-sub">29 September 2026</p>
    <p class="bday-msg">
      On this special day, I want the whole world to know &mdash;<br>
      you are <em>my favourite person</em>, my home, my wife.<br>
      Every single day with you is a gift I never take for granted.<br><br>
      May this year bring you all the happiness<br>
      you so effortlessly bring to everyone around you.<br><br>
      <strong>I love you, Sneha. Always.</strong>
    </p>
    <div class="bday-stars" aria-hidden="true">&#10024; &#11088; &#127775; &#10024; &#11088;</div>
    <button id="bday-close" class="bday-close-btn">
      Open Our Story &nbsp;&hearts;
    </button>
    <p class="bday-from">&mdash; with all my love, Amit</p>
  </div>
</div>
'''


def build_index():
    dots = []
    for cid, title in DOTS:
        active = " active" if cid == "index" else ""
        dots.append(f'  <a class="progress-dot{active}" href="{FILES[cid]}" title="{title}" aria-label="{title}"></a>')
    html = head("index") + TOP_CHROME.replace(
        '<div class="top-bar">', '<div class="top-bar">'
    )
    # index gets its own progress nav + cover + modal (no shared progress_nav call,
    # it's embedded in INDEX_MAIN so the cover markup stays exactly where it was)
    html = head("index") + TOP_CHROME + INDEX_MAIN.replace("__DOTS__", "\n".join(dots)) + FOOT
    with open(FILES["index"], "w") as fh:
        fh.write(html)


def build_chapter(page_id):
    html = (
        head(page_id)
        + TOP_CHROME
        + progress_nav(page_id)
        + '\n<main id="story">\n'
        + CONTENT[page_id]
        + bottom_nav(page_id)
        + "\n</main>\n"
        + FOOT
    )
    with open(FILES[page_id], "w") as fh:
        fh.write(html)


def main():
    build_index()
    for pid in ORDER:
        if pid == "index":
            continue
        build_chapter(pid)
    print("Built:", ", ".join(FILES[p] for p in ORDER))


if __name__ == "__main__":
    main()
