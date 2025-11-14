import { Ticket } from '../dao/models/ticketModel.js';

class TicketRepository {
  // Método para generar código único de ticket
  generateCode() {
    return `TICKET-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  async create(ticketData) {
    try {
      const ticket = new Ticket(ticketData);
      await ticket.save();
      return ticket;
    } catch (error) {
      throw error;
    }
  }

  async findById(id) {
    try {
      const ticket = await Ticket.findById(id).populate('products.product');
      return ticket;
    } catch (error) {
      throw error;
    }
  }

  async findByCode(code) {
    try {
      const ticket = await Ticket.findOne({ code }).populate('products.product');
      return ticket;
    } catch (error) {
      throw error;
    }
  }

  async findByPurchaser(email) {
    try {
      const tickets = await Ticket.find({ purchaser: email })
        .populate('products.product')
        .sort({ purchase_datetime: -1 });
      return tickets;
    } catch (error) {
      throw error;
    }
  }

  async getAll() {
    try {
      const tickets = await Ticket.find()
        .populate('products.product')
        .sort({ purchase_datetime: -1 });
      return tickets;
    } catch (error) {
      throw error;
    }
  }

  async delete(id) {
    try {
      const ticket = await Ticket.findByIdAndDelete(id);
      return ticket;
    } catch (error) {
      throw error;
    }
  }
}

export default new TicketRepository();