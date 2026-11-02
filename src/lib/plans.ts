// Launch plans, per the approved ship design (truthscore-chrome-ext-v2
// plans/2026-09-28-ship-design.md, decisions 2, 4 and 5). One table for the
// landing page and /account/plan so the two can't disagree.
//
// Dedicated is bought on the website via Stripe from 7 October (engine E#36/E#38).
// Until then it is shown with its opening date, never as "coming soon".

export const DEDICATED_OPENS = "7 October";
// Midnight UK time on the opening day. Only used to pick copy for signed-out visitors,
// who can't be told whether billing is switched on (the engine answers that per user).
export const DEDICATED_OPENS_AT = new Date("2026-10-07T00:00:00+01:00");

export const dedicatedHasOpened = (now: Date = new Date()) => now >= DEDICATED_OPENS_AT;

export type Plan = {
  name: string;
  price: string | null;
  features: string[];
  recommended: boolean;
};

export const PLANS: Plan[] = [
  {
    name: "Free",
    price: null,
    features: [
      "10 scores to try, no account needed",
      "25 scores a day when you sign in",
      "The score, the rating and what it means",
      "All nine dimensions, with the reasoning",
      "Your scoring history",
    ],
    recommended: false,
  },
  {
    name: "Dedicated",
    price: "$3",
    features: [
      "Everything in Free",
      "No daily limit",
      "The full council breakdown: every model's score, dimension by dimension, and why they differ",
      "Reading analytics drawn from your own history",
    ],
    recommended: true,
  },
];
