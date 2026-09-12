import { useEffect, type CSSProperties } from 'react'
import { motion, MotionConfig } from 'framer-motion'
import { PROFILE, PROJECTS, type GalleryItem, type Project } from './data'
import odinCompose from './assets/odin-compose.png'
import odinVoice from './assets/odin-voice.png'
import amcDlMain from './assets/amc-download-main.png'
import amcDl1 from './assets/amc-download-1.png'
import shotAmc from './assets/shot-amc.png'
import amcLogoFull from './assets/amc-logo-full.png'
import amcYcRejection from './assets/amc-yc-rejection.png'
import monetaChat from './assets/moneta-chat.png'
import monetaShot from './assets/shot-moneta.png'
import clavDashboard from './assets/clavicular-dashboard.png'
import shotClav from './assets/shot-clavicular.png'
import oscarVideo from './assets/oscarai-vertical.mp4'
import odinDemoVideo from './assets/odin-demo-hero.mp4'
import monetaDemoVideo from './assets/moneta-demo-hero.mp4'
import valedictorianBg from './assets/valedictorian-bg.mp4'
import oscarProto1 from './assets/oscar-proto1.jpg'
import oscarProto2 from './assets/oscar-proto2.jpg'
import oscarProto3 from './assets/oscar-proto3.jpg'
import oscarProto4 from './assets/oscar-proto4.jpg'
import oscarVirsf from './assets/oscar-virsf.jpg'
import oscarIngenious from './assets/oscar-ingenious.jpeg'
import oscarShot from './assets/shot-oscarai.png'
import cgShot from './assets/shot-commongap.png'
import pressBi from './assets/press-business-insider.jpg'
import './portfolio.css'

const ease = [0.22, 1, 0.36, 1] as const

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

type HeroShot = {
  src: string
  alt: string
  kind: 'image' | 'video'
  /* Optional per-shot size/position/roundness override. Default is a full
   * fill of the blob's frame (matches every project except OscarAI). When
   * set, a piece can be smaller or offset so the cluster doesn't just look
   * like one fixed rectangle swapping its picture — different shots read
   * as genuinely different shapes landing in slightly different spots. */
  fit?: { w?: number; h?: number; x?: number; y?: number; radius?: string }
  /* Optional object-position override (e.g. '30% 50%'). The shape default
   * (top-biased for wide shots, centered for portrait) is right most of
   * the time, but a few screenshots have their key content — a logo, a
   * face — closer to one edge than the crop math assumes. */
  focus?: string
}

/* Explicit shots so each cluster shows real product frames. Odin and
 * Moneta lead with their actual demo clips (self-hosted, trimmed from the
 * YouTube demos) rather than a static thumbnail standing in for video —
 * video plays first, stills follow. */
const HERO_SHOTS: Record<string, HeroShot[]> = {
  odin: [
    { src: odinDemoVideo, alt: 'Odin demo', kind: 'video' },
    { src: odinCompose, alt: 'Odin compose mode', kind: 'image' },
    { src: odinVoice, alt: 'Odin voice graph', kind: 'image' },
  ],
  amc: [
    // This blob's box is narrower than the screenshot, so it crops the
    // sides — biased left so the NYU crest at the far left edge survives.
    { src: amcDlMain, alt: 'AMC Academy website', kind: 'image', focus: '30% 50%' },
    { src: shotAmc, alt: 'AMC Academy website, USAJMO page', kind: 'image', focus: '25% 30%' },
    {
      src: amcYcRejection,
      alt: 'Y Combinator rejection email for AMC Academy',
      kind: 'image',
      focus: '50% 12%',
    },
    { src: amcDl1, alt: 'AMC Academy student spotlight', kind: 'image' },
    { src: amcLogoFull, alt: 'AMC Academy logo mark', kind: 'image' },
  ],
  moneta: [
    { src: monetaDemoVideo, alt: 'Moneta demo', kind: 'video' },
    { src: monetaChat, alt: 'Moneta memory graph', kind: 'image' },
    { src: monetaShot, alt: 'Moneta landing', kind: 'image' },
  ],
  clavicular: [
    { src: clavDashboard, alt: 'Clavicular dashboard', kind: 'image' },
    { src: shotClav, alt: 'Clavicular landing', kind: 'image' },
  ],
  /* OscarAI has by far the deepest archive (four hardware generations plus
   * award photos and the site), so it cycles fast and each shot claims a
   * different slice of the frame instead of uniformly replacing the same
   * rectangle. */
  oscarai: [
    { src: oscarVideo, alt: 'OscarAI demo', kind: 'video' },
    { src: oscarProto1, alt: 'OscarAI first cardboard prototype', kind: 'image', fit: { w: 92, h: 74, x: 0, y: -10, radius: '1rem' } },
    { src: oscarProto2, alt: 'OscarAI wooden prototype', kind: 'image', fit: { w: 68, h: 96, x: 12, y: 0, radius: '2.6rem' } },
    { src: oscarProto3, alt: 'OscarAI sorting mechanism', kind: 'image', fit: { w: 82, h: 58, x: -6, y: 16, radius: '3rem' } },
    { src: oscarProto4, alt: 'OscarAI metal prototype', kind: 'image', fit: { w: 58, h: 100, x: -14, y: -2, radius: '1.6rem' } },
    { src: oscarVirsf, alt: 'OscarAI at the Vancouver Island Regional Science Fair', kind: 'image', fit: { w: 96, h: 68, x: 2, y: 18, radius: '1.1rem' } },
    { src: oscarIngenious, alt: 'OscarAI receiving the Ingenious+ award', kind: 'image', fit: { w: 64, h: 92, x: 10, y: -6, radius: '2.2rem' } },
    { src: oscarShot, alt: 'OscarAI website', kind: 'image', fit: { w: 90, h: 80, x: -4, y: 8, radius: '1.3rem' } },
  ],
  commongap: [
    { src: cgShot, alt: 'Common Gap website', kind: 'image' },
    { src: pressBi, alt: 'Common Gap in Business Insider', kind: 'image' },
  ],
}

/* Landscape frames for UI screenshots; Oscar stays tall because the demo is
 * vertical. Positions sit in the corners and edges of the hero stage —
 * nothing circles the name — and each piece fades into and out of view on
 * its own clock, like a row of studio logos materializing. Dimensions,
 * tilt, and roundness are all deliberately mismatched per item — funky,
 * not a uniform grid of identical cards.
 *
 * Each project gets a *pair* of blobs — a main one plus a smaller accent
 * nested right against it — instead of a single spot that just swaps its
 * picture. The accent sits close enough to overlap the main piece's edge
 * (a stacked-photos look, both clearly reading as "one section's stuff")
 * rather than drifting off into open space. The two independently fade
 * in/out and each crossfades through its own slice of that project's
 * shots (see chunkShots below), so a section reads as a small cluster of
 * things happening at once rather than one thing alternating. */
const HERO_LAYOUT: {
  id: string
  x: number
  y: number
  w: number
  h: number
  shape: 'wide' | 'portrait'
  rot: number
  radius: string
}[] = [
  { id: 'odin', x: 14, y: 15, w: 48, h: 31, shape: 'wide', rot: -7, radius: '2.4rem' },
  { id: 'odin', x: 25, y: 27, w: 25, h: 18, shape: 'wide', rot: 11, radius: '1.4rem' },

  { id: 'amc', x: 86, y: 14, w: 38, h: 26, shape: 'wide', rot: 5, radius: '1.1rem' },
  { id: 'amc', x: 77, y: 24, w: 25, h: 18, shape: 'wide', rot: -9, radius: '2.2rem' },

  { id: 'moneta', x: 91, y: 49, w: 32, h: 30, shape: 'wide', rot: -4, radius: '3rem' },
  { id: 'moneta', x: 81, y: 59, w: 24, h: 17, shape: 'wide', rot: 9, radius: '1rem' },

  { id: 'clavicular', x: 86, y: 86, w: 43, h: 22, shape: 'wide', rot: 8, radius: '1rem' },
  { id: 'clavicular', x: 75, y: 76, w: 25, h: 18, shape: 'wide', rot: -7, radius: '2.4rem' },

  { id: 'oscarai', x: 14, y: 86, w: 23, h: 39, shape: 'portrait', rot: -9, radius: '2rem' },
  { id: 'oscarai', x: 25, y: 74, w: 22, h: 27, shape: 'portrait', rot: 8, radius: '1.6rem' },

  { id: 'commongap', x: 8, y: 50, w: 28, h: 36, shape: 'wide', rot: 6, radius: '1.6rem' },
  { id: 'commongap', x: 19, y: 61, w: 23, h: 17, shape: 'wide', rot: -9, radius: '1rem' },
]

/* Splits a project's shot list into `parts` roughly-even, contiguous
 * chunks and returns the one at `part` — so a project's main and accent
 * blobs each cycle through a distinct slice of its media instead of
 * showing the exact same thing twice. When there aren't enough shots to
 * give every part at least two (too few to actually alternate), the main
 * slot (part 0) keeps the whole cycling set and the accent slots each get
 * a single static highlight instead of losing the crossfade entirely. */
function chunkShots(shots: HeroShot[], parts: number, part: number): HeroShot[] {
  if (parts <= 1 || shots.length === 0) return shots
  if (shots.length < parts * 2) {
    return part === 0 ? shots : [shots[shots.length - 1]]
  }
  const size = Math.ceil(shots.length / parts)
  const slice = shots.slice(part * size, part * size + size)
  return slice.length > 0 ? slice : [shots[shots.length - 1]]
}

function HeroMedia({ shot, className }: { shot: HeroShot; className: string }) {
  const style = shot.focus ? { objectPosition: shot.focus } : undefined
  if (shot.kind === 'video') {
    return (
      <video
        className={className}
        src={shot.src}
        style={style}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
    )
  }
  return <img className={className} src={shot.src} alt="" draggable={false} style={style} />
}

function OrbitingCluster({
  slot,
  index,
  groupIndex,
  groupSize,
}: {
  slot: (typeof HERO_LAYOUT)[number]
  index: number
  groupIndex: number
  groupSize: number
}) {
  const project = PROJECTS.find((p) => p.id === slot.id)
  const allShots = HERO_SHOTS[slot.id] ?? []
  const shots = chunkShots(allShots, groupSize, groupIndex)
  if (!project || shots.length === 0) return null
  // OscarAI has enough shots that the normal, slower per-index pacing would
  // leave each one on screen far too long — it gets its own fast pace tied
  // to how many shots it actually has instead.
  const shotCycle = slot.id === 'oscarai' ? shots.length * 1.6 : 16 + index * 2.1
  // Gentle, per-item drift so the pieces aren't pinned dead-still — small
  // wobble in position and tilt, never the same rhythm twice.
  const driftX = 2.4 + (index % 3) * 1.1
  const driftY = -2.6 - (index % 2) * 1.6
  const driftDur = 9 + index * 1.7

  return (
    <div
      className={`pf-blob pf-shape-${slot.shape}`}
      style={
        {
          '--x': `${slot.x}%`,
          '--y': `${slot.y}%`,
          '--blob-w': `${slot.w}vmin`,
          '--blob-h': `${slot.h}vmin`,
          '--fade-dur': `${18 + index * 2.3}s`,
          '--in-delay': `${index * 1.1}s`,
          '--radius': slot.radius,
          '--rotate-start': `${slot.rot - 2.5}deg`,
          '--rotate-end': `${slot.rot + 2.5}deg`,
          '--drift-x': `${driftX}%`,
          '--drift-y': `${driftY}%`,
          '--drift-dur': `${driftDur}s`,
        } as CSSProperties
      }
    >
      <div className="pf-blob-face">
        <button
          type="button"
          className="pf-blob-btn"
          onClick={() => scrollToId(project.id)}
          aria-label={`View ${project.name}`}
        >
          {/* Every shot for this project crossfades in turn, evenly spaced
              across one shared cycle. Most projects stack full-bleed in
              the same spot; a shot with a `fit` override instead claims
              its own smaller, offset slice of the frame. */}
          {shots.map((shot, i) => {
            const w = shot.fit?.w ?? 100
            const h = shot.fit?.h ?? 100
            const offX = shot.fit?.x ?? 0
            const offY = shot.fit?.y ?? 0
            return (
              <span
                key={shot.src}
                className={`pf-piece pf-piece-cycle-${shots.length}`}
                style={
                  {
                    '--shot-cycle': `${shotCycle}s`,
                    '--shot-delay': `${(i * shotCycle) / shots.length}s`,
                    width: `${w}%`,
                    height: `${h}%`,
                    top: `${50 + offY - h / 2}%`,
                    left: `${50 + offX - w / 2}%`,
                    right: 'auto',
                    bottom: 'auto',
                    ...(shot.fit?.radius ? { borderRadius: shot.fit.radius } : {}),
                  } as CSSProperties
                }
              >
                <HeroMedia shot={shot} className="pf-blob-shot" />
              </span>
            )
          })}
        </button>
      </div>
    </div>
  )
}

function HeroSpeechBackdrop() {
  // Self-hosted clip instead of a YouTube iframe — a cross-origin iframe's
  // rendered pixels don't reliably take CSS opacity/mix-blend-mode, and a
  // plain .mp4 has no alpha channel to begin with. Real per-pixel keying
  // was tried (ffmpeg lumakey) and rejected: the subject is in a black
  // graduation gown against a black backdrop, so keying out "black" eats
  // holes straight through him too. Instead the whole frame dissolves into
  // the page at its edges (mask fade, heaviest on the bottom border) and a
  // second star layer is painted *on top* of the video (screen-blended) so
  // the starfield visually sits over the footage rather than needing to
  // show through it.
  return (
    <div className="pf-hero-bg" aria-hidden>
      <div className="pf-hero-bg-frame">
        <video
          src={valedictorianBg}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          tabIndex={-1}
        />
      </div>
      <div className="pf-hero-bg-dim" />
      <div className="pf-hero-bg-stars" />
    </div>
  )
}

/* Every HERO_LAYOUT entry sharing an id is one "group" for that project —
 * this walks the array once and tags each entry with its position within
 * its own group (groupIndex) and how many siblings it has (groupSize), so
 * OrbitingCluster knows which slice of that project's shots to show. */
const HERO_LAYOUT_WITH_GROUPS = (() => {
  const sizes: Record<string, number> = {}
  HERO_LAYOUT.forEach((slot) => {
    sizes[slot.id] = (sizes[slot.id] ?? 0) + 1
  })
  const seen: Record<string, number> = {}
  return HERO_LAYOUT.map((slot) => {
    const groupIndex = seen[slot.id] ?? 0
    seen[slot.id] = groupIndex + 1
    return { slot, groupIndex, groupSize: sizes[slot.id] }
  })
})()

function HeroConstellation() {
  return (
    <div className="pf-hero-stage">
      <div className="pf-hero-orbit">
        {HERO_LAYOUT_WITH_GROUPS.map(({ slot, groupIndex, groupSize }, index) => (
          <OrbitingCluster
            key={`${slot.id}-${groupIndex}`}
            slot={slot}
            index={index}
            groupIndex={groupIndex}
            groupSize={groupSize}
          />
        ))}
      </div>

      <div className="pf-hero-core">
        <h1 className="pf-name">
          <span>Ethan</span>
          <span>Curtis</span>
        </h1>
      </div>
    </div>
  )
}

function GalleryCard({ item, span }: { item: GalleryItem; span: number }) {
  const inner = (
    <>
      <img
        src={item.src}
        alt={item.alt}
        loading="lazy"
        style={item.focus ? { objectPosition: item.focus } : undefined}
      />
      {item.kind === 'press' ? (
        <div className="pf-gal-overlay pf-gal-overlay-press">
          <span className="pf-gal-outlet">{item.outlet}</span>
          <span className="pf-gal-headline">{item.headline}</span>
        </div>
      ) : (
        item.caption && (
          <div className="pf-gal-overlay">
            <span className="pf-gal-cap">{item.caption}</span>
          </div>
        )
      )}
    </>
  )

  const contain = item.fit === 'contain' ? ' pf-gal-contain' : ''
  const className = `pf-gal-card pf-gal-${item.kind} pf-gal-span-${span}${contain}`
  if (item.href) {
    return (
      <a className={className} href={item.href} target="_blank" rel="noreferrer">
        {inner}
      </a>
    )
  }
  return <div className={className}>{inner}</div>
}

/*
 * Lay gallery items out on a 12-column grid so every row is completely
 * filled — press features pair up two per row, everything else flows in
 * rows of up to four. This is what keeps the mosaic seamless.
 */
function layoutGallery(gallery: GalleryItem[]): { item: GalleryItem; span: number }[] {
  // One press + one product (or any pair) should sit on one row, not stack.
  if (gallery.length === 2) {
    return gallery.map((item) => ({ item, span: 6 }))
  }

  // Hero + pair: the first item is the main cover, the other two sit
  // evenly underneath. Used by AMC Academy (site, email, interview).
  if (gallery.length === 3) {
    return [
      { item: gallery[0], span: 12 },
      { item: gallery[1], span: 6 },
      { item: gallery[2], span: 6 },
    ]
  }

  const press = gallery.filter((g) => g.kind === 'press')
  const rest = gallery.filter((g) => g.kind !== 'press')

  const placed: { item: GalleryItem; span: number }[] = []

  for (let i = 0; i < press.length; i += 2) {
    const pair = press.slice(i, i + 2)
    const span = pair.length === 2 ? 6 : 12
    pair.forEach((item) => placed.push({ item, span }))
  }

  const rowSizes: number[] = []
  let n = rest.length
  while (n > 0) {
    if (n === 5) {
      rowSizes.push(3, 2)
      n = 0
    } else if (n % 4 === 0) {
      rowSizes.push(4)
      n -= 4
    } else if (n % 3 === 0) {
      rowSizes.push(3)
      n -= 3
    } else if (n <= 4) {
      rowSizes.push(n)
      n = 0
    } else {
      rowSizes.push(4)
      n -= 4
    }
  }

  let idx = 0
  for (const size of rowSizes) {
    const span = 12 / size
    for (let i = 0; i < size; i += 1) {
      placed.push({ item: rest[idx], span })
      idx += 1
    }
  }

  return placed
}

/*
 * Variant used when a portrait demo video is woven into the mosaic:
 * the video occupies a 4-column, 2-row slot on the left, the next four
 * items fill the two rows beside it, and the rest flow below.
 */
function layoutGalleryWithVideo(gallery: GalleryItem[]): { item: GalleryItem; span: number }[] {
  const beside = gallery.slice(0, 4).map((item) => ({ item, span: 4 }))
  const below = layoutGallery(gallery.slice(4))
  return [...beside, ...below]
}

function Gallery({ gallery, videoSrc }: { gallery: GalleryItem[]; videoSrc?: string }) {
  const placed = videoSrc ? layoutGalleryWithVideo(gallery) : layoutGallery(gallery)
  return (
    <div className={`pf-gallery${videoSrc ? ' pf-gallery-feature' : ''}`}>
      {videoSrc && (
        <div className="pf-gal-card pf-gal-video">
          <video src={videoSrc} autoPlay muted loop playsInline preload="metadata" />
        </div>
      )}
      {placed.map(({ item, span }) => (
        <GalleryCard key={item.src + (item.headline || item.caption || item.alt)} item={item} span={span} />
      ))}
    </div>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="pf-bullets">
      {items.map((b) => (
        <li key={b}>{b}</li>
      ))}
    </ul>
  )
}

function MediaLinks({ media }: { media: Project['media'] }) {
  if (media.length === 0) return null
  return (
    <div className="pf-block-links">
      {media.map((m) => (
        <a key={m.href + m.label} href={m.href} target="_blank" rel="noreferrer">
          {m.label}
        </a>
      ))}
    </div>
  )
}

function ProjectVideo({ project }: { project: Project }) {
  const isPortrait = project.videoAspect === 'portrait'

  if (project.videoSrc) {
    return (
      <div className={`pf-block-video${isPortrait ? ' pf-block-video-portrait' : ''}`}>
        <video src={project.videoSrc} controls playsInline preload="metadata" />
      </div>
    )
  }

  if (project.videoEmbed) {
    // Muted, chromeless auto-loop — YouTube requires the playlist param
    // set to the video's own id for looping to work.
    const videoId = project.videoEmbed.split('/').pop()
    const src = `${project.videoEmbed}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&playsinline=1&rel=0&modestbranding=1`
    return (
      <div className="pf-block-video">
        <iframe
          src={src}
          title={`${project.name} demo`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
        />
      </div>
    )
  }

  return null
}

function ProjectBlock({ project, index }: { project: Project; index: number }) {
  // Portrait demo videos with a rich gallery get woven into the mosaic
  // instead of sitting beside the copy (which leaves dead space).
  const videoInGallery = Boolean(
    project.videoSrc && project.videoAspect === 'portrait' && project.gallery.length >= 4,
  )
  const hasVideo = !videoInGallery && Boolean(project.videoEmbed || project.videoSrc)
  const isPortraitVideo = project.videoAspect === 'portrait'
  const galleryBelow =
    project.galleryBelow || videoInGallery || project.gallery.length > 2

  return (
    <motion.article
      className={`pf-block${hasVideo ? ' pf-block-has-video' : ''}`}
      id={project.id}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease, delay: Math.min(index * 0.03, 0.12) }}
    >
      <header className="pf-block-head">
        <span className="pf-block-num" aria-hidden>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="pf-block-titles">
          <h3 className="pf-block-name">
            {project.name}
            {project.url && (
              <a className="pf-block-url" href={project.url} target="_blank" rel="noreferrer">
                {project.urlLabel ?? project.url}
              </a>
            )}
          </h3>
          <p className="pf-block-tag">{project.tagline}</p>
        </div>
      </header>

      {hasVideo ? (
        <>
          <div className={`pf-block-split${isPortraitVideo ? ' pf-block-split-portrait' : ''}`}>
            <div className="pf-block-video-wrap">
              <ProjectVideo project={project} />
            </div>
            <div className="pf-block-copy">
              <p className="pf-block-desc">{project.description}</p>
              <BulletList items={project.bullets} />
              <MediaLinks media={project.media} />
            </div>
          </div>
          {project.gallery.length > 0 && (
            <div className="pf-gallery-below">
              <Gallery gallery={project.gallery} />
            </div>
          )}
        </>
      ) : galleryBelow ? (
        <>
          <div className="pf-block-copy pf-block-copy-wide">
            <p className="pf-block-desc">{project.description}</p>
            <BulletList items={project.bullets} />
            <MediaLinks media={project.media} />
          </div>
          <div className="pf-gallery-below">
            <Gallery gallery={project.gallery} videoSrc={videoInGallery ? project.videoSrc : undefined} />
          </div>
        </>
      ) : (
        <div className="pf-block-body">
          <div className="pf-block-copy">
            <p className="pf-block-desc">{project.description}</p>
            <BulletList items={project.bullets} />
            <MediaLinks media={project.media} />
          </div>
          {project.gallery.length > 0 && <Gallery gallery={project.gallery} />}
        </div>
      )}
    </motion.article>
  )
}

export default function PortfolioApp() {
  useEffect(() => {
    document.title = 'Ethan Curtis'
  }, [])

  return (
    <MotionConfig reducedMotion="never">
      <div className="pf">
        <div className="pf-cover">
          <HeroSpeechBackdrop />
          <div className="pf-shell pf-shell-nav">
            <nav className="pf-nav">
              <a className="pf-nav-brand" href="#top">
                Ethan Curtis
              </a>
              <div className="pf-nav-links">
                <motion.button
                  type="button"
                  className="pf-nav-link"
                  onClick={() => scrollToId('work')}
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.15, ease }}
                >
                  Work
                </motion.button>
                <motion.a
                  className="pf-nav-link pf-nav-cta"
                  href="https://www.linkedin.com/in/futuretonystark"
                  target="_blank"
                  rel="noreferrer"
                  whileTap={{ scale: 0.88 }}
                  transition={{ duration: 0.15, ease }}
                >
                  LinkedIn
                </motion.a>
              </div>
            </nav>
          </div>

          <header className="pf-hero" id="top">
            <motion.div
              className="pf-hero-map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.05, ease }}
            >
              <HeroConstellation />
            </motion.div>

            <motion.div
              className="pf-hero-foot"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.07, delayChildren: 0.35 } },
              }}
            >
              <motion.p
                className="pf-kicker"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
                }}
              >
                {PROFILE.title}
              </motion.p>
              <motion.div
                className="pf-scroll-cue"
                variants={{
                  hidden: { opacity: 0, y: 12 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease } },
                }}
              >
                <button
                  type="button"
                  className="pf-scroll-cue-btn"
                  onClick={() => scrollToId('work')}
                  aria-label="Scroll to work"
                >
                  <svg viewBox="0 0 24 24" fill="none" aria-hidden>
                    <path
                      d="M5 9l7 7 7-7"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </motion.div>
            </motion.div>
          </header>
        </div>

        <div className="pf-shell">
          <section className="pf-section" id="work">
            <div className="pf-section-head">
              <h2 className="pf-section-title">Work</h2>
              <p className="pf-section-note">Six projects, from first prototype to press coverage.</p>
            </div>
            <div className="pf-stack">
              {PROJECTS.map((p, i) => (
                <ProjectBlock key={p.id} project={p} index={i} />
              ))}
            </div>
          </section>

          <footer className="pf-footer">© {new Date().getFullYear()} Ethan Curtis · ethancurtis</footer>
        </div>
      </div>
    </MotionConfig>
  )
}
