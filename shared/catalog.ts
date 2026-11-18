export type CatalogGender = "men" | "women";

export type CatalogProduct = {
  slug: string;
  name: string;
  brand: string;
  description: string;
  image: string;
  price: number;
  gender: CatalogGender;
  active: number;
};

// Initial storefront catalogue; admins can edit these records after the database seed.
export const seedProducts: Omit<CatalogProduct, "active">[] = [
  { slug: "chanel-no5", name: "Chanel No. 5", brand: "Chanel", description: "A timeless floral-aldehydic composition, balancing bright citrus with soft rose, jasmine and a warm, powdery finish.", image: "/perfumes/chanel-no5.webp", price: 6500, gender: "women" },
  { slug: "aventus", name: "Aventus", brand: "Creed", description: "Fresh fruit and crisp woods lead into a confident, smoky blend with a smooth and enduring trail.", image: "/perfumes/aventus.webp", price: 12400, gender: "men" },
  { slug: "baccarat-rouge-540", name: "Baccarat Rouge 540", brand: "Francis Kurkdjian", description: "Airy saffron and luminous amberwood create a radiant, softly sweet signature with remarkable presence.", image: "/perfumes/baccarat-rouge-540.webp", price: 10600, gender: "women" },
  { slug: "black-orchid", name: "Black Orchid", brand: "Tom Ford", description: "A dark, opulent floral accord with rich spice, velvety petals and a deep, earthy base.", image: "/perfumes/black-orchid.webp", price: 7100, gender: "women" },
  { slug: "sauvage", name: "Sauvage", brand: "Dior", description: "Bracing bergamot and aromatic freshness meet mineral woods for a crisp, modern fougère character.", image: "/perfumes/sauvage.webp", price: 5400, gender: "men" },
  { slug: "jadore", name: "J’adore", brand: "Dior", description: "A golden bouquet of ylang-ylang, rose and jasmine, polished into an elegant and radiant floral.", image: "/perfumes/jadore.webp", price: 6000, gender: "women" },
  { slug: "flowerbomb", name: "Flowerbomb", brand: "Viktor&Rolf", description: "A generous floral explosion of jasmine and rose, softened by warm patchouli and a sweet, enveloping base.", image: "/perfumes/flowerbomb.webp", price: 5800, gender: "women" },
  { slug: "la-vie-est-belle", name: "La Vie Est Belle", brand: "Lancôme", description: "Iris and delicate florals unfold over a comforting gourmand accord of vanilla, praline and woods.", image: "/perfumes/la-vie-est-belle.webp", price: 5200, gender: "women" },
  { slug: "terre-dhermes", name: "Terre d’Hermès", brand: "Hermès", description: "Bright orange and pepper meet dry cedar and mineral notes in a grounded, quietly distinctive woody scent.", image: "/perfumes/terre-dhermes.webp", price: 5800, gender: "men" },
  { slug: "shalimar", name: "Shalimar", brand: "Guerlain", description: "A legendary amber composition, where sparkling citrus gives way to smoky vanilla, incense and soft leather.", image: "/perfumes/shalimar.webp", price: 6200, gender: "women" },
  { slug: "black-opium", name: "Black Opium", brand: "Yves Saint Laurent", description: "Bright coffee and white flowers combine with vanilla for a vibrant, warm and addictive evening scent.", image: "/perfumes/black-opium.webp", price: 5600, gender: "women" },
  { slug: "libre", name: "Libre", brand: "Yves Saint Laurent", description: "Lavender and orange blossom meet a smooth vanilla warmth in a confident contrast of aromatic and floral notes.", image: "/perfumes/libre.webp", price: 5700, gender: "women" },
  { slug: "mitsouko", name: "Mitsouko", brand: "Guerlain", description: "A warm chypre composition with peach, spice and mossy woods, carrying a quietly mysterious vintage character.", image: "/perfumes/mitsouko.png", price: 0, gender: "women" },
  { slug: "habanita", name: "Habanita", brand: "Molinard", description: "A rich, powdery floral-woody fragrance with soft vanilla, florals and a deep, elegant trail.", image: "/perfumes/habanita.png", price: 0, gender: "women" },
  { slug: "luxoria", name: "Luxoria", brand: "Luxoria", description: "A luminous amber-woody composition with warm resins, polished woods and a darkly opulent finish.", image: "/perfumes/luxoria.jfif", price: 0, gender: "women" },
  { slug: "velixir", name: "Velixir", brand: "Velixir", description: "A cool, radiant composition of clean woods and mineral freshness with a smooth, modern signature.", image: "/perfumes/velixir.jfif", price: 0, gender: "women" },
  { slug: "angel", name: "Angel", brand: "Mugler", description: "A bold gourmand trail of praline, red fruits, vanilla and patchouli with a lasting, radiant character.", image: "/perfumes/angel.webp", price: 0, gender: "women" },
  { slug: "black-orchid-parfum", name: "Black Orchid Parfum", brand: "Tom Ford", description: "A dark, opulent floral-amber composition with rum, orchid, spice and a deep woody base.", image: "/perfumes/black-orchid-parfum.webp", price: 0, gender: "women" },
  { slug: "bleu-de-chanel", name: "Bleu de Chanel", brand: "Chanel", description: "A fresh aromatic-woody composition with citrus, incense, cedar and a clean, confident trail.", image: "/perfumes/bleu-de-chanel.webp", price: 0, gender: "men" },
  { slug: "daisy", name: "Daisy", brand: "Marc Jacobs", description: "A bright floral scent with soft violet, wild strawberry and jasmine over a gentle, airy base.", image: "/perfumes/daisy.webp", price: 0, gender: "women" },
  { slug: "fabulous", name: "Fabulous", brand: "Tom Ford", description: "A rich leather-amber composition with bitter almond, cashmere, tonka bean and warm woods.", image: "/perfumes/fabulous.webp", price: 0, gender: "men" },
  { slug: "for-her", name: "For Her", brand: "Narciso Rodriguez", description: "A refined musk-led floral with rose, peach and soft woods, elegant and quietly sensual.", image: "/perfumes/for-her.webp", price: 0, gender: "women" },
  { slug: "good-girl", name: "Good Girl", brand: "Carolina Herrera", description: "A luminous floral gourmand blending jasmine, almond, coffee and tonka over a warm cocoa finish.", image: "/perfumes/good-girl.webp", price: 0, gender: "women" },
  { slug: "hypnotic-poison", name: "Hypnotic Poison", brand: "Dior", description: "A captivating vanilla-amber fragrance with almond, jasmine and a smooth, enveloping woody base.", image: "/perfumes/hypnotic-poison.webp", price: 0, gender: "women" },
  { slug: "le-male", name: "Le Male", brand: "Jean Paul Gaultier", description: "A classic aromatic fougère built around lavender, mint, vanilla and warm woods.", image: "/perfumes/le-male.webp", price: 0, gender: "men" },
  { slug: "lost-cherry", name: "Lost Cherry", brand: "Tom Ford", description: "A vivid cherry-amber composition with cherry liqueur, bitter almond, rose and roasted tonka.", image: "/perfumes/lost-cherry.webp", price: 0, gender: "women" },
  { slug: "opium", name: "Opium", brand: "Yves Saint Laurent", description: "A warm spicy-amber fragrance with citrus, incense, florals and a rich, sensual finish.", image: "/perfumes/opium.webp", price: 0, gender: "women" },
];

export const seedCatalogProducts: CatalogProduct[] = seedProducts.map((product) => ({ ...product, active: 1 }));
