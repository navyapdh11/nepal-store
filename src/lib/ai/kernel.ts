import { z } from 'zod';

export const NudgeSchema = z.object({
  type: z.enum(['weather', 'urgency', 'budget', 'behavior', 'time']),
  message: z.string(),
  confidence: z.number().min(0).max(100),
});

export type Nudge = z.infer<typeof NudgeSchema>;

export class AICompanionKernel {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async getNudges(category: string): Promise<Nudge[]> {
    // Mocking hyper-contextual logic for Nepal
    const nudges: Nudge[] = [
      {
        type: 'weather',
        message: '☔ Monsoon season is approaching in Kathmandu. Check out our water-repellent LifeWear.',
        confidence: 95,
      },
      {
        type: 'behavior',
        message: `🏠 You recently viewed ${category} items. Explore our latest Pashmina blends.`,
        confidence: 88,
      },
      {
        type: 'urgency',
        message: '⚡ High demand for lightweight jackets in your area. Book your size today.',
        confidence: 82,
      }
    ];

    return nudges.filter(n => NudgeSchema.safeParse(n).success);
  }
}
