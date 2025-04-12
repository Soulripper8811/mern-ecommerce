import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";
import { stripe } from "../lib/stripe.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { products, couponCode } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ error: "Invalid or empty products array" });
    }

    let totalAmount = 0;

    const lineItems = products.map((product) => {
      const amount = Math.round(product.price * 100); // stripe wants u to send in the format of cents
      totalAmount += amount * product.quantity;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: product.name,
            images: [product.image],
          },
          unit_amount: amount,
        },
        quantity: product.quantity || 1,
      };
    });

    let coupon = null;
    if (couponCode) {
      coupon = await Coupon.findOne({
        code: couponCode,
        userId: req.user._id,
        isActive: true,
      });
      if (coupon) {
        totalAmount -= Math.round(
          (totalAmount * coupon.discountPercentage) / 100
        );
      }
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/purchase-cancel`,
      shipping_address_collection:{
        allowed_countries:["IN","US"]
      },
      billing_address_collection:"required",
      discounts: coupon
        ? [
            {
              coupon: await createStripeCoupon(coupon.discountPercentage),
            },
          ]
        : [],
      metadata: {
        userId: req.user._id.toString(),
        couponCode: couponCode || "",
        products: JSON.stringify(
          products.map((p) => ({
            id: p._id,
            quantity: p.quantity,
            price: p.price,
          }))
        ),
      },
    });

    if (totalAmount >= 20000) {
      await createNewCoupon(req.user._id);
    }
    res.status(200).json({ id: session.id, totalAmount: totalAmount / 100 });
  } catch (error) {
    console.error("Error processing checkout:", error);
    res
      .status(500)
      .json({ message: "Error processing checkout", error: error.message });
  }
};

// export const checkoutSuccess = async (req, res) => {
//   try {
//     const { sessionId } = req.body;
//     const session = await stripe.checkout.sessions.retrieve(sessionId);

//     if (session.payment_status === "paid") {
//       if (session.metadata.couponCode) {
//         await Coupon.findOneAndUpdate(
//           {
//             code: session.metadata.couponCode,
//             userId: session.metadata.userId,
//           },
//           { isActive: false }
//         );
//       }

//       // **Check if the order already exists before inserting**
//       const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
//       if (existingOrder) {
//         return res.status(200).json({
//           success: true,
//           message: "Order already exists.",
//           orderId: existingOrder._id,
//         });
//       }

//       // Create a new order
//       const products = JSON.parse(session.metadata.products);
//       const newOrder = new Order({
//         user: session.metadata.userId,
//         products: products.map((product) => ({
//           product: product.id,
//           quantity: product.quantity,
//           price: product.price,
//         })),
//         totalAmount: session.amount_total / 100, // Convert from cents to dollars
//         stripeSessionId: sessionId,
//       });

//       await newOrder.save();
//       const updatedUser = await User.findByIdAndUpdate(
//         session.metadata.userId,
//         {
//           cartItems: [],
//         },
//         { new: true }
//       );
//       console.log("updated user is here in checkout success", updatedUser);

//       res.status(200).json({
//         success: true,
//         message:
//           "Payment successful, order created, and coupon deactivated if used.",
//         orderId: newOrder._id,
//       });
//     } else {
//       res.status(400).json({ message: "Payment was not successful." });
//     }
//   } catch (error) {
//     console.error("Error processing successful checkout:", error);
//     res.status(500).json({
//       message: "Error processing successful checkout",
//       error: error.message,
//     });
//   }
// };
export const checkoutSuccess = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer_details"], // Expands customer details to get address
    });

    if (session.payment_status === "paid") {
      if (session.metadata.couponCode) {
        await Coupon.findOneAndUpdate(
          {
            code: session.metadata.couponCode,
            userId: session.metadata.userId,
          },
          { isActive: false }
        );
      }

      // **Check if the order already exists before inserting**
      const existingOrder = await Order.findOne({ stripeSessionId: sessionId });
      if (existingOrder) {
        return res.status(200).json({
          success: true,
          message: "Order already exists.",
          orderId: existingOrder._id,
        });
      }

      // Extract products from metadata
      const products = JSON.parse(session.metadata.products);

      // Extract shipping address from Stripe session
      const shippingAddress = {
        fullName: session.customer_details.name,
        street: session.customer_details.address.line1,
        city: session.customer_details.address.city,
        state: session.customer_details.address.state || "",
        postalCode: session.customer_details.address.postal_code,
        country: session.customer_details.address.country,
      };

      // Create a new order with shipping address
      const newOrder = new Order({
        user: session.metadata.userId,
        products: products.map((product) => ({
          product: product.id,
          quantity: product.quantity,
          price: product.price,
        })),
        totalAmount: session.amount_total / 100, // Convert from cents to dollars
        stripeSessionId: sessionId,
        shippingAddress, // Save the shipping address
      });


      await newOrder.save();

      for (const product of products) {
        await Product.findByIdAndUpdate(
          product.id,
          { $inc: { quantity: -product.quantity } }, // Decrease stock
          { new: true }
        );
      }

      // Clear user cart after successful order
      const updatedUser = await User.findByIdAndUpdate(
        session.metadata.userId,
        { cartItems: [] },
        { new: true }
      );
      console.log("Updated user in checkout success:", updatedUser);

      res.status(200).json({
        success: true,
        message: "Payment successful, order created, and coupon deactivated if used.",
        orderId: newOrder._id,
      });
    } else {
      res.status(400).json({ message: "Payment was not successful." });
    }
  } catch (error) {
    console.error("Error processing successful checkout:", error);
    res.status(500).json({
      message: "Error processing successful checkout",
      error: error.message,
    });
  }
};


async function createStripeCoupon(discountPercentage) {
  const coupon = await stripe.coupons.create({
    percent_off: discountPercentage,
    duration: "once",
  });

  return coupon.id;
}

async function createNewCoupon(userId) {
  await Coupon.findOneAndDelete({ userId });

  const newCoupon = new Coupon({
    code: "GIFT" + Math.random().toString(36).substring(2, 8).toUpperCase(),
    discountPercentage: 10,
    expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    userId: userId,
  });

  await newCoupon.save();

  return newCoupon;
}
