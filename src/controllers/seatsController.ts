import { Request, Response } from 'express';
import { SeatsService } from '../services/seatsService';

const seatsService = new SeatsService();

export async function getSeatsInfo(req: Request, res: Response): Promise<void> {
  try {
    const id = req.query.id as string;
    if (!id) {
      res.status(400).json({ error: 'Invalid request. Missing "id" parameter.' });
      return;
    }

    const resultSeats = await seatsService.getSeatsInfo(id);
    res.json(resultSeats);
  } catch (error: any) {
    console.error(error);
    res.status(error.status || 500).json({ error: 'An error occurred while fetching data.' });
  }
}
