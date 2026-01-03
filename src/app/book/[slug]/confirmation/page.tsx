import Link from "next/link";

export default function ConfirmationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-8 h-8 text-green-600 dark:text-green-400"
          >
            <path
              fillRule="evenodd"
              d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Request Submitted!
        </h1>

        {/* Message */}
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Thank you for your booking request. We've received your information and
          will get back to you within 24 hours to confirm your session.
        </p>

        {/* What's Next */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-6 text-left mb-8">
          <h2 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">
            What happens next?
          </h2>
          <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center">
                1
              </span>
              <span>We'll review your request and check our availability</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center">
                2
              </span>
              <span>You'll receive a confirmation email with session details</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center">
                3
              </span>
              <span>We'll finalize the booking and send any prep instructions</span>
            </li>
          </ul>
        </div>

        {/* Close Button */}
        <p className="text-sm text-gray-500 dark:text-gray-400">
          You can close this page now. Check your email for updates.
        </p>
      </div>
    </div>
  );
}
