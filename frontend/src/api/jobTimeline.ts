import axios from 'axios'
import type { JobUpdate } from '../types'

export const fetchJobTimeline = async (jobId: string): Promise<JobUpdate[]> => {
  try {
    const res = await axios.get<JobUpdate[]>(`http://127.0.0.1:8000/job-updates/${jobId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching job timeline:', error);
    return [];
  }
}
