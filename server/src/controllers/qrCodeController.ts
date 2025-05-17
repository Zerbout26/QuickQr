import { Response } from 'express';
import { AppDataSource } from '../config/database';
import { QRCode } from '../models/QRCode';
import { AuthRequest } from '../middleware/auth';

const qrCodeRepository = AppDataSource.getRepository(QRCode);

export const createQRCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { name, url, logoUrl, foregroundColor, backgroundColor } = req.body;

    const qrCode = qrCodeRepository.create({
      name,
      url,
      logoUrl,
      foregroundColor,
      backgroundColor,
      user: req.user
    });

    await qrCodeRepository.save(qrCode);
    res.status(201).json(qrCode);
  } catch (error) {
    res.status(500).json({ error: 'Error creating QR code' });
  }
};

export const getQRCodes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const qrCodes = await qrCodeRepository.find({
      where: { user: { id: req.user.id } },
      order: { createdAt: 'DESC' }
    });

    res.json(qrCodes);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching QR codes' });
  }
};

export const getQRCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({
      where: { id, user: { id: req.user.id } }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    res.json(qrCode);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching QR code' });
  }
};

export const updateQRCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { name, url, logoUrl, foregroundColor, backgroundColor } = req.body;

    const qrCode = await qrCodeRepository.findOne({
      where: { id, user: { id: req.user.id } }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    if (name) qrCode.name = name;
    if (url) qrCode.url = url;
    if (logoUrl !== undefined) qrCode.logoUrl = logoUrl;
    if (foregroundColor) qrCode.foregroundColor = foregroundColor;
    if (backgroundColor) qrCode.backgroundColor = backgroundColor;

    await qrCodeRepository.save(qrCode);
    res.json(qrCode);
  } catch (error) {
    res.status(500).json({ error: 'Error updating QR code' });
  }
};

export const deleteQRCode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const qrCode = await qrCodeRepository.findOne({
      where: { id, user: { id: req.user.id } }
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    await qrCodeRepository.remove(qrCode);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting QR code' });
  }
}; 