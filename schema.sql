-- Speak in Urdu — database schema
--
-- How to use:
--   1. In Hostinger hPanel, go to Databases > Management and open phpMyAdmin
--      for the database you created (see SETUP.md for the full steps).
--   2. Click the "SQL" tab.
--   3. Paste this whole file in and click "Go".
--
-- This creates three tables — one per form on the site. Every submission
-- is saved here permanently, in addition to the email notification you
-- already get, so nothing is lost if an email fails to send.

CREATE TABLE IF NOT EXISTS bookings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(40) NOT NULL,
  age INT NOT NULL,
  gender VARCHAR(40) NOT NULL,
  country VARCHAR(80) NOT NULL,
  timezone VARCHAR(80) NOT NULL,
  class_time VARCHAR(200) NULL,
  course VARCHAR(120) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Already ran this file before phone numbers were added? `CREATE TABLE IF
-- NOT EXISTS` above won't touch your existing table, so run this once to
-- add the column to it. Safe to skip entirely on a brand-new database —
-- the CREATE TABLE above already includes `phone`.
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS phone VARCHAR(40) NOT NULL DEFAULT '' AFTER email;

CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(200) NOT NULL,
  phone VARCHAR(40) NULL,
  timezone VARCHAR(80) NULL,
  message TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Already ran this file before phone numbers were added to the contact
-- form? Run this once to add the column to your existing `contacts` table.
-- Safe to skip on a brand-new database — the CREATE TABLE above already
-- includes `phone`. (Nullable here since the contact form's phone field
-- is optional, unlike the booking form's.)
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS phone VARCHAR(40) NULL AFTER email;

CREATE TABLE IF NOT EXISTS newsletter_signups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  slug VARCHAR(160) NOT NULL UNIQUE,
  title VARCHAR(200) NOT NULL,
  category VARCHAR(60) NOT NULL,
  excerpt VARCHAR(500) NOT NULL,
  cover_image VARCHAR(500) NULL,
  author_name VARCHAR(120) NOT NULL DEFAULT 'Speak in Urdu Team',
  body LONGTEXT NOT NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published, created_at);

-- Seed data — the blog articles that used to be hardcoded in the React app,
-- now moved into the database so the client can edit/add posts from
-- /admin.php without a developer or a site rebuild. Safe to re-run: uses
-- INSERT IGNORE, so it won't duplicate rows if you paste this file in twice.
INSERT IGNORE INTO posts (slug, title, category, excerpt, cover_image, author_name, body, published, created_at) VALUES
(
  'start-learning-urdu-from-zero',
  'How to Start Learning Urdu From Absolute Zero',
  'Learn Urdu',
  'Never seen the Urdu script before? Here''s a calm, realistic first month that takes you from the alphabet to your first sentences.',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1100&q=80',
  'Ustadha Ayesha K.',
  'If Urdu looks like beautiful but unreadable calligraphy right now, you''re exactly where almost every one of our students started. The good news: Urdu is remarkably learnable when you follow a clear order instead of jumping around.

## Week 1 — Meet the sounds, not the whole alphabet

Urdu has 39 letters, but you don''t memorize them like a list. Start with the most common sounds and the way letters change shape at the beginning, middle, and end of a word. Ten minutes of tracing a day beats an hour of cramming.

## Week 2 — Read three-letter words

Once a handful of letters feel familiar, you''ll read your first real words. This is the moment students light up — the squiggles become language.

URDU: سلام | salaam | peace / hello

## Weeks 3–4 — Your first sentences

With a small set of words plus two or three verbs, you can already introduce yourself and ask simple questions. Speaking early — even badly — is what makes it stick.

TIP: Don''t try to learn reading, writing, and speaking all at once from day one. Lead with sounds and speaking; let reading and writing follow. A teacher sequences this for you automatically.

That''s the whole secret of a good first month: small daily contact, in the right order, with someone to correct you gently.',
  1,
  '2026-06-28 09:00:00'
),
(
  'urdu-alphabet-explained',
  'The Urdu Alphabet, Gently Explained',
  'Learn Urdu',
  'Why do letters change shape? What''s a nuqta? A friendly tour of the script written for people who''ve never read right-to-left.',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1100&q=80',
  'Ustadha Hina N.',
  'Urdu is written right-to-left in the flowing Nastaliq style. Two ideas make the whole script suddenly make sense.

## 1. Letters change shape by position

Most letters have an initial, medial, and final form. They''re the same letter — just joined differently depending on where they sit in the word. Once you see it, you can''t un-see it.

## 2. Dots (nuqte) do a lot of work

Several letters share the same base shape and are told apart only by the number and position of their dots. Learn the base shapes first; the dots come naturally after.

TIP: Practice by writing your own name. It''s the single most motivating first exercise there is.',
  1,
  '2026-06-20 09:00:00'
),
(
  'urdu-verb-tenses-basics',
  'Urdu Verb Tenses Without the Panic',
  'Grammar',
  'Present, past, future — Urdu tenses are more regular than English. Here''s the pattern that unlocks all three.',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1100&q=80',
  'Ustad Bilal R.',
  'English learners are often relieved to find that Urdu verbs follow tidy patterns. Master one root and you can build a lot.

## The core idea: root + ending

Urdu verbs are built from a root that takes predictable endings for gender, number, and tense. Once the endings are familiar, new verbs slot straight in.

URDU: میں پڑھتا ہوں | main parhta hoon | I read / I am reading (masculine speaker)

Notice how the verb ending agrees with the speaker. That agreement is the one habit worth drilling early — it shows up everywhere.

TIP: Learn verbs in full short sentences, never as bare dictionary forms. Your brain remembers patterns, not lists.',
  1,
  '2026-06-12 09:00:00'
),
(
  'gender-in-urdu-grammar',
  'Grammatical Gender in Urdu: A Practical Guide',
  'Grammar',
  'Every Urdu noun is masculine or feminine, and it changes the words around it. Here''s how to stop guessing.',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1100&q=80',
  'Ustad Tariq F.',
  'Gender in Urdu isn''t about meaning — it''s a grammatical category that affects adjectives and verbs. The trick is to learn each noun together with its gender from the start.

- Learn the noun and its gender as one unit, like a single flashcard.
- Watch the adjective ending — it shifts to agree with the noun.
- Read and listen a lot; agreement becomes intuition faster than you''d expect.

TIP: When you meet a new noun, immediately say a tiny phrase with an adjective. The ending will lock the gender into memory.',
  1,
  '2026-05-30 09:00:00'
),
(
  '100-everyday-urdu-words',
  'The First 100 Urdu Words Worth Knowing',
  'Vocabulary',
  'Vocabulary is leverage. These everyday words appear constantly — learn them and you''ll understand far more than 100 words'' worth.',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1100&q=80',
  'Ustadha Maria J.',
  'Not all words are equal. A small core of high-frequency words carries an outsized share of everyday conversation. Start here rather than with random lists.

## Greetings and courtesy

URDU: شکریہ | shukriya | thank you

## People and family

Family words come up constantly — especially for heritage learners reconnecting with relatives. They''re emotional, memorable, and immediately useful.

TIP: Group new words by theme, not alphabetically. Themed clusters stick because your brain links them together.',
  1,
  '2026-05-22 09:00:00'
),
(
  'reading-ghalib-for-beginners',
  'Reading Ghalib: An Invitation for Beginners',
  'Urdu Poetry',
  'Classical Urdu poetry can feel intimidating. Start with one line, one image, and let the language do the rest.',
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1100&q=80',
  'Ustad Tariq F.',
  'Mirza Ghalib (1797–1869) is the poet many learners fall in love with. Because his work is more than a century and a half old, it sits firmly in the public domain — and it''s a wonderful, safe place to begin reading real poetry.

You don''t need advanced Urdu to feel a couplet. Start with a single, famous line and read it slowly, aloud.

> ہزاروں خواہشیں ایسی کہ ہر خواہش پہ دم نکلے | Mirza Ghalib

Transliterated: hazaaron khwahishen aisi ke har khwahish pe dam nikle — ''a thousand desires, each one enough to take my breath.'' Notice how much feeling rides on a handful of words.

TIP: Read classical couplets out loud before you fully understand them. The rhythm teaches your ear, and meaning follows.

In our Advanced course we read Ghalib and other classical poets line by line — never rushing, always savoring.',
  1,
  '2026-05-10 09:00:00'
),
(
  'why-urdu-poetry-matters',
  'Why Urdu Poetry Still Moves Millions',
  'Urdu Poetry',
  'From mushairas to song lyrics, poetry is woven into daily life. Understanding a little unlocks a whole culture.',
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1100&q=80',
  'Ustadha Sana M.',
  'In much of South Asia, poetry isn''t a niche hobby — it''s everywhere: in conversation, in film songs, in the way people express love and grief. Learning even a little transforms how you hear the language.

## The ghazal, briefly

The ghazal is a form of independent couplets bound by rhyme and refrain. Each couplet can stand alone, which is why single lines travel so well through culture.

TIP: You''ll enjoy poetry far sooner if you learn to read the script fluently first. Reading speed is what lets the music come through.',
  1,
  '2026-04-28 09:00:00'
),
(
  'urdu-culture-etiquette',
  'Urdu Culture & Etiquette: What Learners Should Know',
  'Culture',
  'Language and culture travel together. A few customs around greetings, hospitality, and respect go a long way.',
  'https://images.unsplash.com/photo-1519682337058-a94d519337bc?auto=format&fit=crop&w=1100&q=80',
  'Ustadha Sana M.',
  'Speaking a language well means understanding the culture behind it. In Urdu-speaking communities, a few small courtesies signal warmth and respect instantly.

- Greetings matter — taking a moment to ask after family is normal and appreciated.
- Hospitality is generous; accepting tea graciously is part of the ritual.
- Respectful address for elders is built right into the grammar itself.

TIP: Ask your teacher about the ''why'' behind a custom, not just the ''what.'' The stories make the language memorable.',
  1,
  '2026-04-16 09:00:00'
),
(
  'urdu-phrases-for-travel',
  '20 Urdu Phrases That Make Travel Easier',
  'Travel',
  'Heading to Pakistan or visiting family? A handful of phrases turns nervous gestures into real, warm conversations.',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1100&q=80',
  'Ustad Adnan R.',
  'You don''t need fluency to travel well — you need the right twenty phrases, said with a smile. Locals respond warmly to any effort to speak Urdu.

## The essentials

URDU: یہ کتنے کا ہے؟ | yeh kitne ka hai? | how much is this?

Add greetings, thanks, and a couple of directions, and you can navigate markets, taxis, and introductions with confidence.

TIP: Practice phrases as whole sounds, not word-by-word. You want them to come out automatically when you''re on the spot.',
  1,
  '2026-04-04 09:00:00'
),
(
  'teaching-kids-urdu-at-home',
  'Helping Kids Learn Urdu (Without the Battles)',
  'Kids',
  'For diaspora parents, keeping Urdu alive at home is a gift — and it doesn''t have to be a fight. Play beats pressure.',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1100&q=80',
  'Ustadha Zoya K.',
  'Many parents worry their children are losing the family language. The best approach is almost always the opposite of school-style drilling: short, playful, positive contact.

- Keep sessions short and game-like — five happy minutes beats twenty tense ones.
- Tie Urdu to things kids love: food, cartoons, grandparents, songs.
- Praise effort loudly and correct gently; confidence is the real curriculum.

TIP: Kids thrive with a teacher who makes it fun and a parent who cheers them on. Our Kids course is built entirely around play.',
  1,
  '2026-03-25 09:00:00'
);
