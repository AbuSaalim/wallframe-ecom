const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    variant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProductVariant',
        default: null
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
    },
    price: {
        type: Number,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: String, // Firebase UID
        required: true,
        unique: true
    },
    items: [cartItemSchema],
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Update updatedAt on save
cartSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Virtual for total items
cartSchema.virtual('totalItems').get(function() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Virtual for total price
cartSchema.virtual('totalPrice').get(function() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
});

// Ensure virtuals are included in JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const CartModel = mongoose.models.Cart || mongoose.model('Cart', cartSchema);

module.exports = CartModel;
