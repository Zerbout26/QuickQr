import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Order, OrderStatus } from '../models/Order';
import { QRCode } from '../models/QRCode';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/auth';
import { ILike } from 'typeorm';

const orderRepository = AppDataSource.getRepository(Order);
const qrCodeRepository = AppDataSource.getRepository(QRCode);
const userRepository = AppDataSource.getRepository(User);

// Generate unique order number
const generateOrderNumber = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${timestamp.slice(-6)}-${random}`;
};

// Create new order (public endpoint)
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { qrCodeId, items, customerInfo } = req.body;

    if (!qrCodeId || !items || !customerInfo) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate QR code exists and is orderable
    const qrCode = await qrCodeRepository.findOne({
      where: { id: qrCodeId },
      relations: ['user']
    });

    if (!qrCode) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Check if the QR code is orderable (either menu or products)
    const isMenuOrderable = qrCode.menu?.orderable;
    const isProductsOrderable = qrCode.products?.orderable;
    
    if (!isMenuOrderable && !isProductsOrderable) {
      return res.status(400).json({ error: 'This QR code is not orderable' });
    }

    if (!qrCode.user?.isActive) {
      return res.status(400).json({ error: 'This business is not active' });
    }

    // Calculate total amount
    const totalAmount = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    // Create order
    const order = new Order();
    order.orderNumber = generateOrderNumber();
    order.items = items;
    order.customerInfo = customerInfo;
    order.totalAmount = totalAmount;
    order.qrCodeId = qrCodeId;
    order.qrCodeOwnerId = qrCode.user.id;
    order.status = 'pending';

    const savedOrder = await orderRepository.save(order);

    // Return order with QR code info
    const orderWithDetails = await orderRepository.findOne({
      where: { id: savedOrder.id },
      relations: ['qrCode']
    });

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: orderWithDetails
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Error creating order' });
  }
};

// Get orders for QR code owner (admin)
export const getOrders = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const page = parseInt(req.query.page as string, 10) || 1;
    const limit = parseInt(req.query.limit as string, 10) || 10;
    const status = req.query.status as OrderStatus;
    const searchTerm = req.query.searchTerm as string;
    const skip = (page - 1) * limit;

    const where: any = { qrCodeOwnerId: req.user.id };

    if (status) {
      where.status = status;
    }

    if (searchTerm) {
      where.orderNumber = ILike(`%${searchTerm}%`);
    }

    const [orders, total] = await orderRepository.findAndCount({
      where,
      relations: ['qrCode'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
    });

    res.json({
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Error fetching orders' });
  }
};

// Get single order by ID (admin)
export const getOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const order = await orderRepository.findOne({
      where: { id, qrCodeOwnerId: req.user.id },
      relations: ['qrCode']
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ error: 'Error fetching order' });
  }
};

// Update order status (admin)
export const updateOrderStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (!status || !['pending', 'confirmed', 'cancelled', 'delivered'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await orderRepository.findOne({
      where: { id, qrCodeOwnerId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update status and timestamp
    order.status = status as OrderStatus;
    if (adminNotes) {
      order.adminNotes = adminNotes;
    }

    // Set timestamp based on status
    switch (status) {
      case 'confirmed':
        order.confirmedAt = new Date();
        break;
      case 'cancelled':
        order.cancelledAt = new Date();
        break;
      case 'delivered':
        order.deliveredAt = new Date();
        break;
    }

    const updatedOrder = await orderRepository.save(order);

    res.json({
      success: true,
      message: 'Order status updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Error updating order status' });
  }
};

// Update order notes (admin)
export const updateOrderNotes = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const { adminNotes } = req.body;

    const order = await orderRepository.findOne({
      where: { id, qrCodeOwnerId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.adminNotes = adminNotes;
    const updatedOrder = await orderRepository.save(order);

    res.json({
      success: true,
      message: 'Order notes updated successfully',
      order: updatedOrder
    });

  } catch (error) {
    console.error('Error updating order notes:', error);
    res.status(500).json({ error: 'Error updating order notes' });
  }
};

// Delete order (admin)
export const deleteOrder = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;

    const order = await orderRepository.findOne({
      where: { id, qrCodeOwnerId: req.user.id }
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    await orderRepository.remove(order);

    res.json({
      success: true,
      message: 'Order deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Error deleting order' });
  }
};

// Get order statistics (admin)
export const getOrderStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const stats = await orderRepository
      .createQueryBuilder('order')
      .select([
        'order.status',
        'COUNT(*) as count',
        'SUM(order.totalAmount) as totalAmount'
      ])
      .where('order.qrCodeOwnerId = :userId', { userId: req.user.id })
      .groupBy('order.status')
      .getRawMany();

    const totalOrders = await orderRepository.count({
      where: { qrCodeOwnerId: req.user.id }
    });

    const totalRevenue = await orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.qrCodeOwnerId = :userId', { userId: req.user.id })
      .andWhere('order.status IN (:...statuses)', { statuses: ['confirmed', 'delivered'] })
      .getRawOne();

    res.json({
      stats,
      totalOrders,
      totalRevenue: parseFloat(totalRevenue?.total || '0')
    });

  } catch (error) {
    console.error('Error fetching order stats:', error);
    res.status(500).json({ error: 'Error fetching order statistics' });
  }
}; 