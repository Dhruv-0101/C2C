export const DEFAULT_DESIGN_STYLES = [
  {
    name: 'Royal Festive Gold',
    slug: 'royal-festive-gold',
    description: 'Luxurious marigold gold and teal gradient blend for celebrations and high-end offers.',
    primaryColor: '#F59E0B',
    secondaryColor: '#0D9488',
    accentColor: '#EC4899',
    backgroundColor: '#0B0F17',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EC4899 50%, #8B5CF6 100%)',
    fontHeader: 'Space Grotesk',
    fontBody: 'Plus Jakarta Sans',
    colors: ['#F59E0B', '#0D9488', '#EC4899', '#8B5CF6'],
  },
  {
    name: 'Neon Cyberpunk',
    slug: 'neon-cyberpunk',
    description: 'Vibrant neon blue and magenta contrast palette for modern tech & nightlife graphics.',
    primaryColor: '#00F0FF',
    secondaryColor: '#FF007A',
    accentColor: '#7000FF',
    backgroundColor: '#05050A',
    gradient: 'linear-gradient(135deg, #00F0FF 0%, #FF007A 100%)',
    fontHeader: 'Outfit',
    fontBody: 'Inter',
    colors: ['#00F0FF', '#FF007A', '#7000FF'],
  },
  {
    name: 'Corporate Sleek',
    slug: 'corporate-sleek',
    description: 'Professional royal blue and slate styling for B2B, real estate, and financial promotions.',
    primaryColor: '#2563EB',
    secondaryColor: '#1E293B',
    accentColor: '#3B82F6',
    backgroundColor: '#0F172A',
    gradient: 'linear-gradient(135deg, #1E293B 0%, #2563EB 100%)',
    fontHeader: 'Roboto',
    fontBody: 'Inter',
    colors: ['#2563EB', '#1E293B', '#3B82F6'],
  },
  {
    name: 'Minimalist Pastel',
    slug: 'minimalist-pastel',
    description: 'Soft pastel pink and sky blue tones for wellness, salons, and lifestyle branding.',
    primaryColor: '#F472B6',
    secondaryColor: '#38BDF8',
    accentColor: '#A78BFA',
    backgroundColor: '#18181B',
    gradient: 'linear-gradient(135deg, #F472B6 0%, #38BDF8 100%)',
    fontHeader: 'Playfair Display',
    fontBody: 'Plus Jakarta Sans',
    colors: ['#F472B6', '#38BDF8', '#A78BFA'],
  },
];

/**
 * Seed Master Design Styles & Color Palettes
 * @param {import('@prisma/client').PrismaClient} prisma
 */
export async function seedDesignStyles(prisma) {
  for (const style of DEFAULT_DESIGN_STYLES) {
    await prisma.designStyle.upsert({
      where: { slug: style.slug },
      update: {
        name: style.name,
        description: style.description,
        primaryColor: style.primaryColor,
        secondaryColor: style.secondaryColor,
        accentColor: style.accentColor,
        backgroundColor: style.backgroundColor,
        gradient: style.gradient,
        fontHeader: style.fontHeader,
        fontBody: style.fontBody,
        colors: style.colors,
      },
      create: {
        name: style.name,
        slug: style.slug,
        description: style.description,
        primaryColor: style.primaryColor,
        secondaryColor: style.secondaryColor,
        accentColor: style.accentColor,
        backgroundColor: style.backgroundColor,
        gradient: style.gradient,
        fontHeader: style.fontHeader,
        fontBody: style.fontBody,
        colors: style.colors,
        isSystem: true,
      },
    });
  }
  console.log(`🎨 Default Master Design Styles & Color Palettes seeded (${DEFAULT_DESIGN_STYLES.length} styles).`);
}
