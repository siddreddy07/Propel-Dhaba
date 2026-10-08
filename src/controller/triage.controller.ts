import type { Request, Response } from "express";
import { ticketSchema } from "../schemas/triage.schema.js";
import { triageService } from "../services/triage.service.js";

export const triageController = async (req: Request, res: Response) => {
  const result = ticketSchema.safeParse(req.body);

  if (!result.success) {
    res.status(400).json({
      success: false,
      errors: result.error.flatten(),
    });
    return;
  }

  try {
    const response = await triageService(result.data);
    console.log('Response :',response)
    res.status(200).json(response);
  } catch (error) {
    console.error("Triage request failed", {
      ticketId: result.data.id,
      error,
    });

    res.status(500).json({
      success: false,
      message: "Failed to process ticket",
    });
  }
};