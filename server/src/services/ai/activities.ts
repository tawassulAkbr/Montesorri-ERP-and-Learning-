// Curated Montessori activity bank used by the AI assistant for
// "suggest activities" questions. Keyed by learning-area family.

export interface MontessoriActivity {
  name: string;
  detail: string;
}

export const ACTIVITY_BANK: Record<string, MontessoriActivity[]> = {
  math: [
    { name: 'Number Rods & Sandpaper Numbers', detail: 'Match rod lengths to sandpaper number symbols to build quantity–symbol association (1–10).' },
    { name: 'Spindle Box Counting', detail: 'Place the correct number of spindles in each compartment — introduces zero as "nothing".' },
    { name: 'Golden Bead Introduction', detail: 'Feel units, tens, hundreds and thousands beads to preview the decimal system concretely.' },
    { name: 'Practical-Life Counting', detail: 'Count real objects during snack prep — buttons, beans, or fruit slices — one-to-one aloud.' },
  ],
  phonics: [
    { name: 'Sandpaper Letters', detail: 'Trace each letter while saying its sound; start with c, m, a, t for early blending.' },
    { name: 'Sound Games ("I Spy")', detail: '"I spy something that starts with /s/" — builds phonemic awareness without print.' },
    { name: 'Movable Alphabet CVC Words', detail: 'Build 3-letter words (cat, sun, pin) with letter tiles once sounds are secure.' },
    { name: 'Object Matching', detail: 'Match small objects to picture cards that share the same beginning sound.' },
  ],
  sensorial: [
    { name: 'Pink Tower & Broad Stair', detail: 'Grade cubes from largest to smallest; name big/bigger/biggest to build dimension vocabulary.' },
    { name: 'Knobbed Cylinders', detail: 'Fit cylinders into matching sockets — develops visual discrimination and pincer grip.' },
    { name: 'Color Tablets Sorting', detail: 'Match and grade color tablets from light to dark shades in a quiet, controlled workspace.' },
    { name: 'Mystery Bag', detail: 'Identify everyday objects by touch alone to refine the stereognostic sense.' },
  ],
  practical: [
    { name: 'Pouring & Transferring', detail: 'Dry pouring with beans, then water transfer, to build wrist control and concentration.' },
    { name: 'Buttoning Frames', detail: 'Practice buttons, zips and buckles on dressing frames for independence.' },
    { name: 'Table Washing', detail: 'A full care-of-environment cycle: scrub, rinse, dry — order, sequence and responsibility.' },
  ],
  art: [
    { name: 'Color Mixing Exploration', detail: 'Blend primary colors with finger paint to discover secondary shades.' },
    { name: 'Collage & Tearing', detail: 'Tear and glue colored paper along drawn lines — strengthens fine motor control.' },
    { name: 'Nature Printing', detail: 'Press leaves and flowers into paint for prints; pair with a nature walk conversation.' },
  ],
  rhymes: [
    { name: 'Action Rhymes', detail: 'Sing with hand actions (e.g., "Itsy Bitsy Spider") to link rhythm, memory and movement.' },
    { name: 'Story Circle Retelling', detail: 'Retell a familiar story with picture sequence cards, encouraging full sentences.' },
    { name: 'Animal Sound Songs', detail: 'Songs with animal sounds build vocabulary and listening discrimination.' },
  ],
  general: [
    { name: 'Practical Life at Home', detail: 'Let the child help with real tasks — wiping, sorting laundry, setting the table.' },
    { name: 'Quiet Concentration Game', detail: 'One simple material, uninterrupted, for 10–15 minutes to grow attention span.' },
    { name: 'Nature Walk & Collect', detail: 'Collect leaves or stones outside, then sort them by size, color or texture.' },
  ],
};

export const FAMILY_LABELS: Record<string, string> = {
  math: 'Mathematics',
  phonics: 'Language Arts',
  sensorial: 'Sensorial',
  practical: 'Practical Life',
  art: 'Cultural Studies / General Knowledge',
  rhymes: 'Language Arts',
  general: 'Cultural Studies / General Knowledge',
};
