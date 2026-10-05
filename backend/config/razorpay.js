import Razorpay from "razorpay";

let instance;

// Created lazily so dotenv has loaded and the server still boots without keys.
export const getRazorpay = () => {
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return instance;
};
