import axios from 'axios';
import { Product } from "@/models/Products";
import { Order } from '@/models/Order';

export default async function handler(req, res) {
  const {
    cartProducts,
    name,
    email,
    phone,
    province,
    municipality,
    barangay,
    postalCode,
    streetAddress,
    referenceNumber,
  } = req.body;

  console.log("Received reference #", referenceNumber);

  // Validate the cart data
  if (!cartProducts || !Array.isArray(cartProducts) || cartProducts.length === 0) {
    return res.status(400).json({ error: "Invalid or empty cart data" });
  }

  try {
    // Fetch product details from the database
    const products = await Product.find({ _id: { $in: cartProducts } });

    // Create line items for the order
    const lineItems = products.map((product) => {
      const quantity = cartProducts.filter(id => id === product._id.toString()).length;
      return {
        amount: product.price * 100, // Convert to centavos (PHP) 
        currency: "PHP",
        description: product.description || "No description available",
        images: product.images ? [product.images[0].link] : [],
        name: product.title,
        quantity: quantity, 
      };
    });

    console.log("Line items:", lineItems);

    // Create an order in the database using the Order model 
    const orderDoc = await Order.create({
      line_items: lineItems,
      name,
      email,
      phone,
      reference_number: referenceNumber,
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
            line_items: lineItems,
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
 // Use the `id` parameter to locate the order