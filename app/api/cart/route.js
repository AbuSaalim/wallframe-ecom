import { connectDB } from "@/lib/detabaseConnection";
import { catchError } from "@/lib/helperFunction";
import CartModel from "@/models/Cart.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { NextResponse } from "next/server";

// GET /api/cart - Fetch user's cart
export async function GET(request) {
    try {
        await connectDB();

        // Get user ID from auth (you'll need to implement auth verification)
        const userId = request.headers.get('x-user-id'); // Placeholder - replace with actual auth
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: "Unauthorized" 
            }, { status: 401 });
        }

        let cart = await CartModel.findOne({ user: userId })
            .populate({
                path: 'items.product',
                select: 'name slug media sellingPrice mrp stock'
            })
            .populate({
                path: 'items.variant',
                select: 'color size sku sellingPrice mrp stock media'
            })
            .lean();

        if (!cart) {
            // Create empty cart if doesn't exist
            cart = await CartModel.create({ user: userId, items: [] });
        }

        return NextResponse.json({
            success: true,
            data: cart
        });

    } catch (error) {
        return catchError(error);
    }
}

// POST /api/cart - Sync/replace cart from client
export async function POST(request) {
    try {
        await connectDB();

        const userId = request.headers.get('x-user-id');
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: "Unauthorized" 
            }, { status: 401 });
        }

        const { items } = await request.json();

        // Validate items structure
        if (!Array.isArray(items)) {
            return NextResponse.json({
                success: false,
                message: "Invalid cart items"
            }, { status: 400 });
        }

        // Find or create cart
        let cart = await CartModel.findOne({ user: userId });

        if (!cart) {
            cart = new CartModel({ user: userId, items: [] });
        }

        // Merge strategy: Add new items, update quantities for existing
        for (const item of items) {
            const existingItemIndex = cart.items.findIndex(
                i => i.product.toString() === item.productId && 
                     (i.variant?.toString() || null) === (item.variantId || null)
            );

            if (existingItemIndex > -1) {
                // Update quantity
                cart.items[existingItemIndex].quantity += item.quantity;
            } else {
                // Add new item
                cart.items.push({
                    product: item.productId,
                    variant: item.variantId || null,
                    quantity: item.quantity,
                    price: item.price
                });
            }
        }

        await cart.save();

        // Populate and return
        cart = await CartModel.findById(cart._id)
            .populate('items.product', 'name slug media sellingPrice mrp stock')
            .populate('items.variant', 'color size sku sellingPrice mrp stock media')
            .lean();

        return NextResponse.json({
            success: true,
            data: cart
        });

    } catch (error) {
        return catchError(error);
    }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request) {
    try {
        await connectDB();

        const userId = request.headers.get('x-user-id');
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: "Unauthorized" 
            }, { status: 401 });
        }

        await CartModel.findOneAndUpdate(
            { user: userId },
            { items: [] },
            { new: true }
        );

        return NextResponse.json({
            success: true,
            message: "Cart cleared"
        });

    } catch (error) {
        return catchError(error);
    }
}
