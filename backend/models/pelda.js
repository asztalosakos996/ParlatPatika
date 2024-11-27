const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
  });
  
const Product = mongoose.model('Product', ProductSchema);



const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    total: Number,
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number,
      },
    ],
    createdAt: { type: Date, default: Date.now },
  });
  
  const Order = mongoose.model('Order', OrderSchema);

  
  