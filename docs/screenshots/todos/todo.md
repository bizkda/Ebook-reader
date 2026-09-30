Phase 1: quick wins that match the biggest complaints

Night reading

 Add a "dim below system minimum" overlay, since people complain the lowest phone brightness is still too bright
 Add a true-black theme (good for OLED) and a sepia theme
 Add custom text and background colors
 Schedule auto night mode, or follow the system theme

Reading controls

 Add a toggle between paged and scroll mode
 Add volume-button page turning on Android
 Add an option to turn off page animations
 Add an orientation lock
 Add a keep-screen-on option and configurable tap zones

Text comfort (EPUB)

 Add font family, size, line spacing, margins and justify on/off
 Add a dyslexia-friendly font option (OpenDyslexic)
 Add a progress indicator (percent, chapter, time left)

Never lose progress

 Save the last reading position per book and resume automatically
 Add highlights and notes, stored locally with unique IDs
 Add a "Back up everything" button that exports library metadata, progress, bookmarks and highlights to one file
 Add an "Export highlights" button (Markdown/JSON)
Phase 2: fix the big pain points

PDFs on small screens

 Add fit-to-width and auto-crop margins
 Remember the zoom and pan between pages, so users don't have to rescroll on every page
 Add a reflow mode for text-based PDFs that extracts the text and lets users resize fonts. Scanned PDFs and diagram-heavy ones will still need zoom, so say so in the UI
 Optional: convert text PDFs to EPUB. This is hard to do well, so treat it as a stretch goal

Sync without a server

 Let users pick a sync folder, so Syncthing, Nextcloud or Google Drive can do the syncing
 Store highlights and progress as append-only entries with IDs and timestamps, so merges don't duplicate or delete them
 Use last-write-wins per book for reading position
 Show a "last synced" status

Text-to-speech

 Use system TTS (Android TextToSpeech, and the OS speech engine on desktop), with speed control and a sleep timer
 Highlight the sentence being read and keep playing in the background
 Optional: let users plug in an offline neural voice engine such as Piper for more natural sound

Focus mode

 Add an immersive full-screen mode that hides the status bar
 Offer a prompt to turn on Do Not Disturb on Android
 Add a reading session timer and optional daily goal
Phase 3: differentiators
 Support more formats: MOBI/AZW3 (DRM-free), FB2, CBZ and TXT
 Add collections/tags, sorting, cover extraction, and a watch folder for auto-import
 Add OPDS support, so users can browse free catalogs (Standard Ebooks, Project Gutenberg) inside the app
 Add in-book search, table of contents, footnote popups and dictionary lookup
 Add reading stats

Ownership and privacy

 Keep the original book files in a visible folder and never lock them into a private format
 Put "no ads, no account, offline-first" in your README, since users ask for this
 I'd skip DRM removal. It's legally risky, and DRM-free sources plus OPDS serve the same need safely
Phase 4: stability, because update bugs were a top complaint
 Back up data automatically and run schema migrations before each update
 Add a "Copy debug log" button in settings for bug reports
 Collect a test set (huge PDFs, odd EPUBs, non-Latin text) and run it before each release
 Fix the Android CI signing step so releases are consistent
 Publish a changelog and add an update check
 Consider F-Droid distribution, which fits open-source readers well
 Add accessibility basics: screen-reader labels, high contrast and large text

If