import { Link } from "@tanstack/react-router";
import { Icon } from "@iconify/react";

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-[#242424] text-center px-6 py-12">
      <Icon
        className="w-24 h-24 text-yellow-500 dark:text-yellow-400 mb-8 animate-bounce"
        icon={"lucide:triangle-alert"}
      />
      <h1 className="text-6xl font-extrabold text-primary-600 dark:text-primary-500 tracking-tight sm:text-7xl">
        404 - Page Gone Rogue!
      </h1>
      <p className="mt-6 text-xl font-medium text-gray-800 dark:text-white/[.87] sm:text-2xl">
        It seems one of our digital agents misplaced this page.
      </p>
      <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-md">
        Perhaps it decided to go on an unscheduled coffee break, or maybe it's
        plotting to take over the server room. Don't worry, we've dispatched our
        best (and most caffeinated) team to investigate!
      </p>
      <div className="mt-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-[#242424]"
        >
          <Icon className="w-5 h-5" icon={"lucide:home"} />
          Back to HQ (Homepage)
        </Link>
      </div>
      <p className="mt-10 text-sm text-gray-500 dark:text-gray-500">
        P.S. If you see a page muttering about "world domination," please let us
        know.
      </p>
    </div>
  );
};
export default NotFoundPage;
