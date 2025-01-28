import axios from 'axios';
import { Product } from "@/models/Products";
import { Order } from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';
import { Cart } from '@/models/Cart';

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ error: "Unauthorized. Please log in." });
  }

  const {
    name,
    email,
    phone,
    province,
    municipality,
    barangay,
    postalCode,
    streetAddress,
    referenceNumber,
    shippingFee,
  } = req.body;

  console.log("Received reference #", referenceNumber);

  try {
    // Fetch the cart for the current user
    const cart = await Cart.findOne({ userId: session.user.id }).populate("items.productId");
    console.log("Cart items:", cart);
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ error: "Your cart is empty." });
    }

    console.log("Products in the cart: ", cart.items);

    // Create line items for the order
    const lineItems = cart.items.map((cartItem) => {
      const product = cartItem.productId;
      return {
        productId: product._id, // Include productId
        amount: product.price * 100, // Convert to centavos (PHP)
        currency: "PHP",
        description: product.description || "No description available",
        images: product.images ? [product.images[0].link] : [],
        name: product.title,
        quantity: cartItem.quantity, // Use quantity directly from the cart
      };
    });

    console.log("Line items:", lineItems);

    lineItems.push({
      amount: shippingFee * 100, // Convert to centavos
      currency: "PHP",
      description: "Shipping Fee",
      name: "Shipping Fee",
      quantity: 1,
      images: ["https://www.google.com/imgres?q=shipping%20fee%20image&imgurl=https%3A%2F%2Fwww.theritesites.com%2Fwp-content%2Fuploads%2F2018%2F06%2Fshipping-icon-256x415.png&imgrefurl=https%3A%2F%2Fwww.theritesites.com%2Fplugins%2Fwoocommerce-cost-of-shipping%2F&docid=G7QhyTzyoTSmuM&tbnid=faR1HIrHImahGM&vet=12ahUKEwi39ra78qeKAxU-1zQHHTl8Dck4ChAzegQIHxAA..i&w=415&h=256&hcb=2&ved=2ahUKEwi39ra78qeKAxU-1zQHHTl8Dck4ChAzegQIHxAA"],
    });

    // Create an order in the database using the Order model 
    const orderDoc = await Order.create({
      userId: session.user.id, // Add the logged-in user's ID
      line_items: lineItems,
      name,
      email,
      phone,
      reference_number: referenceNumber,
      shippingFee,
      address: {
        streetAddress,
        barangay,
        municipality,
        province,
        postalCode,
      },
      status: 'pending',
    });

    // Create a checkout session using PayMongo
    const checkoutSessionResponse = await axios.post(
      "https://api.paymongo.com/v1/checkout_sessions",
      {
        data: {
          attributes: {
            line_items: lineItems.map(item => ({
              amount: item.amount,
              currency: item.currency,
              description: item.description,
              images: item.images,
              name: item.name,
              quantity: item.quantity,
            })),
            billing: {
              address: {
                city: municipality,
                country: "PH",
                line1: barangay,
                line2: streetAddress,
                postal_code: postalCode,
                state: province,
              },
              email,
              name,
              phone,
            },
            customer_email: email,
            payment_method_types: ["card", "gcash", "paymaya", "billease"],
            payment_method_allowed: ["card", "gcash", "paymaya", "billease"],
            payment_method_options: {
              card: {
                request_three_d_secure: "any",
                installments: {
                  enabled: true,
                  terms: [3, 6, 12]
                }
              }
            },
            metadata: {
              orderId: orderDoc._id.toString(),
            },
            description: `Order #${referenceNumber} - Customer: ${name}`,
            success_url: `${process.env.NEXT_PUBLIC_URL}/success?reference=${referenceNumber}`,
            cancel_url: `${process.env.NEXT_PUBLIC_URL}/cancel?reference=${referenceNumber}`,
            reference_number: referenceNumber,
            show_line_items: true,
            send_email_receipt: true,
          },
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.PAYMONGO_SECRET_KEY + ":"
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log("Checkout session created:", checkoutSessionResponse.data);

    res.status(200).json({
      message: "Checkout session created successfully",
      checkoutUrl: checkoutSessionResponse.data.data.attributes.checkout_url,
    });

  } catch (error) {
    console.error("Checkout session error:", error.response?.data || error.message);
    res.status(500).json({
      error: error.response?.data?.errors?.[0]?.detail || "Failed to create checkout session",
    });
  }
}