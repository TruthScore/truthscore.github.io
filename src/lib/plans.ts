// Launch plans, per the approved ship design (truthscore-chrome-ext-v2
// plans/2026-09-28-ship-design.md, decisions 2, 4 and 5). One table for the
// landing page and /account/plan so the two can't disagree.
//
// Dedicated is bought on the website via Stripe (engine E#36/E#38). Until it goes on sale it is
// shown as opening soon, with no date (the 7 October date passed with billing still parked).
// Flip DEDICATED_ON_SALE to true in the same change that turns billing on in prod (E#36 step 8).

export const DEDICATED_OPENS = "soon";
// Signed-out visitors can't be told whether billing is switched on (the engine answers that per
// user), so this site-wide switch picks their copy.
export const DEDICATED_ON_SALE = false;

export const dedicatedHasOpened = () => DEDICATED_ON_SALE;

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
