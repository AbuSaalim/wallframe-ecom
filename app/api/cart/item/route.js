import { connectDB } from "@/lib/detabaseConnection";
import { catchError } from "@/lib/helperFunction";
import CartModel from "@/models/Cart.model";
import ProductModel from "@/models/Product.model";
import ProductVariantModel from "@/models/ProductVariant.model";
import { NextResponse } from "next/server";

// POST /api/cart/item - Add item to cart
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

        const { productId, variantId, quantity, price } = await request.json();

        // Validate product exists
        const product = await ProductModel.findById(productId);
        if (!product) {
            return NextResponse.json({
                success: false,
                message: "Product not found"
            }, { status: 404 });
        }

        // Validate variant if provided
        if (variantId) {
            const variant = await ProductVariantModel.findById(variantId);
            if (!variant) {
                return NextResponse.json({
                    success: false,
                    message: "Variant not found"
                }, { status: 404 });
            }
        }

        // Find or create cart
        let cart = await CartModel.findOne({ user: userId });

        if (!cart) {
            cart = new CartModel({ user: userId, items: [] });
        }

        // Check if item already exists
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId && 
                   (item.variant?.toString() || null) === (variantId || null)
        );

        if (existingItemIndex > -1) {
            // Update quantity
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                variant: variantId || null,
                quantity,
                price
            });
        }

        await cart.save();

        // Populate and return
        cart = await CartModel.findById(cart._id)
            .populate('items.product', 'name slug media sellingPrice mrp stock')
            .populate('items.variant', 'color size sku sellingPrice mrp stock media')
            .lean();

        return NextResponse.json({
            success: true,
            data: cart,
            message: "Item added to cart"
        });

    } catch (error) {
        return catchError(error);
    }
}

// PATCH /api/cart/item - Update item quantity
export async function PATCH(request) {
    try {
        await connectDB();

        const userId = request.headers.get('x-user-id');
        
        if (!userId) {
            return NextResponse.json({ 
                success: false, 
                message: "Unauthorized" 
            }, { status: 401 });
        }

        const { productId, variantId, quantity } = await request.json();

        const cart = await CartModel.findOne({ user: userId });

        if (!cart) {
            return NextResponse.json({
                success: false,
                message: "Cart not found"
            }, { status: 404 });
        }

        const itemIndex = cart.items.findIndex(
            item => item.product.toString() === productId && 
                   (item.variant?.toString() || null) === (variantId || null)
        );

        if (itemIndex === -1) {
            return NextResponse.json({
                success: false,
                message: "Item not found in cart"
            }, { status: 404 });
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or less
            cart.items.splice(itemIndex, 1);
        } else {
            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();

        // Populate and return
        const updatedCart = await CartModel.findById(cart._id)
            .populate('items.product', 'name slug media sellingPrice mrp stock')
            .populate('items.variant', 'color size sku sellingPrice mrp stock media')
            .lean();

        return NextResponse.json({
            success: true,
            data: updatedCart,
            message: "Cart updated"
        });

    } catch (error) {
        return catchError(error);
    }
}

// DELETE /api/cart/item - Remove item from cart
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

        const { searchParams } = new URL(request.url);
        const productId = searchParams.get('productId');
        const variantId = searchParams.get('variantId');

        const cart = await CartModel.findOne({ user: userId });

        if (!cart) {
            return NextResponse.json({
                success: false,
                message: "Cart not found"
            }, { status: 404 });
        }

        cart.items = cart.items.filter(
            item => !(item.product.toString() === productId && 
                     (item.variant?.toString() || null) === (variantId || null))
        );

        await cart.save();

        // Populate and return
        const updatedCart = await CartModel.findById(cart._id)
            .populate('items.product', 'name slug media sellingPrice mrp stock')
            .populate('items.variant', 'color size sku sellingPrice mrp stock media')
            .lean();

        return NextResponse.json({
            success: true,
            data: updatedCart,
            message: "Item removed from cart"
        });

    } catch (error) {
        return catchError(error);
    }
}
