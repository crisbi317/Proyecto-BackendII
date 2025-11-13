import ProductRepository from './repositories/productRepository.js';

export default (io) => {
  io.on("connection", (socket) => {
    console.log('Cliente conectado');

    socket.on("createProduct", async (data) => {
      try {
        await ProductRepository.create(data);
        const products = await ProductRepository.getAll({});
        socket.emit("publishProducts", products.docs);
        
        io.emit("publishProducts", products.docs);
      } catch (error) {
        socket.emit("statusError", error.message);
      }
    });

    socket.on("deleteProduct", async (data) => {
      try {
        await ProductRepository.delete(data.pid);
        const products = await ProductRepository.getAll({});
        socket.emit("publishProducts", products.docs);
        io.emit("publishProducts", products.docs);
      } catch (error) {
        socket.emit("statusError", error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
};