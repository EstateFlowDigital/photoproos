import { Heart } from "lucide-react";

export default function ThankYouPage() {
  return (
    <div data-element="review-thank-you-page" className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        {/* Heart Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-red-500/20">
          <Heart className="h-10 w-10 text-pink-500 fill-pink-500" />
        </div>

        {/* Thank You Message */}
        <h1 className="mt-8 text-3xl font-bold text-white">Thank You!</h1>
        <p className="mt-4 text-lg text-gray-400">
          Your feedback means the world to us.
        </p>
        <p className="mt-2 text-gray-500">
          We're constantly working to improve and your input helps us deliver
          the best experience possible.
        </p>

        {/* Decorative Element */}
        <div className="mt-8 flex justify-center gap-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-1 w-8 rounded-full bg-gradient-to-r from-pink-500 to-red-500"
              style={{
                opacity: 1 - i * 0.15,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
