// About page copy. SAMPLE content: replace once the client supplies the real story and team.

export type TeamMember = {
  name: string;
  role: string;
  /** Portrait path (shown in monochrome, colour on hover), or null for a placeholder slot. */
  photo: string | null;
  placeholder: boolean;
};

export const about = {
  hero: {
    eyebrow: "About",
    title: "A studio built across three time zones.",
    // SAMPLE founding story (2 short paragraphs)
    story: [
      "Techventics started in Karachi as a small team of developers and designers who were tired of handing clients half-finished work. We wanted one studio where the people who plan a product are the same people who design it, build it and keep it running.",
      "Today we work from Karachi, London and New York with companies in Pakistan, the UK and the US. The setup is simple: senior people on every project, a working link to click every week, and no hand-offs to strangers halfway through.",
    ],
  },
  values: {
    eyebrow: "What we believe",
    items: [
      {
        title: "Craft over shortcuts.",
        body: "We would rather ship one thing that works properly than three that need fixing next month.",
      },
      {
        title: "Clarity over jargon.",
        body: "Plain language in proposals, in meetings and in the product itself. If we can't explain it simply, we're not done.",
      },
      {
        title: "Partners, not vendors.",
        body: "We care about the numbers your product moves, not only the tickets we close. Most of our clients stay after launch.",
      },
    ],
  },
  team: {
    eyebrow: "The team",
    big: "Team",
    title: "The people you will work with.",
    // SAMPLE slots: real names, roles and portraits to come.
    members: [
      { name: "Team member", role: "Founder & Director", photo: null, placeholder: true },
      { name: "Team member", role: "Design Lead", photo: null, placeholder: true },
      { name: "Team member", role: "Engineering Lead", photo: null, placeholder: true },
      { name: "Team member", role: "Brand Strategist", photo: null, placeholder: true },
      { name: "Team member", role: "Motion Designer", photo: null, placeholder: true },
      { name: "Team member", role: "Mobile Developer", photo: null, placeholder: true },
      { name: "Team member", role: "Project Manager", photo: null, placeholder: true },
      { name: "Team member", role: "UI/UX Designer", photo: null, placeholder: true },
    ] satisfies TeamMember[],
  },
  offices: {
    eyebrow: "Offices",
    big: "Offices",
    title: "Where we work.",
  },
};
