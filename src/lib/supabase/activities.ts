// Activities table does not exist yet in the database.
// This is a placeholder API that returns empty data.

export interface Activity {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  category: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityInsert = Omit<Activity, 'id' | 'created_at' | 'updated_at'>;
export type ActivityUpdate = Partial<ActivityInsert>;

export const activitiesAPI = {
  async getPublishedActivities(): Promise<Activity[]> {
    return [];
  },

  async getFeaturedActivities(_limit?: number): Promise<Activity[]> {
    return [];
  },

  async getAllActivities(): Promise<Activity[]> {
    return [];
  },

  async getActivity(_id: string): Promise<Activity | null> {
    return null;
  },

  async createActivity(_activity: ActivityInsert): Promise<Activity | null> {
    throw new Error('Activities table not available');
  },

  async updateActivity(_id: string, _updates: ActivityUpdate): Promise<Activity | null> {
    throw new Error('Activities table not available');
  },

  async deleteActivity(_id: string): Promise<void> {
    throw new Error('Activities table not available');
  },

  async togglePublished(_id: string, _published: boolean): Promise<Activity | null> {
    throw new Error('Activities table not available');
  },

  async toggleFeatured(_id: string, _featured: boolean): Promise<Activity | null> {
    throw new Error('Activities table not available');
  },
};

